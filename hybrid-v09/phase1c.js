const sleepP11 = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    let bro;
    for (let i = 0; i < 500; i += 1) {
      bro = window.__bro;
      if (bro?.body && document.getElementById('ui')?.classList.contains('show')) break;
      await sleepP11(25);
    }
    if (!bro?.body) throw new Error('Gamer Bro runtime was not ready for Phase 1.1 polish.');

    // Exact visual polish retained by live v0.8.7: stronger cowlick/hair silhouette
    // plus the cleaner shield-shaped glasses/lens treatment. This deliberately does
    // not import the v0.8.7 world, Leafs, menu, or gameplay systems.
    if (!bro.body.getObjectByName('v087CharacterPolish')) {
      const polish = new THREE.Group();
      polish.name = 'v087CharacterPolish';
      bro.body.add(polish);

      const hairMat = new THREE.MeshPhysicalMaterial({color:0xf7c65b,roughness:.27,metalness:.02,clearcoat:.64,clearcoatRoughness:.16,envMapIntensity:1.3});
      const hairDeep = new THREE.MeshPhysicalMaterial({color:0xc88423,roughness:.41,clearcoat:.30,envMapIntensity:.9});
      const frameMat = new THREE.MeshPhysicalMaterial({color:0x0d0e15,roughness:.20,metalness:.45,clearcoat:.88,clearcoatRoughness:.06,envMapIntensity:1.5});
      const lensMat = new THREE.MeshPhysicalMaterial({color:0xff2bb8,emissive:0x78065d,emissiveIntensity:.36,roughness:.05,metalness:.12,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.95});

      function lock(points, radius, material = hairMat) {
        const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'centripetal');
        const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, radius, 9, false), material);
        mesh.castShadow = mesh.receiveShadow = true;
        mesh.layers.set(1);
        polish.add(mesh);
      }

      lock([[-.51,2.35,.30],[-.31,2.68,.50],[-.02,2.94,.42],[.25,3.02,.17]],.11);
      lock([[-.28,2.39,.38],[.00,2.75,.57],[.34,2.95,.43],[.65,2.86,.15]],.12);
      lock([[.03,2.40,.39],[.31,2.70,.54],[.63,2.82,.34],[.84,2.66,.06]],.105);
      lock([[-.58,2.30,.18],[-.65,2.54,.29],[-.51,2.74,.17],[-.31,2.84,-.04]],.087);
      lock([[.52,2.27,.16],[.70,2.49,.24],[.80,2.63,.07],[.71,2.74,-.15]],.084);
      lock([[-.08,2.48,.02],[-.10,2.81,.05],[.04,3.03,-.13]],.082,hairDeep);

      function shieldShape(scale = 1) {
        const s = new THREE.Shape();
        s.moveTo(-.72*scale,.17*scale);
        s.quadraticCurveTo(-.50*scale,.24*scale,0,.22*scale);
        s.quadraticCurveTo(.50*scale,.24*scale,.72*scale,.17*scale);
        s.lineTo(.69*scale,-.11*scale);
        s.quadraticCurveTo(.65*scale,-.19*scale,.48*scale,-.20*scale);
        s.lineTo(.17*scale,-.20*scale);
        s.quadraticCurveTo(.09*scale,-.06*scale,0,-.03*scale);
        s.quadraticCurveTo(-.09*scale,-.06*scale,-.17*scale,-.20*scale);
        s.lineTo(-.48*scale,-.20*scale);
        s.quadraticCurveTo(-.65*scale,-.19*scale,-.69*scale,-.11*scale);
        s.closePath();
        return s;
      }

      const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape(1),{depth:.075,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025}),frameMat);
      frame.position.set(0,1.875,.715);
      frame.castShadow = true;
      frame.layers.set(1);
      polish.add(frame);

      const lens = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape(.90),{depth:.028,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.012}),lensMat);
      lens.position.set(0,1.875,.805);
      lens.layers.set(1);
      polish.add(lens);
    }

    const actionBtn = document.getElementById('actionTouchBtn');
    if (actionBtn && !actionBtn.classList.contains('active')) actionBtn.textContent = 'ZAP';
    console.info('[Hybrid v0.9 Phase 1.1] v0.8.7 character polish restored');
  } catch (err) {
    console.error('[Hybrid v0.9 Phase 1.1] character polish failed', err);
  }
})();
