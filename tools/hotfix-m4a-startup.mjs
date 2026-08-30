import fs from 'node:fs';

const gamePath='hybrid-v09/src/game.js';
let s=fs.readFileSync(gamePath,'utf8');
const old='    bakeEnvironment();';
if(!s.includes(old)) throw new Error('M4A startup bake call not found');
s=s.replace(old,"    // M4A startup hotfix: skip the old six-face CubeCamera/PMREM bake.\n    // The expanded arena made this a blocking preloader workload on mobile.\n    scene.environment=null;environmentTarget=null;applyRoomLight();");
fs.writeFileSync(gamePath,s);

const indexPath='hybrid-v09/index.html';
let html=fs.readFileSync(indexPath,'utf8');
html=html.replace('./src/game.js?v=090m4a','./src/game.js?v=090m4a1');
fs.writeFileSync(indexPath,html);
console.log('Applied M4A startup hotfix');
