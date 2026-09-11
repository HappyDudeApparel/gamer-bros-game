from pathlib import Path
import shutil, re

src=Path('pass11-v1')
dst=Path('pass12-v1')
if dst.exists(): shutil.rmtree(dst)
shutil.copytree(src,dst)

# ---------- HTML ----------
p=dst/'index.html'
s=p.read_text()
s=s.replace('Gamer Bros — World 1 Gameplay Pass','Gamer Bros — World 1 Signature Pass')
s=s.replace('PASS 11 · GAMEPLAY WORLD','PASS 12 · SIGNATURE WORLD')
s=s.replace('Building World 1 gameplay environment','Building World 1 signature level')
s=s.replace('Loading world, enemies, collectibles and powers…','Authoring traversal, encounters and signature powers…')
s=s.replace('./app.js?v=11','./app.js?v=12')
s=s.replace('FX: PRISM BOLT','POWER: PRISM RAIL')
s=s.replace('class="fx" id="fx"','class="fx" id="fx" aria-label="Cycle power"')
p.write_text(s)

# ---------- JS BASE ----------
p=dst/'app.js'
s=p.read_text()
s=s.replace('?v=pass11','?v=pass12',1)
s=s.replace("window.__worldSource='pass11-gameplay-environment'","window.__worldSource='pass12-signature-authored-level'")
s=s.replace("window.__pass='pass11-v1'","window.__pass='pass12-v1'")
s=s.replace('WORLD 1 ROUTE COMPLETE · PASS 11','WORLD 1 SIGNATURE ROUTE COMPLETE · PASS 12')
s=s.replace("progress('World 1 Pass 11 gameplay test ready',100)","progress('World 1 Pass 12 signature level ready',100)")

# Reduce village from six buildings to three large landmark buildings.
old_v="[['building-small-a.glb',-13,-4,15,.10],['building-small-b.glb',13,-8,15.5,-.12],['building-small-c.glb',-14,-17,15.75,.06],['building-small-d.glb',14,-19,15,-.08],['building-small-b.glb',-13,-28,13.75,.08],['building-small-a.glb',13,-30,14,-.05]]"
new_v="[['building-small-a.glb',-17,-7,15.5,.10],['building-small-c.glb',15,-18,16,.02],['building-small-d.glb',-14,-29,15.25,-.08]]"
if old_v in s:
    s=s.replace(old_v,new_v,1)
else:
    raise SystemExit('Pass 11 village marker missing')

