import * as pc from 'https://cdn.jsdelivr.net/npm/playcanvas@2.21.4/build/playcanvas.mjs';

const canvas=document.getElementById('game');
const boot=document.getElementById('boot');
const crestCountEl=document.getElementById('crestCount');
const leafCountEl=document.getElementById('leafCount');
const healthCountEl=document.getElementById('healthCount');
const objectiveEl=document.getElementById('objective');
const powerEl=document.getElementById('power');
const powerTimeEl=document.getElementById('powerTime');
const bossBar=document.getElementById('bossBar');
const bossFill=document.getElementById('bossFill');
const messageEl=document.getElementById('message');
const results=document.getElementById('results');
const resultsStats=document.getElementById('resultsStats');
const againBtn=document.getElementById('againBtn');
const stick=document.getElementById('stick');
const knob=document.getElementById('knob');
const zapBtn=document.getElementById('zapBtn');
const jumpBtn=document.getElementById('jumpBtn');
const dashBtn=document.getElementById('dashBtn');

const app=new pc.Application(canvas,{graphicsDeviceOptions:{antialias:true,powerPreference:'high-performance'}});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.start();
window.addEventListener('resize',()=>app.resizeCanvas());
app.scene.ambientLight=new pc.Color(.12,.075,.18);
app.scene.exposure=1.35;

const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if(mobile)app.graphicsDevice.maxPixelRatio=Math.min(window.devicePixelRatio||1,1.25);
else app.graphicsDevice.maxPixelRatio=Math.min(window.devicePixelRatio||1,1.6);

const C={
  stone:new pc.Color(.20,.16,.27), stone2:new pc.Color(.29,.22,.37), trim:new pc.Color(.44,.28,.52),
  bronze:new pc.Color(.45,.29,.19), purple:new pc.Color(.56,.23,.95), cyan:new pc.Color(.22,.78,1),
  pink:new pc.Color(1,.31,.77), orange:new pc.Color(1,.36,.08), blue:new pc.Color(.04,.34,.82),
  leaf:new pc.Color(1,.27,.08), gold:new pc.Color(1,.74,.2), void:new pc.Color(.025,.012,.055)
};
function mat(diffuse,emissive=null,emi=0){const m=new pc.StandardMaterial();m.diffuse=diffuse;m.useMetalness=true;m.metalness=.05;m.gloss=.25;if(emissive){m.emissive=emissive;m.emissiveIntensity=emi;}m.update();return m;}
const MAT={stone:mat(C.stone),stone2:mat(C.stone2),trim:mat(C.trim,C.purple,.18),bronze:mat(C.bronze),void:mat(C.void),orange:mat(C.orange),blue:mat(C.blue,C.cyan,.1),white:mat(new pc.Color(.95,.98,1)),purple:mat(new pc.Color(.28,.09,.5),C.purple,2.6),cyan:mat(new pc.Color(.08,.34,.48),C.cyan,2.4),pink:mat(new pc.Color(.48,.08,.32),C.pink,2.4),leaf:mat(new pc.Color(.63,.15,.03),C.leaf,2.2),gold:mat(new pc.Color(.67,.42,.05),C.gold,2.8),enemy:mat(new pc.Color(.23,.07,.34),C.purple,1.4),enemyEye:mat(new pc.Color(.7,.92,1),C.cyan,2.7)};

function primitive(name,type,pos,scale,material,parent=app.root){const e=new pc.Entity(name);e.addComponent('render',{type});e.setPosition(pos.x,pos.y,pos.z);e.setLocalScale(scale.x,scale.y,scale.z);e.render.material=material;parent.addChild(e);return e;}
function box(name,x,y,z,sx,sy,sz,material=MAT.stone,parent=app.root){return primitive(name,'box',new pc.Vec3(x,y,z),new pc.Vec3(sx,sy,sz),material,parent);}
function sphere(name,x,y,z,sx,sy,sz,material,parent=app.root){return primitive(name,'sphere',new pc.Vec3(x,y,z),new pc.Vec3(sx,sy,sz),material,parent);}
function cylinder(name,x,y,z,sx,sy,sz,material,parent=app.root){return primitive(name,'cylinder',new pc.Vec3(x,y,z),new pc.Vec3(sx,sy,sz),material,parent);}
function torus(name,x,y,z,sx,sy,sz,material,parent=app.root){return primitive(name,'torus',new pc.Vec3(x,y,z),new pc.Vec3(sx,sy,sz),material,parent);}

