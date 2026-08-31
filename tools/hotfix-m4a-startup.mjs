import fs from 'node:fs';

const gamePath='hybrid-v09/src/game.js';
let s=fs.readFileSync(gamePath,'utf8');
function replaceRequired(oldText,newText,label){
  if(!s.includes(oldText)) throw new Error(`Crystal Library refinement target not found: ${label}`);
  s=s.replace(oldText,newText);
}
const oldFrame="let viewIndex=0,yaw=views.hero.yaw,pitch=.41,distance=15.8,targetYaw=yaw,targetPitch=pitch,targetDistance=distance,autoOrbit=false,dragging=false,lastX=0,lastY=0,pinchDist=0,followDistance=15.8,recenterClock=0;";
const newFrame="let viewIndex=0,yaw=views.hero.yaw,pitch=.16,distance=14.6,targetYaw=yaw,targetPitch=pitch,targetDistance=distance,autoOrbit=false,dragging=false,lastX=0,lastY=0,pinchDist=0,followDistance=14.6,recenterClock=0;";
replaceRequired(oldFrame,newFrame,'eye-level library camera framing');
replaceRequired("pitch=THREE.MathUtils.damp(pitch,cameraMode==='tight'?.28:.41,2.5,dt)","pitch=THREE.MathUtils.damp(pitch,cameraMode==='tight'?.22:.16,2.5,dt)",'follow camera pitch');
fs.writeFileSync(gamePath,s);

const indexPath='hybrid-v09/index.html';
let html=fs.readFileSync(indexPath,'utf8');
html=html.replace(/\.\/src\/game\.js\?v=[^\"']+/,'./src/game.js?v=090clv25');
fs.writeFileSync(indexPath,html);
console.log('Applied Crystal Library v2.5 eye-level camera framing');
