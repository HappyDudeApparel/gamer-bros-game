import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createGamerBro} from '../playground-v2/gamer-bro.js?v=pass12';
import {createCrystalLibraryTubeV2} from '../src/crystal-library-tube-v2.js?v=1';

const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
const qp=new URLSearchParams(location.search),requested=qp.get('hero'),saved=localStorage.getItem('gamerBroCharacter');
const id=requested==='gb1'||requested==='gb2'?requested:(saved==='gb1'||saved==='gb2'?saved:'gb2');
const colorway=id==='gb1'?'pink':'teal';localStorage.setItem('gamerBroCharacter',id);
const $=s=>document.querySelector(s),canvas=$('#game'),heroName=$('#heroName'),menu=$('#menu'),objective=$('#objective'),pad=$('#pad'),stick=$('#stick'),jumpBtn=$('#jump'),runBtn=$('#run'),actionBtn=$('#action'),retry=$('#retry'),toastEl=$('#toast'),boot=$('#boot'),status=$('#status'),bar=$('#bar'),fatal=$('#fatal'),errorEl=$('#error');
heroName.textContent=id.toUpperCase();menu.onclick=()=>location.href='../';
function progress(t,n){status.textContent=t;bar.style.width=n+'%'}
function toast(t,ms=1500){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toastEl.classList.remove('show'),ms)}

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=1.38;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1:1.35));
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fcce3);scene.fog=new THREE.Fog(0xa3d1df,58,125);
const camera=new THREE.PerspectiveCamera(36,1,.15,170);camera.layers.enable(1);
scene.add(new THREE.HemisphereLight(0xebfbff,0x456044,1.85));
const sun=new THREE.DirectionalLight(0xffefd4,2.2);sun.position.set(-28,38,18);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:1536,mobile?1024:1536);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;sun.shadow.camera.near=1;sun.shadow.camera.far=110;sun.shadow.bias=-.00025;sun.shadow.normalBias=.03;scene.add(sun);
const rim=new THREE.DirectionalLight(0x8d71ff,.28);rim.position.set(25,18,-24);scene.add(rim);