// Lighting: cool crystal fills, warm directional key, no dozens of shadow lights.
const sun=new pc.Entity('Moon key');sun.addComponent('light',{type:'directional',color:new pc.Color(.72,.65,.86),intensity:1.45,castShadows:true,shadowDistance:55,shadowResolution:1024});sun.setEulerAngles(52,-38,0);app.root.addChild(sun);
function point(name,x,y,z,color,intensity,range){const e=new pc.Entity(name);e.addComponent('light',{type:'omni',color,intensity,range,castShadows:false});e.setPosition(x,y,z);app.root.addChild(e);return e;}
point('Crystal purple fill',-14,9,8,C.purple,5,28);point('Crystal cyan fill',14,8,-9,C.cyan,4,25);point('Warm entrance',0,6,30,new pc.Color(1,.48,.2),2.8,18);

// Large enclosed hall silhouette.
box('void floor',0,-8,0,64,1,82,MAT.void);
for(const x of[-25,25]){box('side wall',x,8,0,1.4,22,76,MAT.stone);for(let z=-31;z<=32;z+=9){box('buttress',x-(x>0?.85:-.85),7,z,1.2,15,1.6,MAT.stone2);}}
box('north wall',0,8,-38,50,22,1.4,MAT.stone);
for(let x=-20;x<=20;x+=8)box('north pier',x,7,-37.1,1.4,15,1.3,MAT.stone2);
for(let z=-30;z<=30;z+=10){
  const pts=[];for(let i=0;i<=12;i++){const x=-23+i*(46/12),y=10.4+9.2*(1-Math.pow(x/23,2));pts.push({x,y});}
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),q=box('vault rib',(a.x+b.x)/2,(a.y+b.y)/2,z,len,.24,.28,MAT.trim);q.setEulerAngles(0,0,Math.atan2(dy,dx)*180/Math.PI);}
}
for(let i=0;i<70;i++){const x=(Math.random()-.5)*44,z=-34+Math.random()*68,y=13+Math.random()*8,q=primitive('ceiling crystal',i%3===0?'cone':'cylinder',new pc.Vec3(x,y,z),new pc.Vec3(.25+Math.random()*.3,.8+Math.random()*1.4,.25+Math.random()*.3),[MAT.purple,MAT.cyan,MAT.pink][i%3]);q.setEulerAngles(Math.random()*35,Math.random()*360,Math.random()*30);}

const surfaces=[];
function addRectSurface(id,x,z,w,d,y,ry=0,entity=null){const s={id,type:'rect',x,z,w,d,y,ry,entity,enabled:true};surfaces.push(s);return s;}
function addDiscSurface(id,x,z,r,y,entity=null){const s={id,type:'disc',x,z,r,y,entity,enabled:true};surfaces.push(s);return s;}
function surfCenter(s){if(s.entity){const p=s.entity.getPosition();return{x:p.x,z:p.z,y:p.y+s.y};}return{x:s.x,z:s.z,y:s.y};}
function contains(s,x,z){const c=surfCenter(s),dx=x-c.x,dz=z-c.z;if(s.type==='disc')return dx*dx+dz*dz<=s.r*s.r;const c0=Math.cos(-s.ry),s0=Math.sin(-s.ry),lx=dx*c0-dz*s0,lz=dx*s0+dz*c0;return Math.abs(lx)<=s.w/2&&Math.abs(lz)<=s.d/2;}
function groundAt(x,z,feetY){let best=null;for(const s of surfaces){if(!s.enabled||!contains(s,x,z))continue;const y=surfCenter(s).y;if(y<=feetY+1.25&&(best===null||y>best))best=y;}return best;}

function island(id,x,y,z,w,d,material=MAT.stone2){const base=box(id+' base',x,y-.65,z,w,1.3,d,MAT.stone);const top=box(id+' top',x,y-.04,z,w-.4,.22,d-.4,material);for(const [ox,oz] of [[-w/2+.4,-d/2+.4],[w/2-.4,-d/2+.4],[-w/2+.4,d/2-.4],[w/2-.4,d/2-.4]])box(id+' edge',x+ox,y+.18,z+oz,.45,.55,.45,MAT.trim);addRectSurface(id,x,z,w-.6,d-.6,y+.08);return{base,top};}
function bridge(id,x1,z1,y1,x2,z2,y2,w=3.1,material=MAT.stone2){const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),ry=Math.atan2(dx,dz),mx=(x1+x2)/2,mz=(z1+z2)/2,my=(y1+y2)/2;const e=box(id,mx,my-.12,mz,w,.28,len,material);e.setEulerAngles(0,ry*180/Math.PI,0);addRectSurface(id,mx,mz,w-.12,len-.08,my+.05,ry);return e;}
function steps(id,x1,z1,y1,x2,z2,y2,w=3.2,count=8){const dx=x2-x1,dz=z2-z1,ry=Math.atan2(dx,dz),len=Math.hypot(dx,dz);for(let i=0;i<count;i++){const t=(i+.5)/count,yy=y1+(y2-y1)*(i+1)/count,e=box(id+' '+i,x1+dx*t,yy-.18,z1+dz*t,w,.36,len/count*1.06,i%2?MAT.stone2:MAT.trim);e.setEulerAngles(0,ry*180/Math.PI,0);addRectSurface(id+'-'+i,x1+dx*t,z1+dz*t,w-.08,len/count*1.08,yy+.02,ry);} }

