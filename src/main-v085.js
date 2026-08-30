const chunkPaths = [
  '01.txt','02.txt','03.txt','04.txt','05.txt','06.txt','07.txt','08.txt','09.txt','10.txt'
].map((name) => new URL(`./chunks/${name}`, import.meta.url));

window.__gamerInput = window.__gamerInput || { x: 0, y: 0, active: false };

function patchRuntime(source) {
  const patches = [];
  function rep(find, replace, label) {
    if (!source.includes(find)) { console.warn('[v0.8.5 patch miss]', label); return; }
    source = source.replace(find, replace); patches.push(label);
  }
  rep("const f=(moveKeys.up?1:0)-(moveKeys.down?1:0),sd=(moveKeys.right?1:0)-(moveKeys.left?1:0),len=Math.hypot(f,sd);","const ai=window.__gamerInput;const f=ai?.active?-ai.y:((moveKeys.up?1:0)-(moveKeys.down?1:0)),sd=ai?.active?ai.x:((moveKeys.right?1:0)-(moveKeys.left?1:0)),len=Math.min(1,Math.hypot(f,sd));",'analog movement');
  rep("player.yaw+=diff*Math.min(1,dt*10.5);","player.yaw+=diff*Math.min(1,dt*2.15);",'gentler hero steering');
  rep("const targetSpeed=len>0?(moveKeys.run?4.65:2.85):0;","const targetSpeed=len>0?(moveKeys.run?4.65:2.85)*Math.max(.24,len):0;",'analog speed');
  rep("const viewOrder=['hero','gamer','front','profile','back','face','portal','room'];let viewIndex=0,yaw=views.hero.yaw,pitch=views.hero.pitch,distance=views.hero.distance,targetYaw=yaw,targetPitch=pitch,targetDistance=distance,autoOrbit=false,dragging=false,lastX=0,lastY=0,pinchDist=0;","const viewOrder=['hero','gamer','front','profile','back','face','portal','room'];let viewIndex=0,yaw=views.hero.yaw,pitch=views.hero.pitch,distance=views.hero.distance,targetYaw=yaw,targetPitch=pitch,targetDistance=distance,autoOrbit=false,dragging=false,lastX=0,lastY=0,pinchDist=0,followDistance=13.8,followYawOffset=0,followPitchOffset=0;",'follow camera state');
  rep("function applyCamera(dt=.016){if(cameraMode==='orbit'||heroPortalState!=='outside'){yaw+=(targetYaw-yaw)*.085;pitch+=(targetPitch-pitch)*.085;distance+=(targetDistance-distance)*.09;target.lerp(targetLook,.085);}else{targetLook.set(player.x,player.y+1.35,player.z);target.lerp(targetLook,.14);const desired=followLock?player.yaw+Math.PI:targetYaw;const dy=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));yaw+=dy*Math.min(1,dt*(followLock?7.2:4.2));const dp=cameraMode==='tight'?.16:.24,dd=cameraMode==='tight'?3.65:6.10;pitch+=(dp-pitch)*Math.min(1,dt*6);distance+=(dd-distance)*Math.min(1,dt*5.5);}const cp=Math.cos(pitch);camera.position.set(target.x+Math.sin(yaw)*cp*distance,target.y+Math.sin(pitch)*distance+(cameraMode==='tight'?.18:.48),target.z+Math.cos(yaw)*cp*distance);camera.lookAt(target);}","function applyCamera(dt=.016){if(cameraMode==='orbit'||heroPortalState!=='outside'){yaw+=(targetYaw-yaw)*.085;pitch+=(targetPitch-pitch)*.085;distance+=(targetDistance-distance)*.09;target.lerp(targetLook,.085);}else{targetLook.set(player.x,player.y+1.48,player.z);target.lerp(targetLook,.12);if(!dragging){followYawOffset*=Math.pow(.06,dt);followPitchOffset*=Math.pow(.08,dt);if(Math.abs(followYawOffset)<.0005)followYawOffset=0;if(Math.abs(followPitchOffset)<.0005)followPitchOffset=0;}const desired=followLock?player.yaw+Math.PI+followYawOffset:targetYaw;const dy=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));yaw+=dy*Math.min(1,dt*(followLock?2.35:3.2));const dp=(cameraMode==='tight'?.20:.31)+followPitchOffset,dd=cameraMode==='tight'?5.4:followDistance;pitch+=(dp-pitch)*Math.min(1,dt*4.2);distance+=(dd-distance)*Math.min(1,dt*3.5);}const cp=Math.cos(pitch);camera.position.set(target.x+Math.sin(yaw)*cp*distance,target.y+Math.sin(pitch)*distance+(cameraMode==='tight'?.40:1.05),target.z+Math.cos(yaw)*cp*distance);camera.lookAt(target);}",'rear camera farther higher softer');
  rep("renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(cameraMode==='orbit'||!followLock){targetYaw-=dx*.006;targetPitch=clamp(targetPitch+dy*.0047,-.24,.48);}});","renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(cameraMode==='orbit'||!followLock){targetYaw-=dx*.006;targetPitch=clamp(targetPitch+dy*.0047,-.24,.48);}else{followYawOffset-=dx*.0048;followPitchOffset=clamp(followPitchOffset+dy*.0035,-.18,.24);}});",'follow drag look');
  rep("renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();targetDistance=clamp(targetDistance+Math.sign(e.deltaY)*.65,1.7,20.0);hint.classList.add('fade');},{passive:false});","renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();if(cameraMode!=='orbit'&&followLock)followDistance=clamp(followDistance+Math.sign(e.deltaY)*.95,6.5,30);else targetDistance=clamp(targetDistance+Math.sign(e.deltaY)*.65,1.7,24);hint.classList.add('fade');},{passive:false});",'follow wheel zoom');
  rep("renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.hypot(dx,dy);if(pinchDist)targetDistance=clamp(targetDistance+(pinchDist-d)*.016,1.7,20.0);pinchDist=d;}},{passive:false});renderer.domElement.addEventListener('touchend',()=>pinchDist=0,{passive:true});","renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.hypot(dx,dy);if(pinchDist){if(cameraMode!=='orbit'&&followLock)followDistance=clamp(followDistance+(pinchDist-d)*.030,6.5,30);else targetDistance=clamp(targetDistance+(pinchDist-d)*.020,1.7,24);}pinchDist=d;}},{passive:false});renderer.domElement.addEventListener('touchend',()=>pinchDist=0,{passive:true});",'follow pinch zoom');
  console.info('[v0.8.5 runtime patches]', patches.join(', '));
  return source;
}

try {
  const parts = await Promise.all(chunkPaths.map(async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load ${url.pathname}: ${response.status}`);
    return response.text();
  }));
  let source = patchRuntime(parts.join(''));
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try { await import(url); } finally { URL.revokeObjectURL(url); }
} catch (error) {
  console.error(error);
  const boot = document.getElementById('boot');
  const fatal = document.getElementById('fatal');
  const fatalText = document.getElementById('fatalText');
  if (boot) boot.style.display = 'none';
  if (fatal) fatal.style.display = 'grid';
  if (fatalText) fatalText.textContent = 'Game files could not be loaded. ' + (error?.message || String(error));
}
