import * as THREE from 'three';

export function createPrismBreaker({scene,bro,getHeroState,getEnemies,damageEnemy,toast=()=>{},mobile=false}){
  const projectiles=[];const debris=[];const impactRings=[];let charging=false,charge=0,cooldown=0,serial=0,chargeFx=null,cameraKick=0,hitStop=0,recoil=0,audio=null,fullChargePulse=false;
  const emitterPos=new THREE.Vector3();

  function ensureAudio(){
    try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch{}
  }
  function tone(freq=440,dur=.08,type='sine',gain=.035,slide=0){
    try{ensureAudio();if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),audio.currentTime+dur);g.gain.setValueAtTime(gain,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+dur);}catch{}
  }
  function makeChargeFx(){
    const g=new THREE.Group();g.name='prism-breaker-charge';
    const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,1),new THREE.MeshBasicMaterial({color:0x8ff7ff,transparent:true,opacity:.95,depthWrite:false}));g.add(core);
    for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.26+i*.07,.018,6,36),new THREE.MeshBasicMaterial({color:i===1?0xff62bd:0x7cecff,transparent:true,opacity:.72,depthWrite:false}));r.rotation.set(Math.PI/2,i*.8,i*.4);g.add(r);}
    if(!mobile){const l=new THREE.PointLight(0x74eaff,1.1,5,2);g.add(l);}
    scene.add(g);return g;
  }
  function start(){if(charging||cooldown>0)return false;charging=true;charge=.02;fullChargePulse=false;bro.setAction(true);chargeFx=chargeFx||makeChargeFx();chargeFx.visible=true;toast('PRISM BREAKER · CHARGING',430);tone(220,.08,'triangle',.018,80);return true}
  function cancel(){charging=false;charge=0;bro.setAction(false);if(chargeFx)chargeFx.visible=false}
  function spawnProjectile(power){
    const state=getHeroState();bro.controllerEmitter.getWorldPosition(emitterPos);
    const dir=new THREE.Vector3(Math.sin(state.yaw),.025,Math.cos(state.yaw)).normalize();
    const g=new THREE.Group();g.position.copy(emitterPos);g.rotation.y=state.yaw;
    const core=new THREE.Mesh(new THREE.CapsuleGeometry(.16+.09*power,.52+.55*power,6,12),new THREE.MeshBasicMaterial({color:0x8ff8ff,transparent:true,opacity:.95,depthWrite:false}));core.rotation.x=Math.PI/2;g.add(core);
    const shell=new THREE.Mesh(new THREE.TorusGeometry(.31+.14*power,.035,7,40),new THREE.MeshBasicMaterial({color:0xff65c1,transparent:true,opacity:.78,depthWrite:false}));shell.rotation.x=Math.PI/2;g.add(shell);
    const shell2=shell.clone();shell2.material=shell.material.clone();shell2.material.color.set(0x70eaff);shell2.rotation.y=Math.PI/2;g.add(shell2);
    if(!mobile)g.add(new THREE.PointLight(0x75e9ff,1.5+power*1.1,6,2));scene.add(g);
    projectiles.push({root:g,dir,speed:27+power*14,life:1.45,radius:.7+power*.28,pierce:power>.72?3:1,hits:0,serial:++serial,power,trail:0});
    recoil=.24+.1*power;cameraKick=.45+.35*power;tone(420+power*180,.12,'sawtooth',.032,-150);setTimeout(()=>tone(780+power*220,.08,'triangle',.02,-220),24);
  }
  function release(){if(!charging)return false;const p=THREE.MathUtils.clamp(charge/1.05,.16,1);charging=false;bro.setAction(true);if(chargeFx)chargeFx.visible=false;spawnProjectile(p);cameraKick=Math.max(cameraKick,.58+.46*p);toast(p>.86?'PRISM BREAKER · MAX CHARGE':'PRISM BREAKER · RELEASE',p>.86?620:420);charge=0;cooldown=.34+.18*p;setTimeout(()=>{if(!charging)bro.setAction(false)},190);return true}
  function burst(pos,power=.5){
    for(let i=0;i<10+Math.floor(power*8);i++){
      const m=new THREE.Mesh(new THREE.TetrahedronGeometry(.055+Math.random()*.06),new THREE.MeshBasicMaterial({color:i%3===0?0xff69c8:(i%3===1?0x75ecff:0xffffff),transparent:true,opacity:.9,depthWrite:false}));m.position.copy(pos);scene.add(m);debris.push({mesh:m,vel:new THREE.Vector3((Math.random()-.5)*5,1.2+Math.random()*3,(Math.random()-.5)*5),life:.42+Math.random()*.28});
    }
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.22,.045,8,34),new THREE.MeshBasicMaterial({color:power>.72?0xffffff:0x7cecff,transparent:true,opacity:.92,depthWrite:false,blending:THREE.AdditiveBlending}));ring.position.copy(pos);ring.rotation.x=Math.PI/2;scene.add(ring);impactRings.push({mesh:ring,life:.30,power});
  }
  function updateProjectile(p,dt){
    p.life-=dt;p.root.position.addScaledVector(p.dir,p.speed*dt);p.root.rotation.z+=dt*(5+p.power*4);p.trail-=dt;
    if(p.trail<=0){p.trail=.035;const s=new THREE.Mesh(new THREE.OctahedronGeometry(.04+.05*p.power),new THREE.MeshBasicMaterial({color:Math.random()>.5?0x70eaff:0xff63bd,transparent:true,opacity:.65,depthWrite:false}));s.position.copy(p.root.position);scene.add(s);debris.push({mesh:s,vel:p.dir.clone().multiplyScalar(-1.5).add(new THREE.Vector3((Math.random()-.5)*.6,(Math.random()-.5)*.4,(Math.random()-.5)*.6)),life:.22});}
    for(const e of getEnemies()){
      if(!e.alive)continue;const d=p.root.position.distanceTo(e.root.position.clone().add(new THREE.Vector3(0,1.05,0)));if(d>p.radius+1)continue;
      if(damageEnemy(e,p.serial,{force:5+5*p.power,source:p.root.position})){p.hits++;burst(p.root.position,p.power);cameraKick=Math.max(cameraKick,.62+.3*p.power);hitStop=Math.max(hitStop,.035+.025*p.power);tone(125,.07,'square',.025,160);if(p.hits>=p.pierce){p.life=0;break;}}
    }
  }
  function update(dt,t){
    cooldown=Math.max(0,cooldown-dt);cameraKick=THREE.MathUtils.damp(cameraKick,0,13,dt);recoil=THREE.MathUtils.damp(recoil,0,16,dt);if(hitStop>0)hitStop=Math.max(0,hitStop-dt);
    if(charging){charge=Math.min(1.05,charge+dt);bro.setAction(true);bro.controllerEmitter.getWorldPosition(emitterPos);chargeFx.position.copy(emitterPos);const q=charge/1.05,s=.65+q*1.45+Math.sin(t*22)*.08;chargeFx.scale.setScalar(s);chargeFx.rotation.x=t*1.7;chargeFx.rotation.y=t*2.3;if(q>=.92&&!fullChargePulse){fullChargePulse=true;cameraKick=Math.max(cameraKick,.22);tone(880,.075,'triangle',.018,120);toast('MAX CHARGE',430)}if(charge>=1.02&&Math.random()>.92)tone(720,.025,'triangle',.008,30);}
    for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];updateProjectile(p,dt);if(p.life<=0){scene.remove(p.root);projectiles.splice(i,1);}}
    for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.life-=dt;d.vel.y-=6*dt;d.mesh.position.addScaledVector(d.vel,dt);d.mesh.rotation.x+=dt*5;d.mesh.rotation.y+=dt*7;if(d.mesh.material)d.mesh.material.opacity=Math.max(0,d.life*2.3);if(d.life<=0){scene.remove(d.mesh);debris.splice(i,1);}}for(let i=impactRings.length-1;i>=0;i--){const r=impactRings[i];r.life-=dt;const q=Math.max(0,r.life/.30);r.mesh.scale.setScalar(1+(1-q)*(3.2+r.power*1.5));r.mesh.material.opacity=q*.88;if(r.life<=0){scene.remove(r.mesh);r.mesh.geometry.dispose();r.mesh.material.dispose();impactRings.splice(i,1);}}
  }
  function consumeHitStop(){const h=hitStop;hitStop=0;return h}
  return {start,release,cancel,update,consumeHitStop,get charging(){return charging},get charge(){return charge/1.05},get cameraKick(){return cameraKick},get recoil(){return recoil},get cooldown(){return cooldown}};
}