// Entry: high balcony -> broken descent -> atrium. Portal is visible but unreachable until 3 crests.
island('entry',0,4,32,9,6.5,MAT.stone2);
steps('entry descent',0,28.5,4,0,20.5,.8,3.8,10);
island('atrium',0,.7,13,13,11,MAT.stone2);
const portalIsland=island('portal island',0,1.1,-4,8.4,8.4,MAT.trim);
// Disable the default direct surface approach: only the island itself remains; bridge comes later.

// West route — broken elevation and melee encounter.
steps('west climb',-4.8,11,.7,-10,8,2.6,3.1,6);
island('west lower',-12,2.7,7,6.8,5.6,MAT.stone2);
bridge('west beam',-15,7,2.7,-18,4,3.7,2.0,MAT.trim);
island('west crest perch',-19,3.8,2.5,6.4,6.2,MAT.stone2);
for(const [x,z,y] of [[-8,13,1.2],[-11,11,1.8],[-15,9,2.5],[-18,7,3.2]]){const q=box('fallen shelf',x,y,z,3.4,.55,1.15,MAT.stone2);q.setEulerAngles(0,(x+z)*7,0);}

// East route — moving platforms and ranged pressure.
island('east launch',8,.9,12,5.2,5.2,MAT.stone2);
const moving=[];
function movingPad(id,x,y,z,axis,amp,speed,phase=0){const e=box(id,x,y-.2,z,4.1,.4,4.1,MAT.trim);const s=addRectSurface(id,0,0,3.8,3.8,.18,0,e);moving.push({e,s,base:new pc.Vec3(x,y-.2,z),axis,amp,speed,phase});return e;}
movingPad('east mover 1',12,1.5,8,'x',2.0,1.05,0);
movingPad('east mover 2',16,2.4,5,'y',1.25,.9,1.2);
movingPad('east mover 3',19,3.2,1,'z',2.1,.8,2.1);
island('east crest perch',21,3.6,-2,7,7,MAT.stone2);

// Lower sanctuary — narrow paths, crumble tiles, jump pad and guardian arena.
bridge('south ledge',5,9,.7,11,5,.7,2.2,MAT.stone2);
steps('sanctuary down',11,4,.7,12,-6,-1.2,2.4,9);
bridge('sanctuary rail',12,-7,-1.2,8,-13,-1.2,1.8,MAT.trim);
const crumbles=[];
function crumblePad(id,x,y,z){const e=box(id,x,y-.16,z,2.8,.32,2.8,MAT.stone2);const s=addRectSurface(id,x,z,2.6,2.6,y+.02);crumbles.push({e,s,trigger:0,fallen:false});return e;}
crumblePad('crumble a',6,-1.2,-14);crumblePad('crumble b',3,-1.2,-16);crumblePad('crumble c',0,-1.2,-17.5);
island('guardian arena',0,-1.0,-24,12,10,MAT.stone2);
const jumpPad=box('jump pad',0,-.74,-18.7,3.3,.34,2.5,MAT.cyan);addRectSurface('jump pad',0,-18.7,3.1,2.3,-.53);

// Optional risky leaf line along a thin upper shelf route.
bridge('secret shelf',-7,19,2.5,-16,18,2.5,1.1,MAT.bronze);island('secret cache',-19,2.5,18,4.2,4.2,MAT.trim);