const world=new THREE.Group();scene.add(world);
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),walkMeshes=[];let worldBounds=new THREE.Box3();
const mats={grass:new THREE.MeshStandardMaterial({color:0x69a449,roughness:.95}),path:new THREE.MeshStandardMaterial({color:0xc7aa79,roughness:.98}),stone:new THREE.MeshStandardMaterial({color:0x777a72,roughness:.9}),stone2:new THREE.MeshStandardMaterial({color:0x97998d,roughness:.9}),wood:new THREE.MeshStandardMaterial({color:0x7a4b2d,roughness:.9}),water:new THREE.MeshPhysicalMaterial({color:0x2f9abe,roughness:.15,transparent:true,opacity:.82}),roof:new THREE.MeshStandardMaterial({color:0x8f4d3c,roughness:.86}),plaster:new THREE.MeshStandardMaterial({color:0xe4d5ad,roughness:.95}),leaf:new THREE.MeshStandardMaterial({color:0x4f8c47,roughness:1})};
function elev(z){if(z>=-55)return 0;if(z<=-90)return 5;let t=(-55-z)/35;t=t*t*(3-2*t);return t*5}
function terrain(){const sx=18,sz=100,w=72,zMax=40,zMin=-151,pos=[],uv=[],idx=[];for(let iz=0;iz<=sz;iz++){const z=THREE.MathUtils.lerp(zMax,zMin,iz/sz),y=elev(z);for(let ix=0;ix<=sx;ix++){const x=THREE.MathUtils.lerp(-w/2,w/2,ix/sx);pos.push(x,y,z);uv.push(ix/sx,iz/sz)}}for(let iz=0;iz<sz;iz++)for(let ix=0;ix<sx;ix++){const a=iz*(sx+1)+ix,b=a+1,c=a+(sx+1),d=c+1;idx.push(a,b,c,b,d,c)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,mats.grass);m.name='continuous-world1-terrain';m.receiveShadow=true;world.add(m);walkMeshes.push(m);return m}
function box(name,x,y,z,w,h,d,mat,ry=0,rx=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.rotation.set(rx,ry,0);m.castShadow=!mobile;m.receiveShadow=true;world.add(m);return m}
function cyl(name,x,y,z,r,h,mat){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat);m.name=name;m.position.set(x,y,z);m.castShadow=!mobile;m.receiveShadow=true;world.add(m);return m}
function tree(x,z,s=1){const y=elev(z);cyl('tree-trunk',x,y+.9*s,z,.28*s,1.8*s,mats.wood);const c=new THREE.Mesh(new THREE.ConeGeometry(1.2*s,2.5*s,10),mats.leaf);c.position.set(x,y+2.45*s,z);c.castShadow=!mobile;world.add(c)}
function house(x,z,scale=1,rot=0){const y=elev(z),g=new THREE.Group(),base=new THREE.Mesh(new THREE.BoxGeometry(4.5*scale,2.7*scale,3.8*scale),mats.plaster);base.position.y=1.35*scale;base.castShadow=!mobile;base.receiveShadow=true;g.add(base);const roof=new THREE.Mesh(new THREE.ConeGeometry(3.6*scale,2.2*scale,4),mats.roof);roof.position.y=3.55*scale;roof.rotation.y=Math.PI/4;roof.castShadow=!mobile;g.add(roof);const door=new THREE.Mesh(new THREE.BoxGeometry(.8*scale,1.6*scale,.16*scale),mats.wood);door.position.set(0,.8*scale,2*scale);g.add(door);g.position.set(x,y,z);g.rotation.y=rot;world.add(g)}
function arch(x,z,s=1,rot=0){const y=elev(z);box('ruin-pillar',x-1.65*s,y+1.7*s,z,.65*s,3.4*s,.75*s,mats.stone,rot);box('ruin-pillar',x+1.65*s,y+1.7*s,z,.65*s,3.4*s,.75*s,mats.stone,rot);box('ruin-lintel',x,y+3.35*s,z,3.95*s,.6*s,.8*s,mats.stone,rot)}
function buildWorld(){progress('Building one continuous World 1 landmass…',18);terrain();for(const [z,d] of [[18,35],[-12,25],[-51,10],[-73,31],[-108,29],[-133,20]])box('path',0,elev(z)+.035,z,5,.07,d,mats.path);for(const [x,z,s] of [[-11,30,1.05],[11,28,.9],[-12,16,.85],[12,9,1],[-10,-28,.75],[11,-30,.8],[-13,-94,.85],[13,-100,.85],[-12,-126,.85],[12,-139,.9]])tree(x,z,s);for(let i=0;i<6;i++){box('fence',-4.8,.55,29-i*4,.18,1.1,3.1,mats.wood);box('fence',4.8,.55,29-i*4,.18,1.1,3.1,mats.wood)}house(-9,-5,.9,.08);house(9,-7,1,-.12);house(-10,-15,.82,-.05);house(10,-17,.92,.12);house(-8,-23,.74,.06);house(8,-24,.78,-.08);box('village-square',0,.05,-15,11,.10,7,mats.path);cyl('well',-4,.65,-15,1.1,1.1,mats.stone);cyl('well-cap',-4,1.25,-15,1.35,.18,mats.stone2);box('river-left',-12,-.12,-40,14,.10,11,mats.water);box('river-right',12,-.12,-40,14,.10,11,mats.water);for(let z=-44.5;z<=-35.5;z+=1.05)box('bridge-plank',0,.10,z,6,.18,.86,mats.wood);for(const x of [-3.25,3.25]){for(let z=-44;z<=-36;z+=2)box('bridge-post',x,.9,z,.18,1.8,.18,mats.wood);box('bridge-rail',x,1.35,-40,.16,.18,9,mats.wood)}arch(0,-103,1.05);arch(-8,-110,.85,.08);arch(8,-114,.75,-.06);box('ruin-platform-a',-6,elev(-109)+.5,-109,4.5,1,4.5,mats.stone);box('ruin-platform-b',6,elev(-115)+.75,-115,4.5,1.5,4.5,mats.stone);box('ruin-platform-c',0,elev(-121)+1,-121,5.5,2,4.5,mats.stone);box('shrine-court',0,elev(-133)+.08,-133,17,.16,15,mats.stone2);box('shrine-step',0,elev(-138)+.22,-138,9,.44,5,mats.stone);for(const x of [-8,8]){cyl('shrine-column',x,elev(-132)+2,-132,.55,4,mats.stone);cyl('shrine-cap',x,elev(-132)+4.05,-132,.8,.2,mats.stone2)}arch(0,-144,1.25);world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);window.__worldSource='pass12-signature-authored-level';window.__worldRoute='meadow-village-river-bridge-hillside-ruins-portal-shrine';window.__enemyCount=0;window.__continuousLand=true;window.__movementCollisionMeshes=1;return{spawn:{x:0,y:.02,z:31},tube:{x:0,y:elev(-138)+.44,z:-138}}}