# ---------- SIGNATURE TRAVERSAL ----------
marker='const heightCache=new Map();'
traversal=r'''

// PASS 12 SIGNATURE TRAVERSAL ---------------------------------------------
// Continuous terrain remains a recovery floor. Every raised collider below
// is aligned to visible traversal architecture; there are no invisible walls.
const traversalRoot=new THREE.Group();traversalRoot.name='pass12-signature-traversal';world.add(traversalRoot);
const colliderMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.001,side:THREE.DoubleSide,depthWrite:false});
function walkPad(x,z,y,w,d,name='walk-pad'){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,.10,d),colliderMat);m.name=name;m.position.set(x,y-.05,z);traversalRoot.add(m);walkMeshes.push(m);return m;
}
function walkRamp(x0,z0,y0,x1,z1,y1,width=4,name='walk-ramp'){
 const dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz)||1,px=-dz/len*(width/2),pz=dx/len*(width/2);
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute([
   x0+px,y0,z0+pz, x0-px,y0,z0-pz, x1+px,y1,z1+pz, x1-px,y1,z1-pz
 ],3));
 g.setIndex([0,1,2,1,3,2]);g.computeVertexNormals();
 const m=new THREE.Mesh(g,colliderMat);m.name=name;traversalRoot.add(m);walkMeshes.push(m);return m;
}
function railAlong(x0,z0,x1,z1,y){
 const dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz),cx=(x0+x1)/2,cz=(z0+z1)/2,ry=Math.atan2(dx,dz);
 for(const side of [-1,1]){const off=side*2.3,ox=Math.cos(ry)*off,oz=-Math.sin(ry)*off;placeAsset(kayBase+'railing_straight_double_neutral.gltf',{x:cx+ox,z:cz+oz,y:y+.16,width:Math.max(2.6,len*.32),ry,name:'pass12-railing'})}
}
async function buildSignatureTraversal(){
 // Remove Pass 11's flat decorative loop ribbons; replace them with real traversal beats.
 for(const c of [...world.children])if(c.name==='optional-loop-path')world.remove(c);
 const jobs=[];
 const K=kenneyPlat,Q=kayBase;
 const add=(url,o)=>jobs.push(placeAsset(url,o));
 const platform=(x,z,y,w,d=5,file='platform.glb',name='signature-platform')=>{add(K+file,{x,z,y,width:w,name});walkPad(x,z,y+.20,w,d,name+'-collider')};
 const ramp=(x0,z0,y0,x1,z1,y1,w=5,file='platform-ramp.glb',name='signature-ramp')=>{const cx=(x0+x1)/2,cz=(z0+z1)/2,ry=Math.atan2(x1-x0,z1-z0),len=Math.hypot(x1-x0,z1-z0);add(K+file,{x:cx,z:cz,y:Math.min(y0,y1)-.08,width:Math.max(w,len*.78),ry,name});walkRamp(x0,z0,y0,x1,z1,y1,w,name+'-collider')};

 progress('Authoring Meadow Launch…',46);
 // A — Meadow Launch: first ramp, terrace and optional left lookout.
 let y=elev(18)+.18;platform(0,19,y,8,6,'block-grass-large.glb','meadow-launch');
 ramp(0,16,y+.2,-8,9,elev(9)+1.65,5.5,'block-grass-large-slope.glb','meadow-ramp');
 platform(-8,7,elev(7)+1.65,9,7,'block-grass-large.glb','meadow-terrace');
 ramp(-8,3,elev(3)+1.65,-18,-1,elev(-1)+2.2,4.4,'platform-ramp.glb','meadow-side-ramp');
 platform(-19,-2,elev(-2)+2.2,8,7,'platform-overhang.glb','meadow-lookout');
 add(K+'fence-rope.glb',{x:-20,z:-5,y:elev(-5)+2.25,width:6,ry:Math.PI/2,name:'meadow-rope-fence'});
 add(K+'chest.glb',{x:-20,z:-2,y:elev(-2)+2.35,height:1.15,ry:.2,name:'meadow-chest'});

 progress('Authoring Village Heights…',51);
 // B — Village Heights: three large landmarks with a raised route weaving between them.
 platform(2,-5,elev(-5)+1.15,9,7,'block-grass-long.glb','village-platform-a');
 ramp(2,-9,elev(-9)+1.15,10,-15,elev(-15)+2.05,5,'block-grass-large-slope.glb','village-ramp-a');
 platform(10,-18,elev(-18)+2.05,9,7,'block-grass-curve-half.glb','village-platform-b');
 ramp(8,-21,elev(-21)+2.05,-2,-26,elev(-26)+2.65,5,'platform-ramp.glb','village-ramp-b');
 platform(-3,-28,elev(-28)+2.65,10,8,'platform-fortified.glb','village-market-terrace');
 // optional rooftop/terrace loop
 ramp(-7,-28,elev(-28)+2.65,-18,-23,elev(-23)+3.55,4,'platform-ramp.glb','village-high-ramp');
 platform(-21,-22,elev(-22)+3.55,9,7,'platform-overhang.glb','village-high-loop');
 add(K+'chest.glb',{x:-22,z:-22,y:elev(-22)+3.72,height:1.2,ry:.35,name:'village-loop-chest'});
 add(K+'ladder-long.glb',{x:-17.5,z:-19.5,y:elev(-20)+.1,height:4.2,ry:.4,name:'village-ladder'});

 progress('Authoring Riverworks…',56);
 // C — Bridge main line plus lower riverworks side route.
 platform(0,-34,elev(-34)+.35,8,5,'platform-fortified.glb','bridge-gate-a');
 platform(0,-46,elev(-46)+.35,8,5,'platform-fortified.glb','bridge-gate-b');
 ramp(7,-35,elev(-35)+.2,16,-39,elev(-39)+.6,4.2,'platform-ramp.glb','riverbank-ramp-down');
 for(const [x,z,yy] of [[18,-40,.6],[23,-43,.72],[27,-47,.85],[23,-51,.78]])platform(x,z,elev(z)+yy,5.2,4.6,'platform-overhang.glb','river-step-platform');
 ramp(22,-53,elev(-53)+.78,10,-56,elev(-56)+.45,4.2,'platform-ramp.glb','riverbank-ramp-up');
 add(K+'pipe.glb',{x:27,z:-51,y:elev(-51)+.9,width:4.2,ry:Math.PI/2,name:'riverworks-pipe'});
 add(K+'crate-strong.glb',{x:20,z:-40,y:elev(-40)+.7,height:1.3,ry:.3,name:'river-crate'});
 add(K+'spring.glb',{x:25,z:-48,y:elev(-48)+1.0,width:2.2,name:'river-spring'});
 railAlong(18,-40,23,-43,elev(-42)+.8);railAlong(23,-43,27,-47,elev(-45)+.9);

 progress('Authoring Windridge…',62);
 // D — zig-zag ramp garden with a high alternate route.
 const ridge=[
   [-6,-61,elev(-61)+.6],[-15,-68,elev(-68)+1.35],[-6,-75,elev(-75)+1.95],[13,-82,elev(-82)+2.45],[4,-90,elev(-90)+2.85]
 ];
 for(let i=0;i<ridge.length;i++){const [x,z,yy]=ridge[i];platform(x,z,yy,8.5,6.5,i%2?'block-grass-large-tall.glb':'block-grass-large.glb','ridge-terrace');if(i){const [px,pz,py]=ridge[i-1];ramp(px,pz-2,py+.2,x,z+2,yy+.2,5.2,'block-grass-large-slope.glb','ridge-ramp')}}
 // High optional route using overhangs.
 ramp(-15,-68,elev(-68)+1.55,-27,-73,elev(-73)+3.4,4.3,'platform-ramp.glb','ridge-high-ramp');
 platform(-28,-76,elev(-76)+3.4,8,6,'platform-overhang.glb','ridge-high-a');
 platform(-25,-84,elev(-84)+3.8,7,6,'platform-overhang.glb','ridge-high-b');
 ramp(-25,-87,elev(-87)+3.8,-7,-92,elev(-92)+2.9,4.3,'platform-ramp.glb','ridge-return-ramp');
 add(K+'flag.glb',{x:-28,z:-76,y:elev(-76)+3.55,height:2.8,name:'ridge-flag'});

 progress('Authoring Ruin Circuit…',69);
 // E — multi-level circuit around a central encounter court.
 platform(0,-101,elev(-101)+.75,11,8,'platform-fortified.glb','ruin-entry');
 platform(-12,-108,elev(-108)+1.65,9,7,'platform-fortified.glb','ruin-left');
 platform(12,-110,elev(-110)+2.15,9,7,'platform-overhang.glb','ruin-right');
 platform(-9,-120,elev(-120)+2.85,8,7,'platform-overhang.glb','ruin-upper-left');
 platform(9,-123,elev(-123)+3.35,8,7,'platform-fortified.glb','ruin-upper-right');
 ramp(0,-104,elev(-104)+.95,-12,-106,elev(-106)+1.85,5,'platform-ramp.glb','ruin-ramp-l');
 ramp(-12,-111,elev(-111)+1.85,-9,-117,elev(-117)+3.05,4.5,'platform-ramp.glb','ruin-ramp-ul');
 ramp(-7,-122,elev(-122)+3.05,9,-121,elev(-121)+3.55,4.6,'platform-ramp.glb','ruin-cross-ramp');
 ramp(11,-119,elev(-119)+3.55,12,-112,elev(-112)+2.35,4.5,'platform-ramp.glb','ruin-ramp-r');
 ramp(10,-108,elev(-108)+2.35,2,-104,elev(-104)+.95,4.5,'platform-ramp.glb','ruin-return');
 for(const [x,z,r] of [[-12,-108,0],[12,-110,Math.PI],[-9,-120,.15],[9,-123,-.15]])add(Q+'arch_tall_neutral.gltf',{x,z,y:elev(z)+.2,height:5.5,ry:r,name:'ruin-signature-arch'});
 add(K+'chest.glb',{x:-9,z:-120,y:elev(-120)+3.05,height:1.2,ry:.3,name:'ruin-upper-chest'});
 add(K+'fence-rope.glb',{x:9,z:-126,y:elev(-126)+3.55,width:6,ry:Math.PI/2,name:'ruin-rope-edge'});

 progress('Authoring Portal Ascent…',75);
 // F — ceremonial two-stage ascent; portal sits on the final dais.
 const shrineBase=elev(-136);
 platform(0,-132,shrineBase+1.0,13,9,'platform-fortified.glb','shrine-terrace-a');
 ramp(0,-128,shrineBase+.25,0,-132,shrineBase+1.2,6,'platform-ramp.glb','shrine-ramp-a');
 platform(0,-139,shrineBase+2.45,11,9,'platform-fortified.glb','shrine-dais');
 ramp(0,-135,shrineBase+1.2,0,-138,shrineBase+2.65,6,'platform-ramp.glb','shrine-ramp-b');
 for(const x of [-6.3,6.3]){add(Q+'arch_tall_neutral.gltf',{x,z:-137,y:shrineBase+.1,height:6.5,ry:x<0?.15:-.15,name:'shrine-side-arch'});add(Q+'flag_A_neutral.gltf',{x,z:-132,y:shrineBase+1.15,height:3.0,name:'shrine-flag'})}
 sites.tube.x=0;sites.tube.z=-139;sites.tube.y=shrineBase+2.89;

 await Promise.all(jobs);
 world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);heightCache?.clear?.();
 window.__signatureTraversal=true;window.__walkMeshCount=walkMeshes.length;window.__pass12Landmarks=['Meadow Launch','Village Heights','Riverworks','Windridge','Ruin Circuit','Portal Ascent'];
 progress('Signature traversal authored',78);
}
// -------------------------------------------------------------------------

'''
if marker not in s: raise SystemExit('heightCache marker missing')
s=s.replace(marker,traversal+marker,1)

