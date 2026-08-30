(() => {
  // Phase 1.2 bridge patch. Applied after Hybrid's runtime rewrite but before the
  // rewritten module is imported. Keeps portal entry automatic, removes the
  // post-disappearance stall, respawns safely across the map, and restores the
  // original controller-held action pose + controller-emitted beam.
  const NativeBlob = window.Blob;
  function HybridBlob(parts, options) {
    let next = parts;
    if (options?.type === 'text/javascript' && parts?.length === 1 && typeof parts[0] === 'string') {
      let source = parts[0];
      if (source.includes('function loadHero(){') && source.includes("heroPortalState='loading'")) {
        let entryPatched = false;
        let activationPatched = false;
        let finishPatched = false;
        let actionPatched = false;
        let beamPatched = false;
        let stallPatched = false;

        const stateNeedle = "let phase='idle',phaseT=0,heroPortalState='outside',heroLoadT=0;";
        if (source.includes(stateNeedle)) {
          source = source.replace(stateNeedle, stateNeedle + "let portalEntryArmed=true;");
        } else {
          console.error('[Hybrid v0.9 Phase 1.2] portal arm state target not found');
        }

        const entryNeedle = "      if(player.y<-6.25)resetPlayerToPavement();";
        const entryInsert = "      if(player.y<-6.25)resetPlayerToPavement();\n      const portalEntryDistance=Math.hypot(player.x,player.z);\n      if(!portalEntryArmed&&heroPortalState==='outside'&&phase==='idle'&&portalEntryDistance>2.55)portalEntryArmed=true;\n      if(portalEntryArmed&&heroPortalState==='outside'&&phase==='idle'&&portalEntryDistance<1.75&&player.y<1.35){portalEntryArmed=false;player.speed=0;loadHero();return;}";
        if (source.includes(entryNeedle)) {
          source = source.replace(entryNeedle, entryInsert);
          entryPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1.2] portal entry trigger target not found');
        }

        const loadedNeedle = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);}";
        const loadedInsert = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);setTimeout(()=>{if(heroPortalState==='loaded'&&phase==='idle')activatePortal();},180);}";
        if (source.includes(loadedNeedle)) {
          source = source.replace(loadedNeedle, loadedInsert);
          activationPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1.2] portal auto-activate target not found');
        }

        const phaseDurNeedle = "const phaseDur={charge:2.60,convert:2.65,dissipate:2.25,afterglow:.85};";
        if (source.includes(phaseDurNeedle)) {
          source = source.replace(phaseDurNeedle, "const phaseDur={charge:2.60,convert:2.65,dissipate:.42,afterglow:.30};");
        }
        const goneNeedle = "if(p>=1){heroPortalState='gone';heroGhost.visible=false;setPhase('dissipate');syncPortalCharacterUI();}";
        const goneInsert = "if(p>=1){heroPortalState='gone';heroGhost.visible=false;heroParticlePoints.visible=false;setPhase('afterglow');syncPortalCharacterUI();}";
        if (source.includes(goneNeedle)) {
          source = source.replace(goneNeedle, goneInsert);
          stallPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1.2] post-disappearance transition target not found');
        }

        const actionNeedle = "bro.setAction(false);actionTouchBtn.classList.toggle('active',actionActive);";
        if (source.includes(actionNeedle)) {
          source = source.replace(actionNeedle, "bro.setAction(actionActive);actionTouchBtn.classList.toggle('active',actionActive);");
          actionPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1.2] controller action target not found');
        }

        const beamNeedle = "laserDir.set(Math.sin(player.yaw),0,Math.cos(player.yaw)).normalize();laserOrigin.set(player.x,player.y+2.02,player.z).addScaledVector(laserDir,.38);const hits=[];laserEnd.copy(laserOrigin).addScaledVector(laserDir,24);";
        const beamInsert = "bro.controllerEmitter.getWorldPosition(laserOrigin);bro.controllerEmitter.getWorldQuaternion(controllerWorldQ);laserDir.set(0,0,1).applyQuaternion(controllerWorldQ).normalize();laserOrigin.addScaledVector(laserDir,.12);const hits=[];laserEnd.copy(laserOrigin).addScaledVector(laserDir,24);";
        if (source.includes(beamNeedle)) {
          source = source.replace(beamNeedle, beamInsert);
          beamPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1.2] controller beam target not found');
        }

        const finishNeedle = "if(p>=1)resetTest();";
        const finishInsert = "if(p>=1){resetTest();const safeX=0,safeZ=75,safeSurface=surfaceHeight(safeX,safeZ);player.x=safeX;player.z=safeZ;player.y=safeSurface===null?3.14:safeSurface;player.yaw=Math.PI;player.vy=0;player.speed=0;player.grounded=true;bro.setHome(player.x,player.z,player.yaw);gamerRoot.position.y=player.y;portalEntryArmed=false;cameraMode='follow';followLock=true;lookYawOffset=0;lookPitchOffset=0;recenterClock=0;yaw=player.yaw+Math.PI;targetYaw=yaw;pitch=.34;targetPitch=.34;distance=followDistance;targetDistance=followDistance;targetLook.set(player.x,player.y+1.45,player.z);target.copy(targetLook);orbitBtn.textContent='CAM: FOLLOW';orbitBtn.classList.add('active');followLockBtn.textContent='FOLLOW LOCK: ON';followLockBtn.classList.add('active');actionTouchBtn.textContent='ZAP';requestShadowUpdate(2);}";
        if (source.includes(finishNeedle)) {
          source = source.replace(finishNeedle, finishInsert);
          finishPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1.2] portal completion target not found');
        }

        source = source.replaceAll("actionTouchBtn.textContent='ACTION';", "actionTouchBtn.textContent='ZAP';");

        const viewNeedle = "if(typeof selectView==='function')setTimeout(()=>selectView('portal'),0);";
        if (source.includes(viewNeedle)) {
          source = source.replace(viewNeedle, "if(typeof selectView==='function')setTimeout(()=>selectView('portal'),90);");
        }

        next = [source];
        if (entryPatched && activationPatched && finishPatched && actionPatched && beamPatched && stallPatched) {
          console.info('[Hybrid v0.9 Phase 1.2] portal + controller lifecycle armed');
        } else {
          console.error('[Hybrid v0.9 Phase 1.2] lifecycle patch incomplete');
        }
      }
    }
    return new NativeBlob(next, options);
  }
  HybridBlob.prototype = NativeBlob.prototype;
  Object.setPrototypeOf(HybridBlob, NativeBlob);
  window.Blob = HybridBlob;
})();
