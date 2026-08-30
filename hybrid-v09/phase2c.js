const sleep2C = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    let bro;
    for (let i = 0; i < 500; i += 1) {
      bro = window.__bro;
      if (bro?.root?.parent && document.getElementById('ui')?.classList.contains('show')) break;
      await sleep2C(25);
    }
    if (!bro?.root?.parent) throw new Error('Phase 2C could not find the active Gamer Bro.');

    const scene = bro.root.parent;
    const body = bro.body;
    const M = bro.materials;
    window.__hybridPrismAttack = true;

    // ------------------------------------------------------------------
    // HERO FIDELITY LOCK — remove the old visible lens group and replace
    // it once with a new two-tone face-gear design using the hero's own
    // dissolve-compatible materials. No extra post-load character shell.
    // ------------------------------------------------------------------
    const lensMeshes = [];
    body.traverse(o => { if (o.isMesh && o.material === M.lens) lensMeshes.push(o); });
    const oldGlasses = lensMeshes.length ? lensMeshes[0].parent : null;
    if (oldGlasses && oldGlasses !== body) oldGlasses.visible = false;

    const faceGear = new THREE.Group();
    faceGear.name = 'HybridHeroFaceGear2C';
    body.add(faceGear);

    function roundedLensShape(w=.50,h=.31,r=.10){
      const s=new THREE.Shape(),x=-w/2,y=-h/2;
      s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
      s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();
      return s;
    }
    function addFaceMesh(geo,mat,pos,scale){
      const m=new THREE.Mesh(geo,mat);m.position.set(...pos);if(scale)m.scale.set(...scale);m.castShadow=m.receiveShadow=true;m.layers.enable(0);m.layers.enable(1);faceGear.add(m);bro.all?.push?.(m);return m;
    }
    const frameGeo=new THREE.ExtrudeGeometry(roundedLensShape(.55,.34,.105),{depth:.075,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.022});
    const lensGeo=new THREE.ExtrudeGeometry(roundedLensShape(.43,.235,.075),{depth:.030,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.010});
    const cyanMat=M.cup, pinkMat=M.lens, navyMat=M.frame, orangeMat=M.cupAccent;
    addFaceMesh(frameGeo,navyMat,[-.315,1.77,.753]);
    addFaceMesh(frameGeo.clone(),navyMat,[.315,1.77,.753]);
    addFaceMesh(lensGeo,cyanMat,[-.315,1.815,.835]);
    addFaceMesh(lensGeo.clone(),pinkMat,[.315,1.815,.835]);
    addFaceMesh(new THREE.BoxGeometry(.19,.075,.10),orangeMat,[0,1.88,.805]);
    addFaceMesh(new THREE.BoxGeometry(.30,.045,.075),cyanMat,[-.39,2.105,.765],null).rotation.z=.06;
    addFaceMesh(new THREE.BoxGeometry(.30,.045,.075),pinkMat,[.39,2.105,.765],null).rotation.z=-.06;
    const hingeGeo=new THREE.SphereGeometry(.065,12,8);
    addFaceMesh(hingeGeo,orangeMat,[-.66,1.92,.755]);addFaceMesh(hingeGeo.clone(),orangeMat,[.66,1.92,.755]);

    // Stronger authored-looking cowlick using the same native hair materials,
    // so it dissolves with the rest of the hero in the portal.
    const hair2C=new THREE.Group();hair2C.name='HybridHeroHair2C';body.add(hair2C);
    function lock(points,r,mat=M.hair){
      const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
      const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,16,r,9,false),mat);mesh.castShadow=mesh.receiveShadow=true;mesh.layers.enable(0);mesh.layers.enable(1);hair2C.add(mesh);bro.all?.push?.(mesh);
    }
    lock([[-.52,2.34,.31],[-.31,2.70,.52],[-.02,3.00,.44],[.28,3.05,.18]],.108);
    lock([[-.26,2.39,.39],[.02,2.77,.59],[.36,2.99,.45],[.69,2.87,.15]],.118);
    lock([[.04,2.40,.40],[.33,2.72,.55],[.66,2.84,.35],[.86,2.67,.05]],.102);
    lock([[-.60,2.30,.18],[-.67,2.56,.30],[-.52,2.77,.17],[-.29,2.86,-.05]],.082,M.hairDeep||M.hair);
    lock([[.53,2.28,.16],[.72,2.51,.24],[.82,2.65,.07],[.71,2.77,-.16]],.082,M.hairDeep||M.hair);

    // ------------------------------------------------------------------
    // TRUE MIRRORED TWO-HAND CONTROLLER POSE.
    // The source arms are asymmetrical, so use the left authored arm as the
    // action master and mirror it for the right side only while firing.
    // ------------------------------------------------------------------
    const armCandidates=body.children.filter(c=>c.isGroup&&Math.abs(c.position.y-1.145)<.20&&Math.abs(c.position.x)>.28&&Math.abs(c.position.x)<.80);
    armCandidates.sort((a,b)=>a.position.x-b.position.x);
    const armL=armCandidates[0], armROriginal=armCandidates[armCandidates.length-1];
    let mirroredRight=null;
    if(armL&&armROriginal&&armL!==armROriginal){
      mirroredRight=armL.clone(true);mirroredRight.name='HybridMirroredActionArmR';mirroredRight.visible=false;body.add(mirroredRight);
    }
    const originalUpdate=bro.update.bind(bro);
    bro.update=(t,dt,fx)=>{
      originalUpdate(t,dt,fx);
      if(!armL||!armROriginal||!mirroredRight)return;
      if(bro.action){
        armROriginal.visible=false;mirroredRight.visible=true;
        armL.position.set(-.365,1.18,.145);armL.rotation.set(-.44,0,1.08);armL.scale.set(1,1,1);
        mirroredRight.position.set(.365,1.18,.145);mirroredRight.rotation.set(-.44,0,-1.08);mirroredRight.scale.set(-1,1,1);
        bro.controllerGroup.position.set(0,1.02,.63);bro.controllerGroup.scale.setScalar(1.10);
      }else{
        armROriginal.visible=true;mirroredRight.visible=false;
      }
    };

    // ------------------------------------------------------------------
    // REMOVE THE OLD THIN BEAM FROM RENDERING. It still exists internally
    // for compatibility, but cannot draw. The actual attack is the prism
    // stream below.
    // ------------------------------------------------------------------
    scene.traverse(o=>{
      const mat=o?.material;if(!mat?.isMaterial)return;
      const hex=mat.color?.getHex?.();
      if(hex===0xe8fbff||hex===0x8d5dff){mat.colorWrite=false;mat.needsUpdate=true;}
    });

    // ------------------------------------------------------------------
    // COMBAT ARENA DRESSING — large circular combat pads and luminous
    // crystals inspired by the supplied concept, kept off the traversal
    // centreline so they do not create another movement barrier.
    // ------------------------------------------------------------------
    const arenaDress=new THREE.Group();arenaDress.name='HybridPhase2CArenaDress';scene.add(arenaDress);
    const stone=new THREE.MeshPhysicalMaterial({color:0x332946,roughness:.72,metalness:.05,clearcoat:.18});
    const rune=new THREE.MeshBasicMaterial({color:0x9b64ff,transparent:true,opacity:.62,blending:THREE.AdditiveBlending,depthWrite:false});
    const crystalMats=[
      new THREE.MeshPhysicalMaterial({color:0xa36cff,emissive:0x5c22ca,emissiveIntensity:1.15,roughness:.12,metalness:.08,clearcoat:.85}),
      new THREE.MeshPhysicalMaterial({color:0x5ee8ff,emissive:0x167fbe,emissiveIntensity:1.05,roughness:.10,metalness:.08,clearcoat:.85}),
      new THREE.MeshPhysicalMaterial({color:0xff62cf,emissive:0xa41678,emissiveIntensity:.90,roughness:.10,metalness:.05,clearcoat:.85})
    ];
    function arenaPad(x,z,r,y){
      const base=new THREE.Mesh(new THREE.CylinderGeometry(r,r+.30,.34,48),stone);base.position.set(x,y-.12,z);base.receiveShadow=true;arenaDress.add(base);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(r*.67,.055,8,56),rune);ring.position.set(x,y+.08,z);ring.rotation.x=Math.PI/2;arenaDress.add(ring);
      const ring2=new THREE.Mesh(new THREE.TorusGeometry(r*.38,.035,8,48),rune);ring2.position.set(x,y+.09,z);ring2.rotation.x=Math.PI/2;arenaDress.add(ring2);
    }
    arenaPad(0,33.5,6.9,.45);arenaPad(-18,33,5.2,.92);arenaPad(18,33,5.2,.92);
    const crystalGeo=new THREE.OctahedronGeometry(.42,0);
    [[-6.7,31.0,.72],[6.6,36.0,.72],[-23.0,29.0,1.23],[-14.0,37.2,1.23],[23.0,30.1,1.23],[14.1,36.9,1.23],[-4.6,38.8,.72],[4.8,28.4,.72]].forEach((p,i)=>{
      const g=new THREE.Group();g.position.set(...p);arenaDress.add(g);
      for(let k=0;k<3;k++){const c=new THREE.Mesh(crystalGeo,crystalMats[(i+k)%crystalMats.length]);c.position.set((k-1)*.34,k*.28,0);c.scale.set(.72+k*.13,1.05+k*.28,.72+k*.13);c.rotation.y=(i+k)*.47;c.castShadow=true;g.add(c);}
    });

    // ------------------------------------------------------------------
    // ENEMIES — patrol/chase retained, now 3 HP, strong hit reaction,
    // knockback, readable shatter defeat, then delayed respawn.
    // ------------------------------------------------------------------
    const enemyRoot=new THREE.Group();enemyRoot.name='HybridPhase2CEnemies';scene.add(enemyRoot);
    const mkPhysical=(color,emissive=0x000000,emissiveIntensity=0)=>new THREE.MeshPhysicalMaterial({color,emissive,emissiveIntensity,roughness:.50,metalness:.02,clearcoat:.34,clearcoatRoughness:.24});
    const eyeMat=new THREE.MeshBasicMaterial({color:0xf7dd66});const darkMat=mkPhysical(0x1d1324);
    function addMesh(parent,geo,mat,pos,scale,rot){const m=new THREE.Mesh(geo,mat);if(pos)m.position.set(...pos);if(scale)m.scale.set(...scale);if(rot)m.rotation.set(...rot);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
    function addEyes(parent,y,z,spread,color=0xf7dd66){const mat=color===0xf7dd66?eyeMat:new THREE.MeshBasicMaterial({color});for(const side of[-1,1])addMesh(parent,new THREE.SphereGeometry(.085,12,8),mat,[side*spread,y,z],[1,1.18,.60]);}
    function stumpModel(){const g=new THREE.Group(),bark=mkPhysical(0x704321,0x2b1105,.08),barkDark=mkPhysical(0x382217),moss=mkPhysical(0x54a33f,0x163d17,.10);addMesh(g,new THREE.CylinderGeometry(.58,.66,1.22,16),bark,[0,.61,0]);addMesh(g,new THREE.CylinderGeometry(.48,.55,.16,16),barkDark,[0,1.25,0]);addMesh(g,new THREE.TorusGeometry(.38,.065,8,20),moss,[0,1.29,0],[1,.55,1],[Math.PI/2,0,0]);addEyes(g,.82,.57,.19,0xd97cff);for(const s of[-1,1])addMesh(g,new THREE.ConeGeometry(.16,.54,7),bark,[s*.61,.56,.02],null,[0,0,-s*.72]);return g;}
    function ghostModel(){const g=new THREE.Group(),ghost=mkPhysical(0x8c5fe9,0x421886,.52);ghost.transparent=true;ghost.opacity=.94;addMesh(g,new THREE.SphereGeometry(.66,24,18),ghost,[0,.86,0],[1,1.13,.90]);for(let i=-2;i<=2;i++)addMesh(g,new THREE.ConeGeometry(.16,.45,8),ghost,[i*.22,.30,0],[1,1,.9],[0,0,Math.PI]);addEyes(g,.99,.57,.21,0xc7f8ff);return g;}
    function mushroomModel(){const g=new THREE.Group(),stem=mkPhysical(0xf2d8b0),cap=mkPhysical(0xd94e6c,0x641128,.20),spot=mkPhysical(0xfff1ce);addMesh(g,new THREE.CapsuleGeometry(.36,.68,7,14),stem,[0,.64,0]);addMesh(g,new THREE.SphereGeometry(.72,24,14),cap,[0,1.30,0],[1.14,.57,1.04]);addEyes(g,.82,.37,.15,0x37222a);for(const[x,z,s]of[[-.28,.19,.11],[.18,.28,.13],[.35,-.02,.09],[-.05,-.35,.10]])addMesh(g,new THREE.SphereGeometry(s,10,7),spot,[x,1.53,z],[1,.42,1]);return g;}
    const defs=[
      {kind:'stump',build:stumpModel,center:[0,33.5],y:.52,radius:7.2,speed:.90,route:[[-4.3,31.2],[1.7,29.7],[4.7,34.0],[-1.8,37.0]]},
      {kind:'ghost',build:ghostModel,center:[-18,33],y:.98,radius:5.9,speed:1.04,route:[[-21.0,30.5],[-16.6,29.4],[-14.6,33.3],[-19.0,36.0]]},
      {kind:'mushroom',build:mushroomModel,center:[18,33],y:.98,radius:5.9,speed:.98,route:[[15.0,30.7],[18.4,28.9],[21.5,33.0],[18.1,36.0]]}
    ];
    const colliderMat=new THREE.MeshBasicMaterial({transparent:true,opacity:.001,depthWrite:false});
    const enemies=defs.map((d,index)=>{const root=d.build();root.name=`HybridEnemy_${d.kind}`;root.position.set(d.route[0][0],d.y,d.route[0][1]);enemyRoot.add(root);const collider=new THREE.Mesh(new THREE.SphereGeometry(.90,12,8),colliderMat);collider.position.y=.78;root.add(collider);return{...d,root,collider,waypoint:1,hp:3,maxHp:3,alive:true,defeating:false,defeatT:0,respawnT:0,hitT:0,knock:new THREE.Vector3(),chase:false,bobSeed:index*2.17,baseScale:1};});

    // ------------------------------------------------------------------
    // PRISM STREAM — broad controller-fired crystal burst rather than a
    // rigid laser. Five luminous shards fan forward with additive tails.
    // ------------------------------------------------------------------
    const attackRoot=new THREE.Group();attackRoot.name='HybridPrismStream';scene.add(attackRoot);
    const shardGeo=new THREE.OctahedronGeometry(.13,0),trailGeo=new THREE.ConeGeometry(.12,.78,7,1,true),sparkGeo=new THREE.TetrahedronGeometry(.09,0);
    const prismMats=[
      new THREE.MeshBasicMaterial({color:0x7eeeff,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false}),
      new THREE.MeshBasicMaterial({color:0xff68d1,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false}),
      new THREE.MeshBasicMaterial({color:0xffe37a,transparent:true,opacity:.90,blending:THREE.AdditiveBlending,depthWrite:false}),
      new THREE.MeshBasicMaterial({color:0xc08cff,transparent:true,opacity:.94,blending:THREE.AdditiveBlending,depthWrite:false})
    ];
    const projectiles=[],particles=[];let fireCooldown=0,last=performance.now();
    const emitterPos=new THREE.Vector3(),emitterQ=new THREE.Quaternion(),forward=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(),tmp=new THREE.Vector3(),targetPos=new THREE.Vector3(),yAxis=new THREE.Vector3(0,1,0);
    function orient(mesh,dir){mesh.quaternion.setFromUnitVectors(yAxis,dir);}
    function spawnPrismBurst(){
      bro.controllerEmitter.getWorldPosition(emitterPos);bro.controllerEmitter.getWorldQuaternion(emitterQ);forward.set(0,0,1).applyQuaternion(emitterQ).normalize();right.set(1,0,0).applyQuaternion(emitterQ).normalize();up.set(0,1,0).applyQuaternion(emitterQ).normalize();
      const spread=[[-.16,.04],[-.075,.10],[0,0],[.075,-.02],[.16,.06]];
      spread.forEach((s,i)=>{const dir=forward.clone().addScaledVector(right,s[0]).addScaledVector(up,s[1]).normalize();const g=new THREE.Group();g.position.copy(emitterPos).addScaledVector(forward,.18);attackRoot.add(g);const core=new THREE.Mesh(shardGeo,prismMats[i%prismMats.length]);core.scale.set(1,1,2.5);g.add(core);const tail=new THREE.Mesh(trailGeo,prismMats[(i+1)%prismMats.length]);tail.position.copy(dir).multiplyScalar(-.28);orient(tail,dir);g.add(tail);projectiles.push({g,dir,speed:15.5+i*.55,life:1.28,age:0});});
      for(let i=0;i<8;i++){const m=new THREE.Mesh(sparkGeo,prismMats[i%prismMats.length]);m.position.copy(emitterPos);attackRoot.add(m);const a=(i/8)*Math.PI*2;particles.push({mesh:m,vel:right.clone().multiplyScalar(Math.cos(a)*1.7).addScaledVector(up,Math.sin(a)*1.7).addScaledVector(forward,2.2),life:.32});}
    }
    function hitBurst(pos,big=false){for(let i=0;i<(big?24:9);i++){const m=new THREE.Mesh(sparkGeo,prismMats[i%prismMats.length]);m.position.copy(pos);attackRoot.add(m);const v=new THREE.Vector3((Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5);particles.push({mesh:m,vel:v,life:(big?.75:.38)+Math.random()*.22});}}
    function damage(enemy,dir){if(!enemy?.alive||enemy.defeating)return;enemy.hp--;enemy.hitT=1;enemy.knock.addScaledVector(dir,1.25);enemy.root.getWorldPosition(targetPos);targetPos.y+=.8;hitBurst(targetPos,false);if(enemy.hp<=0){enemy.alive=false;enemy.defeating=true;enemy.defeatT=.78;enemy.respawnT=6.0;hitBurst(targetPos,true);}}
    function updateProjectiles(dt){
      for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.age+=dt;p.life-=dt;p.g.position.addScaledVector(p.dir,p.speed*dt);p.g.rotation.z+=dt*8;let hit=false;for(const e of enemies){if(!e.alive||e.defeating)continue;e.root.getWorldPosition(targetPos);targetPos.y+=.8;if(p.g.position.distanceToSquared(targetPos)<.95*.95){damage(e,p.dir);hit=true;break;}}if(hit||p.life<=0){attackRoot.remove(p.g);p.g.traverse(o=>{if(o.geometry&&o.geometry!==shardGeo&&o.geometry!==trailGeo)o.geometry.dispose?.();});projectiles.splice(i,1);}}
    }
    function updateParticles(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.vel.y-=2.4*dt;p.mesh.position.addScaledVector(p.vel,dt);p.mesh.rotation.x+=dt*7;p.mesh.rotation.y+=dt*9;p.mesh.scale.setScalar(Math.max(.10,p.life*1.8));if(p.life<=0){attackRoot.remove(p.mesh);particles.splice(i,1);}}}

    function moveEnemy(e,dt,t){
      if(e.defeating){e.defeatT-=dt;const q=Math.max(0,e.defeatT/.78);e.root.rotation.z+=(1-q)*dt*8;e.root.rotation.y+=dt*7;e.root.scale.setScalar(Math.max(.05,q));e.root.position.y+=dt*.65;if(e.defeatT<=0){e.defeating=false;e.root.visible=false;}return;}
      if(!e.alive){e.respawnT-=dt;if(e.respawnT<=0){e.alive=true;e.hp=e.maxHp;e.root.visible=true;e.root.scale.setScalar(1);e.root.rotation.set(0,0,0);e.root.position.set(e.route[0][0],e.y,e.route[0][1]);e.waypoint=1;e.knock.set(0,0,0);}return;}
      e.hitT=Math.max(0,e.hitT-dt*4.8);const hero=bro.root.position,hx=hero.x,hz=hero.z,heroFromCenter=Math.hypot(hx-e.center[0],hz-e.center[1]),dxh=hx-e.root.position.x,dzh=hz-e.root.position.z,heroDist=Math.hypot(dxh,dzh),sameTier=Math.abs(hero.y-e.y)<2.6;e.chase=bro.root.visible&&sameTier&&heroDist<8.2&&heroFromCenter<e.radius+.8;let tx,tz,speed;if(e.chase){tx=hx;tz=hz;speed=e.speed*1.68;}else{[tx,tz]=e.route[e.waypoint%e.route.length];speed=e.speed;if(Math.hypot(tx-e.root.position.x,tz-e.root.position.z)<.45)e.waypoint=(e.waypoint+1)%e.route.length;}let dx=tx-e.root.position.x,dz=tz-e.root.position.z,dist=Math.hypot(dx,dz);if(dist>.001){dx/=dist;dz/=dist;e.root.position.x+=dx*Math.min(dist,speed*dt)+e.knock.x*dt;e.root.position.z+=dz*Math.min(dist,speed*dt)+e.knock.z*dt;const desired=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(desired-e.root.rotation.y),Math.cos(desired-e.root.rotation.y));e.root.rotation.y+=delta*Math.min(1,dt*6.2);}e.knock.multiplyScalar(Math.pow(.03,dt));const bob=e.kind==='ghost'?.11*Math.sin(t*2.2+e.bobSeed):.04*Math.abs(Math.sin(t*3.4+e.bobSeed));e.root.position.y=e.y+bob;const pulse=1+e.hitT*.19;e.root.scale.setScalar(pulse);e.root.rotation.z=e.hitT*.12*Math.sin(t*35+e.bobSeed);
    }

    function tick(now){const dt=Math.min(.034,Math.max(.001,(now-last)/1000));last=now;const t=now/1000;fireCooldown=Math.max(0,fireCooldown-dt);if(bro.action&&bro.controllerEmitter&&fireCooldown<=0){spawnPrismBurst();fireCooldown=.19;}for(const e of enemies)moveEnemy(e,dt,t);updateProjectiles(dt);updateParticles(dt);rune.opacity=.52+.16*(.5+.5*Math.sin(t*2.1));requestAnimationFrame(tick);}
    requestAnimationFrame(tick);

    window.__hybridEnemies=enemies;
    window.__hybridPhase='2C';
    console.info('[Hybrid v0.9 Phase 2C] hero fidelity lock + prism combat ready');
  } catch (err) {
    console.error('[Hybrid v0.9 Phase 2C] failed', err);
  }
})();
