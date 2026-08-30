(() => {
  // Phase 1.3 bridge patch. Applied after Hybrid's runtime rewrite but before the
  // rewritten module is imported. Fixes true camera-relative analog movement,
  // makes the controller action visibly two-handed, removes portal residue/stall,
  // and keeps the far-map respawn.
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
        let movementPatched = false;
        let cameraPatched = false;
        let twoHandPatched = false;

        const stateNeedle = "let phase='idle',phaseT=0,heroPortalState='outside',heroLoadT=0;";
        if (source.includes(stateNeedle)) {
          source = source.replace(stateNeedle, stateNeedle + "let portalEntryArmed=true;");
        } else {
          console.error('[Hybrid v0.9 Phase 1.3] portal arm state target not found');
        }

        const entryNeedle = "      if(player.y<-6.25)resetPlayerToPavement();";
        const entryInsert = "      if(player.y<-6.25)resetPlayerToPavement();\n      const portalEntryDistance=Math.hypot(player.x,player.z);\n      if(!portalEntryArmed&&heroPortalState==='outside'&&phase==='idle'&&portalEntryDistance>2.55)portalEntryArmed=true;\n      if(portalEntryArmed&&heroPortalState==='outside'&&phase==='idle'&&portalEntryDistance<1.75&&player.y<1.35){portalEntryArmed=false;player.speed=0;loadHero();return;}";
        if (source.includes(entryNeedle)) { source = source.replace(entryNeedle, entryInsert); entryPatched = true; }

        const moveBasisNeedle = "const moveYaw=yaw+Math.PI,fx=Math.sin(moveYaw),fz=Math.cos(moveYaw),rx=Math.sin(moveYaw+Math.PI/2),rz=Math.cos(moveYaw+Math.PI/2);";
        const moveBasisInsert = "const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);";
        if (source.includes(moveBasisNeedle)) { source = source.replace(moveBasisNeedle, moveBasisInsert); movementPatched = true; }
        else console.error('[Hybrid v0.9 Phase 1.3] analog movement basis target not found');

        const cameraNeedle = "const desired=followLock?player.yaw+Math.PI+lookYawOffset:targetYaw+lookYawOffset,dy=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));yaw+=dy*(1-Math.exp(-(recenterClock>.72?2.25:.45)*dt));";
        const cameraInsert = "const desired=followLock?player.yaw+Math.PI+lookYawOffset:targetYaw+lookYawOffset,dy=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));if(!analogMove.active&&!dragging)yaw+=dy*(1-Math.exp(-(recenterClock>.42?2.5:.65)*dt));";
        if (source.includes(cameraNeedle)) { source = source.replace(cameraNeedle, cameraInsert); cameraPatched = true; }
        else console.error('[Hybrid v0.9 Phase 1.3] camera steering target not found');

        const loadedNeedle = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);}";
        const loadedInsert = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);setTimeout(()=>{if(heroPortalState==='loaded'&&phase==='idle')activatePortal();},160);}";
        if (source.includes(loadedNeedle)) { source = source.replace(loadedNeedle, loadedInsert); activationPatched = true; }

        const convertStartNeedle = "heroPortalState='converting';gamerRoot.scale.setScalar(heroBaseScale);";
        const convertStartInsert = "heroPortalState='converting';const hybridPolish=bro.body.getObjectByName('v087CharacterPolish');if(hybridPolish)hybridPolish.visible=false;gamerRoot.scale.setScalar(heroBaseScale);";
        if (source.includes(convertStartNeedle)) source = source.replace(convertStartNeedle, convertStartInsert);

        const restoreNeedle = "gamerRoot.scale.setScalar(heroBaseScale);setHeroDissolve(false,-20);";
        const restoreInsert = "gamerRoot.scale.setScalar(heroBaseScale);const hybridPolish=bro.body.getObjectByName('v087CharacterPolish');if(hybridPolish)hybridPolish.visible=true;setHeroDissolve(false,-20);";
        if (source.includes(restoreNeedle)) source = source.replace(restoreNeedle, restoreInsert);

        const phaseDurNeedle = "const phaseDur={charge:2.60,convert:2.65,dissipate:2.25,afterglow:.85};";
        if (source.includes(phaseDurNeedle)) source = source.replace(phaseDurNeedle, "const phaseDur={charge:2.60,convert:2.65,dissipate:.08,afterglow:.06};");
        const goneNeedle = "if(p>=1){heroPortalState='gone';heroGhost.visible=false;setPhase('dissipate');syncPortalCharacterUI();}";
        const goneInsert = "if(p>=.975){heroPortalState='gone';gamerRoot.visible=false;heroGhost.visible=false;heroParticlePoints.visible=false;setPhase('afterglow');syncPortalCharacterUI();}";
        if (source.includes(goneNeedle)) { source = source.replace(goneNeedle, goneInsert); stallPatched = true; }

        const actionNeedle = "bro.setAction(false);actionTouchBtn.classList.toggle('active',actionActive);";
        if (source.includes(actionNeedle)) { source = source.replace(actionNeedle, "bro.setAction(actionActive);actionTouchBtn.classList.toggle('active',actionActive);"); actionPatched = true; }

        const controllerPoseNeedle = "controllerGroup.position.set(0,1.025,.675);controllerGroup.rotation.x=-.12;controllerGroup.visible=false;body.add(controllerGroup);";
        const controllerPoseInsert = "controllerGroup.position.set(0,1.00,.60);controllerGroup.rotation.x=-.10;controllerGroup.visible=false;body.add(controllerGroup);";
        if (source.includes(controllerPoseNeedle)) source = source.replace(controllerPoseNeedle, controllerPoseInsert);

        const armsNeedle = "armL.rotation.x=THREE.MathUtils.lerp(armLX,-1.04,actionBlend);\n    armR.rotation.x=THREE.MathUtils.lerp(armRX,-1.04,actionBlend);\n    armL.rotation.z=THREE.MathUtils.lerp(armLZ,.62,actionBlend);\n    armR.rotation.z=THREE.MathUtils.lerp(armRZ,-.62,actionBlend);\n    armL.position.x=THREE.MathUtils.lerp(-.505,-.425,actionBlend);\n    armR.position.x=THREE.MathUtils.lerp(.505,.425,actionBlend);\n    armL.position.z=THREE.MathUtils.lerp(.02,.09,actionBlend);\n    armR.position.z=THREE.MathUtils.lerp(.02,.09,actionBlend);";
        const armsInsert = "armL.rotation.x=THREE.MathUtils.lerp(armLX,-.85,actionBlend);\n    armR.rotation.x=THREE.MathUtils.lerp(armRX,-.04,actionBlend);\n    armL.rotation.z=THREE.MathUtils.lerp(armLZ,1.20,actionBlend);\n    armR.rotation.z=THREE.MathUtils.lerp(armRZ,-1.20,actionBlend);\n    armL.position.x=THREE.MathUtils.lerp(-.505,-.355,actionBlend);\n    armR.position.x=THREE.MathUtils.lerp(.505,.398,actionBlend);\n    armL.position.y=THREE.MathUtils.lerp(1.145,1.184,actionBlend);\n    armR.position.y=THREE.MathUtils.lerp(1.145,1.114,actionBlend);\n    armL.position.z=THREE.MathUtils.lerp(.02,.127,actionBlend);\n    armR.position.z=THREE.MathUtils.lerp(.02,.098,actionBlend);";
        if (source.includes(armsNeedle)) { source = source.replace(armsNeedle, armsInsert); twoHandPatched = true; }
        else console.error('[Hybrid v0.9 Phase 1.3] two-hand controller pose target not found');

        const beamNeedle = "laserDir.set(Math.sin(player.yaw),0,Math.cos(player.yaw)).normalize();laserOrigin.set(player.x,player.y+2.02,player.z).addScaledVector(laserDir,.38);const hits=[];laserEnd.copy(laserOrigin).addScaledVector(laserDir,24);";
        const beamInsert = "bro.controllerEmitter.getWorldPosition(laserOrigin);bro.controllerEmitter.getWorldQuaternion(controllerWorldQ);laserDir.set(0,0,1).applyQuaternion(controllerWorldQ).normalize();laserOrigin.addScaledVector(laserDir,.12);const hits=[];laserEnd.copy(laserOrigin).addScaledVector(laserDir,24);";
        if (source.includes(beamNeedle)) { source = source.replace(beamNeedle, beamInsert); beamPatched = true; }

        const finishNeedle = "if(p>=1)resetTest();";
        const finishInsert = "if(p>=1){resetTest();const safeX=0,safeZ=75,safeSurface=surfaceHeight(safeX,safeZ);player.x=safeX;player.z=safeZ;player.y=safeSurface===null?3.14:safeSurface;player.yaw=Math.PI;player.vy=0;player.speed=0;player.grounded=true;bro.setHome(player.x,player.z,player.yaw);gamerRoot.position.y=player.y;portalEntryArmed=false;cameraMode='follow';followLock=true;lookYawOffset=0;lookPitchOffset=0;recenterClock=0;yaw=player.yaw+Math.PI;targetYaw=yaw;pitch=.34;targetPitch=.34;distance=followDistance;targetDistance=followDistance;targetLook.set(player.x,player.y+1.45,player.z);target.copy(targetLook);orbitBtn.textContent='CAM: FOLLOW';orbitBtn.classList.add('active');followLockBtn.textContent='FOLLOW LOCK: ON';followLockBtn.classList.add('active');actionTouchBtn.textContent='ZAP';requestShadowUpdate(2);}";
        if (source.includes(finishNeedle)) { source = source.replace(finishNeedle, finishInsert); finishPatched = true; }

        source = source.replaceAll("actionTouchBtn.textContent='ACTION';", "actionTouchBtn.textContent='ZAP';");
        const viewNeedle = "if(typeof selectView==='function')setTimeout(()=>selectView('portal'),0);";
        if (source.includes(viewNeedle)) source = source.replace(viewNeedle, "if(typeof selectView==='function')setTimeout(()=>selectView('portal'),70);");

        next = [source];
        if (entryPatched && activationPatched && finishPatched && actionPatched && beamPatched && stallPatched && movementPatched && cameraPatched && twoHandPatched) console.info('[Hybrid v0.9 Phase 1.3] natural movement + two-hand controller + portal lifecycle armed');
        else console.error('[Hybrid v0.9 Phase 1.3] lifecycle patch incomplete');
      }
    }
    return new NativeBlob(next, options);
  }
  HybridBlob.prototype = NativeBlob.prototype;
  Object.setPrototypeOf(HybridBlob, NativeBlob);
  window.Blob = HybridBlob;
})();