// Portal structure, deliberately visible from the start.
const portalRoot=new pc.Entity('PORTAL LOCK');portalRoot.setPosition(0,1.3,-4);app.root.addChild(portalRoot);
for(const y of[0,3.8]){const r=primitive('portal ring','torus',new pc.Vec3(0,y,0),new pc.Vec3(4.4,4.4,4.4),MAT.purple,portalRoot);r.setEulerAngles(90,0,0);}
for(let i=0;i<8;i++){const a=i/8*Math.PI*2,c=Math.cos(a)*3.5,s=Math.sin(a)*3.5;box('portal strut',c,1.9,s,.25,4,.25,MAT.bronze,portalRoot);}
const portalCore=cylinder('portal core',0,2.0,0,3.4,3.6,3.4,MAT.purple,portalRoot);portalCore.render.meshInstances?.forEach(mi=>mi.material.opacity=.42);
const lockCrystal=primitive('lock crystal','cone',new pc.Vec3(0,5.2,0),new pc.Vec3(1.2,2.0,1.2),MAT.gold,portalRoot);lockCrystal.setEulerAngles(180,0,0);
const unlockBridgeEntity=box('unlock bridge',0,.9,4.1,4.2,.34,8.2,MAT.cyan);unlockBridgeEntity.enabled=false;
const unlockSurface=addRectSurface('unlock bridge',0,4.1,4.0,8.0,1.12);unlockSurface.enabled=false;

// Decorative columns, bookcase placeholders; GLBs replace/supplement these after load.
for(const x of[-21,21])for(let z=-30;z<=30;z+=10){box('library pier',x,4.7,z,1.3,10,1.5,MAT.stone2);box('shelf recess',x+(x<0?.7:-.7),3.7,z,1,6.8,5.8,MAT.bronze);}

// Hero: preserve the orange + blue masked/caped read, but use a lightweight PlayCanvas proxy for the first gameplay slice.
const hero=new pc.Entity('Gamer Bro proxy');hero.setLocalScale(.72,.72,.72);app.root.addChild(hero);
sphere('body',0,1.2,0,1.7,1.9,1.55,MAT.orange,hero);
const mask=sphere('mask',0,1.55,-1.22,1.18,.48,.34,MAT.blue,hero);
sphere('eyeL',-.38,1.64,-1.47,.22,.28,.13,MAT.white,hero);sphere('eyeR',.38,1.64,-1.47,.22,.28,.13,MAT.white,hero);
box('cape',0,1.2,.95,1.25,1.6,.16,MAT.blue,hero);sphere('footL',-.58,.16,-.25,.5,.35,.7,MAT.orange,hero);sphere('footR',.58,.16,-.25,.5,.35,.7,MAT.orange,hero);
hero.setPosition(0,4.15,32);

const camera=new pc.Entity('Camera');camera.addComponent('camera',{clearColor:new pc.Color(.018,.008,.04),fov:58,nearClip:.15,farClip:120});app.root.addChild(camera);
let camYaw=0,camPitch=.24,camDist=12.8,drag=false,lastPX=0,lastPY=0;
canvas.addEventListener('pointerdown',e=>{if(e.target!==canvas)return;drag=true;lastPX=e.clientX;lastPY=e.clientY;canvas.setPointerCapture?.(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lastPX,dy=e.clientY-lastPY;lastPX=e.clientX;lastPY=e.clientY;camYaw-=dx*.0046;camPitch=Math.max(.05,Math.min(.48,camPitch+dy*.0032));});
canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);

