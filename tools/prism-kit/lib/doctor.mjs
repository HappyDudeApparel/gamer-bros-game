// DOCTOR: detects what's actually available in THIS environment and
// reports it plainly. It does not assume a local Windows PC with a D:
// drive — this tooling runs wherever Claude Code (or a human) invokes it,
// container or real machine alike, entirely from repo-relative paths.
//
// Safe, project-local repairs it WILL do:
//   - create missing cache/proof directories;
//   - download a Chromium-version-matched chromedriver into
//     .prism-cache/tools/ (never system-wide, never committed).
//
// It will NEVER: install Blender, modify system packages, or touch
// anything outside this repo checkout and its own ignored cache dir.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import * as P from './paths.mjs';

const run = promisify(execFile);

async function tryRun(cmd, args) {
  try {
    const { stdout } = await run(cmd, args, { timeout: 10_000 });
    return { ok: true, output: stdout.trim() };
  } catch (error) {
    return { ok: false, output: null, error: String(error.message || error) };
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function checkGit() {
  const branch = await tryRun('git', ['-C', P.REPO_ROOT, 'rev-parse', '--abbrev-ref', 'HEAD']);
  const head = await tryRun('git', ['-C', P.REPO_ROOT, 'rev-parse', 'HEAD']);
  const status = await tryRun('git', ['-C', P.REPO_ROOT, 'status', '--short']);
  return {
    ok: branch.ok && head.ok,
    branch: branch.output || null,
    head: head.output || null,
    dirty: status.ok ? status.output.length > 0 : null,
  };
}

async function findChromiumBinary() {
  const candidates = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    process.env.PRISM_CHROME_BINARY,
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  // Fall back to whatever's on PATH.
  const which = await tryRun('sh', ['-c', 'command -v chromium || command -v google-chrome || true']);
  return which.ok && which.output ? which.output : null;
}

async function chromiumVersion(binary) {
  const r = await tryRun(binary, ['--version']);
  if (!r.ok) return null;
  const m = r.output.match(/(\d+\.\d+\.\d+\.\d+)/);
  return m ? m[1] : null;
}

function httpsGet(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects > 0) {
        res.resume();
        return resolve(httpsGet(res.headers.location, redirects - 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function ensureMatchingChromedriver(chromiumVer) {
  const driverPath = path.join(P.TOOLS_CACHE_DIR, 'chromedriver');
  const versionFile = path.join(P.TOOLS_CACHE_DIR, 'chromedriver.version');
  if (fs.existsSync(driverPath) && fs.existsSync(versionFile)) {
    const cachedVer = fs.readFileSync(versionFile, 'utf8').trim();
    if (cachedVer === chromiumVer) {
      return { ok: true, path: driverPath, action: 'cached', version: cachedVer };
    }
  }
  if (!chromiumVer) return { ok: false, action: 'no-chromium-version' };
  ensureDir(P.TOOLS_CACHE_DIR);
  const url = `https://storage.googleapis.com/chrome-for-testing-public/${chromiumVer}/linux64/chromedriver-linux64.zip`;
  let zipBuf;
  try {
    zipBuf = await httpsGet(url);
  } catch (error) {
    return { ok: false, action: 'download-failed', error: String(error.message || error), url };
  }
  const zipPath = path.join(P.TOOLS_CACHE_DIR, 'chromedriver.zip');
  fs.writeFileSync(zipPath, zipBuf);
  const unzip = await tryRun('unzip', ['-o', zipPath, '-d', P.TOOLS_CACHE_DIR]);
  if (!unzip.ok) return { ok: false, action: 'unzip-failed', error: unzip.error };
  const extracted = path.join(P.TOOLS_CACHE_DIR, 'chromedriver-linux64', 'chromedriver');
  if (!fs.existsSync(extracted)) return { ok: false, action: 'extracted-binary-missing' };
  fs.copyFileSync(extracted, driverPath);
  fs.chmodSync(driverPath, 0o755);
  fs.writeFileSync(versionFile, chromiumVer);
  return { ok: true, path: driverPath, action: 'downloaded', version: chromiumVer };
}

export async function runDoctor({ silent = false } = {}) {
  const log = silent ? () => {} : (...a) => console.log(...a);
  ensureDir(P.CACHE_DIR);
  ensureDir(P.TOOLS_CACHE_DIR);
  ensureDir(P.ASSETS_DIR);
  ensureDir(P.PROOF_DIR);
  ensureDir(P.REFERENCES_DIR);

  const report = { timestamp: new Date().toISOString(), checks: {} };

  log('== Prism Kit Doctor ==');

  const node = await tryRun('node', ['--version']);
  report.checks.node = { ok: node.ok, version: node.output };
  log(`node:        ${node.ok ? node.output : 'MISSING'}`);

  const python = await tryRun('python3', ['--version']);
  report.checks.python = { ok: python.ok, version: python.output };
  log(`python3:     ${python.ok ? python.output : 'MISSING'}`);

  const gitVer = await tryRun('git', ['--version']);
  const git = await checkGit();
  report.checks.git = { ok: gitVer.ok && git.ok, version: gitVer.output, ...git };
  log(`git:         ${gitVer.output || 'MISSING'}`);
  log(`repo:        branch=${git.branch} head=${git.head?.slice(0, 10)} dirty=${git.dirty}`);

  const chromeBinary = await findChromiumBinary();
  const chromeVer = chromeBinary ? await chromiumVersion(chromeBinary) : null;
  report.checks.chromium = { ok: !!chromeBinary, binary: chromeBinary, version: chromeVer };
  log(`chromium:    ${chromeBinary || 'NOT FOUND'} ${chromeVer ? `(v${chromeVer})` : ''}`);

  let driverResult = { ok: false, action: 'skipped-no-chromium' };
  if (chromeBinary && chromeVer) {
    driverResult = await ensureMatchingChromedriver(chromeVer);
  }
  report.checks.chromedriver = driverResult;
  log(`chromedriver: ${driverResult.ok ? `${driverResult.action} -> ${driverResult.path}` : `FAILED (${driverResult.action})`}`);

  const selenium = await tryRun('python3', ['-c', 'import selenium; print(selenium.__version__)']);
  report.checks.selenium = { ok: selenium.ok, version: selenium.output };
  log(`selenium:    ${selenium.ok ? selenium.output : 'MISSING (pip install --user selenium)'}`);

  const exporterPath = path.join(P.REPO_ROOT, 'vendor', 'three', 'addons', 'exporters', 'GLTFExporter.js');
  const exporterOk = fs.existsSync(exporterPath);
  report.checks.gltfExporter = { ok: exporterOk, path: exporterPath };
  log(`GLTFExporter: ${exporterOk ? 'present (vendored)' : 'MISSING'}`);

  const blender = await tryRun('sh', ['-c', 'command -v blender || true']);
  const blenderPresent = blender.ok && !!blender.output;
  report.checks.blender = { ok: blenderPresent, present: blenderPresent, required: false };
  log(`blender:     ${blenderPresent ? blender.output : 'not installed (not required — see PRISM_KIT_PLAN.md)'}`);

  const refFiles = fs.existsSync(P.REFERENCES_DIR) ? fs.readdirSync(P.REFERENCES_DIR).filter(f => !f.startsWith('.')) : [];
  report.checks.references = { ok: refFiles.length >= 2, files: refFiles };
  log(`references:  ${refFiles.length ? refFiles.join(', ') : 'NONE — see PRISM_KIT_HANDOFF.md for the one manual step'}`);

  report.overallOk = report.checks.node.ok && report.checks.python.ok && report.checks.git.ok
    && report.checks.chromium.ok && report.checks.chromedriver.ok && report.checks.gltfExporter.ok;

  fs.writeFileSync(P.doctorReportPath(), JSON.stringify(report, null, 2));
  log(`\nReport written: ${path.relative(P.REPO_ROOT, P.doctorReportPath())}`);
  log(report.overallOk
    ? 'DOCTOR: core toolchain ready for M1 generation work.'
    : 'DOCTOR: one or more core checks failed — see above before starting M1.');

  return report;
}