# ---------- SPRING FUNCTIONALITY ----------
# Added to gameplay updater via proximity; visual spring is at riverworks.
old_game='function updateGameplay(dt,elapsed){damageCooldown=Math.max(0,damageCooldown-dt);'
new_game="let springCooldown=0;function updateGameplay(dt,elapsed){damageCooldown=Math.max(0,damageCooldown-dt);springCooldown=Math.max(0,springCooldown-dt);if(springCooldown<=0&&player.grounded&&Math.hypot(player.x-25,player.z+48)<1.45){player.vy=7.6;player.grounded=false;player.jumpCount=1;springCooldown=1.0;toast('SPRING BOOST!',650)}"
if old_game not in s: raise SystemExit('updateGameplay marker missing')
s=s.replace(old_game,new_game,1)

# ---------- POWER SYSTEM REPLACEMENT ----------
s=s.replace("const POWER_STYLES=['PRISM BOLT','NOVA PULSE','COMET BURST'];","const POWER_STYLES=['PRISM RAIL','GRAVITY NOVA','AURORA SWARM'];")
s=s.replace("const enemies=[],shots=[],pulses=[],collectibles=[],debris=[];","const enemies=[],shots=[],pulses=[],collectibles=[],debris=[],powerEvents=[],trailBits=[];let actionSerial=0,cameraKick=0;")

