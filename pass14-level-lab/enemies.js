import * as THREE from 'three';

export function createEnemySystem({assets,parent,groundAt,getPlayerPosition,damagePlayer,onEnemyKilled=()=>{},toast=()=>{}}){
  const enemies=[];let nextId=1;
  const tmp=new THREE.Vector3();

  function findClip(clips,kind){
    const rules={idle:/idle|stand/i,walk:/walk|run|move/i,attack:/attack|slash|strike|swing/i,hit:/hit|hurt|damage|impact/i,death:/death|die|dead|defeat/i};
    return clips.find(c=>rules[kind]?.test(c.name))||null;
  }
  function buildActions(e,clips){
    if(!clips.length)return;
    e.mixer=new THREE.AnimationMixer(e.root);
    for(const kind of ['idle','walk','attack','hit','death']){
      const clip=findClip(clips,kind);if(!clip)continue;
      const a=e.mixer.clipAction(clip);a.enabled=true;
      if(kind==='death'){a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;}
      e.actions[kind]=a;
    }
    if(!e.actions.idle){const first=e.mixer.clipAction(clips[0]);e.actions.idle=first;}
    play(e,'idle',0);
  }
  function play(e,kind,fade=.15){
    const next=e.actions[kind]||e.actions.idle;if(!next||e.currentAction===next)return;
    if(e.currentAction&&fade>0)e.currentAction.fadeOut(fade);
    next.reset().fadeIn(fade).play();e.currentAction=next;
  }
  function telegraphMesh(){
    const g=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.8,.055,8,40),new THREE.MeshBasicMaterial({color:0xff516f,transparent:true,opacity:.75,depthWrite:false}));
    ring.rotation.x=Math.PI/2;ring.position.y=.045;g.add(ring);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(.12,.42,10),new THREE.MeshBasicMaterial({color:0xffd2d9,transparent:true,opacity:.88,depthWrite:false}));
    cone.position.y=2.45;cone.rotation.z=Math.PI;g.add(cone);
    g.visible=false;return g;
  }
  async function spawnOne(spec,index){
    const made=await assets.instantiateAnimated(spec.kind,{x:spec.x,y:spec.y,z:spec.z,height:2.25,rotationY:Math.PI,parent});
    const e={id:nextId++,root:made.root,home:new THREE.Vector3(spec.x,spec.y,spec.z),hp:2,alive:true,state:'patrol',timer:.7+index*.18,alertRadius:8.5,attackRange:2.15,walkSpeed:2.25,lungeSpeed:6.4,hitSerial:-1,mixer:null,actions:{},currentAction:null,telegraph:telegraphMesh(),knock:new THREE.Vector3(),didContact:false,deathTimer:0,patrolPhase:index*1.7};
    e.root.add(e.telegraph);buildActions(e,made.animations);
    e.clipNames=made.animations.map(c=>c.name);enemies.push(e);return e;
  }
  async function spawnAll(spawns){
    await Promise.all(spawns.map(spawnOne));
    window.__pass14EnemyClips=enemies.map(e=>({id:e.id,clips:e.clipNames}));
    window.__pass14EnemyModelsReady=enemies.length;
    return enemies;
  }
  function setState(e,state,time=0){
    e.state=state;e.timer=time;e.didContact=false;e.telegraph.visible=state==='windup';
    if(state==='patrol')play(e,'idle');
    if(state==='alert')play(e,'walk');
    if(state==='windup'||state==='lunge')play(e,'attack');
    if(state==='recover')play(e,'idle');
    if(state==='hit')play(e,'hit');
    if(state==='dead')play(e,'death',.08);
  }
  function faceToward(e,x,z,dt,rate=10){
    const want=Math.atan2(x-e.root.position.x,z-e.root.position.z);const d=Math.atan2(Math.sin(want-e.root.rotation.y),Math.cos(want-e.root.rotation.y));e.root.rotation.y+=d*(1-Math.exp(-rate*dt));
  }
  function updateEnemy(e,dt,t){
    e.mixer?.update(dt);if(!e.alive){e.deathTimer+=dt;e.root.position.y-=dt*.32;if(e.deathTimer>1.25)e.root.visible=false;return;}
    e.root.position.addScaledVector(e.knock,dt);e.knock.multiplyScalar(Math.exp(-8*dt));
    const p=getPlayerPosition(tmp),dx=p.x-e.root.position.x,dz=p.z-e.root.position.z,d=Math.hypot(dx,dz);
    const gy=groundAt(e.root.position.x,e.root.position.z);if(gy!==null)e.root.position.y=THREE.MathUtils.damp(e.root.position.y,gy,16,dt);
    e.timer-=dt;
    if(e.state==='patrol'){
      const tx=e.home.x+Math.sin(t*.65+e.patrolPhase)*1.4,tz=e.home.z+Math.cos(t*.55+e.patrolPhase)*1.15;faceToward(e,tx,tz,dt,3);
      if(d<e.alertRadius){setState(e,'alert');toast('ENEMY ALERT',420);}
    }else if(e.state==='alert'){
      faceToward(e,p.x,p.z,dt,11);
      if(d>e.alertRadius*1.45)setState(e,'patrol',.5);
      else if(d<e.attackRange)setState(e,'windup',.48);
      else if(d>.001){const s=e.walkSpeed*dt;e.root.position.x+=dx/d*s;e.root.position.z+=dz/d*s;}
    }else if(e.state==='windup'){
      faceToward(e,p.x,p.z,dt,15);const pulse=.9+.12*Math.sin((.48-Math.max(0,e.timer))*35);e.telegraph.scale.setScalar(pulse);
      if(e.timer<=0)setState(e,'lunge',.28);
    }else if(e.state==='lunge'){
      faceToward(e,p.x,p.z,dt,18);const f=new THREE.Vector3(Math.sin(e.root.rotation.y),0,Math.cos(e.root.rotation.y));e.root.position.addScaledVector(f,e.lungeSpeed*dt);
      if(!e.didContact&&d<1.22){e.didContact=true;damagePlayer();}
      if(e.timer<=0)setState(e,'recover',.62);
    }else if(e.state==='recover'){
      if(e.timer<=0)setState(e,d<e.alertRadius?'alert':'patrol',.35);
    }else if(e.state==='hit'){
      if(e.timer<=0)setState(e,d<e.alertRadius*1.3?'alert':'patrol',.25);
    }
    e.telegraph.rotation.z+=dt*2.4;
  }
  function update(dt,t){for(const e of enemies)updateEnemy(e,dt,t)}
  function damage(e,serial,{force=5,source=null}={}){
    if(!e||!e.alive||e.hitSerial===serial)return false;e.hitSerial=serial;e.hp--;
    if(source){const dx=e.root.position.x-source.x,dz=e.root.position.z-source.z,l=Math.hypot(dx,dz)||1;e.knock.set(dx/l*force,1.2,dz/l*force);}
    if(e.hp<=0){e.alive=false;setState(e,'dead');e.deathTimer=0;onEnemyKilled(e);}
    else{setState(e,'hit',.32);toast('DIRECT HIT · ONE MORE',520);}
    return true;
  }
  function living(){return enemies.filter(e=>e.alive)}
  return {enemies,spawnAll,update,damage,living};
}
