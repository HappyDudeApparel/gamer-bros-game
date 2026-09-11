from pathlib import Path
import shutil

src=Path('pass10-v1')
dst=Path('pass11-v1')
if dst.exists(): shutil.rmtree(dst)
shutil.copytree(src,dst)

# ---------- HTML / HUD ----------
p=dst/'index.html'
s=p.read_text()
s=s.replace('Gamer Bros — World 1 Asset Pass','Gamer Bros — World 1 Gameplay Pass')
s=s.replace('PASS 10 · OPTION B ASSET WORLD','PASS 11 · GAMEPLAY WORLD')
s=s.replace('Building World 1 with imported asset kits','Building World 1 gameplay environment')
s=s.replace('Loading Kenney + KayKit world assets…','Loading world, enemies, collectibles and powers…')
s=s.replace('./app.js?v=10','./app.js?v=11')
# HUD stats
s=s.replace('<div class="objective glass" id="objective">MEADOW → VILLAGE → BRIDGE → HILLSIDE → RUINS → PORTAL</div>',
'''<div class="objective glass" id="objective">A MEADOW → B VILLAGE → C BRIDGE → D HILLSIDE → E RUINS → F PORTAL</div><div class="stats glass"><span id="health">♥♥♥♥♥</span><span>COINS <b id="coins">0</b></span><span>GEMS <b id="gems">0</b></span></div>''')
s=s.replace('<button class="action" id="action">POWER / ACTION</button>',
'''<button class="action" id="action">POWER / ACTION</button><button class="fx" id="fx">FX: PRISM BOLT</button>''')
s=s.replace('.actions button.active{transform:scale(.96);border-color:#fff}',
'''.actions button.active{transform:scale(.96);border-color:#fff}.fx{grid-column:1/-1;height:38px;border-radius:14px;background:linear-gradient(#184f58e8,#11223bef)!important;border-color:#7feeff88!important}.stats{position:absolute;left:50%;top:max(50px,calc(env(safe-area-inset-top) + 38px));transform:translateX(-50%);display:flex;gap:13px;align-items:center;padding:7px 11px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}.stats #health{font-size:13px;letter-spacing:2px;color:#ff6f8d;text-shadow:0 0 8px #ff4e7f88}.stats b{color:#fff2a8}@media(max-width:700px){.stats{top:max(88px,calc(env(safe-area-inset-top) + 78px));font-size:8px;gap:9px}}''')
p.write_text(s)

# ---------- JS ----------
p=dst/'app.js'
s=p.read_text()
s=s.replace("?v=pass10","?v=pass11",1)
s=s.replace("window.__worldSource='pass10-continuous-terrain-plus-kit-assets'","window.__worldSource='pass11-gameplay-environment'")
s=s.replace("w=38,zMax=40,zMin=-151","w=72,zMax=40,zMin=-151")
s=s.replace("(moveKeys.run?6.35:3.75)","(moveKeys.run?15.875:9.375)")
s=s.replace("player.speed<3.7?'walk':'run'","player.speed<9.0?'walk':'run'")

# Larger village buildings (about 2.5x Pass 10)
old_v="[['building-small-a.glb',-9,-5,6,.10],['building-small-b.glb',9,-7,6.2,-.12],['building-small-c.glb',-10,-15,6.3,.06],['building-small-d.glb',10,-17,6,-.08],['building-small-b.glb',-8,-24,5.5,.08],['building-small-a.glb',8,-25,5.6,-.05]]"
new_v="[['building-small-a.glb',-13,-4,15,.10],['building-small-b.glb',13,-8,15.5,-.12],['building-small-c.glb',-14,-17,15.75,.06],['building-small-d.glb',14,-19,15,-.08],['building-small-b.glb',-13,-28,13.75,.08],['building-small-a.glb',13,-30,14,-.05]]"
if old_v not in s: raise SystemExit('village array marker missing')
s=s.replace(old_v,new_v,1)

