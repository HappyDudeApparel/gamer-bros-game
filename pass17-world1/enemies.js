import * as THREE from 'three';

const BODY=0x182433,BODY2=0x26384c,EYE=0xffd845,RED=0xe94e62,BLUE=0x49cfe8,SPIKE=0xdde8ef,FOOT=0x303b49;
function m(color,rough=.55,metal=.08,emissive=0,ei=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive,emissiveIntensity:ei})}
const mats={body:m(BODY,.48,.14),body2:m(BODY2,.5,.1),eye:m(EYE,.28,.05,EYE,.35),red:m(RED,.42,.12),blue:m(BLUE,.35,.18,BLUE,.08),spike:m(SPIKE,.45,.18),foot:m(FOOT,.7,.05)};

function shadowed(mesh){mesh.castShadow=true;mesh.receiveShadow=true;return mesh}
function conceptEnemy(role='patrol'){
 const root=new THREE.Group();root.name='concept-enemy-'+role;
 const body=shadowed(new THREE.Mesh(new THREE.SphereGeometry(.72,24,18),mats.body));body.scale.set(1,1.08,.92);body.position.y=.82;root.add(body);
 const browMat=m(BODY2,.46,.1);const eyeGeo=new THREE.SphereGeometry(.14,14,10);
 for(const x of [-.25,.25]){const e=shadowed(new THREE.Mesh(eyeGeo,mats.eye));e.scale.set(1,.72,.45);e.position.set(x,1.00,.64);root.add(e);const b=shadowed(new THREE.Mesh(new THREE.BoxGeometry(.28,.07,.08),browMat));b.position.set(x,1.17,.70);b.rotation.z=x<0?.18:-.18;root.add(b)}
 const footGeo=new THREE.SphereGeometry(.27,16,10);for(const x of [-.36,.36]){const f=shadowed(new THREE.Mesh(footGeo,mats.foot));f.scale.set(1.2,.55,1.45);f.position.set(x,.22,.12);root.add(f)}
 if(role==='patrol'||role==='guard'){
   const cap=shadowed(new THREE.Mesh(new THREE.SphereGeometry(.60,22,12,0,Math.PI*2,0,Math.PI*.48),role==='guard'?mats.blue:mats.red));cap.position.y=1.35;cap.scale.y=.55;root.add(cap);
   const brim=shadowed(new THREE.Mesh(new THREE.BoxGeometry(.78,.11,.38),role==='guard'?mats.blue:mats.red));brim.position.set(0,1.31,.34);root.add(brim);
 }
 if(role==='spike'){
   const cone=new THREE.ConeGeometry(.16,.52,8);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,s=shadowed(new THREE.Mesh(cone,mats.spike));s.position.set(Math.sin(a)*.66,1.02,Math.cos(a)*.60);s.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.sin(a),.22,Math.cos(a)).normalize());root.add(s)}
   const top=shadowed(new THREE.Mesh(cone,mats.spike));top.position.set(0,1.60,0);root.add(top);
 }
 if(role==='flyer'){
   body.position.y=1.08;for(const f of root.children.filter(o=>o!==body&&o.geometry===footGeo))f.visible=false;
   const hub=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.16,12),mats.body2));hub.position.y=1.82;root.add(hub);
   for(const r of [0,Math.PI/2]){const blade=shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.18,.06,.16),mats.blue));blade.position.y=1.94;blade.rotation.y=r;blade.userData.rotor=true;root.add(blade)}
 }
 root.userData.role=role;root.userData.body=body;return root;
}
function telegraphMesh(){const g=new THREE.Group(),ring=new THREE.Mesh(new THREE.TorusGeometry(.82,.055,8,40),new THREE.MeshBasicMaterial({color:0xff516f,transparent:true,opacity:.78,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.position.y=.045;g.add(ring);const cone=new THREE.Mesh(new THREE.ConeGeometry(.12,.42,10),new THREE.MeshBasicMaterial({color:0xffd2d9,transparent:true,opacity:.9,depthWrite:false}));cone.position.y=2.2;cone.rotation.z=Math.PI;g.add(cone);g.visible=false;return g}

export function createEnemySystem({parent,groundAt,getPlayerPosition,damagePlayer,onEnemyKilled=()=>{},toast=()=>{}}){
 const enemies=[];let nextId=1;const tmp=new THREE.Vector3();
 function roleFor(spec,index){if(spec.role)return spec.role;return ['patrol','spike','guard','patrol','flyer'][index%5]}
 async function spawnOne(spec,index){const role=roleFor(spec,index),root=conceptEnemy(role),gy=groundAt(spec.x,spec.z)??spec.y??0;root.position.set(spec.x,gy,spec.z);root.rotation.y=Math.PI;parent.add(root);const e={id:nextId++,root,home:new THREE.Vector3(spec.x,gy,spec.z),hp:2,alive:true,state:'patrol',timer:.7+index*.18,alertRadius:role==='flyer'?10:8.5,attackRange:2.15,walkSpeed:role==='spike'?1.8:2.25,lungeSpeed:role==='guard'?7:6.2,hitSerial:-1,telegraph:telegraphMesh(),knock:new THREE.Vector3(),didContact:false,deathTimer:0,patrolPhase:index*1.7,role,hover:role==='flyer',bob:index*.7};root.add(e.telegraph);enemies.push(e);return e}
 function publish(){window.__pass17EnemyModelsReady=enemies.length;window.__pass17EnemyFamily='concept-rounded-v1';document.documentElement.dataset.enemies=String(enemies.length);document.documentElement.dataset.enemyFamily='concept-rounded-v1'}
 async function spawnAll(spawns){if(!spawns.length)return enemies;await spawnOne(spawns[0],0);publish();Promise.all(spawns.slice(1).map((s,i)=>spawnOne(s,i+1))).then(()=>{publish();window.__pass17AllEnemiesReady=true}).catch(e=>{console.error('[Pass17 concept enemy]',e);document.documentElement.dataset.enemyStreamError='1'});return enemies}
 function setState(e,state,time=0){e.state=state;e.timer=time;e.didContact=false;e.telegraph.visible=state==='windup'}
 function faceToward(e,x,z,dt,rate=10){const want=Math.atan2(x-e.root.position.x,z-e.root.position.z),d=Math.atan2(Math.sin(want-e.root.rotation.y),Math.cos(want-e.root.rotation.y));e.root.rotation.y+=d*(1-Math.exp(-rate*dt))}
 function pose(e,dt,t){const body=e.root.userData.body;if(body){body.scale.y=1.08+(e.state==='windup'?.12:0)+Math.sin(t*4+e.bob)*.025;body.scale.x=1-(e.state==='windup'?.05:0)}for(const o of e.root.children)if(o.userData.rotor)o.rotation.y+=dt*10;if(e.state==='hit')e.root.rotation.z=Math.sin(e.timer*35)*.12;else e.root.rotation.z=THREE.MathUtils.damp(e.root.rotation.z,0,14,dt)}
 function updateEnemy(e,dt,t){pose(e,dt,t);if(!e.alive){e.deathTimer+=dt;e.root.scale.multiplyScalar(Math.exp(-2.8*dt));e.root.rotation.y+=dt*5;if(e.deathTimer>1.1)e.root.visible=false;return}e.root.position.addScaledVector(e.knock,dt);e.knock.multiplyScalar(Math.exp(-8*dt));const p=getPlayerPosition(tmp),dx=p.x-e.root.position.x,dz=p.z-e.root.position.z,d=Math.hypot(dx,dz),gy=groundAt(e.root.position.x,e.root.position.z);if(gy!==null){const targetY=gy+(e.hover?1.45+Math.sin(t*2.4+e.bob)*.18:0);e.root.position.y=THREE.MathUtils.damp(e.root.position.y,targetY,12,dt)}e.timer-=dt;if(e.state==='patrol'){const tx=e.home.x+Math.sin(t*.65+e.patrolPhase)*1.45,tz=e.home.z+Math.cos(t*.55+e.patrolPhase)*1.15;faceToward(e,tx,tz,dt,3);if(d<e.alertRadius){setState(e,'alert');toast('ENEMY ALERT',420)}}else if(e.state==='alert'){faceToward(e,p.x,p.z,dt,11);if(d>e.alertRadius*1.45)setState(e,'patrol',.5);else if(d<e.attackRange)setState(e,'windup',.48);else if(d>.001){const s=e.walkSpeed*dt;e.root.position.x+=dx/d*s;e.root.position.z+=dz/d*s}}else if(e.state==='windup'){faceToward(e,p.x,p.z,dt,15);const pulse=.9+.12*Math.sin((.48-Math.max(0,e.timer))*35);e.telegraph.scale.setScalar(pulse);if(e.timer<=0)setState(e,'lunge',.28)}else if(e.state==='lunge'){faceToward(e,p.x,p.z,dt,18);const f=new THREE.Vector3(Math.sin(e.root.rotation.y),0,Math.cos(e.root.rotation.y));e.root.position.addScaledVector(f,e.lungeSpeed*dt);if(!e.didContact&&d<1.25){e.didContact=true;damagePlayer()}if(e.timer<=0)setState(e,'recover',.62)}else if(e.state==='recover'){if(e.timer<=0)setState(e,d<e.alertRadius?'alert':'patrol',.35)}else if(e.state==='hit'){if(e.timer<=0)setState(e,d<e.alertRadius*1.3?'alert':'patrol',.25)}e.telegraph.rotation.z+=dt*2.4}
 function update(dt,t){for(const e of enemies)updateEnemy(e,dt,t)}
 function damage(e,serial,{force=5,source=null}={}){if(!e||!e.alive||e.hitSerial===serial)return false;e.hitSerial=serial;e.hp--;if(source){const dx=e.root.position.x-source.x,dz=e.root.position.z-source.z,l=Math.hypot(dx,dz)||1;e.knock.set(dx/l*force,1.2,dz/l*force)}if(e.hp<=0){e.alive=false;setState(e,'dead');e.deathTimer=0;onEnemyKilled(e)}else{setState(e,'hit',.32);toast('DIRECT HIT · ONE MORE',520)}return true}
 function living(){return enemies.filter(e=>e.alive)}
 return{enemies,spawnAll,update,damage,living};
}
