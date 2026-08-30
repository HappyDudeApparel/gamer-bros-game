(() => {
  // Small Phase-1 bridge patch applied after the Hybrid runtime rewrites its baseline source,
  // but before that source is imported. This keeps portal gameplay automatic without exposing
  // the old developer LOAD/ACTIVATE buttons.
  const NativeBlob = window.Blob;
  function HybridBlob(parts, options) {
    let next = parts;
    if (options?.type === 'text/javascript' && parts?.length === 1 && typeof parts[0] === 'string') {
      let source = parts[0];
      if (source.includes('function loadHero(){') && source.includes("heroPortalState='loading'")) {
        let entryPatched = false;
        let activationPatched = false;

        // Trigger portal entry from the current playable-slice update loop.
        const entryNeedle = "      if(player.y<-6.25)resetPlayerToPavement();";
        const entryInsert = "      if(player.y<-6.25)resetPlayerToPavement();\n      if(heroPortalState==='outside'&&phase==='idle'&&Math.hypot(player.x,player.z)<2.15&&player.y<1.35){player.speed=0;loadHero();return;}";
        if (source.includes(entryNeedle)) {
          source = source.replace(entryNeedle, entryInsert);
          entryPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1b] portal entry trigger target not found');
        }

        // Once the hero has physically loaded into the tube, start the preserved portal sequence.
        const loadedNeedle = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);}";
        const loadedInsert = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);setTimeout(()=>{if(heroPortalState==='loaded'&&phase==='idle')activatePortal();},180);}";
        if (source.includes(loadedNeedle)) {
          source = source.replace(loadedNeedle, loadedInsert);
          activationPatched = true;
        } else {
          console.error('[Hybrid v0.9 Phase 1b] portal auto-activate target not found');
        }

        const viewNeedle = "if(typeof selectView==='function')setTimeout(()=>selectView('portal'),0);";
        if (source.includes(viewNeedle)) {
          source = source.replace(viewNeedle, "if(typeof selectView==='function')setTimeout(()=>selectView('portal'),90);");
        }

        next = [source];
        if (entryPatched && activationPatched) console.info('[Hybrid v0.9 Phase 1b] automatic portal trigger armed');
        else console.error('[Hybrid v0.9 Phase 1b] automatic portal trigger incomplete');
      }
    }
    return new NativeBlob(next, options);
  }
  HybridBlob.prototype = NativeBlob.prototype;
  Object.setPrototypeOf(HybridBlob, NativeBlob);
  window.Blob = HybridBlob;
})();
