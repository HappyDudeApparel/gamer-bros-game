const chunkPaths = [
  '01.txt','02.txt','03.txt','04.txt','05.txt','06.txt','07.txt','08.txt','09.txt','10.txt'
].map((name) => new URL(`./chunks/${name}`, import.meta.url));

window.__gamerInput = window.__gamerInput || { x: 0, y: 0, active: false };

function patchRuntime(source) {
  const patches = [];
  function rep(find, replace, label) {
    if (!source.includes(find)) { console.warn('[v0.8.7 patch miss]', label); return; }
    source = source.replace(find, replace); patches.push(label);
  }

  // Standard third-person movement: stick direction is relative to the current camera,
  // the hero rotates toward the desired travel vector, and the stick never spins the camera.
  rep("const f=(moveKeys.up?1:0)-(moveKeys.down?1:0),sd=(moveKeys.right?1:0)-(moveKeys.left?1:0),len=Math.hypot(f,sd);",
      "const ai=window.__gamerInput;const f=ai?.active?-ai.y:((moveKeys.up?1:0)-(moveKeys.down?1:0)),sd=ai?.active?ai.x:((moveKeys.right?1:0)-(moveKeys.left?1:0)),len=Math.min(1,Math.hypot(f,sd));",
      'analog camera-relative movement');
  rep("const moveYaw=(cameraMode==='orbit'?yaw+Math.PI:(followLock?player.yaw:yaw+Math.PI));",
      "const moveYaw=yaw+Math.PI;",
      'movement follows camera heading');
  rep("player.yaw+=diff*Math.min(1,dt*10.5);",
      "player.yaw+=diff*Math.min(1,dt*5.8);",
      'natural hero rotation');
  rep("const targetSpeed=len>0?(moveKeys.run?4.65:2.85):0;",
      "const targetSpeed=len>.08?(moveKeys.run?4.65:2.85)*THREE.MathUtils.smoothstep(len,.08,.92):0;",
      'smooth analog speed');
  rep("function canLeaveRoom(nx,nz){const r=Math.hypot(nx,nz);if(r<=ROOM_R-.62)return true;return nz>ROOM_R-.95&&Math.abs(nx)<2.75;}",
      "function canLeaveRoom(nx,nz){return true;}",
      'open hub movement');

  // Remove the enclosing chamber structures. The v0.5 floor, portal, crystals and materials remain.
  rep("wallInst.instanceMatrix.needsUpdate=true;if(wallInst.instanceColor)wallInst.instanceColor.needsUpdate=true;env.add(wallInst);",
      "wallInst.instanceMatrix.needsUpdate=true;if(wallInst.instanceColor)wallInst.instanceColor.needsUpdate=true;wallInst.visible=false;env.add(wallInst);",
      'remove masonry wall');
  rep("envMesh(new THREE.CylinderGeometry(ROOM_R+.18,ROOM_R+.18,.32,80),ceilingMat,new THREE.Vector3(0,ROOM_H,0),false);",
      "const openCeiling=envMesh(new THREE.CylinderGeometry(ROOM_R+.18,ROOM_R+.18,.32,80),ceilingMat,new THREE.Vector3(0,ROOM_H,0),false);openCeiling.visible=false;",
      'remove ceiling');
  rep("cornice.castShadow=false;cornice.receiveShadow=true;env.add(cornice);",
      "cornice.castShadow=false;cornice.receiveShadow=true;cornice.visible=false;env.add(cornice);",
      'remove cornice');
  rep("[archFoot,archBlocks,archCaps,archTrim,reliefOuter,reliefInner,voussoir,alcoves].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;});",
      "[archFoot,archBlocks,archCaps,archTrim,reliefOuter,reliefInner,voussoir,alcoves].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.visible=false;});",
      'remove arch structures');
  rep("[buttBase,buttBlocks,buttCaps].forEach(m=>m.instanceMatrix.needsUpdate=true);",
      "[buttBase,buttBlocks,buttCaps].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.visible=false;});",
      'remove buttresses');
  rep("[torchBack,torchBracket,torchCup].forEach(m=>m.instanceMatrix.needsUpdate=true);",
      "[torchBack,torchBracket,torchCup].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.visible=false;});torchFlame.visible=false;torchCore.visible=false;",
      'remove wall torches');
  rep("[lanternChain,lanternCap,lanternFrame,lanternGlass,lanternGlow].forEach(m=>m.instanceMatrix.needsUpdate=true);",
      "[lanternChain,lanternCap,lanternFrame,lanternGlass,lanternGlow].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.visible=false;});",
      'remove hanging lanterns');

  // Camera: no joystick/camera feedback loop. While the stick is active the camera keeps its
  // heading. After the player eases off, it waits briefly then softly settles behind the hero.
  rep("const viewOrder=['hero','gamer','front','profile','back','face','portal','room'];let viewIndex=0,yaw=views.hero.yaw,pitch=views.hero.pitch,distance=views.hero.distance,targetYaw=yaw,targetPitch=pitch,targetDistance=distance,autoOrbit=false,dragging=false,lastX=0,lastY=0,pinchDist=0;",
      "const viewOrder=['hero','gamer','front','profile','back','face','portal','room'];let viewIndex=0,yaw=views.hero.yaw,pitch=views.hero.pitch,distance=views.hero.distance,targetYaw=yaw,targetPitch=pitch,targetDistance=distance,autoOrbit=false,dragging=false,lastX=0,lastY=0,pinchDist=0,followDistance=14.5,followYawOffset=0,followPitchOffset=0,recenterClock=0;",
      'standard follow camera state');
  rep("function applyCamera(dt=.016){if(cameraMode==='orbit'||heroPortalState!=='outside'){yaw+=(targetYaw-yaw)*.085;pitch+=(targetPitch-pitch)*.085;distance+=(targetDistance-distance)*.09;target.lerp(targetLook,.085);}else{targetLook.set(player.x,player.y+1.35,player.z);target.lerp(targetLook,.14);const desired=followLock?player.yaw+Math.PI:targetYaw;const dy=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));yaw+=dy*Math.min(1,dt*(followLock?7.2:4.2));const dp=cameraMode==='tight'?.16:.24,dd=cameraMode==='tight'?3.65:6.10;pitch+=(dp-pitch)*Math.min(1,dt*6);distance+=(dd-distance)*Math.min(1,dt*5.5);}const cp=Math.cos(pitch);camera.position.set(target.x+Math.sin(yaw)*cp*distance,target.y+Math.sin(pitch)*distance+(cameraMode==='tight'?.18:.48),target.z+Math.cos(yaw)*cp*distance);camera.lookAt(target);}",
      "function applyCamera(dt=.016){if(cameraMode==='orbit'||heroPortalState!=='outside'){yaw+=(targetYaw-yaw)*.085;pitch+=(targetPitch-pitch)*.085;distance+=(targetDistance-distance)*.09;target.lerp(targetLook,.085);}else{targetLook.set(player.x,player.y+1.52,player.z);target.lerp(targetLook,.13);const stickActive=!!window.__gamerInput?.active&&Math.hypot(window.__gamerInput.x||0,window.__gamerInput.y||0)>.09;if(dragging||stickActive)recenterClock=0;else recenterClock+=dt;if(!dragging&&recenterClock>.55){followYawOffset*=Math.pow(.075,dt);followPitchOffset*=Math.pow(.10,dt);}let desired=yaw;if(followLock&&recenterClock>.55)desired=player.yaw+Math.PI+followYawOffset;else if(!followLock)desired=targetYaw+followYawOffset;const dy=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));yaw+=dy*Math.min(1,dt*(recenterClock>.55?2.15:.35));const dp=(cameraMode==='tight'?.21:.32)+followPitchOffset,dd=cameraMode==='tight'?6.0:followDistance;pitch+=(dp-pitch)*Math.min(1,dt*4.0);distance+=(dd-distance)*Math.min(1,dt*3.3);}const cp=Math.cos(pitch);camera.position.set(target.x+Math.sin(yaw)*cp*distance,target.y+Math.sin(pitch)*distance+(cameraMode==='tight'?.45:1.18),target.z+Math.cos(yaw)*cp*distance);camera.lookAt(target);}",
      'decoupled third-person follow camera');
  rep("renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(cameraMode==='orbit'||!followLock){targetYaw-=dx*.006;targetPitch=clamp(targetPitch+dy*.0047,-.24,.48);}});",
      "renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(cameraMode==='orbit'||!followLock){targetYaw-=dx*.0048;targetPitch=clamp(targetPitch+dy*.0038,-.24,.54);}else{followYawOffset-=dx*.0045;followPitchOffset=clamp(followPitchOffset+dy*.0032,-.20,.28);recenterClock=0;if(!window.__gamerInput?.active)player.yaw-=dx*.00035;}});",
      'natural drag look');
  rep("renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();targetDistance=clamp(targetDistance+Math.sign(e.deltaY)*.65,1.7,20.0);hint.classList.add('fade');},{passive:false});",
      "renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();if(cameraMode!=='orbit'&&followLock)followDistance=clamp(followDistance+Math.sign(e.deltaY)*1.05,7.0,34);else targetDistance=clamp(targetDistance+Math.sign(e.deltaY)*.70,1.7,28);hint.classList.add('fade');},{passive:false});",
      'wide follow zoom');
  rep("renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.hypot(dx,dy);if(pinchDist)targetDistance=clamp(targetDistance+(pinchDist-d)*.016,1.7,20.0);pinchDist=d;}},{passive:false});renderer.domElement.addEventListener('touchend',()=>pinchDist=0,{passive:true});",
      "renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.hypot(dx,dy);if(pinchDist){if(cameraMode!=='orbit'&&followLock)followDistance=clamp(followDistance+(pinchDist-d)*.036,7.0,34);else targetDistance=clamp(targetDistance+(pinchDist-d)*.022,1.7,28);}pinchDist=d;}},{passive:false});renderer.domElement.addEventListener('touchend',()=>pinchDist=0,{passive:true});",
      'pinch follow zoom');

  const worldMarker = "    // Abyss cue only outside the room; quality stays in geometry/materials above it.";
  const worldExpansion = `    // ------------------------------------------------------------\n    // V0.8.7 OPEN WORLD NETWORK — no enclosing walls. The portal sits on an\n    // open stone hub with multiple routes, loops and long branches.\n    // ------------------------------------------------------------\n    function openBridge87(x,z,w,d,y,rot=0){\n      const segs=Math.max(2,Math.ceil(d/2.25)),step=d/segs;\n      const baseGeo=new THREE.BoxGeometry(w+.30,.54,step-.05),topGeo=new THREE.BoxGeometry(w,.18,step-.06),edgeGeo=new THREE.BoxGeometry(.10,.10,step-.08);\n      const baseI=new THREE.InstancedMesh(baseGeo,stoneDark,segs),topI=new THREE.InstancedMesh(topGeo,floorMat,segs),edgeI=new THREE.InstancedMesh(edgeGeo,stoneMat,segs*2);baseI.castShadow=true;baseI.receiveShadow=topI.receiveShadow=edgeI.receiveShadow=true;\n      const sn=Math.sin(rot),cs=Math.cos(rot);let ei=0;for(let i=0;i<segs;i++){const lz=-d*.5+step*(i+.5),wx=x+lz*sn,wz=z+lz*cs;dummy.rotation.set(0,rot,0);dummy.scale.set(1,1,1);dummy.position.set(wx,y-.28,wz);dummy.updateMatrix();baseI.setMatrixAt(i,dummy.matrix);dummy.position.set(wx,y+.02,wz);dummy.updateMatrix();topI.setMatrixAt(i,dummy.matrix);for(const side of [-1,1]){dummy.position.set(wx+side*(w*.5-.07)*cs,y+.13,wz-side*(w*.5-.07)*sn);dummy.updateMatrix();edgeI.setMatrixAt(ei++,dummy.matrix);}}baseI.instanceMatrix.needsUpdate=topI.instanceMatrix.needsUpdate=edgeI.instanceMatrix.needsUpdate=true;ext.add(baseI,topI,edgeI);addRectSurface(x,z,w-.16,d-.12,y+.11,rot);\n    }\n    function bridgeBetween87(x1,z1,x2,z2,w,y){const dx=x2-x1,dz=z2-z1,d=Math.hypot(dx,dz),rot=Math.atan2(dx,dz);openBridge87((x1+x2)*.5,(z1+z2)*.5,w,d,y,rot);}\n    function disc87(x,z,r,y){extMesh(new THREE.CylinderGeometry(r,r+.20,.68,64),stoneDark,new THREE.Vector3(x,y-.34,z),0,true);extMesh(new THREE.CylinderGeometry(r-.18,r-.10,.18,64),floorMat,new THREE.Vector3(x,y+.05,z),0,false);addDiscSurface(x,z,r-.25,y+.14);}\n    // Three routes directly out of the portal hub.\n    openBridge87(-13.2,0,3.45,8.7,.02,Math.PI/2);disc87(-18.0,0,4.0,.02);\n    openBridge87(13.2,0,3.45,8.7,.02,Math.PI/2);disc87(18.0,0,4.0,.02);\n    openBridge87(0,-13.2,3.45,8.7,.02,0);disc87(0,-18.0,4.2,.02);\n    // Long forward route retained and expanded beyond the previous endpoint.\n    openBridge87(0,31.05,3.45,11.4,1.70,0);disc87(0,38.45,4.1,2.00);\n    openBridge87(0,44.15,3.35,6.9,2.02,0);\n    {const n=10,d=.70,w=2.72,z0=47.35,rise=.135;for(let i=0;i<n;i++){const y=2.04+i*rise,z=z0+i*d*.78;extMesh(new THREE.BoxGeometry(w,.22,d),floorMat,new THREE.Vector3(0,y,z),0,true);extMesh(new THREE.BoxGeometry(w+.22,.22,d+.04),stoneDark,new THREE.Vector3(0,y-.20,z),0,true);}addRampSurface(0,50.45,2.56,6.35,2.13,3.38,0);}\n    disc87(0,55.0,4.7,3.56);openBridge87(0,63.5,3.6,13.4,3.58,0);disc87(0,72.0,5.6,3.96);\n    // Open side loops and diagonal shortcuts.\n    disc87(-9.0,38.45,2.8,2.13);disc87(9.0,38.45,2.8,2.13);bridgeBetween87(-3.8,38.45,-6.2,38.45,2.25,2.02);bridgeBetween87(3.8,38.45,6.2,38.45,2.25,2.02);\n    disc87(-10.0,55.0,3.0,3.62);disc87(10.0,55.0,3.0,3.62);bridgeBetween87(-4.3,55.0,-7.1,55.0,2.25,3.57);bridgeBetween87(4.3,55.0,7.1,55.0,2.25,3.57);\n    bridgeBetween87(-18.0,0,-8.0,17.25,2.55,.34);bridgeBetween87(18.0,0,8.0,17.25,2.55,.34);\n    disc87(-9.0,17.25,3.0,.36);disc87(9.0,17.25,3.0,.36);bridgeBetween87(-6.2,17.25,-3.2,17.25,2.5,.30);bridgeBetween87(6.2,17.25,3.2,17.25,2.5,.30);\n    bridgeBetween87(-9.0,38.45,-10.0,55.0,2.35,2.72);bridgeBetween87(9.0,38.45,10.0,55.0,2.35,2.72);\n    bridgeBetween87(-10.0,55.0,-4.4,72.0,2.25,3.82);bridgeBetween87(10.0,55.0,4.4,72.0,2.25,3.82);\n    // Freestanding lantern posts around the open hub and route.\n    const postSpots=[[-6.2,0,.15],[6.2,0,.15],[0,-6.2,.15],[0,6.2,.15],[-18,2.8,.18],[18,2.8,.18],[-2.0,38.45,2.18],[2.0,38.45,2.18],[-2.2,55.0,3.83],[2.2,55.0,3.83],[-3.0,72.0,4.24],[3.0,72.0,4.24]];\n    for(const [lx,lz,ly] of postSpots){extMesh(new THREE.CylinderGeometry(.10,.13,1.25,8),metalDark,new THREE.Vector3(lx,ly+.62,lz),0,true);extMesh(new THREE.CylinderGeometry(.16,.16,.34,10),extLanternMat,new THREE.Vector3(lx,ly+1.36,lz),0,false);const lg=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffb55e,transparent:true,opacity:.20,blending:THREE.AdditiveBlending,depthWrite:false}));lg.position.set(lx,ly+1.36,lz);lg.scale.set(.88,.88,1);ext.add(lg);}\n\n`;
  rep(worldMarker, worldExpansion + worldMarker, 'open world bridge network');
  rep("const abyss=extMesh(new THREE.PlaneGeometry(28,26),abyssMat,new THREE.Vector3(0,-5.0,17.2),0,false);",
      "const abyss=extMesh(new THREE.PlaneGeometry(120,130),abyssMat,new THREE.Vector3(0,-5.0,28.0),0,false);",
      'expanded open-world abyss');

  console.info('[v0.8.7 runtime patches]', patches.join(', '));
  return source;
}

try {
  const parts = await Promise.all(chunkPaths.map(async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load ${url.pathname}: ${response.status}`);
    return response.text();
  }));
  const source = patchRuntime(parts.join(''));
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
