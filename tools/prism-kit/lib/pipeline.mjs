// Stage runner: DOCTOR -> GENERATE -> EXPORT -> VALIDATE-ASSET ->
// RENDER-DESKTOP -> RENDER-ANDROID -> COLLECT-METRICS -> VISUAL-REVIEW-STOP.
//
// Design rules this file exists to enforce (see PRISM_KIT_RULES.md):
//   - every stage is explicit, logged, independently rerunnable;
//   - a stage's own checkpoint entry is ONLY trusted for skip-on-resume
//     when the stage explicitly marks itself skippable (GENERATE/EXPORT/
//     RENDER-* do; VALIDATE-ASSET and VISUAL-REVIEW-STOP never do — resume
//     must never bypass validation or fake a visual pass);
//   - a stage failure is classified before any repair is attempted;
//   - at most 2 automatic retries per stage, each gated on a diagnosed
//     change, never an identical blind rerun;
//   - an unresolved failure writes a compact failure capsule and stops —
//     it never improvises past its own architecture.
import fs from 'node:fs';
import path from 'node:path';
import * as P from './paths.mjs';

export const STAGE_ORDER = [
  'DOCTOR',
  'GENERATE',
  'EXPORT',
  'VALIDATE-ASSET',
  'RENDER-DESKTOP',
  'RENDER-ANDROID',
  'COLLECT-METRICS',
  'VISUAL-REVIEW-STOP',
];

// Stages whose "ok" checkpoint entry is trusted to skip re-execution on
// resume. Anything not listed here always re-runs, even if a prior
// checkpoint says ok — this is what makes "never bypass validation" true
// by construction rather than by convention.
const SKIPPABLE_ON_RESUME = new Set(['GENERATE', 'EXPORT', 'RENDER-DESKTOP', 'RENDER-ANDROID']);

const MAX_ATTEMPTS = 2;

function nowIso() { return new Date().toISOString(); }

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function loadCheckpoint(asset) {
  return readJson(P.checkpointPath(asset), {
    asset, lastCompletedStage: null, stages: {}, attempts: {}, updatedAt: null,
  });
}

export function saveCheckpoint(asset, state) {
  state.updatedAt = nowIso();
  writeJson(P.checkpointPath(asset), state);
}