power_start=s.find('function makeShot(')
power_end=s.find('function updateGameplay(',power_start)
if power_start<0 or power_end<0: raise SystemExit('power block markers missing')
new_power=r'''function damageOnce(e,serial){if(!e.alive||e.userLastAction===serial)return;e.userLastAction=serial;hitEnemy(e)}
function energyMat(color,opacity=.95){return new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})}
function orb(color=.95){return new THREE.Mesh(new THREE.IcosahedronGeometry(.18,1),energyMat(color,.96))}
function heroPoint(x,z,y,color,intensity=4,dist=8){const l=new THREE.PointLight(color,intensity,dist,2);l.position.set(x,y,z);scene.add(l);return l}
function spawnRail(serial){
 const g=new THREE.Group();g.position.set(player.x,player.y+1.15,player.z);scene.add(g);
 const core=orb(0x8df8ff);core.scale.setScalar(1.35);g.add(core);
 const a=orb(0xff6ee7),b=orb(0x8b74ff);g.add(a,b);const light=heroPoint(player.x,player.z,player.y+1.25,0x81eaff,5.2,9);
 powerEvents.push({type:'rail',serial,age:0,g,core,a,b,light,fired:false,beam:null,rings:[]});
}
function spawnNova(serial){
 const g=new THREE.Group();g.position.set(player.x,player.y+1.0,player.z);scene.add(g);const shards=[];
 for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.20),energyMat(i%2?0xb569ff:0x63efff));g.add(m);shards.push(m)}
 const light=heroPoint(player.x,player.z,player.y+1.2,0x9b55ff,4.6,8);powerEvents.push({type:'nova',serial,age:0,g,shards,light,burst:false,shell:null,ring:null});
}
function spawnSwarm(serial){
 const g=new THREE.Group();g.position.set(player.x,player.y+1.1,player.z);scene.add(g);const stars=[];const colors=[0xff6edf,0x78efff,0xffd15e,0xa983ff,0x72ffbd];
 for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.20),energyMat(colors[i]));g.add(m);stars.push({m,color:colors[i],launched:false,target:null,v:new THREE.Vector3()})}
 const light=heroPoint(player.x,player.z,player.y+1.25,0xff72dc,4.8,8);powerEvents.push({type:'swarm',serial,age:0,g,stars,light,released:false});
}
function nearestTargets(max=22){return enemies.filter(e=>e.alive).map(e=>({e,d:Math.hypot(e.root.position.x-player.x,e.root.position.z-player.z)})).filter(o=>o.d<max).sort((a,b)=>a.d-b.d).map(o=>o.e)}
function fireRail(ev){
 ev.fired=true;const length=24,fx=Math.sin(player.yaw),fz=Math.cos(player.yaw),mx=player.x+fx*length*.5,mz=player.z+fz*length*.5;
 const beam=new THREE.Group();beam.position.set(mx,player.y+1.25,mz);beam.rotation.y=player.yaw;scene.add(beam);ev.beam=beam;
 const outer=new THREE.Mesh(new THREE.CylinderGeometry(.18,.44,length,18,1,true),energyMat(0x8b67ff,.32));outer.rotation.x=Math.PI/2;beam.add(outer);
 const inner=new THREE.Mesh(new THREE.CylinderGeometry(.055,.10,length,12),energyMat(0xa9ffff,.98));inner.rotation.x=Math.PI/2;beam.add(inner);
 for(const d of [4,8,12,16,20]){const r=new THREE.Mesh(new THREE.TorusGeometry(.38,.045,8,28),energyMat(d%8?0xff67e6:0x76ecff,.82));r.rotation.x=Math.PI/2;r.position.z=d-length/2;beam.add(r);ev.rings.push(r)}
 let best=null,bestT=1e9;for(const e of enemies){if(!e.alive)continue;const ex=e.root.position.x-player.x,ez=e.root.position.z-player.z,t=ex*fx+ez*fz;if(t<0||t>length)continue;const perp=Math.abs(ex*fz-ez*fx);if(perp<1.4&&t<bestT){best=e;bestT=t}}if(best)damageOnce(best,ev.serial);cameraKick=.72;
}
function burstNova(ev){
 ev.burst=true;const shell=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),energyMat(0x9b5dff,.22));shell.position.set(player.x,player.y+1.0,player.z);scene.add(shell);ev.shell=shell;
 const ring=new THREE.Mesh(new THREE.RingGeometry(.72,1.0,64),energyMat(0x6ff5ff,.95));ring.rotation.x=-Math.PI/2;ring.position.set(player.x,player.y+.10,player.z);scene.add(ring);ev.ring=ring;cameraKick=.5;
}
function releaseSwarm(ev){
 ev.released=true;const targets=nearestTargets(24);for(let i=0;i<ev.stars.length;i++){const s=ev.stars[i],wp=new THREE.Vector3();s.m.getWorldPosition(wp);scene.attach(s.m);s.m.position.copy(wp);s.launched=true;s.target=targets.length?targets[i%targets.length]:null;const spread=(i-2)*.13,a=player.yaw+spread;s.v.set(Math.sin(a)*14,1.8+Math.abs(i-2)*.35,Math.cos(a)*14)}cameraKick=.38;
}
function useAction(){if(!bro||!tube||tube.state!=='idle'||actionCooldown>0)return;const serial=++actionSerial;actionCooldown=.48;actionPoseTimer=.64;bro.setAction(true);actionBtn.classList.add('active');setTimeout(()=>actionBtn.classList.remove('active'),150);if(powerStyle===0)spawnRail(serial);else if(powerStyle===1)spawnNova(serial);else spawnSwarm(serial);window.__actionCount=(window.__actionCount||0)+1;}
function updateAction(dt){
 actionCooldown=Math.max(0,actionCooldown-dt);actionPoseTimer=Math.max(0,actionPoseTimer-dt);cameraKick=Math.max(0,cameraKick-dt*2.7);if(bro&&actionPoseTimer<=0&&bro.action)bro.setAction(false);
 for(let i=powerEvents.length-1;i>=0;i--){const ev=powerEvents[i];ev.age+=dt;if(ev.light){ev.light.position.set(player.x,player.y+1.25,player.z);ev.light.intensity*=Math.pow(.985,dt*60)}
  if(ev.type==='rail'){
   const t=Math.min(1,ev.age/.13),ang=ev.age*22;ev.g.position.set(player.x,player.y+1.15,player.z);ev.a.position.set(Math.cos(ang)*(.55-.3*t),.18,Math.sin(ang)*(.55-.3*t));ev.b.position.set(Math.cos(ang+Math.PI)*(.55-.3*t),-.12,Math.sin(ang+Math.PI)*(.55-.3*t));ev.core.scale.setScalar(1.1+t*1.8);if(ev.age>.13&&!ev.fired)fireRail(ev);if(ev.beam){const q=Math.max(0,1-(ev.age-.13)/.24);ev.beam.scale.x=ev.beam.scale.y=.72+.28*q;ev.beam.traverse(o=>{if(o.material?.opacity!=null)o.material.opacity*=Math.pow(.90,dt*60)})}if(ev.age>.42){scene.remove(ev.g);if(ev.beam)scene.remove(ev.beam);if(ev.light)scene.remove(ev.light);powerEvents.splice(i,1)}}
  else if(ev.type==='nova'){
   ev.g.position.set(player.x,player.y+1.0,player.z);for(let j=0;j<ev.shards.length;j++){const a=ev.age*10+j*Math.PI/2,r=.85-Math.min(.5,ev.age*2.3);ev.shards[j].position.set(Math.cos(a)*r,.2+Math.sin(a*1.7)*.24,Math.sin(a)*r)}if(ev.age>.18&&!ev.burst)burstNova(ev);if(ev.burst){const p=Math.min(1,(ev.age-.18)/.46),radius=.7+p*8.2;ev.shell.scale.setScalar(radius);ev.shell.material.opacity=.25*(1-p);ev.ring.scale.setScalar(radius);ev.ring.material.opacity=.95*(1-p);for(const e of enemies){if(!e.alive)continue;const d=Math.hypot(e.root.position.x-player.x,e.root.position.z-player.z);if(d<radius&&d>Math.max(0,radius-1.8)){damageOnce(e,ev.serial);const nx=(e.root.position.x-player.x)/(d||1),nz=(e.root.position.z-player.z)/(d||1);e.root.position.x+=nx*.7;e.root.position.z+=nz*.7}}}if(ev.age>.7){scene.remove(ev.g);if(ev.shell)scene.remove(ev.shell);if(ev.ring)scene.remove(ev.ring);if(ev.light)scene.remove(ev.light);powerEvents.splice(i,1)}}
  else if(ev.type==='swarm'){
   ev.g.position.set(player.x,player.y+1.1,player.z);if(!ev.released){for(let j=0;j<ev.stars.length;j++){const s=ev.stars[j],a=ev.age*12+j*(Math.PI*2/5);s.m.position.set(Math.cos(a)*.78,.15+Math.sin(a*1.6)*.30,Math.sin(a)*.78)}if(ev.age>.17)releaseSwarm(ev)}else{let aliveStars=0;for(const s of ev.stars){if(!s.m.parent)continue;aliveStars++;if(s.target?.alive){const tp=s.target.root.position.clone().add(new THREE.Vector3(0,.7,0)),dir=tp.sub(s.m.position).normalize();s.v.lerp(dir.multiplyScalar(18),1-Math.exp(-7*dt))}s.v.y-=1.4*dt;s.m.position.addScaledVector(s.v,dt);s.m.rotation.x+=dt*12;s.m.rotation.y+=dt*16;if(Math.random()<.7){const tr=new THREE.Mesh(new THREE.SphereGeometry(.055,6,4),energyMat(s.color,.55));tr.position.copy(s.m.position);scene.add(tr);trailBits.push({m:tr,age:0})}if(s.target?.alive&&s.m.position.distanceTo(s.target.root.position.clone().add(new THREE.Vector3(0,.7,0)))<.85){damageOnce(s.target,ev.serial);scene.remove(s.m);s.m.parent=null}}if(ev.age>.95||aliveStars===0){for(const s of ev.stars)if(s.m.parent)scene.remove(s.m);scene.remove(ev.g);if(ev.light)scene.remove(ev.light);powerEvents.splice(i,1)}}}
 }
 for(let i=trailBits.length-1;i>=0;i--){const t=trailBits[i];t.age+=dt;t.m.scale.setScalar(1+t.age*4);t.m.material.opacity=Math.max(0,.55*(1-t.age/.26));if(t.age>.26){scene.remove(t.m);trailBits.splice(i,1)}}
 for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.age+=dt;d.v.y-=8*dt;d.m.position.addScaledVector(d.v,dt);d.m.rotation.x+=dt*8;d.m.rotation.y+=dt*10;d.m.material.opacity=Math.max(0,1-d.age/.7);if(d.age>.7){scene.remove(d.m);debris.splice(i,1)}}
}
'''
s=s[:power_start]+new_power+s[power_end:]