# Add extra environment/side-loop dressing before Promise.all in decorateWorld.
marker="  await Promise.all(jobs);window.__pass10Assets=true;"
extra=r'''
 // PASS 11 optional side loops: safe continuous terrain remains underneath.
 const loopMat=new THREE.MeshStandardMaterial({color:0xb79a6c,roughness:.98});
 for(const [x,z,w,d,r] of [
   [-18,2,22,3,.35],[-24,-7,3,19,0],[-18,-17,22,3,-.35],
   [18,-46,22,3,-.28],[25,-54,3,18,0],[18,-62,22,3,.28],
   [-18,-76,22,3,.30],[-25,-84,3,18,0],[-18,-92,22,3,-.30],
   [18,-111,22,3,-.28],[25,-120,3,18,0],[18,-129,22,3,.28]
 ]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,.055,d),loopMat);m.position.set(x,elev(z)+.04,z);m.rotation.y=r;m.receiveShadow=true;m.name='optional-loop-path';world.add(m)}
 // More authored environment assets framing loops and landmarks.
 for(const [x,z,h,r] of [[-28,6,5.5,.2],[-28,-13,6,.8],[-22,-31,5.2,.4],[27,-48,5.8,.2],[27,-61,5.5,.7],[-28,-79,6,.1],[-27,-94,5.4,.8],[28,-113,5.5,.2],[27,-129,6,.6]])jobs.push(placeAsset(cityBase+'grass-trees-tall.glb',{x,z,height:h,ry:r,name:'pass11-tree-landmark'}));
 for(const [x,z,r] of [[-20,5,0],[-25,-8,.7],[-19,-19,.3],[20,-48,.2],[25,-55,.8],[-20,-78,.4],[-25,-86,.2],[20,-113,.5],[25,-123,.1]])jobs.push(placeAsset(kenneyPlat+'barrel.glb',{x,z,height:1.3,ry:r,name:'loop-barrel'}));
 for(const [x,z,r] of [[-20,-4,.2],[20,-52,-.2],[-20,-83,.2],[20,-118,-.2]])jobs.push(placeAsset(kayBase+'signage_arrow_stand_neutral.gltf',{x,z,height:2.3,ry:r,name:'loop-route-sign'}));
 for(const [x,z,r] of [[-27,-8,0],[27,-55,.4],[-27,-85,.2],[27,-120,-.2]])jobs.push(placeAsset(kayBase+'flag_A_neutral.gltf',{x,z,height:3.2,ry:r,name:'loop-flag'}));
'''
if marker not in s: raise SystemExit('decorate marker missing')
s=s.replace(marker,extra+marker,1)
s=s.replace("window.__pass10Assets=true;window.__pass10AssetCount=assetRoot.children.length;","window.__pass10Assets=true;window.__pass10AssetCount=assetRoot.children.length;window.__optionalLoops=4;",1)

