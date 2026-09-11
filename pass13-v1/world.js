import * as THREE from 'three';

export function createWorldSystem({ scene, mobile, setPhase }) {
  const world = new THREE.Group();
  world.name = 'pass13-world';
  scene.add(world);
  const artRoot = new THREE.Group();
  artRoot.name = 'streamed-world-art';
  world.add(artRoot);

  const walkMeshes = [];
  const ray = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const heightCache = new Map();
  let worldBounds = new THREE.Box3();

  const mats = {
    grass: new THREE.MeshStandardMaterial({ color: 0x69a74b, roughness: 0.96 }),
    grassDark: new THREE.MeshStandardMaterial({ color: 0x4f873d, roughness: 0.98 }),
    path: new THREE.MeshStandardMaterial({ color: 0xc4a36f, roughness: 0.98 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x7d8179, roughness: 0.92 }),
    stoneLight: new THREE.MeshStandardMaterial({ color: 0x9ba093, roughness: 0.9 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x744626, roughness: 0.9 }),
    water: new THREE.MeshPhysicalMaterial({ color: 0x2596bd, roughness: 0.14, transparent: true, opacity: 0.78 }),
    cyan: new THREE.MeshStandardMaterial({ color: 0x6cecff, emissive: 0x1a7180, emissiveIntensity: 0.55, roughness: 0.35 }),
    violet: new THREE.MeshStandardMaterial({ color: 0xa56cff, emissive: 0x4a2376, emissiveIntensity: 0.52, roughness: 0.38 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xffcf4d, emissive: 0x6a4a00, emissiveIntensity: 0.35, roughness: 0.35 }),
    red: new THREE.MeshStandardMaterial({ color: 0xe44968, emissive: 0x5b0e25, emissiveIntensity: 0.38, roughness: 0.45 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2b3640, roughness: 0.8 })
  };

  const zones = [
    { id: 'A', name: 'MEADOW LAUNCH', z: 34 },
    { id: 'B', name: 'VILLAGE HEIGHTS', z: -8 },
    { id: 'C', name: 'RIVERWORKS', z: -42 },
    { id: 'D', name: 'WINDRIDGE', z: -78 },
    { id: 'E', name: 'RUIN CIRCUIT', z: -118 },
    { id: 'F', name: 'PORTAL ASCENT', z: -156 }
  ];

  function elev(z) {
    if (z > -45) return 0;
    if (z > -82) {
      const t = (-45 - z) / 37;
      return THREE.MathUtils.smoothstep(t, 0, 1) * 4.5;
    }
    if (z > -132) return 4.5 + Math.sin((z + 82) * 0.055) * 0.55;
    const t = Math.min(1, (-132 - z) / 34);
    return 4.5 + t * 1.5;
  }
  function routeX(z) {
    if (z > 8) return 0;
    if (z > -30) return Math.sin((8 - z) * 0.07) * 5;
    if (z > -63) return 7 + Math.sin((z + 30) * 0.08) * 4;
    if (z > -104) return -5 + Math.sin((z + 63) * 0.085) * 8;
    if (z > -145) return 5 + Math.sin((z + 104) * 0.09) * 7;
    return Math.sin((z + 145) * 0.12) * 2;
  }
  function meshBox(name, x, y, z, w, h, d, mat, ry = 0, rx = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.name = name;
    m.position.set(x, y, z);
    m.rotation.order = 'YXZ';
    m.rotation.y = ry;
    m.rotation.x = rx;
    m.castShadow = !mobile;
    m.receiveShadow = true;
    world.add(m);
    return m;
  }
  function terrain() {
    const sx = 26, sz = 150, width = 96, zMax = 52, zMin = -178;
    const pos = [], uv = [], idx = [];
    for (let iz = 0; iz <= sz; iz++) {
      const z = THREE.MathUtils.lerp(zMax, zMin, iz / sz);
      const y = elev(z);
      for (let ix = 0; ix <= sx; ix++) {
        const x = THREE.MathUtils.lerp(-width / 2, width / 2, ix / sx);
        const edge = Math.abs(x) / (width / 2);
        const crown = Math.max(0, edge - 0.72) * 1.2;
        pos.push(x, y - crown, z);
        uv.push(ix / sx, iz / sz);
      }
    }
    for (let iz = 0; iz < sz; iz++) for (let ix = 0; ix < sx; ix++) {
      const a = iz * (sx + 1) + ix, b = a + 1, c = a + (sx + 1), d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mats.grass);
    m.name = 'continuous-world1-terrain';
    m.receiveShadow = true;
    world.add(m); walkMeshes.push(m);
  }
  function addPad(name, x, z, y, w, d, mat = mats.stone, h = 0.4) {
    const m = meshBox(name, x, y - h / 2, z, w, h, d, mat);
    walkMeshes.push(m); return m;
  }
  function addRamp(name, x0, z0, y0, x1, z1, y1, width = 5.5, mat = mats.stone) {
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
    const slope = Math.atan2(y1 - y0, len), yaw = Math.atan2(dx, dz);
    const m = meshBox(name, (x0 + x1) / 2, (y0 + y1) / 2 - 0.18, (z0 + z1) / 2, width, 0.36, len, mat, yaw, -slope);
    walkMeshes.push(m); return m;
  }
  function addPathSegment(z0, z1, width = 6.8) {
    const x0 = routeX(z0), x1 = routeX(z1), dx = x1 - x0, dz = z1 - z0;
    const len = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz);
    meshBox('route-path', (x0 + x1) / 2, (elev(z0) + elev(z1)) / 2 + 0.035, (z0 + z1) / 2, width, 0.07, len, mats.path, yaw);
  }
  function addTree(x, z, s = 1) {
    const y = elev(z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.3 * s, 1.8 * s, 8), mats.wood);
    trunk.position.set(x, y + 0.9 * s, z); world.add(trunk);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.1 * s, 2.5 * s, 9), mats.grassDark);
    crown.position.set(x, y + 2.55 * s, z); world.add(crown);
  }
  function addRail(x0, z0, x1, z1, y, side = 1) {
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz);
    const ox = Math.cos(yaw) * side * 2.7, oz = -Math.sin(yaw) * side * 2.7;
    meshBox('visible-rail', (x0 + x1) / 2 + ox, y + 0.8, (z0 + z1) / 2 + oz, 0.16, 1.6, len, mats.wood, yaw);
  }

  function buildWorld() {
    setPhase('Building clean World 1 geometry…', 20);
    terrain();
    for (let z = 42; z > -168; z -= 10) addPathSegment(z, Math.max(-168, z - 10));

    addPad('A-launch', 0, 24, elev(24) + 0.55, 11, 8, mats.stoneLight);
    addRamp('A-main-ramp', 0, 20, elev(20) + 0.2, -7, 12, elev(12) + 1.45, 6.2);
    addPad('A-terrace', -7, 9, elev(9) + 1.45, 11, 8, mats.grassDark);
    addRamp('A-lookout-ramp', -10, 7, elev(7) + 1.45, -23, 1, elev(1) + 2.55, 4.8);
    addPad('A-lookout', -25, -1, elev(-1) + 2.55, 10, 8, mats.stoneLight);

    addPad('B-market', 7, -8, elev(-8) + 1.2, 13, 9, mats.stoneLight);
    addRamp('B-rise-1', 2, -5, elev(-5) + 0.25, 7, -8, elev(-8) + 1.4, 6);
    addRamp('B-rise-2', 7, -12, elev(-12) + 1.4, -4, -18, elev(-18) + 2.1, 5.2);
    addPad('B-upper-square', -5, -21, elev(-21) + 2.1, 12, 9);
    addRamp('B-rooftop-loop', -10, -21, elev(-21) + 2.3, -22, -18, elev(-18) + 3.5, 4.4);
    addPad('B-high-cache', -24, -18, elev(-18) + 3.5, 10, 7, mats.stoneLight);
    addRamp('B-return', -20, -22, elev(-22) + 3.5, -7, -28, elev(-28) + 0.5, 4.5);

    const riverY = elev(-44) + 0.08;
    meshBox('river-water', 7, riverY, -44, 64, 0.12, 15, mats.water);
    addPad('C-bridge-entry', routeX(-35), -35, elev(-35) + 0.65, 10, 6);
    addRamp('C-bridge-up', routeX(-32), -32, elev(-32) + 0.2, routeX(-37), -37, elev(-37) + 0.9, 7, mats.wood);
    addPad('C-main-bridge', 7, -44, elev(-44) + 0.9, 9, 16, mats.wood, 0.5);
    addRamp('C-bridge-down', 7, -51, elev(-51) + 0.9, routeX(-57), -57, elev(-57) + 0.25, 7, mats.wood);
    addRail(7, -36, 7, -52, elev(-44) + 0.9, -1); addRail(7, -36, 7, -52, elev(-44) + 0.9, 1);
    [[22,-38,.55],[27,-44,.85],[25,-51,1.05],[18,-56,.7]].forEach(([x,z,h])=>addPad('C-river-loop',x,z,elev(z)+h,6.5,5.5,mats.stoneLight));
    addRamp('C-loop-in', 11, -36, elev(-36) + 0.3, 22, -38, elev(-38) + 0.75, 4.2);
    addRamp('C-loop-out', 18, -56, elev(-56) + 0.9, 8, -59, elev(-59) + 0.3, 4.2);

    const ridge=[[-3,-65,elev(-65)+.8],[-14,-72,elev(-72)+1.45],[-3,-80,elev(-80)+2.1],[13,-87,elev(-87)+2.65],[4,-96,elev(-96)+3.05]];
    ridge.forEach(([x,z,y],i)=>addPad(`D-ridge-${i}`,x,z,y,10,7,i%2?mats.stoneLight:mats.grassDark));
    for(let i=1;i<ridge.length;i++){const a=ridge[i-1],b=ridge[i];addRamp(`D-ramp-${i}`,a[0],a[1]-2.2,a[2]+.2,b[0],b[1]+2.2,b[2]+.2,5.5);}
    addRamp('D-high-in', -14, -72, ridge[1][2]+.25, -28, -77, elev(-77)+4.1, 4.4);
    addPad('D-high-a', -29, -80, elev(-80)+4.1, 9, 7, mats.stoneLight);
    addPad('D-high-b', -26, -89, elev(-89)+4.5, 8, 7, mats.stoneLight);
    addRamp('D-high-return', -26, -92, elev(-92)+4.5, -4, -99, elev(-99)+3.1, 4.4);

    const ry=(z,h)=>elev(z)+h;
    addPad('E-entry',4,-106,ry(-106,1),12,9); addPad('E-left',-12,-114,ry(-114,1.8),10,8,mats.stoneLight);
    addPad('E-right',16,-115,ry(-115,2.2),10,8,mats.stoneLight); addPad('E-upper-left',-10,-127,ry(-127,3),9,8);
    addPad('E-upper-right',13,-130,ry(-130,3.6),9,8);
    addRamp('E-l1',4,-109,ry(-109,1.2),-12,-111,ry(-111,2),5.2); addRamp('E-l2',-12,-118,ry(-118,2),-10,-124,ry(-124,3.2),4.6);
    addRamp('E-cross',-7,-130,ry(-130,3.2),13,-127,ry(-127,3.8),4.8,mats.stoneLight); addRamp('E-r2',13,-126,ry(-126,3.8),16,-118,ry(-118,2.4),4.6);
    addRamp('E-return',14,-112,ry(-112,2.4),4,-108,ry(-108,1.2),4.6);

    const base=elev(-151);
    addPad('F-court',0,-148,base+1,17,11,mats.stoneLight); addRamp('F-ramp-1',routeX(-143),-143,elev(-143)+.25,0,-148,base+1.2,7);
    addPad('F-dais',0,-158,base+2.65,13,10); addRamp('F-ramp-2',0,-153,base+1.2,0,-158,base+2.85,7);

    [[-18,38,1.25],[17,34,1],[-20,24,.95],[20,17,1.1],[-29,4,.85],[26,-4,.9],[-30,-31,.9],[34,-30,1],[-31,-61,.9],[31,-66,.9],[-35,-96,.8],[35,-101,.85],[-31,-138,.85],[32,-142,.9]].forEach(t=>addTree(...t));
    refreshBounds();
    return { spawn:{x:0,z:39}, tube:{x:0,z:-158,y:base+3.1} };
  }
  function groundAt(x,z,useCache=true){
    const key=`${Math.round(x*8)},${Math.round(z*8)}`; if(useCache&&heightCache.has(key))return heightCache.get(key);
    const top=Math.max(30,worldBounds.max.y+18); ray.set(new THREE.Vector3(x,top,z),down); ray.far=top-worldBounds.min.y+30;
    const hit=ray.intersectObjects(walkMeshes,false)[0],y=hit?hit.point.y:null; if(useCache)heightCache.set(key,y); return y;
  }
  function refreshBounds(){world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);heightCache.clear();}
  function zoneForZ(z){let current=zones[0];for(const zone of zones)if(z<=zone.z)current=zone;return current;}
  function getBounds(){return worldBounds;}

  return { world, artRoot, mats, zones, elev, routeX, walkMeshes, buildWorld, groundAt, refreshBounds, zoneForZ, getBounds };
}
