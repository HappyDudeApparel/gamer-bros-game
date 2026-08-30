const sleepP12 = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    let bro;
    for (let i = 0; i < 500; i += 1) {
      bro = window.__bro;
      if (bro?.body && bro?.materials && document.getElementById('ui')?.classList.contains('show')) break;
      await sleepP12(25);
    }
    if (!bro?.body || !bro?.materials) throw new Error('Gamer Bro runtime was not ready for Phase 1.2 visuals.');

    // Phase 1.1 added a full shield-shaped black glasses shell on top of the
    // already-authored two-lens visor. Keep its useful hair locks but hide those
    // two overlay meshes so the original distinct lenses/frames can read again.
    const polish = bro.body.getObjectByName('v087CharacterPolish');
    if (polish) {
      const overlayMeshes = polish.children.filter(child => child?.geometry?.type === 'ExtrudeGeometry');
      overlayMeshes.forEach(mesh => { mesh.visible = false; });
    }

    // Explicit high-contrast two-tone treatment for phone readability.
    const M = bro.materials;
    if (M.frame?.color) {
      M.frame.color.set(0x18233d);
      M.frame.roughness = .22;
      M.frame.metalness = .42;
      M.frame.clearcoat = .82;
    }
    if (M.lens?.color) {
      M.lens.color.set(0xff45c2);
      M.lens.emissive?.set(0x790d63);
      M.lens.emissiveIntensity = .52;
      M.lens.clearcoat = 1;
    }
    if (M.cup?.color) M.cup.color.set(0x25c6cf);
    if (M.cupAccent?.color) M.cupAccent.color.set(0xff9d35);
    if (M.trim?.color) M.trim.color.set(0xef4fa8);
    if (M.pad?.color) M.pad.color.set(0x26324a);

    // The controller is part of the original rig and shares the same materials,
    // so the palette above also gives it a dark-navy + teal + orange/magenta read.
    // Add a small luminous muzzle marker exactly at the existing beam emitter so
    // it is visually obvious that the ZAP originates from the controller.
    if (bro.controllerGroup && bro.controllerEmitter && !bro.controllerGroup.getObjectByName('phase12EmitterGlow')) {
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x77f2ff,
        transparent: true,
        opacity: .92,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 8), glowMat);
      glow.name = 'phase12EmitterGlow';
      glow.position.copy(bro.controllerEmitter.position);
      glow.position.z += .015;
      glow.layers.set(1);
      bro.controllerGroup.add(glow);
    }

    const actionBtn = document.getElementById('actionTouchBtn');
    if (actionBtn && !actionBtn.classList.contains('active')) actionBtn.textContent = 'ZAP';
    console.info('[Hybrid v0.9 Phase 1.2] two-tone gear + controller emitter polish ready');
  } catch (err) {
    console.error('[Hybrid v0.9 Phase 1.2] visual/action polish failed', err);
  }
})();