# Replace old single ring action system with Pass 11 combat/power system.
old_action="""let actionCooldown=0,actionRing=null,actionPoseTimer=0;function useAction(){if(!bro||!tube||tube.state!=='idle'||actionCooldown>0)return;actionCooldown=.55;actionPoseTimer=.32;bro.setAction(true);actionBtn.classList.add('active');setTimeout(()=>actionBtn.classList.remove('active'),120);if(actionRing){scene.remove(actionRing);actionRing.geometry.dispose();actionRing.material.dispose()}actionRing=new THREE.Mesh(new THREE.RingGeometry(.5,1.05,48),new THREE.MeshBasicMaterial({color:0xa768ff,transparent:true,opacity:.78,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));actionRing.rotation.x=-Math.PI/2;actionRing.position.set(player.x,player.y+.08,player.z);scene.add(actionRing);actionRing.userData.age=0;window.__actionCount=(window.__actionCount||0)+1;toast('POWER / ACTION')}
function updateAction(dt){actionCooldown=Math.max(0,actionCooldown-dt);actionPoseTimer=Math.max(0,actionPoseTimer-dt);if(bro&&actionPoseTimer<=0&&bro.action)bro.setAction(false);if(!actionRing)return;actionRing.userData.age+=dt;const p=Math.min(1,actionRing.userData.age/.52);actionRing.scale.setScalar(1+p*4);actionRing.material.opacity=.78*(1-p);if(p>=1){scene.remove(actionRing);actionRing.geometry.dispose();actionRing.material.dispose();actionRing=null}}"""
new_action=r'''const healthEl=document.querySelector('#health'),coinsEl=document.querySelector('#coins'),gemsEl=document.querySelector('#gems'),fxBtn=document.querySelector('#fx');
let hearts=5,coins=0,gems=0,damageCooldown=0,actionCooldown=0,actionPoseTimer=0,powerStyle=0;
const POWER_STYLES=['PRISM BOLT','NOVA PULSE','COMET BURST'];
const enemies=[],shots=[],pulses=[],collectibles=[],debris=[];
const enemyMat=new THREE.MeshStandardMaterial({color:0x4b315f,roughness:.5,metalness:.15,emissive:0x19091f,emissiveIntensity:.4});
function updateHUD(){healthEl.textContent='♥'.repeat(hearts)+'♡'.repeat(5-hearts);coinsEl.textContent=coins;gemsEl.textContent=gems;fxBtn.textContent='FX: '+POWER_STYLES[powerStyle]}
function cyclePower(){powerStyle=(powerStyle+1)%POWER_STYLES.length;updateHUD();toast(POWER_STYLES[powerStyle],900)}
fxBtn.addEventListener('pointerdown',e=>{e.preventDefault();cyclePower()});
function enemyBody(x,z,radius=9){const g=new THREE.Group();g.position.set(x,elev(z),z);const body=new THREE.Mesh(new THREE.SphereGeometry(.72,18,14),enemyMat.clone());body.scale.y=.82;body.position.y=.72;body.castShadow=!mobile;g.add(body);for(const sx of [-.24,.24]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:0xffe8ff}));eye.position.set(sx,.84,.61);g.add(eye)}const hornMat=new THREE.MeshStandardMaterial({color:0x8c5fad,roughness:.6});for(const sx of [-.38,.38]){const horn=new THREE.Mesh(new THREE.ConeGeometry(.12,.45,8),hornMat);horn.position.set(sx,1.38,0);horn.rotation.z=sx<0?.35:-.35;g.add(horn)}world.add(g);const e={root:g,body,hp:2,home:new THREE.Vector3(x,elev(z),z),radius,alive:true,speed:2.35,flash:0};enemies.push(e);return e}
function spawnEnemies(){for(const [x,z,r] of [[7,8,8],[-18,-8,7],[8,-32,8],[20,-53,8],[-8,-70,9],[-22,-84,8],[7,-103,9],[22,-119,8],[0,-130,9]])enemyBody(x,z,r);window.__enemyCount=enemies.length;window.__enemyAggroRadius='7-9m'}
function coinMesh(x,z){const m=new THREE.Mesh(new THREE.TorusGeometry(.28,.09,8,18),new THREE.MeshStandardMaterial({color:0xffd84a,metalness:.7,roughness:.25,emissive:0x8c5500,emissiveIntensity:.35}));m.rotation.y=Math.PI/2;m.position.set(x,elev(z)+.8,z);world.add(m);collectibles.push({mesh:m,type:'coin',taken:false});}
function gemMesh(x,z){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.38),new THREE.MeshStandardMaterial({color:0x62e6ff,metalness:.25,roughness:.2,emissive:0x0d6680,emissiveIntensity:.7}));m.position.set(x,elev(z)+.85,z);world.add(m);collectibles.push({mesh:m,type:'gem',taken:false});}
function spawnCollectibles(){for(const [x,z] of [[0,24],[2,15],[-5,3],[-18,1],[-25,-8],[-18,-17],[3,-25],[0,-35],[18,-47],[25,-54],[18,-62],[-3,-69],[-18,-76],[-25,-84],[-18,-92],[3,-101],[18,-111],[25,-120],[18,-129],[0,-136]])coinMesh(x,z);for(const [x,z] of [[-24,-4],[24,-56],[-24,-86],[24,-122],[-7,-113],[7,-124]])gemMesh(x,z);window.__coinTotal=20;window.__gemTotal=6}
function destroyEnemy(e){if(!e.alive)return;e.alive=false;for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.TetrahedronGeometry(.10+Math.random()*.10),new THREE.MeshBasicMaterial({color:i%2?0xb869ff:0x6fe8ff,transparent:true,opacity:1}));m.position.copy(e.root.position).add(new THREE.Vector3((Math.random()-.5)*1.2,.7+Math.random(),(Math.random()-.5)*1.2));scene.add(m);debris.push({m,v:new THREE.Vector3((Math.random()-.5)*5,2+Math.random()*4,(Math.random()-.5)*5),age:0})}world.remove(e.root);toast('ENEMY DESTROYED',700)}
function hitEnemy(e){if(!e.alive)return;e.hp--;e.flash=.14;e.body.material.emissive.setHex(0x9b24ff);e.body.material.emissiveIntensity=2.2;if(e.hp<=0)destroyEnemy(e);else toast('HIT · ONE MORE',550)}
function damagePlayer(){if(damageCooldown>0||tube?.state!=='idle')return;damageCooldown=1.0;hearts=Math.max(0,hearts-1);updateHUD();toast(hearts?'OUCH!':'KNOCKED OUT',700);if(hearts<=0){setTimeout(()=>{hearts=5;updateHUD();resetPlayer();toast('RESPAWNED AT MEADOW',1200)},450)}}
function makeShot(angle,color=0x77efff,speed=24){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.24,1),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95}));m.position.set(player.x,player.y+1.25,player.z);scene.add(m);shots.push({m,dx:Math.sin(angle),dz:Math.cos(angle),speed,age:0,hit:new Set()})}
function makePulse(){const m=new THREE.Mesh(new THREE.RingGeometry(.55,.82,64),new THREE.MeshBasicMaterial({color:0xd077ff,transparent:true,opacity:.92,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));m.rotation.x=-Math.PI/2;m.position.set(player.x,player.y+.12,player.z);scene.add(m);pulses.push({m,age:0,hit:new Set()})}
function useAction(){if(!bro||!tube||tube.state!=='idle'||actionCooldown>0)return;actionCooldown=.30;actionPoseTimer=.42;bro.setAction(true);actionBtn.classList.add('active');setTimeout(()=>actionBtn.classList.remove('active'),130);const a=player.yaw;if(powerStyle===0){makeShot(a,0x70f2ff,28);makePulse()}else if(powerStyle===1){makePulse();makePulse()}else{makeShot(a,0xff78dd,27);makeShot(a-.18,0x7eeaff,25);makeShot(a+.18,0xffd05a,25);makePulse()}window.__actionCount=(window.__actionCount||0)+1;}
function updateAction(dt){actionCooldown=Math.max(0,actionCooldown-dt);actionPoseTimer=Math.max(0,actionPoseTimer-dt);if(bro&&actionPoseTimer<=0&&bro.action)bro.setAction(false);for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.age+=dt;s.m.position.x+=s.dx*s.speed*dt;s.m.position.z+=s.dz*s.speed*dt;s.m.rotation.x+=dt*9;s.m.rotation.y+=dt*12;for(const e of enemies){if(!e.alive||s.hit.has(e))continue;if(s.m.position.distanceTo(e.root.position.clone().add(new THREE.Vector3(0,.7,0)))<1.0){s.hit.add(e);hitEnemy(e);s.age=9;break}}if(s.age>.8){scene.remove(s.m);shots.splice(i,1)}}for(let i=pulses.length-1;i>=0;i--){const p=pulses[i];p.age+=dt;const radius=.8+p.age*8;p.m.scale.setScalar(radius);p.m.material.opacity=.92*Math.max(0,1-p.age/.5);for(const e of enemies){if(!e.alive||p.hit.has(e))continue;const d=Math.hypot(e.root.position.x-player.x,e.root.position.z-player.z);if(d<radius&&d>Math.max(0,radius-1.4)){p.hit.add(e);hitEnemy(e)}}if(p.age>.5){scene.remove(p.m);pulses.splice(i,1)}}for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.age+=dt;d.v.y-=8*dt;d.m.position.addScaledVector(d.v,dt);d.m.rotation.x+=dt*8;d.m.rotation.y+=dt*10;d.m.material.opacity=Math.max(0,1-d.age/.7);if(d.age>.7){scene.remove(d.m);debris.splice(i,1)}}}
function updateGameplay(dt,elapsed){damageCooldown=Math.max(0,damageCooldown-dt);for(const e of enemies){if(!e.alive)continue;e.flash=Math.max(0,e.flash-dt);if(e.flash<=0){e.body.material.emissive.setHex(0x19091f);e.body.material.emissiveIntensity=.4}const dx=player.x-e.root.position.x,dz=player.z-e.root.position.z,d=Math.hypot(dx,dz);const homeD=e.root.position.distanceTo(e.home);if(d<e.radius){const inv=1/Math.max(.001,d);e.root.position.x+=dx*inv*e.speed*dt;e.root.position.z+=dz*inv*e.speed*dt;e.root.rotation.y=Math.atan2(dx,dz)}else if(homeD>1){const hx=e.home.x-e.root.position.x,hz=e.home.z-e.root.position.z,hd=Math.hypot(hx,hz);e.root.position.x+=hx/hd*e.speed*.55*dt;e.root.position.z+=hz/hd*e.speed*.55*dt}e.root.position.y=elev(e.root.position.z);if(d<1.25)damagePlayer()}for(const c of collectibles){if(c.taken)continue;c.mesh.rotation.y+=dt*2.7;c.mesh.position.y=elev(c.mesh.position.z)+.82+Math.sin(elapsed*3+c.mesh.position.x)*.12;if(Math.hypot(player.x-c.mesh.position.x,player.z-c.mesh.position.z)<.9){c.taken=true;world.remove(c.mesh);if(c.type==='coin')coins++;else gems++;updateHUD();toast(c.type==='coin'?'+1 COIN':'+1 GEM',450)}}}
updateHUD();'''
if old_action not in s: raise SystemExit('action block marker missing')
s=s.replace(old_action,new_action,1)

