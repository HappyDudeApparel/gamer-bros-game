import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hybrid = path.join(root, 'hybrid-v09');
const runtimePath = path.join(hybrid, 'runtime', 'main.js');
const chunkDir = path.join(hybrid, 'src', 'chunks');

const runtime = fs.readFileSync(runtimePath, 'utf8');
const fnStart = runtime.indexOf('function patchRuntime(source){');
const fnEnd = runtime.indexOf('\ntry{', fnStart);
if (fnStart < 0 || fnEnd < 0) throw new Error('Could not extract patchRuntime from Phase 2D runtime.');
const fnSource = runtime.slice(fnStart, fnEnd);
const patchRuntime = Function(`"use strict";\n${fnSource}\nreturn patchRuntime;`)();

const chunks = Array.from({ length: 10 }, (_, i) =>
  fs.readFileSync(path.join(chunkDir, `${String(i + 1).padStart(2, '0')}.txt`), 'utf8')
);
let source = patchRuntime(chunks.join(''));

function replaceOnce(find, replacement, label) {
  if (!source.includes(find)) throw new Error(`M1/M2 source promotion missing target: ${label}`);
  source = source.replace(find, replacement);
}

// M2 — rebuild the portal tail as a continuous authored sequence.
replaceOnce(
  "const phaseDur={charge:2.60,convert:2.65,dissipate:2.25,afterglow:.85};",
  "const phaseDur={charge:2.60,convert:2.65,sustain:.45,dissipate:1.55,afterglow:.90};",
  'portal durations'
);

replaceOnce(
  "else if(name==='afterglow'){phaseLine.textContent='4 · AFTERGLOW';activateBtn.textContent='COOLING…';}",
  "else if(name==='sustain'){phaseLine.textContent='4 · SUSTAIN';activateBtn.textContent='TRANSMITTING…';}\n      else if(name==='afterglow'){phaseLine.textContent='6 · SETTLE';activateBtn.textContent='COOLING…';}\n      else if(name==='complete'){phaseLine.textContent='7 · COMPLETE · PLAY AGAIN';activateBtn.textContent='TRANSMISSION COMPLETE';resetBtn.textContent='PLAY AGAIN';}",
  'portal phase labels'
);

replaceOnce(
  "if(p>=1){heroPortalState='gone';gamerRoot.visible=false;heroGhost.visible=false;heroParticlePoints.visible=false;setPhase('afterglow');phaseT=0;phaseLine.textContent='5 · TRANSMISSION COMPLETE';activateBtn.textContent='TRANSMISSION COMPLETE';resetBtn.textContent='PLAY AGAIN';syncPortalCharacterUI();}",
  "if(p>=1){heroPortalState='gone';gamerRoot.visible=false;heroGhost.visible=false;setPhase('sustain');syncPortalCharacterUI();}",
  'convert to sustain'
);

replaceOnce(
  "      }else if(phase==='dissipate'){",
  "      }else if(phase==='sustain'){\n        const p=clamp(phaseT/phaseDur.sustain,0,1);fx=1;fill=1;disc=1.48+.16*Math.sin(t*8.0);arcFx=.70;pl=34;ph=22;pw=7.5;heroParticlePoints.visible=true;updateHeroDissolveParticles(1,t,false);heroParticleMat.opacity=.68+.12*Math.sin(t*9.0);heroParticleMat.size=.050;if(p>=1)setPhase('dissipate');\n      }else if(phase==='dissipate'){",
  'sustain phase'
);

replaceOnce(
  "if(p>=1){phaseT=phaseDur.afterglow;heroParticleMat.opacity=0;}",
  "if(p>=1){heroParticleMat.opacity=0;heroParticlePoints.visible=false;setPhase('complete');resetBtn.textContent='PLAY AGAIN';activateBtn.textContent='TRANSMISSION COMPLETE';phaseLine.textContent='7 · COMPLETE · PLAY AGAIN';}",
  'settle to complete'
);

replaceOnce(
  "      // Update the character AFTER its home/portal placement has been set.",
  "      if(phase==='complete'){const breathe=.5+.5*Math.sin(t*.72);fx=.085+.025*breathe;fill=.10;disc=.27+.055*breathe;arcFx=0;pl=8.2+.7*breathe;ph=5.2+.45*breathe;pw=0;heroParticleMat.opacity=0;}\n\n      // Update the character AFTER its home/portal placement has been set.",
  'completed breathing state'
);

replaceOnce(
  "const idleLike=phaseName==='idle'||phaseName==='afterglow'",
  "const idleLike=phaseName==='idle'||phaseName==='afterglow'||phaseName==='complete'",
  'complete particle idle'
);

replaceOnce(
  "if(phase==='idle'||phase==='afterglow')risingRings.forEach(m=>m.material.opacity=0);",
  "if(phase==='idle'||phase==='afterglow'||phase==='complete')risingRings.forEach(m=>m.material.opacity=0);",
  'complete ring idle'
);

replaceOnce(
  "portal:{yaw:.06,pitch:.075,distance:10.40,target:new THREE.Vector3(0,2.55,0)},",
  "portal:{yaw:.06,pitch:.10,distance:12.20,target:new THREE.Vector3(0,2.48,0)},",
  'portal camera distance'
);

// M1 cleanup directly in promoted source.
replaceOnce(
  "const PLAYER_RADIUS=.34,STEP_HEIGHT=.90,GRAVITY=8.25,JUMP_V=5.05,DOUBLE_JUMP_V=4.65,HOLD_BOOST_V=3.95,HOLD_BOOST_INTERVAL=.22;",
  "const PLAYER_RADIUS=.34,STEP_HEIGHT=.50,GRAVITY=8.25,JUMP_V=5.05,DOUBLE_JUMP_V=4.65,HOLD_BOOST_V=3.95,HOLD_BOOST_INTERVAL=.22;",
  'step height'
);
source = source.replace(
  "if(moveKeys.jump&&!player.grounded){",
  "if(moveKeys.jump&&!player.grounded&&player.jumpCount<2){"
);

source = `// Hybrid v0.9 — promoted clean source (M1) + portal timeline rebuild (M2)\n// Generated once from the last Phase 2D runtime. Do not reintroduce runtime string patching.\n${source}`;

const gamePath = path.join(hybrid, 'src', 'game.js');
fs.writeFileSync(gamePath, source);

const indexPath = path.join(hybrid, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html
  .replace(/<title>[^<]*<\/title>/, '<title>Gamer Bros · Hybrid v0.9 · M2 Clean Portal</title>')
  .replace(/Hybrid v0\.9 · Phase 2D/g, 'Hybrid v0.9 · M2 Clean Portal')
  .replace(/HYBRID v0\.9 · PHASE 2D/g, 'HYBRID v0.9 · M2 CLEAN PORTAL')
  .replace('Loading the wide portal sequence, smooth native hero, controller-button barrage and combat arena.', 'Loading the promoted clean source and rebuilt portal transmission timeline.')
  .replace('Stick up = camera-forward · drag world anytime · hold ZAP to fire controller buttons', 'Stick up = camera-forward · drag world anytime · portal completes only when you choose PLAY AGAIN')
  .replace(/<script type="module" src="\.\/runtime\/main\.js\?v=[^"]+"><\/script>\s*<script type="module" src="\.\/phase2d\.js\?v=[^"]+"><\/script>/, '<script type="module" src="./src/game.js?v=090m2"></script>');
fs.writeFileSync(indexPath, html);

console.log(`Promoted clean source: ${gamePath} (${source.length} bytes)`);
