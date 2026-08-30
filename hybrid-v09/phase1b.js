(() => {
  // Phase 1.1 bridge patch. Applied after Hybrid's runtime rewrite but before the
  // rewritten module is imported. Keeps portal entry automatic, prevents the
  // completion loop from immediately re-triggering, and restores gameplay camera.
  const NativeBlob = window.Blob;
  function HybridBlob(parts, options) {
    let next = parts;
    if (options?.type === 'text/javascript' && parts?.length === 1 && typeof parts[0] === 'string') {
      let source = parts[0];
      if (source.includes('function loadHero(){') && source.includes("heroPortalState='loading'")) {
        let entryPatched = false;
        let activationPatched = false;
        let finishPatched = false;

        const stateNeedle = "let phase='idle',phaseT=0,heroPortalState='outside',heroLoadT=0;";
        if (source.includes(stateNeedle)) {
          source = source.replace(stateNeedle, stateNeedle + "let portalEntryArmed=true;");
        } else {
          console.error('[Hybrid v0.9 Phase 1.1] portal arm state target not found');
        }

        // Trigger only after deliberate entry into the tube footprint. Once used,
        // stay disarmed until the player actually walks away from the portal.
        const entryNeedle = "      if(player.y<-6.25)resetPlayerToPavement();";
        const entryInsert = "      if(player.y<-6.25)resetPlayerToPavement();\n      const portalEntryDistance=Math.hypot(player.x,player.z);\n      if(!portalEntryArmed&&heroPortalState==='outside'&&phase==='idle'&&portalEntryDistance>2.55)portalEntryArmed=true;\n      if(portalEntryArmed&&heroPortalState==='outside'&&phase==='idle'&&portalEntryDistance<1.75&&player.y<1.35){portalEntryArmed=false;player.speed=0;loadHero();return;}";
        if (source.includes(entryNeedle)) {
          source = source.replace(entryNeedle, entryInsert);
          entryPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1.1] portal entry trigger target not found');
        }

        // Once physically loaded, begin the preserved portal conversion automatically.
        const loadedNeedle = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);}";
        const loadedInsert = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);setTimeout(()=>{if(heroPortalState==='loaded'&&phase==='idle')activatePortal();},180);}";
        if (source.includes(loadedNeedle)) {
          source = source.replace(loadedNeedle, loadedInsert);
          activationPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1.1] portal auto-activate target not found');
        }

        // Finish the entire afterglow before returning to normal third-person play.
        // resetTest restores the hero; these lines restore the Hybrid camera instead
        // of leaving the user looking at the static portal inspection view.
        const finishNeedle = "if(p>=1)resetTest();";
        const finishInsert = "if(p>=1){resetTest();cameraMode='follow';followLock=true;lookYawOffset=0;lookPitchOffset=0;recenterClock=0;orbitBtn.textContent='CAM: FOLLOW';orbitBtn.classList.add('active');followLockBtn.textContent='FOLLOW LOCK: ON';followLockBtn.classList.add('active');targetLook.set(player.x,player.y+1.45,player.z);actionTouchBtn.textContent='ZAP';requestShadowUpdate(2);}";
        if (source.includes(finishNeedle)) {
          source = source.replace(finishNeedle, finishInsert);
          finishPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1.1] portal completion target not found');
        }

        // Baseline helpers still write ACTION during reset/load. Hybrid's player UI is ZAP.
        source = source.replaceAll("actionTouchBtn.textContent='ACTION';", "actionTouchBtn.textContent='ZAP';");

        const viewNeedle = "if(typeof selectView==='function')setTimeout(()=>selectView('portal'),0);";
        if (source.includes(viewNeedle)) {
          source = source.replace(viewNeedle, "if(typeof selectView==='function')setTimeout(()=>selectView('portal'),90);");
        }

        next = [source];
        if (entryPatched && activationPatched && finishPatched) console.info('[Hybrid v0.9 Phase 1.1] automatic portal lifecycle armed');
        else console.error('[Hybrid v0.9 Phase 1.1] automatic portal lifecycle incomplete');
      }
    }
    return new NativeBlob(next, options);
  }
  HybridBlob.prototype = NativeBlob.prototype;
  Object.setPrototypeOf(HybridBlob, NativeBlob);
  window.Blob = HybridBlob;
})();