// PASS 10 OPTION B ---------------------------------------------------------
// Pass 9C's continuous terrain stays the ONLY movement collision surface.
// Imported kit models are visual-only in this first art-direction pass.
const assetLoader=new GLTFLoader();
const assetRoot=new THREE.Group();assetRoot.name='pass10-imported-world-assets';world.add(assetRoot);
const assetBase='../assets/world-kit/';
const cityBase=assetBase+'kenney/city-builder/models/';
const kenneyPlat=assetBase+'kenney/platformer-kit/Models/GLB format/';
const kayBase=assetBase+'kaykit/platformer-pack/KayKit_Platformer_Pack_1.0_FREE/Assets/gltf/neutral/';
const assetCache=new Map();
async function loadTemplate(url){if(assetCache.has(url))return assetCache.get(url);const pr=assetLoader.loadAsync(url).then(g=>g.scene);assetCache.set(url,pr);return pr}
function prepModel(root){root.traverse(o=>{if(o.isMesh){o.castShadow=!mobile;o.receiveShadow=true;o.frustumCulled=true}});return root}
async function placeAsset(url,{x=0,z=0,y=null,height=null,width=null,scale=1,ry=0,name='kit-asset'}={}){
 try{
  const src=await loadTemplate(url),root=prepModel(src.clone(true));root.name=name;root.updateMatrixWorld(true);
  const box0=new THREE.Box3().setFromObject(root),size0=box0.getSize(new THREE.Vector3());let factor=scale;
  if(height)factor*=height/Math.max(.001,size0.y);else if(width)factor*=width/Math.max(.001,Math.max(size0.x,size0.z));
  root.scale.multiplyScalar(factor);root.rotation.y=ry;root.position.set(x,0,z);root.updateMatrixWorld(true);
  const box1=new THREE.Box3().setFromObject(root),baseY=(y==null?elev(z):y);root.position.y+=baseY-box1.min.y;
  assetRoot.add(root);return root;
 }catch(err){console.warn('[Pass10 asset skipped]',url,err);return null}
}
function removeProceduralDecor(){
 const removeNames=new Set(['tree-trunk','fence','village-square','well','well-cap','bridge-plank','bridge-post','bridge-rail','ruin-pillar','ruin-lintel','ruin-platform-a','ruin-platform-b','ruin-platform-c','shrine-column','shrine-cap']);
 for(const child of [...world.children]){
  if(child===assetRoot||walkMeshes.includes(child)||child.name==='path'||child.name==='river-left'||child.name==='river-right'||child.name==='shrine-court'||child.name==='shrine-step')continue;
  if(child.type==='Group'||removeNames.has(child.name)||(!child.name&&child.geometry?.type==='ConeGeometry'))world.remove(child);
 }
}
async function decorateWorld(){
 progress('Placing Kenney village and vegetation…',30);removeProceduralDecor();const jobs=[];
 const village=[['building-small-a.glb',-17,-7,15.5,.10],['building-small-c.glb',15,-18,16,.02],['building-small-d.glb',-14,-29,15.25,-.08]];
 for(const [f,x,z,h,r] of village)jobs.push(placeAsset(cityBase+f,{x,z,height:h,ry:r,name:'kenney-village-building'}));
 jobs.push(placeAsset(cityBase+'pavement-fountain.glb',{x:-4,z:-15,width:3.8,name:'kenney-village-fountain'}));
 for(const [x,z,h,r] of [[-13,29,5.5,0],[13,27,4.8,.4],[-13,11,4.8,.7],[13,4,5.2,.2],[-14,-28,5,0],[14,-29,5,.5]])jobs.push(placeAsset(cityBase+'grass-trees.glb',{x,z,height:h,ry:r,name:'kenney-tree-cluster'}));
 for(const [x,z,r] of [[-6,-20,0],[6,-22,.6],[-8,-96,.4],[8,-100,-.5]])jobs.push(placeAsset(kenneyPlat+'barrel.glb',{x,z,height:1.2,ry:r,name:'kenney-barrel'}));
 for(const [x,z,r] of [[-11,-66,0],[11,-72,Math.PI],[-12,-82,.3],[12,-88,-.3]])jobs.push(placeAsset(kenneyPlat+'block-grass-large-slope.glb',{x,z,width:5.8,ry:r,name:'kenney-slope-accent'}));
 for(const [x,z,r] of [[-15,-58,0],[15,-62,Math.PI],[-15,-90,.2],[15,-94,-.2]])jobs.push(placeAsset(kenneyPlat+'block-grass-edge.glb',{x,z,width:4.2,ry:r,name:'kenney-grass-edge'}));
 progress('Placing KayKit bridge, ruins and route markers…',42);
 for(const [x,z,h,r] of [[0,-103,5,0],[-8,-111,4.4,.08],[8,-115,4.2,-.08],[0,-144,5.3,0]])jobs.push(placeAsset(kayBase+'arch_tall_neutral.gltf',{x,z,height:h,ry:r,name:'kaykit-ruin-arch'}));
 for(const [x,z,w,r] of [[-10,-105,4,0],[10,-108,4,Math.PI/2],[-10,-120,4,.15],[10,-124,4,-.15]])jobs.push(placeAsset(kayBase+'barrier_2x1x4_neutral.gltf',{x,z,width:w,ry:r,name:'kaykit-ruin-barrier'}));
 // Authored bridge deck + rails; continuous terrain remains hidden underneath for safe collision.
 for(const z of [-43.5,-40,-36.5])jobs.push(placeAsset(kayBase+'platform_6x2x1_neutral.gltf',{x:0,z,y:.03,width:6.1,ry:0,name:'kaykit-bridge-deck'}));
 for(const x of [-3.15,3.15])for(const z of [-43,-40,-37])jobs.push(placeAsset(kayBase+'railing_straight_double_neutral.gltf',{x,z,y:.20,width:3.0,ry:0,name:'kaykit-bridge-rail'}));
 // Readable route markers without giant HUD arrows.
 for(const [x,z,r] of [[3.7,27,Math.PI],[-3.7,-2,0],[3.8,-31,Math.PI],[-3.8,-55,0],[3.8,-91,Math.PI],[-3.8,-126,0]])jobs.push(placeAsset(kayBase+'signage_arrow_stand_neutral.gltf',{x,z,height:1.8,ry:r,name:'kaykit-route-sign'}));
 for(const [x,z,r] of [[-5,-101,0],[5,-118,Math.PI]])jobs.push(placeAsset(kayBase+'flag_A_neutral.gltf',{x,z,height:2.4,ry:r,name:'kaykit-ruin-flag'}));
 
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
await Promise.all(jobs);window.__pass10Assets=true;window.__pass10AssetCount=assetRoot.children.length;window.__optionalLoops=4;window.__movementCollisionMeshes=1;
 progress(`Imported world assets ready · ${assetRoot.children.length} placed`,58);
}
// -------------------------------------------------------------------------



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