export function clearFailureCapsule(asset) {
  const p = P.capsulePath(asset);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

export function writeFailureCapsule(asset, capsule) {
  writeJson(P.capsulePath(asset), capsule);
  return P.capsulePath(asset);
}

export function readFailureCapsule(asset) {
  const p = P.capsulePath(asset);
  return fs.existsSync(p) ? readJson(p, null) : null;
}

async function gitInfo() {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  try {
    const branch = (await run('git', ['-C', P.REPO_ROOT, 'rev-parse', '--abbrev-ref', 'HEAD'])).stdout.trim();
    const head = (await run('git', ['-C', P.REPO_ROOT, 'rev-parse', 'HEAD'])).stdout.trim();
    return { branch, head };
  } catch {
    return { branch: null, head: null };
  }
}

// Heuristic failure classifier. Deliberately conservative: anything it
// doesn't recognize with confidence is Class 5 (stop, capsule, no
// improvisation) rather than guessed at.
export function classifyFailure(stage, error) {
  const msg = String(error && (error.message || error) || '');
  if (/ENOENT.*(\.prism-cache|proof\/prism-kit|assets\/prism-kit)/.test(msg)) {
    return { class: 1, label: 'SAFE_MECHANICAL', reason: 'missing project-local directory', repair: 'mkdir -p and retry' };
  }
  if (/not yet implemented/i.test(msg)) {
    return { class: 5, label: 'ARCHITECTURAL_UNKNOWN', reason: 'stage has no asset-specific implementation yet', repair: null };
  }
  if (/ModuleNotFoundError|Cannot find module|command not found/i.test(msg)) {
    return { class: 3, label: 'TOOL_ENVIRONMENT', reason: 'missing dependency/executable', repair: 'attempt project/user-local install if safe, else stop and ask' };
  }
  if (/AssertionError|assert|validator|schema/i.test(msg)) {
    return { class: 2, label: 'CODE_BUILD', reason: 'deterministic assertion/validator failure in current work', repair: 'inspect and fix the just-written code, then rerun this stage only' };
  }
  return { class: 5, label: 'ARCHITECTURAL_UNKNOWN', reason: 'unrecognized failure, not guessed at', repair: null };
}

/**
 * @param {string} asset
 * @param {Array<{name:string, run:(ctx)=>Promise<any>, skippableOnResume?:boolean}>} stages
 * @param {{resume?:boolean}} opts
 */
export async function runPipeline(asset, stages, opts = {}) {
  const state = opts.resume ? loadCheckpoint(asset) : { asset, lastCompletedStage: null, stages: {}, attempts: {}, updatedAt: null };
  if (!opts.resume) clearFailureCapsule(asset);
  const git = await gitInfo();

  for (const stage of stages) {
    const prior = state.stages[stage.name];
    const canSkip = opts.resume && SKIPPABLE_ON_RESUME.has(stage.name) && prior?.status === 'ok';
    if (canSkip) {
      console.log(`[${stage.name}] SKIP (resume: already ok at ${prior.at})`);
      continue;
    }

    console.log(`[${stage.name}] running…`);
    state.attempts[stage.name] = state.attempts[stage.name] || 0;
    let lastError = null;
    let attemptRepairs = [];
    const maxAttempts = MAX_ATTEMPTS + 1; // first try + up to 2 repaired retries

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const started = Date.now();
      try {
        const result = await stage.run({ asset, state, attempt });
        state.stages[stage.name] = { status: 'ok', at: nowIso(), durationMs: Date.now() - started, result: result ?? null };
        state.lastCompletedStage = stage.name;
        saveCheckpoint(asset, state);
        console.log(`[${stage.name}] OK (${Date.now() - started}ms)`);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        const classification = classifyFailure(stage.name, error);
        console.error(`[${stage.name}] FAILED (attempt ${attempt}): ${error.message || error}`);
        console.error(`[${stage.name}] classified as CLASS ${classification.class} (${classification.label}): ${classification.reason}`);

        if (classification.class === 5) {
          break; // never improvise past architecture; stop immediately
        }
        if (classification.class === 4) {
          console.error(`[${stage.name}] visual failure is never auto-passed — stopping for human review.`);
          break;
        }
        if (attempt > MAX_ATTEMPTS) {
          console.error(`[${stage.name}] retry budget (${MAX_ATTEMPTS}) exhausted.`);
          break;
        }
        attemptRepairs.push({ attempt, class: classification.class, action: classification.repair || 'none' });
        // Class 1/2/3 with a diagnosed repair: the stage's own run() is
        // responsible for performing the repair on the NEXT call using
        // ctx.attempt — this loop only decides whether another attempt is
        // warranted, per the "diagnosed change, not a blind rerun" rule.
        if (!classification.repair) break;
      }
    }

    if (lastError) {
      state.stages[stage.name] = { status: 'failed', at: nowIso(), error: String(lastError.message || lastError) };
      saveCheckpoint(asset, state);
      const capsule = {
        branch: git.branch, head: git.head,
        asset, failedStage: stage.name,
        exitCode: typeof lastError.code === 'number' ? lastError.code : 1,
        error: String(lastError.message || lastError),
        attemptedRepairs: attemptRepairs,
        artifactPath: path.relative(P.REPO_ROOT, P.assetCacheDir(asset)),
        nextRecommendedAction: classifyFailure(stage.name, lastError).repair
          || `Read the ${stage.name} stage implementation for '${asset}' and address the root cause, then run: npm run prism:resume -- ${asset}`,
        timestamp: nowIso(),
      };
      const capsulePath = writeFailureCapsule(asset, capsule);
      console.error(`\nSTOPPED. Failure capsule written: ${path.relative(P.REPO_ROOT, capsulePath)}`);
      return { ok: false, state, capsule };
    }
  }

  return { ok: true, state };
}
