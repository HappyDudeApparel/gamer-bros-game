const sleep2D = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    let bro;
    for (let i=0;i<500;i++){
      bro=window.__bro;
      if(bro?.root?.parent&&document.getElementById('ui')?.classList.contains('show')) break;
      await sleep2D(25);
    }
    if(!bro?.root?.parent) throw new Error('Phase 2D could not find Gamer Bro.');

    const scene=bro.root.parent,body=bro.body,M=bro.materials;
    window.__hybridButtonAttack=true;

    const lensMeshes=[];
    body.traverse(o=>{if(o.isMesh&&o.material===M.lens)lensMeshes.push(o);});
    const oldGlasses=lensMeshes.length?lensMeshes[0].parent:null;
    if(oldGlasses&&oldGlasses!==body)oldGlasses.visible=false;
    body.getObjectByName('HybridHeroFaceGear2C')?.removeFromParent();
    body.getObjectByName('HybridHeroHair2C')?.removeFromParent();

    const faceGear=new THREE.Group();faceGear.name='HybridHeroFaceGear2D';body.add(faceGear);
    function roundedShape(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s;}
    function fm(geo,mat,pos){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=m.receiveShadow=true;m.layers.enable(0);m.layers.enable(1);faceGear.add(m);bro.all?.push?.(m);return m;}
    const frameGeo=new THREE.ExtrudeGeometry(roundedShape(.53,.32,.12),{depth:.062,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.028,bevelThickness:.018});
    const lensGeo=new THREE.ExtrudeGeometry(roundedShape(.42,.22,.09),{depth:.025,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.014,bevelThickness:.009});
    fm(frameGeo,M.frame,[-.305,1.79,.765]);fm(frameGeo.clone(),M.frame,[.305,1.79,.765]);
    fm(lensGeo,M.cup,[-.305,1.83,.836]);fm(lensGeo.clone(),M.lens,[.305,1.83,.836]);
    fm(new THREE.CapsuleGeometry(.035,.16,5,10),M.cupAccent,[0,1.89,.815]).rotation.z=Math.PI/2;
    const sideGeo=new THREE.CapsuleGeometry(.028,.17,5,10);fm(sideGeo,M.trim,[-.61,1.92,.775]).rotation.z=Math.PI/2;fm(sideGeo.clone(),M.trim,[.61,1.92,.775]).rotation.z=Math.PI/2;

    const armCandidates=body.children.filter(c=>c.isGroup&&Math.abs(c.position.y-1.145)<.20&&Math.abs(c.position.x)>.28&&Math.abs(c.position.x)<.80);
    armCandidates.sort((a,b)=>a.position.x-b.position.x);
    const armL=armCandidates[0],armROriginal=armCandidates[armCandidates.length-1];
    let mirroredRight=null;
    if(armL&&armROriginal&&armL!==armROriginal){
      mirroredRight=armL.clone(true);mirroredRight.name='HybridMirroredActionArmR2D';mirroredRight.visible=false;
      mirroredRight.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();o.geometry.scale(-1,1,1);o.material=o.material.clone();o.material.side=THREE.DoubleSide;}});
      body.add(mirroredRight);
    }
    const originalUpdate=bro.update.bind(bro);
    bro.update=(t,dt,fx)=>{
      originalUpdate(t,dt,fx);
      if(!armL||!armROriginal||!mirroredRight)return;
      if(bro.action){
        armROriginal.visible=false;mirroredRight.visible=true;
        armL.position.set(-.355,1.165,.145);armL.rotation.set(-.36,0,1.03);armL.scale.set(1,1,1);
        mirroredRight.position.set(.355,1.165,.145);mirroredRight.rotation.set(-.36,0,-1.03);mirroredRight.scale.set(1,1,1);
        bro.controllerGroup.position.set(0,1.00,.625);bro.controllerGroup.rotation.x=-.08;bro.controllerGroup.scale.setScalar(1.08);
      }else{
        armROriginal.visible=true;mirroredRight.visible=false;
      }
    };

    scene.traverse(o=>{const mat=o?.material;if(!mat?.isMaterial)return;const h=mat.color?.getHex?.();if(h===0xe8fbff||h===0x8d5dff){mat.colorWrite=false;mat.needsUpdate=true;}});

    const arena=new THREE.Group();arena.name='HybridPhase2DArena';scene.add(arena);
    const stone=new THREE.MeshPhysicalMaterial({color:0x332946,roughness:.72,metalness:.05,clearcoat:.18});
    const rune=new THREE.MeshBasicMaterial({color:0x9b64ff,transparent:true,opacity:.58,blending:THREE.AdditiveBlending,depthWrite:false});
    const crystalMats=[0xa36cff,0x5ee8ff,0xff62cf].map((c,i)=>new THREE.MeshPhysicalMaterial({color:c,emissive:c,emissiveIntensity:i===0?.62:.48,roughness:.12,clearcoat:.85}));
    function pad(x,z,r,y){const b=new THREE.Mesh(new THREE.CylinderGeometry(r,r+.28,.30,48),stone);b.position.set(x,y-.10,z);b.receiveShadow=true;arena.add(b);for(const q of[.68,.39]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r*q,.045,8,56),rune);ring.position.set(x,y+.075,z);ring.rotation.x=Math.PI/2;arena.add(ring);}}
    pad(0,33.5,6.9,.45);pad(-18,33,5.2,.92);pad(18,33,5.2,.92);
    const cg=new THREE.OctahedronGeometry(.42,0);[[-6.7,31,.72],[6.6,36,.72],[-23,29,1.23],[-14,37.2,1.23],[23,30.1,1.23],[14.1,36.9,1.23]].forEach((p,i)=>{const g=new THREE.Group();g.position.set(...p);arena.add(g);for(let k=0;k<3;k++){const c=new THREE.Mesh(cg,crystalMats[(i+k)%3]);c.position.set((k-1)*.34,k*.28,0);c.scale.set(.72+k*.13,1.05+k*.28,.72+k*.13);c.rotation.y=(i+k)*.47;c.castShadow=true;g.add(c);}});

    const enemyRoot=new THREE.Group();enemyRoot.name='HybridPhase2DEnemies';scene.add(enemyRoot);
    const phys=(color,em=0,int=0)=>new THREE.MeshPhysicalMaterial({color,emissive:em,emissiveIntensity:int,roughness:.50,metalness:.02,clearcoat:.34,clearcoatRoughness:.24});
    const eyeMat=new THREE.MeshBasicMaterial({color:0xf7dd66});
    function mesh(parent,geo,mat,pos,scale,rot){const m=new THREE.Mesh(geo,mat);if(pos)m.position.set(...pos);if(scale)m.scale.set(...scale);if(rot)m.rotation.set(...rot);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
    function eyes(parent,y,z,spread,color=0xf7dd66){const mat=color===0xf7dd66?eyeMat:new THREE.MeshBasicMaterial({color});for(const s of[-1,1])mesh(parent,new THREE.SphereGeometry(.085,12,8),mat,[s*spread,y,z],[1,1.18,.60]);}
    function stump(){const g=new THREE.Group(),b=phys(0x704321,0x2b1105,.08),d=phys(0x382217),m=phys(0x54a33f,0x163d17,.10);mesh(g,new THREE.CylinderGeometry(.58,.66,1.22,16),b,[0,.61,0]);mesh(g,new THREE.CylinderGeometry(.48,.55,.16,16),d,[0,1.25,0]);mesh(g,new THREE.TorusGeometry(.38,.065,8,20),m,[0,1.29,0],[1,.55,1],[Math.PI/2,0,0]);eyes(g,.82,.57,.19,0xd97cff);for(const s of[-1,1])mesh(g,new THREE.ConeGeometry(.16,.54,7),b,[s*.61,.56,.02],null,[0,0,-s*.72]);return g;}
    function ghost(){const g=new THREE.Group(),m=phys(0x8c5fe9,0x421886,.52);m.transparent=true;m.opacity=.94;mesh(g,new THREE.SphereGeometry(.66,24,18),m,[0,.86,0],[1,1.13,.90]);for(let i=-2;i<=2;i++)mesh(g,new THREE.ConeGeometry(.16,.45,8),m,[i*.22,.30,0],[1,1,.9],[0,0,Math.PI]);eyes(g,.99,.57,.21,0xc7f8ff);return g;}
    function mushroom(){const g=new THREE.Group(),s=phys(0xf2d8b0),c=phys(0xd94e6c,0x641128,.20),sp=phys(0xfff1ce);mesh(g,new THREE.CapsuleGeometry(.36,.68,7,14),s,[0,.64,0]);mesh(g,new THREE.SphereGeometry(.72,24,14),c,[0,1.30,0],[1.14,.57,1.04]);eyes(g,.82,.37,.15,0x37222a);for(const[x,z,r]of[[-.28,.19,.11],[.18,.28,.13],[.35,-.02,.09],[-.05,-.35,.10]])mesh(g,new THREE.SphereGeometry(r,10,7),sp,[x,1.53,z],[1,.42,1]);return g;}
    const defs=[
      {kind:'stump',build:stump,center:[0,33.5],y:.52,radius:7.2,speed:.90,route:[[-4.3,31.2],[1.7,29.7],[4.7,34],[-1.8,37]]},
      {kind:'ghost',build:ghost,center:[-18,33],y:.98,radius:5.9,speed:1.04,route:[[-21,30.5],[-16.6,29.4],[-14.6,33.3],[-19,36]]},
      {kind:'mushroom',build:mushroom,center:[18,33],y:.98,radius:5.9,speed:.98,route:[[15,30.7],[18.4,28.9],[21.5,33],[18.1,36]]}
    ];
    const colliderMat=new THREE.MeshBasicMaterial({transparent:true,opacity:.001,depthWrite:false});
    const enemies=defs.map((d,index)=>{const root=d.build();root.position.set(d.route[0][0],d.y,d.route[0][1]);enemyRoot.add(root);const collider=new THREE.Mesh(new THREE.SphereGeometry(.92,12,8),colliderMat);collider.position.y=.80;root.add(collider);return{...d,root,collider,waypoint:1,hp:3,maxHp:3,alive:true,defeating:false,defeatT:0,respawnT:0,hitT:0,knock:new THREE.Vector3(),chase:false,bobSeed:index*2.17};});

    const attackRoot=new THREE.Group();attackRoot.name='HybridButtonBarrage';scene.add(attackRoot);
    const buttonDefs=[
      {label:'X',fg:'#ffffff',bg:'#2589ff'},{label:'O',fg:'#ffffff',bg:'#ff4267'},
      {label:'△',fg:'#ffffff',bg:'#35d77f'},{label:'□',fg:'#ffffff',bg:'#e96ad8'},
      {label:'L1',fg:'#182033',bg:'#ffd54b'},{label:'R1',fg:'#182033',bg:'#ff9d35'},
      {label:'L2',fg:'#ffffff',bg:'#745cff'},{label:'R2',fg:'#ffffff',bg:'#25c6cf'}
    ];
    function buttonTexture(def){const c=document.createElement('canvas');c.width=c.height=192;const x=c.getContext('2d');x.clearRect(0,0,192,192);x.shadowColor=def.bg;x.shadowBlur=24;x.fillStyle=def.bg;x.beginPath();x.arc(96,96,67,0,Math.PI*2);x.fill();x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,.88)';x.lineWidth=8;x.stroke();x.fillStyle=def.fg;x.textAlign='center';x.textBaseline='middle';x.font=(def.label.length>1?'800 58px':'900 82px')+' Arial, sans-serif';x.fillText(def.label,96,101);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
    const buttonMats=buttonDefs.map(d=>new THREE.SpriteMaterial({map:buttonTexture(d),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    const sparkGeo=new THREE.TetrahedronGeometry(.075,0),sparkMats=[0x58e7ff,0xff5dcc,0xffd75c,0x916cff].map(c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));
    const shots=[],particles=[];let fireCooldown=0,shotIndex=0,last=performance.now();
    const emitterPos=new THREE.Vector3(),emitterQ=new THREE.Quaternion(),forward=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(),targetPos=new THREE.Vector3();
    function spawnButton(){
      bro.controllerEmitter.getWorldPosition(emitterPos);bro.controllerEmitter.getWorldQuaternion(emitterQ);forward.set(0,0,1).applyQuaternion(emitterQ).normalize();right.set(1,0,0).applyQuaternion(emitterQ).normalize();up.set(0,1,0).applyQuaternion(emitterQ).normalize();
      const count=shotIndex%4===0?2:1;
      for(let n=0;n<count;n++){
        const idx=(shotIndex+n*3)%buttonMats.length,sp=new THREE.Sprite(buttonMats[idx]);
        const scale=.48+(idx%3)*.08;sp.scale.set(scale,scale,scale);sp.position.copy(emitterPos).addScaledVector(forward,.25).addScaledVector(right,(n-(count-1)/2)*.14);attackRoot.add(sp);
        const dir=forward.clone().addScaledVector(right,((idx%5)-2)*.025+(n?-.045:.025)).addScaledVector(up,((idx%3)-1)*.018).normalize();
        shots.push({sprite:sp,dir,speed:12.8+(idx%4)*.75,life:1.55,spin:(idx%2?1:-1)*(2.5+(idx%3)),base:scale});
      }
      for(let i=0;i<4;i++){const m=new THREE.Mesh(sparkGeo,sparkMats[(shotIndex+i)%sparkMats.length]);m.position.copy(emitterPos);attackRoot.add(m);particles.push({mesh:m,vel:right.clone().multiplyScalar((Math.random()-.5)*2).addScaledVector(up,(Math.random()-.25)*1.6).addScaledVector(forward,2+Math.random()*2),life:.28});}
      shotIndex=(shotIndex+1)%buttonMats.length;
    }
    function impact(pos,big=false){for(let i=0;i<(big?20:8);i++){const m=new THREE.Mesh(sparkGeo,sparkMats[i%sparkMats.length]);m.position.copy(pos);attackRoot.add(m);particles.push({mesh:m,vel:new THREE.Vector3((Math.random()-.5)*5,1+Math.random()*4,(Math.random()-.5)*5),life:(big?.72:.36)+Math.random()*.20});}}
    function damage(e,dir){if(!e?.alive||e.defeating)return;e.hp--;e.hitT=1;e.knock.addScaledVector(dir,1.18);e.root.getWorldPosition(targetPos);targetPos.y+=.8;impact(targetPos,false);if(e.hp<=0){e.alive=false;e.defeating=true;e.defeatT=.78;e.respawnT=6;impact(targetPos,true);}}
    function updateShots(dt){for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.life-=dt;s.sprite.position.addScaledVector(s.dir,s.speed*dt);s.sprite.material.rotation+=s.spin*dt;s.sprite.scale.setScalar(s.base*(.92+.12*Math.sin((1.55-s.life)*16)));let hit=false;for(const e of enemies){if(!e.alive||e.defeating)continue;e.root.getWorldPosition(targetPos);targetPos.y+=.8;if(s.sprite.position.distanceToSquared(targetPos)<1.05){damage(e,s.dir);hit=true;break;}}if(hit||s.life<=0){attackRoot.remove(s.sprite);shots.splice(i,1);}}}
    function updateParticles(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.vel.y-=2.1*dt;p.mesh.position.addScaledVector(p.vel,dt);p.mesh.rotation.x+=dt*7;p.mesh.rotation.y+=dt*9;p.mesh.scale.setScalar(Math.max(.08,p.life*1.8));if(p.life<=0){attackRoot.remove(p.mesh);particles.splice(i,1);}}}

    function moveEnemy(e,dt,t){
      if(e.defeating){e.defeatT-=dt;const q=Math.max(0,e.defeatT/.78);e.root.rotation.z+=(1-q)*dt*8;e.root.rotation.y+=dt*7;e.root.scale.setScalar(Math.max(.05,q));e.root.position.y+=dt*.65;if(e.defeatT<=0){e.defeating=false;e.root.visible=false;}return;}
      if(!e.alive){e.respawnT-=dt;if(e.respawnT<=0){e.alive=true;e.hp=e.maxHp;e.root.visible=true;e.root.scale.setScalar(1);e.root.rotation.set(0,0,0);e.root.position.set(e.route[0][0],e.y,e.route[0][1]);e.waypoint=1;e.knock.set(0,0,0);}return;}
      e.hitT=Math.max(0,e.hitT-dt*4.8);const hero=bro.root.position,hx=hero.x,hz=hero.z,heroFromCenter=Math.hypot(hx-e.center[0],hz-e.center[1]),dxh=hx-e.root.position.x,dzh=hz-e.root.position.z,heroDist=Math.hypot(dxh,dzh),sameTier=Math.abs(hero.y-e.y)<2.6;e.chase=bro.root.visible&&sameTier&&heroDist<8.2&&heroFromCenter<e.radius+.8;let tx,tz,speed;if(e.chase){tx=hx;tz=hz;speed=e.speed*1.68;}else{[tx,tz]=e.route[e.waypoint%e.route.length];speed=e.speed;if(Math.hypot(tx-e.root.position.x,tz-e.root.position.z)<.45)e.waypoint=(e.waypoint+1)%e.route.length;}let dx=tx-e.root.position.x,dz=tz-e.root.position.z,dist=Math.hypot(dx,dz);if(dist>.001){dx/=dist;dz/=dist;e.root.position.x+=dx*Math.min(dist,speed*dt)+e.knock.x*dt;e.root.position.z+=dz*Math.min(dist,speed*dt)+e.knock.z*dt;const desired=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(desired-e.root.rotation.y),Math.cos(desired-e.root.rotation.y));e.root.rotation.y+=delta*Math.min(1,dt*6.2);}e.knock.multiplyScalar(Math.pow(.03,dt));const bob=e.kind==='ghost'?.11*Math.sin(t*2.2+e.bobSeed):.04*Math.abs(Math.sin(t*3.4+e.bobSeed));e.root.position.y=e.y+bob;const pulse=1+e.hitT*.19;e.root.scale.setScalar(pulse);e.root.rotation.z=e.hitT*.12*Math.sin(t*35+e.bobSeed);
    }

    function tick(now){const dt=Math.min(.034,Math.max(.001,(now-last)/1000));last=now;const t=now/1000;fireCooldown=Math.max(0,fireCooldown-dt);if(bro.action&&bro.controllerEmitter&&fireCooldown<=0){spawnButton();fireCooldown=.135;}for(const e of enemies)moveEnemy(e,dt,t);updateShots(dt);updateParticles(dt);rune.opacity=.50+.14*(.5+.5*Math.sin(t*2.1));requestAnimationFrame(tick);}
    requestAnimationFrame(tick);

    window.__hybridEnemies=enemies;window.__hybridPhase='2D';
    console.info('[Hybrid v0.9 Phase 2D] smooth hero + controller-button barrage ready');
  }catch(err){console.error('[Hybrid v0.9 Phase 2D] failed',err);}
})();
