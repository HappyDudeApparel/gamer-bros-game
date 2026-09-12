// Generic stage definitions shared by every Prism Kit asset target.
//
// Each content stage (GENERATE / EXPORT / VALIDATE-ASSET / RENDER-*) looks
// for an asset-specific implementation module under
// tools/prism-kit/assets/<asset>/<stage>.mjs and calls its default export.
// If that module doesn't exist yet, the stage throws a clear "not yet
// implemented" error — classified as Class 5 (architectural/unknown) by the
// pipeline's failure classifier, which stops cleanly rather than faking
// success. This is intentional for M0: no asset has a GENERATE
// implementation yet, so running `prism:build -- overhang` today is
// expected to stop at GENERATE with an honest, actionable message.
import fs from 'node:fs';
import path from 'node:path';
import * as P from './paths.mjs';
import { runDoctor } from './doctor.mjs';

const STAGE_MODULE_NAMES = {
  GENERATE: 'generate.mjs',
  EXPORT: 'export.mjs',
  'VALIDATE-ASSET': 'validate.mjs',
  'RENDER-DESKTOP': 'render.mjs',
  'RENDER-ANDROID': 'render.mjs',
  'COLLECT-METRICS': 'metrics.mjs',
};

async function loadAssetStage(asset, stageName) {
  const moduleName = STAGE_MODULE_NAMES[stageName];
  const modulePath = path.join(P.PER_ASSET_TOOLS_DIR, asset, moduleName);
  if (!fs.existsSync(modulePath)) {
    throw new Error(
      `${stageName} not yet implemented for asset '${asset}' ` +
      `(expected tools/prism-kit/assets/${asset}/${moduleName}). ` +
      `This is expected until M1 authors it — see PRISM_KIT_PLAN.md.`
    );
  }
  const mod = await import(`file://${modulePath}?t=${Date.now()}`);
  if (typeof mod.default !== 'function') {
    throw new Error(`${modulePath} must have a default export function`);
  }
  return mod.default;
}

export function buildStageList() {
  return [
    {
      name: 'DOCTOR',
      run: async () => {
        const report = await runDoctor({ silent: true });
        if (!report.overallOk) {
          const err = new Error('doctor reported a failing core check — run `npm run prism:doctor` for details');
          throw err;
        }
        return { doctorOk: true };
      },
    },
    {
      name: 'GENERATE',
      run: async ({ asset, attempt }) => {
        const fn = await loadAssetStage(asset, 'GENERATE');
        return fn({ asset, attempt, paths: P });
      },
    },
    {
      name: 'EXPORT',
      run: async ({ asset, attempt }) => {
        const fn = await loadAssetStage(asset, 'EXPORT');
        return fn({ asset, attempt, paths: P });
      },
    },
    {
      name: 'VALIDATE-ASSET',
      run: async ({ asset, attempt }) => {
        const fn = await loadAssetStage(asset, 'VALIDATE-ASSET');
        return fn({ asset, attempt, paths: P });
      },
    },
    {
      name: 'RENDER-DESKTOP',
      run: async ({ asset, attempt }) => {
        const fn = await loadAssetStage(asset, 'RENDER-DESKTOP');
        return fn({ asset, attempt, target: 'desktop', paths: P });
      },
    },
    {
      name: 'RENDER-ANDROID',
      run: async ({ asset, attempt }) => {
        const fn = await loadAssetStage(asset, 'RENDER-ANDROID');
        return fn({ asset, attempt, target: 'android', paths: P });
      },
    },
    {
      name: 'COLLECT-METRICS',
      run: async ({ asset, attempt }) => {
        const fn = await loadAssetStage(asset, 'COLLECT-METRICS');
        return fn({ asset, attempt, paths: P });
      },
    },
    {
      name: 'VISUAL-REVIEW-STOP',
      run: async ({ asset }) => {
        // This stage can never report success on its own authority. It
        // exists to make that fact structurally unavoidable rather than a
        // convention someone can forget.
        console.log('\n============================================');
        console.log(` VISUAL REVIEW REQUIRED for '${asset}'`);
        console.log(' Compare the actual desktop + Android renders in');
        console.log(` proof/prism-kit/${asset}/ against the concept`);
        console.log(' references. Technical success above is NOT a');
        console.log(' visual approval. Do not mark this GREEN in any');
        console.log(' doc without a human/independent image comparison.');
        console.log('============================================\n');
        return { visualApproval: 'PENDING_HUMAN_REVIEW' };
      },
    },
  ];
}