# Cycle label now says POWER instead of FX.
s=s.replace("fxBtn.textContent='FX: '+POWER_STYLES[powerStyle]","fxBtn.textContent='POWER: '+POWER_STYLES[powerStyle]")

# Camera kick applied after normal follow solve.
old_cam="camera.position.lerp(desired,1-Math.exp(-16*dt));camera.lookAt(target)"
new_cam="camera.position.lerp(desired,1-Math.exp(-16*dt));if(cameraKick>0){camera.position.x+=Math.cos(yaw)*cameraKick*.12;camera.position.y+=cameraKick*.08;camera.position.z-=Math.sin(yaw)*cameraKick*.12}camera.lookAt(target)"
if old_cam not in s: raise SystemExit('camera marker missing')
s=s.replace(old_cam,new_cam,1)

# More intentional enemy placement around traversal beats; fewer random blockers.
old_enemy="[[7,8,8],[-18,-8,7],[8,-32,8],[20,-53,8],[-8,-70,9],[-22,-84,8],[7,-103,9],[22,-119,8],[0,-130,9]]"
new_enemy="[[5,12,8],[-18,-6,7],[8,-27,8],[23,-47,8],[-7,-72,9],[-25,-81,8],[-3,-104,9],[-10,-117,8],[10,-121,8],[0,-131,9]]"
if old_enemy in s:s=s.replace(old_enemy,new_enemy,1)

