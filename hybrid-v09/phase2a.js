const sleepP2A = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    let bro;
    for (let i = 0; i < 500; i += 1) {
      bro = window.__bro;
      if (bro?.root?.parent && document.getElementById('ui')?.classList.contains('show')) break;
      await sleepP2A(25);
    }
    if (!bro?.root?.parent) throw new Error('Gamer Bro scene was not ready for Phase 2A enemies.');

    const scene = bro.root.parent;
    const enemyRoot = new THREE.Group();
    enemyRoot.name = 'HybridPhase2AEnemies';
    scene.add(enemyRoot);

    const mkPhysical = (color, emissive = 0x000000, emissiveIntensity = 0) => new THREE.MeshPhysicalMaterial({
      color, emissive, emissiveIntensity, roughness: .54, metalness: .02, clearcoat: .28, clearcoatRoughness: .28
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf7dd66 });
    const darkMat = mkPhysical(0x1d1324);
    const particleGeo = new THREE.TetrahedronGeometry(.10, 0);
    const particles = [];

    function addMesh(parent, geo, mat, pos, scale, rot) {
      const m = new THREE.Mesh(geo, mat);
      if (pos) m.position.set(...pos);
      if (scale) m.scale.set(...scale);
      if (rot) m.rotation.set(...rot);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }

    function addEyes(parent, y, z, spread, color = 0xf7dd66) {
      const mat = color === 0xf7dd66 ? eyeMat : new THREE.MeshBasicMaterial({ color });
      for (const side of [-1, 1]) addMesh(parent, new THREE.SphereGeometry(.075, 10, 7), mat, [side * spread, y, z], [1, 1.18, .60]);
    }

    function stumpModel() {
      const g = new THREE.Group();
      const bark = mkPhysical(0x6f421f, 0x241005, .08);
      const barkDark = mkPhysical(0x392216);
      const moss = mkPhysical(0x4d8b39);
      addMesh(g, new THREE.CylinderGeometry(.54, .62, 1.16, 14, 1, false), bark, [0, .58, 0]);
      addMesh(g, new THREE.CylinderGeometry(.46, .52, .15, 14), barkDark, [0, 1.20, 0]);
      addMesh(g, new THREE.TorusGeometry(.36, .06, 7, 18), moss, [0, 1.25, 0], [1, .55, 1], [Math.PI / 2, 0, 0]);
      addEyes(g, .78, .53, .18, 0xd97cff);
      addMesh(g, new THREE.BoxGeometry(.30, .055, .045), darkMat, [0, .57, .57], null, [0, 0, -.05]);
      for (const s of [-1, 1]) addMesh(g, new THREE.ConeGeometry(.15, .50, 7), bark, [s * .58, .54, .02], null, [0, 0, -s * .72]);
      g.scale.setScalar(.92);
      return g;
    }

    function ghostModel() {
      const g = new THREE.Group();
      const ghost = new THREE.MeshPhysicalMaterial({ color: 0x8b5ee8, emissive: 0x35156d, emissiveIntensity: .34, roughness: .25, transparent: true, opacity: .93, clearcoat: .52 });
      addMesh(g, new THREE.SphereGeometry(.62, 22, 16), ghost, [0, .82, 0], [1, 1.12, .90]);
      for (let i = -2; i <= 2; i += 1) addMesh(g, new THREE.ConeGeometry(.15, .42, 8), ghost, [i * .21, .29, 0], [1, 1, .9], [0, 0, Math.PI]);
      addEyes(g, .94, .53, .20, 0xc7f8ff);
      const spiral = new THREE.TorusGeometry(.095, .018, 6, 18, Math.PI * 1.55);
      addMesh(g, spiral, darkMat, [-.20, .94, .575], null, [0, 0, .5]);
      addMesh(g, spiral.clone(), darkMat, [.20, .94, .575], null, [0, 0, -.5]);
      g.scale.setScalar(.94);
      return g;
    }

    function mushroomModel() {
      const g = new THREE.Group();
      const stem = mkPhysical(0xf1d6ad);
      const cap = mkPhysical(0xd74a67, 0x4f0b1e, .14);
      const spot = mkPhysical(0xffefcd);
      addMesh(g, new THREE.CapsuleGeometry(.34, .65, 6, 12), stem, [0, .62, 0]);
      addMesh(g, new THREE.SphereGeometry(.69, 22, 12), cap, [0, 1.25, 0], [1.12, .56, 1.02]);
      addEyes(g, .78, .34, .14, 0x37222a);
      for (const [x,z,s] of [[-.28,.19,.10],[.18,.28,.12],[.35,-.02,.08],[-.05,-.35,.09]]) addMesh(g, new THREE.SphereGeometry(s, 9, 6), spot, [x, 1.48, z], [1, .42, 1]);
      for (const side of [-1, 1]) addMesh(g, new THREE.SphereGeometry(.16, 10, 8), stem, [side * .37, .48, .02], [1, .75, 1]);
      g.scale.setScalar(.90);
      return g;
    }

    const defs = [
      { kind: 'stump', build: stumpModel, center: [0, 33.5], y: .39, radius: 7.6, speed: .92, route: [[-4.3,31.2],[1.7,29.7],[4.7,34.0],[-1.8,37.0]] },
      { kind: 'ghost', build: ghostModel, center: [-18, 33], y: .86, radius: 6.2, speed: 1.04, route: [[-21.0,30.5],[-16.6,29.4],[-14.6,33.3],[-19.0,36.0]] },
      { kind: 'mushroom', build: mushroomModel, center: [18, 33], y: .86, radius: 6.2, speed: .98, route: [[15.0,30.7],[18.4,28.9],[21.5,33.0],[18.1,36.0]] }
    ];

    const enemies = defs.map((d, index) => {
      const root = d.build();
      root.name = `HybridEnemy_${d.kind}`;
      root.position.set(d.route[0][0], d.y, d.route[0][1]);
      enemyRoot.add(root);
      const colliderMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: .001, depthWrite: false });
      const collider = new THREE.Mesh(new THREE.SphereGeometry(.78, 12, 8), colliderMat);
      collider.position.y = .78;
      collider.userData.enemyIndex = index;
      root.add(collider);
      return { ...d, root, collider, waypoint: 1, hp: 2, alive: true, hitT: 0, chase: false, bobSeed: index * 2.17 };
    });

    const ray = new THREE.Raycaster();
    ray.far = 24;
    const rayOrigin = new THREE.Vector3();
    const rayDirection = new THREE.Vector3();
    const emitterQ = new THREE.Quaternion();
    let zapCooldown = 0;
    let last = performance.now();

    function burst(enemy) {
      const base = enemy.root.position.clone().add(new THREE.Vector3(0, .9, 0));
      const colors = enemy.kind === 'stump' ? [0x8ac85d,0xa86d35] : enemy.kind === 'ghost' ? [0xb77cff,0x77e9ff] : [0xff6f91,0xffdf91];
      for (let i = 0; i < 12; i += 1) {
        const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: .95 });
        const m = new THREE.Mesh(particleGeo, mat);
        m.position.copy(base);
        scene.add(m);
        const a = Math.random() * Math.PI * 2, r = 1.4 + Math.random() * 2.6;
        particles.push({ mesh: m, vel: new THREE.Vector3(Math.cos(a) * r, 2.1 + Math.random() * 2.8, Math.sin(a) * r), life: .62 + Math.random() * .42 });
      }
    }

    function damage(enemy) {
      if (!enemy?.alive) return;
      enemy.hp -= 1;
      enemy.hitT = 1;
      if (enemy.hp <= 0) {
        enemy.alive = false;
        burst(enemy);
        enemy.root.visible = false;
      }
    }

    function moveEnemy(e, dt, t) {
      if (!e.alive) return;
      e.hitT = Math.max(0, e.hitT - dt * 4.2);
      const hero = bro.root.position;
      const hx = hero.x, hz = hero.z;
      const heroFromCenter = Math.hypot(hx - e.center[0], hz - e.center[1]);
      const dxh = hx - e.root.position.x, dzh = hz - e.root.position.z;
      const heroDist = Math.hypot(dxh, dzh);
      const sameTier = Math.abs(hero.y - e.y) < 2.35;
      e.chase = bro.root.visible && sameTier && heroDist < 7.5 && heroFromCenter < e.radius + .5;

      let tx, tz, speed;
      if (e.chase) {
        tx = hx; tz = hz; speed = e.speed * 1.72;
      } else {
        [tx, tz] = e.route[e.waypoint % e.route.length];
        speed = e.speed;
        if (Math.hypot(tx - e.root.position.x, tz - e.root.position.z) < .45) e.waypoint = (e.waypoint + 1) % e.route.length;
      }

      let dx = tx - e.root.position.x, dz = tz - e.root.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > .001) {
        dx /= dist; dz /= dist;
        const nx = e.root.position.x + dx * Math.min(dist, speed * dt);
        const nz = e.root.position.z + dz * Math.min(dist, speed * dt);
        if (Math.hypot(nx - e.center[0], nz - e.center[1]) <= e.radius) {
          e.root.position.x = nx;
          e.root.position.z = nz;
        } else {
          e.chase = false;
          e.waypoint = (e.waypoint + 1) % e.route.length;
        }
        const desired = Math.atan2(dx, dz);
        const delta = Math.atan2(Math.sin(desired - e.root.rotation.y), Math.cos(desired - e.root.rotation.y));
        e.root.rotation.y += delta * Math.min(1, dt * 6.5);
      }
      const bob = e.kind === 'ghost' ? .10 * Math.sin(t * 2.2 + e.bobSeed) : .035 * Math.abs(Math.sin(t * 3.4 + e.bobSeed));
      e.root.position.y = e.y + bob;
      const pulse = 1 + e.hitT * .14;
      e.root.scale.setScalar(pulse);
    }

    function updateZap(dt) {
      zapCooldown = Math.max(0, zapCooldown - dt);
      if (!bro.action || !bro.controllerEmitter || zapCooldown > 0) return;
      bro.controllerEmitter.getWorldPosition(rayOrigin);
      bro.controllerEmitter.getWorldQuaternion(emitterQ);
      rayDirection.set(0, 0, 1).applyQuaternion(emitterQ).normalize();
      ray.set(rayOrigin, rayDirection);
      const liveColliders = enemies.filter(e => e.alive).map(e => e.collider);
      const hits = ray.intersectObjects(liveColliders, false);
      if (hits.length) {
        const enemy = enemies[hits[0].object.userData.enemyIndex];
        damage(enemy);
        zapCooldown = .32;
      }
    }

    function updateParticles(dt) {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= dt;
        p.vel.y -= 6.4 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += dt * 5.3;
        p.mesh.rotation.y += dt * 7.1;
        p.mesh.material.opacity = Math.max(0, Math.min(1, p.life * 1.8));
        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.material.dispose();
          particles.splice(i, 1);
        }
      }
    }

    function tick(now) {
      const dt = Math.min(.034, Math.max(.001, (now - last) / 1000));
      last = now;
      const t = now / 1000;
      for (const e of enemies) moveEnemy(e, dt, t);
      updateZap(dt);
      updateParticles(dt);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    window.__hybridEnemies = enemies;
    console.info('[Hybrid v0.9 Phase 2A] 3-enemy patrol/chase/ZAP encounter ready');
  } catch (err) {
    console.error('[Hybrid v0.9 Phase 2A] enemy foundation failed', err);
  }
})();
