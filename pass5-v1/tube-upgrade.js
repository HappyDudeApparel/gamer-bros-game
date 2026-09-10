import * as THREE from 'three';
import {createAdvancedTube,ADVANCED_TUBE_ID} from '../src/advanced-tube-v1.js';

// Temporary compatibility upgrade for the deprecated Pass 5 map. The actual next
// level will use createAdvancedTube directly. This hides the placeholder cylinder
// tube and overlays the canonical refined glass/metal/bronze transfer chamber at the
// same trigger position, with shader/program prewarming before player interaction.
const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
const nativeRender=THREE.WebGLRenderer.prototype.render;
let upgraded=false,portal=null,rendererRef=null,sceneRef=null,last=performance.now();
window.__advancedTubeUpgradeLoaded=true;

function distXZ(a,b){return Math.hypot((a.x||0)-(b.x||0),(a.z||0)-(b.z||0));}
function findPlaceholder(scene,pos){let best=null,bestScore=1e9;scene.traverse(o=>{
  if(o===scene||!o.isGroup||!o.visible||o.userData?.advancedTube)return;
  const wp=new THREE.Vector3();o.getWorldPosition(wp);const d=distXZ(wp,pos);
  if(d<.5&&o.children?.length>8&&d<bestScore){best=o;bestScore=d;}
 });return best;
}
async function upgrade(renderer,scene){if(upgraded||!window.__tubeReady||!window.__tubePosition)return;upgraded=true;rendererRef=renderer;sceneRef=scene;const p=window.__tubePosition;
  const placeholder=findPlaceholder(scene,p);if(placeholder){placeholder.visible=false;window.__placeholderTubeHidden=true;}
  portal=createAdvancedTube(THREE,{mobile});portal.root.userData.advancedTube=true;portal.root.userData.component=ADVANCED_TUBE_ID;portal.root.position.set(p.x,p.y||0,p.z);scene.add(portal.root);window.__advancedTubeReady=true;window.__advancedTubeComponent=ADVANCED_TUBE_ID;
  try{const promise=renderer.compileAsync?.(scene,window.__pass5Runtime?.camera);if(promise?.then)await promise;else renderer.compile?.(scene,window.__pass5Runtime?.camera);window.__advancedTubePrewarmed=true;}catch(e){console.warn('[Advanced Tube] prewarm fallback',e);window.__advancedTubePrewarmed=true;}
}
THREE.WebGLRenderer.prototype.render=function(scene,camera){const now=performance.now(),dt=Math.min(.04,(now-last)/1000);last=now;if(!upgraded&&window.__pass5Ready&&window.__tubeReady)upgrade(this,scene);if(portal){const state=window.__tubeState||'idle';portal.setCharge(state==='charge'?1:state==='complete'?.12:0);portal.update(now*.001,dt);}return nativeRender.call(this,scene,camera);};
