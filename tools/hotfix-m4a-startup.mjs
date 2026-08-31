import fs from 'node:fs';

const gamePath='hybrid-v09/src/game.js';
let s=fs.readFileSync(gamePath,'utf8');
function replaceRequired(oldText,newText,label){
  if(!s.includes(oldText)) throw new Error(`Crystal Library refinement target not found: ${label}`);
  s=s.replace(oldText,newText);
}
const oldBuild="const crystalLibrary=buildCrystalLibraryV2({THREE,scene,parent:ext,layout:arenaLayout,mobile,resolvedQuality,addRectSurface,addDiscSurface,addRampSurface,glowTex});";
const newBuild="const crystalLibrary=buildCrystalLibraryV2({THREE,scene,parent:ext,layout:arenaLayout,mobile,resolvedQuality,addRectSurface,addDiscSurface,addRampSurface,glowTex,stoneMap,stoneNormal,floorMap,floorRough});";
if(s.includes(oldBuild))s=s.replace(oldBuild,newBuild);else if(!s.includes(newBuild))throw new Error('Crystal Library build call not found');
replaceRequired("const target=new THREE.Vector3(0,2.9,0),targetLook=target.clone();","const target=new THREE.Vector3(gamerBase.x,gamerBase.y+1.45,gamerBase.z),targetLook=target.clone();",'camera initial target');
replaceRequired("let viewIndex=0,yaw=views.hero.yaw,pitch=.34,distance=13.4,targetYaw=yaw,targetPitch=pitch,targetDistance=distance,autoOrbit=false,dragging=false,lastX=0,lastY=0,pinchDist=0,followDistance=13.4,recenterClock=0;","let viewIndex=0,yaw=views.hero.yaw,pitch=.41,distance=15.8,targetYaw=yaw,targetPitch=pitch,targetDistance=distance,autoOrbit=false,dragging=false,lastX=0,lastY=0,pinchDist=0,followDistance=15.8,recenterClock=0;",'camera framing');
s=s.replace("pitch=THREE.MathUtils.damp(pitch,cameraMode==='tight'?.24:.34,2.5,dt)","pitch=THREE.MathUtils.damp(pitch,cameraMode==='tight'?.28:.41,2.5,dt)");
fs.writeFileSync(gamePath,s);

const indexPath='hybrid-v09/index.html';
let html=fs.readFileSync(indexPath,'utf8');
html=html.replace(/\.\/src\/game\.js\?v=[^\"']+/,'./src/game.js?v=090clv24');
fs.writeFileSync(indexPath,html);
console.log('Applied Crystal Library v2.4 texture and camera framing refinement');
