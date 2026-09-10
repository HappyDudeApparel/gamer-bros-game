// Gamer Bros v0.8.9 bootstrap
// Runs before the preserved chunk-loader. It leaves the proven runtime intact, but
// applies player-facing fixes at the final Blob boundary after v0.8.7 has finished
// assembling its source.
(()=>{
  window.__v089Bootstrap=true;

  // The old recovery loader deliberately bypassed browser cache on all ten source
  // chunks. That was useful while patching, but punishes every real player visit.
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    const url=typeof input==='string'?input:(input?.url||'');
    if(/\/src\/chunks\/\d+\.txt(?:[?#]|$)/.test(url)){
      return nativeFetch(input,{...init,cache:'force-cache'});
    }
    return nativeFetch(input,init);
  };

  const NativeBlob=window.Blob;
  function PlayerBlob(parts,options){
    let nextParts=parts;
    try{
      if(options?.type==='text/javascript'&&parts?.length===1&&typeof parts[0]==='string'&&parts[0].includes('PORTAL STATE MACHINE — HERO LOAD')){
        let source=parts[0];
        const changed=[];
        const rep=(find,repl,label)=>{
          if(source.includes(find)){source=source.replace(find,repl);changed.push(label);return true;}
          console.warn('[v0.8.9 bootstrap miss]',label);return false;
        };

        // Expose only what the player-facing cinematic needs. The camera declaration in
        // the preserved v0.5 runtime uses a 70-unit far plane, so match it generically.
        rep('stage.appendChild(renderer.domElement);','stage.appendChild(renderer.domElement);window.__gamerRenderer=renderer;','renderer');
        rep('const scene=new THREE.Scene();','const scene=new THREE.Scene();window.__gamerScene=scene;','scene');
        if(!source.includes('window.__gamerCamera=camera')){
          const cameraDecl=/(const camera\s*=\s*new THREE\.PerspectiveCamera\([^;]+\);)/;
          if(cameraDecl.test(source)){
            source=source.replace(cameraDecl,'$1window.__gamerCamera=camera;');changed.push('camera');
          }else console.warn('[v0.8.9 bootstrap miss] camera');
        }

        // Match the movement response of the Crystal Library build.
        rep('player.yaw+=diff*Math.min(1,dt*5.8);','player.yaw+=diff*(1-Math.exp(-8.5*dt));','Crystal hero turn');
        rep('(moveKeys.run?4.65:2.85)*THREE.MathUtils.smoothstep','(moveKeys.run?6.35:3.75)*THREE.MathUtils.smoothstep','Crystal move speeds');
        rep('followDistance=14.5,followYawOffset=0,followPitchOffset=0,recenterClock=0','followDistance=13.4,followYawOffset=0,followPitchOffset=0,recenterClock=0','Crystal follow distance');

        // main-v087 has already produced this exact working follow-camera function before
        // this bootstrap sees the assembled source. Replace that final function directly.
        const oldCamera="function applyCamera(dt=.016){if(cameraMode==='orbit'||heroPortalState!=='outside'){yaw+=(targetYaw-yaw)*.085;pitch+=(targetPitch-pitch)*.085;distance+=(targetDistance-distance)*.09;target.lerp(targetLook,.085);}else{targetLook.set(player.x,player.y+1.52,player.z);target.lerp(targetLook,.13);const stickActive=!!window.__gamerInput?.active&&Math.hypot(window.__gamerInput.x||0,window.__gamerInput.y||0)>.09;if(dragging||stickActive)recenterClock=0;else recenterClock+=dt;if(!dragging&&recenterClock>.55){followYawOffset*=Math.pow(.075,dt);followPitchOffset*=Math.pow(.10,dt);}let desired=yaw;if(followLock&&recenterClock>.55)desired=player.yaw+Math.PI+followYawOffset;else if(!followLock)desired=targetYaw+followYawOffset;const dy=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));yaw+=dy*Math.min(1,dt*(recenterClock>.55?2.15:.35));const dp=(cameraMode==='tight'?.21:.32)+followPitchOffset,dd=cameraMode==='tight'?6.0:followDistance;pitch+=(dp-pitch)*Math.min(1,dt*4.0);distance+=(dd-distance)*Math.min(1,dt*3.3);}const cp=Math.cos(pitch);camera.position.set(target.x+Math.sin(yaw)*cp*distance,target.y+Math.sin(pitch)*distance+(cameraMode==='tight'?.45:1.18),target.z+Math.cos(yaw)*cp*distance);camera.lookAt(target);}";
        const crystalCamera="function applyCamera(dt=.016){if(window.__introTourActive&&window.__introPose){const q=window.__introPose;camera.position.set(q.pos[0],q.pos[1],q.pos[2]);target.set(q.look[0],q.look[1],q.look[2]);camera.lookAt(target);return;}if(cameraMode==='orbit'||heroPortalState!=='outside'){yaw+=(targetYaw-yaw)*.085;pitch+=(targetPitch-pitch)*.085;distance+=(targetDistance-distance)*.09;target.lerp(targetLook,.085);}else{targetLook.set(player.x,player.y+1.45,player.z);target.lerp(targetLook,1-Math.exp(-8*dt));if(dragging||window.__gamerInput?.active)recenterClock=0;else recenterClock+=dt;if(!dragging&&!window.__gamerInput?.active&&recenterClock>.85&&followLock){const behind=player.yaw+Math.PI,dy=Math.atan2(Math.sin(behind-yaw),Math.cos(behind-yaw));yaw+=dy*(1-Math.exp(-1.75*dt));pitch=THREE.MathUtils.damp(pitch,cameraMode==='tight'?.24:.34,2.5,dt);}distance=THREE.MathUtils.damp(distance,cameraMode==='tight'?7.6:followDistance,3.8,dt);}const cp=Math.cos(pitch);camera.position.set(target.x+Math.sin(yaw)*cp*distance,target.y+Math.sin(pitch)*distance+(cameraMode==='tight'?.55:1.05),target.z+Math.cos(yaw)*cp*distance);camera.lookAt(target);}";
        rep(oldCamera,crystalCamera,'Crystal follow camera');

        const oldPointer="renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(cameraMode==='orbit'||!followLock){targetYaw-=dx*.0048;targetPitch=clamp(targetPitch+dy*.0038,-.24,.54);}else{followYawOffset-=dx*.0045;followPitchOffset=clamp(followPitchOffset+dy*.0032,-.20,.28);recenterClock=0;if(!window.__gamerInput?.active)player.yaw-=dx*.00035;}});";
        const crystalPointer="renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(cameraMode==='orbit'){targetYaw-=dx*.0052;targetPitch=clamp(targetPitch+dy*.0039,-.24,.58);}else{yaw-=dx*.0052;pitch=clamp(pitch+dy*.0036,.08,.62);targetYaw=yaw;targetPitch=pitch;followYawOffset=0;followPitchOffset=0;recenterClock=0;}});";
        rep(oldPointer,crystalPointer,'Crystal drag look');

        // Portal hitch fix: the old transition did a full scene-matrix update, hero bounds
        // walk, random mesh sampling and first dissolve use at the exact conversion frame.
        // Prewarm all of that during the non-interactive opening fly-through instead.
        const updateMarker='function updateHeroDissolveParticles(progress,t,dissipating=false){';
        const prewarm=`window.__prewarmPortalHero=()=>{\n  if(heroParticleData.length)return true;\n  scene.updateMatrixWorld(true);gamerRoot.updateMatrixWorld(true);\n  const bb=new THREE.Box3().setFromObject(gamerRoot);heroBottom=bb.min.y+.02;heroTop=bb.max.y-.02;\n  seedHeroParticles();heroParticlePoints.visible=false;heroGhost.visible=false;heroParticleMat.opacity=0;heroGhostMat.opacity=0;\n  return true;\n};\n`;
        if(source.includes(updateMarker)&&!source.includes('window.__prewarmPortalHero=')){
          source=source.replace(updateMarker,prewarm+updateMarker);changed.push('portal prewarm hook');
        }

        const heavy='scene.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(gamerRoot);heroBottom=bb.min.y+.02;heroTop=bb.max.y-.02;seedHeroParticles();setHeroDissolve(true,heroBottom-.20);';
        const light="if(!heroParticleData.length)window.__prewarmPortalHero?.();heroParticlePoints.visible=true;setHeroDissolve(true,heroBottom-.20);";
        rep(heavy,light,'remove conversion-frame traversal');

        console.info('[v0.8.9 player bootstrap]',changed.join(', '));
        nextParts=[source];
      }
    }catch(err){console.error('[v0.8.9 bootstrap]',err);}
    return new NativeBlob(nextParts,options);
  }
  PlayerBlob.prototype=NativeBlob.prototype;
  try{Object.setPrototypeOf(PlayerBlob,NativeBlob);}catch{}
  window.Blob=PlayerBlob;
})();
