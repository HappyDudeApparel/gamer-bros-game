#!/usr/bin/env node
// Prism Kit CLI — single entry point for all local production-pipeline
// subcommands. Deliberately thin: it wires lib/doctor.mjs, lib/stages.mjs
// and lib/pipeline.mjs together and does no independent logic of its own.
//
// Usage:
//   node tools/prism-kit/cli.mjs doctor
//   node tools/prism-kit/cli.mjs build   <asset>
//   node tools/prism-kit/cli.mjs resume  <asset>
//   node tools/prism-kit/cli.mjs proof   <asset>   (alias for build, same stage list)
//   node tools/prism-kit/cli.mjs test    <asset>   (alias for build, same stage list)
//   node tools/prism-kit/cli.mjs clean
import fs from 'node:fs';
import * as P from './lib/paths.mjs';
import { runDoctor } from './lib/doctor.mjs';
import { buildStageList } from './lib/stages.mjs';
import { runPipeline, readFailureCapsule } from './lib/pipeline.mjs';

const [, , command, asset] = process.argv;

async function cmdDoctor() {
  const report = await runDoctor({ silent: false });
  process.exit(report.overallOk ? 0 : 1);
}

async function cmdRun(assetName, { resume }) {
  if (!assetName) {
    console.error(`Usage: node tools/prism-kit/cli.mjs ${resume ? 'resume' : 'build'} <asset>`);
    process.exit(1);
  }
  const stages = buildStageList();
  const { ok, capsule } = await runPipeline(assetName, stages, { resume: !!resume });
  if (!ok) {
    console.error(`\nPipeline stopped for '${assetName}' at stage: ${capsule.failedStage}`);
    console.error(`Next recommended action: ${capsule.nextRecommendedAction}`);
    process.exit(1);
  }
  console.log(`\nPipeline reached VISUAL-REVIEW-STOP for '${assetName}'. Technical stages complete.`);
  console.log('This is NOT a visual approval — see PRISM_KIT_RULES.md.');
  process.exit(0);
}

function cmdClean() {
  if (fs.existsSync(P.CACHE_DIR)) {
    fs.rmSync(P.CACHE_DIR, { recursive: true, force: true });
    console.log(`Removed ${P.CACHE_DIR} (checkpoints, failure capsules, cached chromedriver).`);
  } else {
    console.log('Nothing to clean — .prism-cache/ does not exist.');
  }
  console.log('assets/prism-kit, proof/prism-kit, references/prism-valley and all repo content were left untouched.');
}

function cmdCapsule(assetName) {
  if (!assetName) {
    console.error('Usage: node tools/prism-kit/cli.mjs capsule <asset>');
    process.exit(1);
  }
  const capsule = readFailureCapsule(assetName);
  if (!capsule) {
    console.log(`No failure capsule for '${assetName}'.`);
    return;
  }
  console.log(JSON.stringify(capsule, null, 2));
}

switch (command) {
  case 'doctor':
    await cmdDoctor();
    break;
  case 'build':
  case 'proof':
  case 'test':
    await cmdRun(asset, { resume: false });
    break;
  case 'resume':
    await cmdRun(asset, { resume: true });
    break;
  case 'clean':
    cmdClean();
    break;
  case 'capsule':
    cmdCapsule(asset);
    break;
  default:
    console.error('Prism Kit CLI — unknown or missing command.');
    console.error('Commands: doctor | build <asset> | resume <asset> | proof <asset> | test <asset> | clean | capsule <asset>');
    process.exit(1);
}