# More strategic collectibles: guide ramps, reward high/side routes.
coin_old="[[0,24],[2,15],[-5,3],[-18,1],[-25,-8],[-18,-17],[3,-25],[0,-35],[18,-47],[25,-54],[18,-62],[-3,-69],[-18,-76],[-25,-84],[-18,-92],[3,-101],[18,-111],[25,-120],[18,-129],[0,-136]]"
coin_new="[[0,23],[-3,15],[-7,10],[-12,4],[-18,-2],[-8,-8],[3,-12],[8,-18],[1,-25],[-8,-29],[0,-35],[10,-38],[18,-40],[23,-43],[27,-47],[23,-51],[10,-56],[-5,-62],[-12,-68],[-7,-75],[5,-81],[4,-89],[-20,-74],[-27,-78],[-24,-84],[0,-101],[-8,-107],[-11,-115],[-7,-121],[4,-122],[10,-119],[0,-130],[0,-136]]"
if coin_old in s:s=s.replace(coin_old,coin_new,1)
gem_old="[[-24,-4],[24,-56],[-24,-86],[24,-122],[-7,-113],[7,-124]]"
gem_new="[[-20,-2],[-22,-22],[27,-47],[-28,-76],[-25,-84],[-9,-120],[9,-123],[0,-139]]"
if gem_old in s:s=s.replace(gem_old,gem_new,1)
s=s.replace("window.__coinTotal=20;window.__gemTotal=6","window.__coinTotal=33;window.__gemTotal=8")

# Startup: signature traversal must be built before player/tube and after asset layer.
old_start='sites=buildWorld();worldBounds=new THREE.Box3().setFromObject(world);await decorateWorld();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);spawnEnemies();spawnCollectibles();await createPlayer();'
new_start='sites=buildWorld();worldBounds=new THREE.Box3().setFromObject(world);await decorateWorld();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);await buildSignatureTraversal();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);spawnEnemies();spawnCollectibles();await createPlayer();'
if old_start not in s: raise SystemExit('startup marker missing')
s=s.replace(old_start,new_start,1)

# Objective/retry text.
s=s.replace("objective.textContent='A MEADOW → B VILLAGE → C BRIDGE → D HILLSIDE → E RUINS → F PORTAL'","objective.textContent='A LAUNCH → B HEIGHTS → C RIVERWORKS → D WINDRIDGE → E RUIN CIRCUIT → F PORTAL ASCENT'")

p.write_text(s)
print('Pass 12 signature world generated')
