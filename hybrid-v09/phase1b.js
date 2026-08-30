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
        const moveNeedle = "      gamerRoot.position.set(player.x,player.y,player.z);gamerRoot.rotation.y=player.yaw;\n      const speed01=clamp(player.speed/4.65,0,1);";
        const moveInsert = "      gamerRoot.position.set(player.x,player.y,player.z);gamerRoot.rotation.y=player.yaw;\n      if(heroPortalState==='outside'&&phase==='idle'&&Math.hypot(player.x,player.z)<2.15&&player.y<1.35){player.speed=0;loadHero();return;}\n      const speed01=clamp(player.speed/4.65,0,1);";
        if (source.includes(moveNeedle)) source = source.replace(moveNeedle, moveInsert);
        else console.warn('[Hybrid v0.9 Phase 1b] portal entry trigger target not found');

        const loadedNeedle = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);}";
        const loadedInsert = "if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);setTimeout(()=>{if(heroPortalState==='loaded'&&phase==='idle')activatePortal();},180);}";
        if (source.includes(loadedNeedle)) source = source.replace(loadedNeedle, loadedInsert);
        else console.warn('[Hybrid v0.9 Phase 1b] portal auto-activate target not found');

        source = source.replace("if(typeof selectView==='function')setTimeout(()=>selectView('portal'),0);", "if(typeof selectView==='function')setTimeout(()=>selectView('portal'),90);");
        next = [source];
        console.info('[Hybrid v0.9 Phase 1b] automatic portal trigger armed');
      }
    }
    return new NativeBlob(next, options);
  }
  HybridBlob.prototype = NativeBlob.prototype;
  Object.setPrototypeOf(HybridBlob, NativeBlob);
  window.Blob = HybridBlob;
})();