const keys=new Set();window.addEventListener('keydown',e=>{keys.add(e.code);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Space')queueJump();if(e.code==='KeyF')zap();if(e.code==='ShiftLeft'||e.code==='ShiftRight')dash();});window.addEventListener('keyup',e=>keys.delete(e.code));
const analog={x:0,y:0,active:false,id:null};
function setStick(e){const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.32,l=Math.hypot(dx,dy)||1,k=Math.min(1,max/l),nx=dx/l*k,ny=dy/l*k;analog.x=nx;analog.y=ny;knob.style.transform=`translate(${nx*max}px,${ny*max}px)`;}
stick.addEventListener('pointerdown',e=>{analog.active=true;analog.id=e.pointerId;stick.setPointerCapture?.(e.pointerId);setStick(e);});stick.addEventListener('pointermove',e=>{if(analog.active&&e.pointerId===analog.id)setStick(e);});
function clearStick(){analog.active=false;analog.x=analog.y=0;knob.style.transform='translate(0,0)';}stick.addEventListener('pointerup',clearStick);stick.addEventListener('pointercancel',clearStick);
zapBtn.addEventListener('pointerdown',e=>{e.preventDefault();zap();});jumpBtn.addEventListener('pointerdown',e=>{e.preventDefault();queueJump();});dashBtn.addEventListener('pointerdown',e=>{e.preventDefault();dash();});againBtn.addEventListener('click',()=>location.reload());

const state={health:3,leaves:0,crests:0,power:0,complete:false,kills:0,start:performance.now(),checkpoint:new pc.Vec3(0,4.15,32),lastDamage:0,zapCd:0,dashCd:0,dashTime:0,jumpQueued:0,vy:0,grounded:false};
function hud(){crestCountEl.textContent=`${state.crests} / 3`;leafCountEl.textContent=state.leaves;healthCountEl.textContent='♥ '.repeat(state.health).trim();powerEl.hidden=state.power<=0;if(state.power>0)powerTimeEl.textContent=state.power.toFixed(1);objectiveEl.textContent=state.crests<3?`Find the three Maple Crests. ${3-state.crests} remaining.`:'Portal unlocked — return to the central chamber.';}
let msgTimer=0;function message(t,sec=1.4){messageEl.textContent=t;messageEl.classList.add('show');msgTimer=sec;}
function damage(amount=1){const now=performance.now()/1000;if(now-state.lastDamage<1.1||state.complete)return;state.lastDamage=now;state.health=Math.max(0,state.health-amount);message('HIT!');if(state.health<=0){state.health=3;respawn(true);}hud();}
function respawn(hard=false){hero.setPosition(state.checkpoint);state.vy=0;state.grounded=false;if(hard)message('CHECKPOINT RESTORED');}
function queueJump(){state.jumpQueued=.16;}
function dash(){if(state.dashCd<=0&&!state.complete){state.dashCd=1.4;state.dashTime=.22;message('DASH',.35);}}

const effects=[];function pulse(pos,color=MAT.cyan,max=6,dur=.35){const e=sphere('pulse',pos.x,pos.y,pos.z,.35,.35,.35,color);effects.push({e,t:0,dur,max});}
function zap(){if(state.zapCd>0||state.complete)return;state.zapCd=state.power>0?.28:.48;const p=hero.getPosition(),radius=state.power>0?7.2:4.7;pulse(new pc.Vec3(p.x,p.y+1,p.z),state.power>0?MAT.pink:MAT.cyan,radius,.32);let hits=0;for(const en of enemies){if(en.dead)continue;const ep=en.root.getPosition();if(ep.distance(p)<=radius){hitEnemy(en,state.power>0?2:1);hits++;}}if(hits)message(`${hits} HIT${hits>1?'S':''}`,.4);}

function makeMapleLeaf(x,y,z,kind='leaf'){
  const root=new pc.Entity(kind==='crest'?'Maple Crest':kind==='power'?'Overcharge Leaf':'Maple Leaf');root.setPosition(x,y,z);app.root.addChild(root);const material=kind==='crest'?MAT.gold:kind==='power'?MAT.pink:MAT.leaf,scale=kind==='crest'?1.35:kind==='power'?1.2:.55;
  for(let i=0;i<5;i++){const a=(i-2)*25*Math.PI/180,px=Math.sin(a)*.55*scale,py=Math.cos(a)*.28*scale,seg=primitive('leaf point','cone',new pc.Vec3(px,py,0),new pc.Vec3(.36*scale,.75*scale,.13*scale),material,root);seg.setEulerAngles(0,0,(i-2)*-20);}
  box('stem',0,-.62*scale,0,.12*scale,.55*scale,.12*scale,material,root);return{root,kind,taken:false,baseY:y,spin:Math.random()*6};
}
const collectibles=[];
const leafSpots=[[-3,4.6,29],[-1,3.8,26],[1,3.0,24],[0,2.1,22],[-4,1.1,15],[3,1.1,15],[-8,3.1,9],[-12,3.2,7],[-16,3.8,5],[-18,4.5,1],[-7,3.0,19],[-11,3,18],[-15,3,18],[-19,3,18],[8,1.4,12],[12,2.1,8],[16,3.1,5],[19,4,1],[21,4.3,-4],[10,.9,6],[11,0,0],[12,-.6,-5],[11,-.5,-9],[8,-.4,-13],[6,-.4,-14],[3,-.4,-16],[0,-.4,-18],[-4,-.4,-23],[4,-.4,-23],[0,.1,-28]];
leafSpots.forEach(p=>collectibles.push(makeMapleLeaf(...p,'leaf')));
collectibles.push(makeMapleLeaf(-19,5.2,2.5,'crest'));collectibles.push(makeMapleLeaf(21,5.1,-2,'crest'));collectibles.push(makeMapleLeaf(0,1.1,-26,'crest'));collectibles.push(makeMapleLeaf(16,4.8,3,'power'));

const enemies=[];
function shardling(x,y,z,hp=2){const root=new pc.Entity('Shardling');root.setPosition(x,y,z);app.root.addChild(root);sphere('core',0,.7,0,1.0,1.15,1.0,MAT.enemy,root);sphere('eye',0,.9,-.85,.36,.28,.14,MAT.enemyEye,root);for(let i=0;i<5;i++){const a=i/5*Math.PI*2,sp=primitive('spike','cone',new pc.Vec3(Math.sin(a)*.78,1.35,Math.cos(a)*.78),new pc.Vec3(.28,.8,.28),MAT.purple,root);sp.setEulerAngles(0,i*72,0);}const en={type:'melee',root,hp,max:hp,dead:false,cd:0,home:new pc.Vec3(x,y,z)};enemies.push(en);return en;}
function wisp(x,y,z,hp=2){const root=new pc.Entity('Crystal Wisp');root.setPosition(x,y,z);app.root.addChild(root);sphere('orb',0,0,0,.9,.9,.9,MAT.cyan,root);const ring=torus('ring',0,0,0,1.4,1.4,1.4,MAT.pink,root);ring.setEulerAngles(90,0,0);const en={type:'ranged',root,hp,max:hp,dead:false,cd:1+Math.random(),home:new pc.Vec3(x,y,z),phase:Math.random()*6};enemies.push(en);return en;}
function guardian(x,y,z){const root=new pc.Entity('Crystal Guardian');root.setPosition(x,y,z);app.root.addChild(root);sphere('guardian body',0,1,0,2.1,2.5,2.1,MAT.enemy,root);sphere('guardian eye',0,1.3,-1.8,.62,.45,.18,MAT.enemyEye,root);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,sp=primitive('crown','cone',new pc.Vec3(Math.sin(a)*1.45,2.7,Math.cos(a)*1.45),new pc.Vec3(.45,1.3,.45),i%2?MAT.pink:MAT.purple,root);sp.setEulerAngles(0,i*45,0);}const en={type:'guardian',root,hp:8,max:8,dead:false,cd:1.2,home:new pc.Vec3(x,y,z)};enemies.push(en);return en;}
shardling(-12,3.6,7);shardling(-18,4.8,2.5);shardling(-16,3.8,5);wisp(15,5.5,5);wisp(21,5.5,-2);shardling(9,.1,-12);const guardianEnemy=guardian(0,0,-24);
const projectiles=[];
function shoot(from,to){const p=sphere('enemy bolt',from.x,from.y,from.z,.26,.26,.26,MAT.pink),d=new pc.Vec3().sub2(to,from).normalize();projectiles.push({e:p,v:d.mulScalar(8.5),t:3.2});}
function hitEnemy(en,dmg){if(en.dead)return;en.hp-=dmg;pulse(en.root.getPosition(),MAT.pink,2.6,.22);if(en===guardianEnemy){bossBar.hidden=false;bossFill.style.width=`${Math.max(0,en.hp/en.max*100)}%`;}if(en.hp<=0){en.dead=true;en.root.enabled=false;state.kills++;state.leaves+=en.type==='guardian'?8:2;if(en===guardianEnemy){bossBar.hidden=true;message('GUARDIAN DEFEATED · +8 LEAVES',1.8);}else message('+2 MAPLE LEAVES',.8);hud();}}

function unlockPortal(){if(unlockBridgeEntity.enabled)return;unlockBridgeEntity.enabled=true;unlockSurface.enabled=true;portalCore.render.material=MAT.cyan;lockCrystal.render.material=MAT.cyan;message('PORTAL UNLOCKED',2.2);objectiveEl.textContent='Portal unlocked — return to the central chamber.';}
function completeGame(){if(state.complete)return;state.complete=true;hero.enabled=false;pulse(new pc.Vec3(0,3,-4),MAT.cyan,10,.42);setTimeout(()=>{const sec=((performance.now()-state.start)/1000).toFixed(1);resultsStats.textContent=`${state.leaves} Maple Leaves · ${state.kills} enemies defeated · ${sec}s`;results.hidden=false;results.classList.add('show');},430);}

function collectUpdate(dt,t){const p=hero.getPosition();for(const c of collectibles){if(c.taken)continue;const cp=c.root.getPosition();c.root.setEulerAngles(0,(t*70+c.spin*30)%360,0);c.root.setPosition(cp.x,c.baseY+Math.sin(t*2.2+c.spin)*.18,cp.z);if(cp.distance(p)<1.35){c.taken=true;c.root.enabled=false;if(c.kind==='leaf'){state.leaves++;message('+1 MAPLE LEAF',.55);}else if(c.kind==='power'){state.power=12;message('OVERCHARGE · 12 SECONDS',1.4);}else{state.crests++;state.checkpoint=p.clone();message(`MAPLE CREST ${state.crests}/3`,1.5);if(state.crests===3)unlockPortal();}hud();}}
}

function updateEnemies(dt,t){const p=hero.getPosition();for(const en of enemies){if(en.dead)continue;en.cd-=dt;const ep=en.root.getPosition(),d=ep.distance(p);if(en.type==='melee'){if(d<10){const dir=new pc.Vec3(p.x-ep.x,0,p.z-ep.z);if(dir.lengthSq()>.01){dir.normalize().mulScalar(dt*(d<2?0:2.0));en.root.translate(dir);}if(d<1.65&&en.cd<=0){damage(1);en.cd=1.3;}}}else if(en.type==='ranged'){en.root.setPosition(en.home.x+Math.sin(t*.8+en.phase)*1.4,en.home.y+Math.sin(t*1.6+en.phase)*.55,en.home.z+Math.cos(t*.8+en.phase)*1.4);if(d<17&&en.cd<=0){shoot(new pc.Vec3(ep.x,ep.y,ep.z),new pc.Vec3(p.x,p.y+1,p.z));en.cd=2.0;}}else{if(d<10){bossBar.hidden=false;bossFill.style.width=`${en.hp/en.max*100}%`;const dir=new pc.Vec3(p.x-ep.x,0,p.z-ep.z);if(d>3.2)en.root.translate(dir.normalize().mulScalar(dt*1.2));if(en.cd<=0){if(d<3.6)damage(1);else shoot(new pc.Vec3(ep.x,ep.y+1.6,ep.z),new pc.Vec3(p.x,p.y+1,p.z));en.cd=1.5;}}}}
  for(let i=projectiles.length-1;i>=0;i--){const q=projectiles[i];q.t-=dt;const pos=q.e.getPosition();q.e.setPosition(pos.x+q.v.x*dt,pos.y+q.v.y*dt,pos.z+q.v.z*dt);if(q.e.getPosition().distance(p)<.8){damage(1);q.t=0;}if(q.t<=0){q.e.destroy();projectiles.splice(i,1);}}
}

function updateMoving(t){for(const m of moving){const p=m.base.clone(),v=Math.sin(t*m.speed+m.phase)*m.amp;if(m.axis==='x')p.x+=v;if(m.axis==='y')p.y+=v;if(m.axis==='z')p.z+=v;m.e.setPosition(p);}}
function updateCrumble(dt){const p=hero.getPosition();for(const c of crumbles){if(c.fallen)continue;if(c.trigger<=0&&contains(c.s,p.x,p.z)&&Math.abs(p.y-c.s.y)<1.3)c.trigger=1.15;if(c.trigger>0){c.trigger-=dt;if(c.trigger<=0){c.fallen=true;c.s.enabled=false;c.e.translate(0,-8,0);setTimeout(()=>{c.e.setPosition(c.s.x,c.s.y-.16,c.s.z);c.s.enabled=true;c.fallen=false;c.trigger=0;},4200);}}}}

function movement(dt){if(state.complete)return;state.zapCd=Math.max(0,state.zapCd-dt);state.dashCd=Math.max(0,state.dashCd-dt);state.dashTime=Math.max(0,state.dashTime-dt);state.jumpQueued=Math.max(0,state.jumpQueued-dt);state.power=Math.max(0,state.power-dt);if(state.power>0)powerTimeEl.textContent=state.power.toFixed(1);else powerEl.hidden=true;
  let ix=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),iz=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);if(analog.active){ix+=analog.x;iz+=-analog.y;}const mag=Math.hypot(ix,iz);if(mag>1){ix/=mag;iz/=mag;}
  const sy=Math.sin(camYaw),cy=Math.cos(camYaw),fx=-sy,fz=-cy,rx=cy,rz=-sy;let dx=rx*ix+fx*iz,dz=rz*ix+fz*iz;const dl=Math.hypot(dx,dz);if(dl>.001){dx/=dl;dz/=dl;hero.setEulerAngles(0,Math.atan2(dx,dz)*180/Math.PI+180,0);}const speed=(state.power>0?6.8:5.5)*(state.dashTime>0?2.45:1),pos=hero.getPosition(),nx=pos.x+dx*speed*dt,nz=pos.z+dz*speed*dt;
  const feet=pos.y-.05,gy=groundAt(nx,nz,feet);if(gy!==null||!state.grounded){hero.setPosition(nx,pos.y,nz);}if(state.grounded&&state.jumpQueued>0){state.vy=8.4;state.grounded=false;state.jumpQueued=0;}state.vy-=21*dt;let np=hero.getPosition(),ny=np.y+state.vy*dt,ground=groundAt(np.x,np.z,ny);if(ground!==null&&state.vy<=0&&ny<=ground+.16){ny=ground+.16;state.vy=0;state.grounded=true;}else state.grounded=false;hero.setPosition(np.x,ny,np.z);
  // Jump pad launches from the sanctuary approach.
  if(contains(unlockSurface,-999,-999)){} // keeps JIT path warm; no behavior.
  if(Math.abs(np.x)<1.6&&Math.abs(np.z+18.7)<1.3&&ny<.5&&state.vy<=0){state.vy=10.5;state.grounded=false;message('CRYSTAL LAUNCH',.6);}
  if(ny<-7||Math.abs(np.x)>31||np.z>42||np.z<-43){damage(1);respawn();}
  if(state.crests===3&&Math.hypot(np.x,np.z+4)<2.5&&ny<4.5)completeGame();
}