const heightCache=new Map();function hkey(x,z){return`${Math.round(x*10)},${Math.round(z*10)}`}function groundAt(x,z,cache=true){const key=hkey(x,z);if(cache&&heightCache.has(key))return heightCache.get(key);const top=worldBounds.max.y+18;ray.set(new THREE.Vector3(x,top,z),down);ray.far=(top-worldBounds.min.y)+30;const hit=ray.intersectObjects(walkMeshes,false)[0],y=hit?hit.point.y:null;if(cache)heightCache.set(key,y);return y}
let bro,heroRoot,tube,sites;const player={x:0,y:0,z:0,yaw:Math.PI,vy:0,speed:0,grounded:true,jumpCount:0,holdJumpTimer:0};const moveKeys={up:false,down:false,left:false,right:false,run:false,jump:false,jumpQueued:false},analogMove={x:0,y:0,active:false,pointerId:null};const STEP_HEIGHT=.70,GRAVITY=8.25,JUMP_V=5.05,DOUBLE_JUMP_V=4.65,HOLD_BOOST_V=3.95,HOLD_BOOST_INTERVAL=.22;
async function createPlayer(){progress('Restoring animated Gamer Bro movement…',45);bro=createGamerBro(THREE,renderer,{colorway,detail:mobile?'low':'high',height:2.62});heroRoot=bro.root;bro.all.forEach(m=>{m.layers.enable(0);m.layers.enable(1)});bro.setRoomLight(1);scene.add(heroRoot);resetPlayer();window.__characterReady=id;window.__playerPosition=player;window.__movementBaseline='crystal-library-v2';window.__cameraBaseline='crystal-library-v2'}
function resetPlayer(){player.x=sites.spawn.x;player.z=sites.spawn.z;player.y=(groundAt(player.x,player.z,false)??sites.spawn.y)+.02;player.yaw=Math.PI;player.vy=0;player.speed=0;player.grounded=true;player.jumpCount=0;if(bro){bro.setMotion('idle');bro.setHome(player.x,player.z,player.yaw);heroRoot.position.y=player.y;bro.update(0,0,0)}}
function createTube(){progress('Installing canonical Crystal Library v2 tube…',67);tube=createCrystalLibraryTubeV2({renderer,scene,camera,bro,heroRoot,mobile,onComplete:()=>{objective.textContent='WORLD 1 SIGNATURE ROUTE COMPLETE · PASS 12';retry.classList.add('show');toast('ROUTE COMPLETE',2200)}});tube.root.position.set(sites.tube.x,sites.tube.y-.42,sites.tube.z);window.__tubeComponent='crystal-library-v2-tube';window.__tubePosition={...sites.tube};window.__portalRequiresEnemies=false}
const target=new THREE.Vector3(),targetLook=new THREE.Vector3();let yaw=.06,pitch=.34,distance=13.4,followDistance=13.4,recenterClock=0,dragging=false,lastX=0,lastY=0;function cameraDesired(dt){const portalActive=tube&&tube.state!=='idle';if(portalActive){targetLook.set(tube.root.position.x,tube.root.position.y+2.9,tube.root.position.z);target.lerp(targetLook,.085);yaw=THREE.MathUtils.damp(yaw,.06,3,dt);pitch=THREE.MathUtils.damp(pitch,.10,3,dt);distance=THREE.MathUtils.damp(distance,12.2,3.4,dt)}else{targetLook.set(player.x,player.y+1.45,player.z);target.lerp(targetLook,1-Math.exp(-8*dt));if(dragging||analogMove.active)recenterClock=0;else recenterClock+=dt;if(!dragging&&!analogMove.active&&recenterClock>.85){const behind=player.yaw+Math.PI,dy=Math.atan2(Math.sin(behind-yaw),Math.cos(behind-yaw));yaw+=dy*(1-Math.exp(-1.75*dt));pitch=THREE.MathUtils.damp(pitch,.34,2.5,dt)}distance=THREE.MathUtils.damp(distance,followDistance,3.8,dt)}const cp=Math.cos(pitch),desired=new THREE.Vector3(target.x+Math.sin(yaw)*cp*distance,target.y+Math.sin(pitch)*distance+1.05,target.z+Math.cos(yaw)*cp*distance);camera.position.lerp(desired,1-Math.exp(-16*dt));if(cameraKick>0){camera.position.x+=Math.cos(yaw)*cameraKick*.12;camera.position.y+=cameraKick*.08;camera.position.z-=Math.sin(yaw)*cameraKick*.12}camera.lookAt(target)}
const healthEl=document.querySelector('#health'),coinsEl=document.querySelector('#coins'),gemsEl=document.querySelector('#gems'),fxBtn=document.querySelector('#fx');
let hearts=5,coins=0,gems=0,damageCooldown=0,actionCooldown=0,actionPoseTimer=0,powerStyle=0;
const POWER_STYLES=['PRISM RAIL','GRAVITY NOVA','AURORA SWARM'];
const enemies=[],shots=[],pulses=[],collectibles=[],debris=[],powerEvents=[],trailBits=[];let actionSerial=0,cameraKick=0;let actionSerial=0;
const enemyMat=new THREE.MeshStandardMaterial({color:0x4b315f,roughness:.5,metalness:.15,emissive:0x19091f,emissiveIntensity:.4});
function updateHUD(){healthEl.textContent='♥'.repeat(hearts)+'♡'.repeat(5-hearts);coinsEl.textContent=coins;gemsEl.textContent=gems;fxBtn.textContent='POWER: '+POWER_STYLES[powerStyle]}
function cyclePower(){powerStyle=(powerStyle+1)%POWER_STYLES.length;updateHUD();toast(POWER_STYLES[powerStyle],900)}
fxBtn.addEventListener('pointerdown',e=>{e.preventDefault();cyclePower()});
function enemyBody(x,z,radius=9){const g=new THREE.Group();g.position.set(x,elev(z),z);const body=new THREE.Mesh(new THREE.SphereGeometry(.72,18,14),enemyMat.clone());body.scale.y=.82;body.position.y=.72;body.castShadow=!mobile;g.add(body);for(const sx of [-.24,.24]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:0xffe8ff}));eye.position.set(sx,.84,.61);g.add(eye)}const hornMat=new THREE.MeshStandardMaterial({color:0x8c5fad,roughness:.6});for(const sx of [-.38,.38]){const horn=new THREE.Mesh(new THREE.ConeGeometry(.12,.45,8),hornMat);horn.position.set(sx,1.38,0);horn.rotation.z=sx<0?.35:-.35;g.add(horn)}world.add(g);const e={root:g,body,hp:2,home:new THREE.Vector3(x,elev(z),z),radius,alive:true,speed:2.35,flash:0,lastActionId:-1};enemies.push(e);return e}
function spawnEnemies(){for(const [x,z,r] of [[5,12,8],[-18,-6,7],[8,-27,8],[23,-47,8],[-7,-72,9],[-25,-81,8],[-3,-104,9],[-10,-117,8],[10,-121,8],[0,-131,9]])enemyBody(x,z,r);window.__enemyCount=enemies.length;window.__enemyAggroRadius='7-9m'}
function coinMesh(x,z){const m=new THREE.Mesh(new THREE.TorusGeometry(.28,.09,8,18),new THREE.MeshStandardMaterial({color:0xffd84a,metalness:.7,roughness:.25,emissive:0x8c5500,emissiveIntensity:.35}));m.rotation.y=Math.PI/2;m.position.set(x,elev(z)+.8,z);world.add(m);collectibles.push({mesh:m,type:'coin',taken:false});}
function gemMesh(x,z){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.38),new THREE.MeshStandardMaterial({color:0x62e6ff,metalness:.25,roughness:.2,emissive:0x0d6680,emissiveIntensity:.7}));m.position.set(x,elev(z)+.85,z);world.add(m);collectibles.push({mesh:m,type:'gem',taken:false});}
function spawnCollectibles(){for(const [x,z] of [[0,23],[-3,15],[-7,10],[-12,4],[-18,-2],[-8,-8],[3,-12],[8,-18],[1,-25],[-8,-29],[0,-35],[10,-38],[18,-40],[23,-43],[27,-47],[23,-51],[10,-56],[-5,-62],[-12,-68],[-7,-75],[5,-81],[4,-89],[-20,-74],[-27,-78],[-24,-84],[0,-101],[-8,-107],[-11,-115],[-7,-121],[4,-122],[10,-119],[0,-130],[0,-136]])coinMesh(x,z);for(const [x,z] of [[-20,-2],[-22,-22],[27,-47],[-28,-76],[-25,-84],[-9,-120],[9,-123],[0,-139]])gemMesh(x,z);window.__coinTotal=33;window.__gemTotal=8}
function destroyEnemy(e){if(!e.alive)return;e.alive=false;for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.TetrahedronGeometry(.10+Math.random()*.10),new THREE.MeshBasicMaterial({color:i%2?0xb869ff:0x6fe8ff,transparent:true,opacity:1}));m.position.copy(e.root.position).add(new THREE.Vector3((Math.random()-.5)*1.2,.7+Math.random(),(Math.random()-.5)*1.2));scene.add(m);debris.push({m,v:new THREE.Vector3((Math.random()-.5)*5,2+Math.random()*4,(Math.random()-.5)*5),age:0})}world.remove(e.root);toast('ENEMY DESTROYED',700)}
function hitEnemy(e,actionId){if(!e.alive||e.lastActionId===actionId)return;e.lastActionId=actionId;e.hp--;e.flash=.14;e.body.material.emissive.setHex(0x9b24ff);e.body.material.emissiveIntensity=2.2;if(e.hp<=0)destroyEnemy(e);else toast('HIT · ONE MORE',550)}
function damagePlayer(){if(damageCooldown>0||tube?.state!=='idle')return;damageCooldown=1.0;hearts=Math.max(0,hearts-1);updateHUD();toast(hearts?'OUCH!':'KNOCKED OUT',700);if(hearts<=0){setTimeout(()=>{hearts=5;updateHUD();resetPlayer();toast('RESPAWNED AT MEADOW',1200)},450)}}
function damageOnce(e,serial){if(!e.alive||e.userLastAction===serial)return;e.userLastAction=serial;hitEnemy(e)}
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
function updateGameplay(dt,elapsed){damageCooldown=Math.max(0,damageCooldown-dt);springCooldown=Math.max(0,springCooldown-dt);if(springCooldown<=0&&player.grounded&&Math.hypot(player.x-25,player.z+48)<1.45){player.vy=7.6;player.grounded=false;player.jumpCount=1;springCooldown=1.0;toast('SPRING BOOST!',650)}for(const e of enemies){if(!e.alive)continue;e.flash=Math.max(0,e.flash-dt);if(e.flash<=0){e.body.material.emissive.setHex(0x19091f);e.body.material.emissiveIntensity=.4}const dx=player.x-e.root.position.x,dz=player.z-e.root.position.z,d=Math.hypot(dx,dz);const homeD=e.root.position.distanceTo(e.home);if(d<e.radius){const inv=1/Math.max(.001,d);e.root.position.x+=dx*inv*e.speed*dt;e.root.position.z+=dz*inv*e.speed*dt;e.root.rotation.y=Math.atan2(dx,dz)}else if(homeD>1){const hx=e.home.x-e.root.position.x,hz=e.home.z-e.root.position.z,hd=Math.hypot(hx,hz);e.root.position.x+=hx/hd*e.speed*.55*dt;e.root.position.z+=hz/hd*e.speed*.55*dt}e.root.position.y=elev(e.root.position.z);if(d<1.25)damagePlayer()}for(const c of collectibles){if(c.taken)continue;c.mesh.rotation.y+=dt*2.7;c.mesh.position.y=elev(c.mesh.position.z)+.82+Math.sin(elapsed*3+c.mesh.position.x)*.12;if(Math.hypot(player.x-c.mesh.position.x,player.z-c.mesh.position.z)<.9){c.taken=true;world.remove(c.mesh);if(c.type==='coin')coins++;else gems++;updateHUD();toast(c.type==='coin'?'+1 COIN':'+1 GEM',450)}}}
updateHUD();
function updatePlayer(dt){if(!bro||!tube||tube.state!=='idle')return;const kx=(moveKeys.right?1:0)-(moveKeys.left?1:0),ky=(moveKeys.up?1:0)-(moveKeys.down?1:0);let sx=analogMove.active?analogMove.x:kx,sy=analogMove.active?-analogMove.y:ky,len=Math.hypot(sx,sy);if(len<.075){sx=0;sy=0;len=0}const inputMag=Math.min(1,len);if(len>1){sx/=len;sy/=len}let dx=0,dz=0;if(len>0){const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);dx=fx*sy+rx*sx;dz=fz*sy+rz*sx;const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;const desiredYaw=Math.atan2(dx,dz),diff=Math.atan2(Math.sin(desiredYaw-player.yaw),Math.cos(desiredYaw-player.yaw));player.yaw+=diff*(1-Math.exp(-10*dt))}const speedScale=THREE.MathUtils.smoothstep(inputMag,.075,.88),targetSpeed=len>0?(moveKeys.run?15.875:9.375)*speedScale:0;player.speed=THREE.MathUtils.damp(player.speed,targetSpeed,targetSpeed>player.speed?7.5:11,dt);const currentH=groundAt(player.x,player.z),nx=player.x+dx*player.speed*dt,nz=player.z+dz*player.speed*dt,nextH=groundAt(nx,nz);if(nextH!==null&&(currentH===null||nextH-currentH<=STEP_HEIGHT)){player.x=nx;player.z=nz}if(moveKeys.jumpQueued){if(player.grounded){player.vy=JUMP_V;player.grounded=false;player.jumpCount=1;player.holdJumpTimer=HOLD_BOOST_INTERVAL}else if(player.jumpCount<2){player.vy=Math.max(player.vy,DOUBLE_JUMP_V);player.jumpCount=2;player.holdJumpTimer=HOLD_BOOST_INTERVAL}moveKeys.jumpQueued=false}if(moveKeys.jump&&!player.grounded){player.holdJumpTimer-=dt;if(player.holdJumpTimer<=0){player.vy=Math.max(player.vy,HOLD_BOOST_V);player.holdJumpTimer=HOLD_BOOST_INTERVAL}}player.vy-=GRAVITY*dt;player.y+=player.vy*dt;const ground=groundAt(player.x,player.z);if(ground!==null&&player.vy<=0&&player.y<=ground+.04){player.y=ground+.02;player.vy=0;player.grounded=true;player.jumpCount=0}else if(ground===null||player.y>ground+.08)player.grounded=false;if(player.y<worldBounds.min.y-6){resetPlayer();toast('BACK AT THE MEADOW')}const motion=player.speed<.14?'idle':(player.speed<9.0?'walk':'run');bro.setMotion(motion);bro.setHome(player.x,player.z,player.yaw);heroRoot.position.y=player.y;window.__heroMotion=motion;const d=Math.hypot(player.x-sites.tube.x,player.z-sites.tube.z);if(d<tube.entryRadius&&player.grounded&&tube.prewarmed){player.speed=0;bro.setMotion('idle');tube.trigger();objective.textContent='CRYSTAL LIBRARY V2 · TRANSMISSION IN PROGRESS'}}
const keyMap={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};addEventListener('keydown',e=>{if(keyMap[e.code])moveKeys[keyMap[e.code]]=true;if(e.code==='ShiftLeft'||e.code==='ShiftRight')moveKeys.run=true;if(e.code==='Space'){e.preventDefault();if(!moveKeys.jump)moveKeys.jumpQueued=true;moveKeys.jump=true}if(['KeyE','KeyX','KeyJ','KeyK'].includes(e.code))useAction();if(e.code==='KeyC')cyclePower()});addEventListener('keyup',e=>{if(keyMap[e.code])moveKeys[keyMap[e.code]]=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight')moveKeys.run=false;if(e.code==='Space')moveKeys.jump=false});function setStick(x,y){const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,lim=r.width*.34;let dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy);if(d>lim){dx=dx/d*lim;dy=dy/d*lim}let nx=dx/lim,ny=dy/lim;if(Math.hypot(nx,ny)<.035){nx=ny=0}analogMove.x=nx;analogMove.y=ny;analogMove.active=true;stick.style.transform=`translate(${nx*lim}px,${ny*lim}px)`}pad.addEventListener('pointerdown',e=>{analogMove.pointerId=e.pointerId;pad.setPointerCapture(e.pointerId);setStick(e.clientX,e.clientY)});pad.addEventListener('pointermove',e=>{if(e.pointerId===analogMove.pointerId)setStick(e.clientX,e.clientY)});function stopStick(e){if(e.pointerId!==analogMove.pointerId)return;analogMove.active=false;analogMove.pointerId=null;analogMove.x=analogMove.y=0;stick.style.transform='translate(0,0)'}pad.addEventListener('pointerup',stopStick);pad.addEventListener('pointercancel',stopStick);function hold(btn,key){btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);moveKeys[key]=true;if(key==='jump')moveKeys.jumpQueued=true;btn.classList.add('active')});const off=()=>{moveKeys[key]=false;btn.classList.remove('active')};btn.addEventListener('pointerup',off);btn.addEventListener('pointercancel',off)}hold(jumpBtn,'jump');hold(runBtn,'run');actionBtn.addEventListener('pointerdown',e=>{e.preventDefault();useAction()});canvas.addEventListener('pointerdown',e=>{if(e.target!==canvas)return;dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.00245;pitch=THREE.MathUtils.clamp(pitch+dy*.0019,-.08,.78);recenterClock=0});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);canvas.addEventListener('wheel',e=>{followDistance=THREE.MathUtils.clamp(followDistance+e.deltaY*.008,7.2,18);e.preventDefault()},{passive:false});retry.onclick=()=>{tube.reset();resetPlayer();retry.classList.remove('show');objective.textContent='A LAUNCH → B HEIGHTS → C RIVERWORKS → D WINDRIDGE → E RUIN CIRCUIT → F PORTAL ASCENT';toast('ROUTE RESTARTED')};
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();const clock=new THREE.Clock();let elapsed=0;function loop(){requestAnimationFrame(loop);const dt=Math.min(.033,clock.getDelta());elapsed+=dt;updatePlayer(dt);updateAction(dt);updateGameplay(dt,elapsed);if(bro&&tube?.state==='idle')bro.update(elapsed,dt,0);tube?.update(elapsed,dt);cameraDesired(dt);renderer.render(scene,camera)}
(async()=>{try{sites=buildWorld();worldBounds=new THREE.Box3().setFromObject(world);await decorateWorld();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);await buildSignatureTraversal();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);spawnEnemies();spawnCollectibles();await createPlayer();createTube();progress('Prewarming tube and shaders…',82);await tube.prewarm();progress('World 1 Pass 12 signature level ready',100);window.__pass='pass12-v1';window.__world1Ready=true;window.__actionReady=true;window.__rigAnimationLive=true;setTimeout(()=>boot.classList.add('hide'),180);loop()}catch(err){console.error(err);errorEl.textContent=err?.stack||err?.message||String(err);fatal.classList.add('show')}})();