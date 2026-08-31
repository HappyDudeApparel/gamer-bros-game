import fs from 'node:fs';

const gamePath='hybrid-v09/src/game.js';
let s=fs.readFileSync(gamePath,'utf8');
function replaceRequired(oldText,newText,label){
  if(!s.includes(oldText)) throw new Error(`Crystal Library refinement target not found: ${label}`);
  s=s.replace(oldText,newText);
}
replaceRequired('let roomLightMult=2.20,roomTrim=1,baseEnvIntensity=.87,baseFogDensity=.0100;',"let roomLightMult=.92,roomTrim=1,baseEnvIntensity=.87,baseFogDensity=.0100;",'default lighting');
replaceRequired("lightingSlider.value='220';","lightingSlider.value='92';",'lighting slider');
replaceRequired('const gamerBase=new THREE.Vector3(0,.02,5.25);','const gamerBase=new THREE.Vector3(arenaLayout.spawn.x,.02,arenaLayout.spawn.z);','Crystal Library spawn');
fs.writeFileSync(gamePath,s);

const indexPath='hybrid-v09/index.html';
let html=fs.readFileSync(indexPath,'utf8');
html=html.replace('<span id="lightingValue">220%</span>','<span id="lightingValue">92%</span>');
html=html.replace('value="220" step="1"','value="92" step="1"');
html=html.replace(/\.\/src\/game\.js\?v=[^\"']+/,'./src/game.js?v=090clv22');
fs.writeFileSync(indexPath,html);
console.log('Applied Crystal Library spawn and lighting refinement');