# Keyboard toggle for power styles.
s=s.replace("if(['KeyE','KeyX','KeyJ','KeyK'].includes(e.code))useAction()","if(['KeyE','KeyX','KeyJ','KeyK'].includes(e.code))useAction();if(e.code==='KeyC')cyclePower()",1)

# Add gameplay update to frame.
s=s.replace("updatePlayer(dt);updateAction(dt);if(bro&&tube?.state==='idle')bro.update(elapsed,dt,0);","updatePlayer(dt);updateAction(dt);updateGameplay(dt,elapsed);if(bro&&tube?.state==='idle')bro.update(elapsed,dt,0);",1)

# Spawn enemies/collectibles after world decoration and before player creation.
s=s.replace("await decorateWorld();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);await createPlayer();","await decorateWorld();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);spawnEnemies();spawnCollectibles();await createPlayer();",1)
s=s.replace("progress('World 1 Option B asset test ready',100)","progress('World 1 Pass 11 gameplay test ready',100)",1)
s=s.replace("window.__pass='pass9-v1c'","window.__pass='pass11-v1'",1)
s=s.replace("objective.textContent='MEADOW → VILLAGE → BRIDGE → HILLSIDE → RUINS → PORTAL'","objective.textContent='A MEADOW → B VILLAGE → C BRIDGE → D HILLSIDE → E RUINS → F PORTAL'",1)
s=s.replace("objective.textContent='WORLD 1 ROUTE COMPLETE · PASS 10'","objective.textContent='WORLD 1 ROUTE COMPLETE · PASS 11'",1)
p.write_text(s)
print('Pass 11 generated')