function updateCamera(dt){const p=hero.enabled?hero.getPosition():new pc.Vec3(0,2,-4),target=new pc.Vec3(p.x,p.y+1.55,p.z),cp=Math.cos(camPitch),desired=new pc.Vec3(target.x+Math.sin(camYaw)*cp*camDist,target.y+Math.sin(camPitch)*camDist+1.2,target.z+Math.cos(camYaw)*cp*camDist);const cur=camera.getPosition(),a=1-Math.exp(-8*dt);camera.setPosition(cur.x+(desired.x-cur.x)*a,cur.y+(desired.y-cur.y)*a,cur.z+(desired.z-cur.z)*a);camera.lookAt(target);}
function updateEffects(dt){for(let i=effects.length-1;i>=0;i--){const q=effects[i];q.t+=dt;const k=q.t/q.dur,s=.3+(q.max-.3)*k;q.e.setLocalScale(s,s,s);if(q.t>=q.dur){q.e.destroy();effects.splice(i,1);}}}

// Asset-driven dressing. Failure never blocks the game.
async function loadContainer(url,name){return new Promise((resolve,reject)=>app.assets.loadFromUrlAndFilename(url,name,'container',(err,asset)=>err?reject(err):resolve(asset.resource.instantiateRenderEntity())));}
(async()=>{try{const base='../hybrid-v09/assets/kenney/';const [book,gate,lamp]=await Promise.all([loadContainer(base+'furniture/bookcaseOpen.glb','bookcaseOpen.glb'),loadContainer(base+'dungeon/gate.glb','gate.glb'),loadContainer(base+'furniture/lampWall.glb','lampWall.glb')]);
  for(const x of[-23.4,23.4])for(let z=-30;z<=30;z+=10){const b=book.clone();b.setPosition(x,z%20===0?0:.1,z);b.setLocalScale(3.1,3.1,3.1);b.setEulerAngles(0,x<0?90:-90,0);app.root.addChild(b);const g=gate.clone();g.setPosition(x-(x>0?1.2:-1.2),0,z);g.setLocalScale(3.6,3.6,3.6);g.setEulerAngles(0,x<0?90:-90,0);app.root.addChild(g);}
  for(const z of[-25,-5,15,25])for(const x of[-22.8,22.8]){const l=lamp.clone();l.setPosition(x,5.3,z);l.setLocalScale(2.4,2.4,2.4);l.setEulerAngles(0,x<0?90:-90,0);app.root.addChild(l);}
}catch(err){console.warn('Optional library dressing failed',err);}})();

window.__spriteGame={
  state,
  collectAllCrests(){state.crests=3;unlockPortal();hud();},
  teleportToPortal(){hero.setPosition(0,1.35,-4);state.vy=0;state.grounded=false;},
  completeGame,
  hero,
  enemies
};

hud();
setTimeout(()=>{boot.style.opacity='0';setTimeout(()=>boot.remove(),380);message('THE PORTAL IS LOCKED · EXPLORE THE THREE WINGS',2.6);},650);
let time=0;app.on('update',dt=>{dt=Math.min(dt,.05);time+=dt;if(msgTimer>0){msgTimer-=dt;if(msgTimer<=0)messageEl.classList.remove('show');}updateMoving(time);updateCrumble(dt);movement(dt);collectUpdate(dt,time);updateEnemies(dt,time);updateEffects(dt);updateCamera(dt);portalRoot.rotate(0,dt*10,0);if(lockCrystal.enabled)lockCrystal.rotate(0,dt*34,0);});
