from pathlib import Path
import shutil

src=Path('pass9-v1')
dst=Path('pass10-v1')
if dst.exists(): shutil.rmtree(dst)
shutil.copytree(src,dst)

p=dst/'index.html'
s=p.read_text()
s=s.replace('Gamer Bros — World 1 Traversal Test','Gamer Bros — World 1 Asset Pass')
s=s.replace('PASS 9C · CONTINUOUS WORLD 1','PASS 10 · OPTION B ASSET WORLD')
s=s.replace('Building corrected World 1 test','Building World 1 with imported asset kits')
s=s.replace('Preparing one continuous landmass…','Loading Kenney + KayKit world assets…')
s=s.replace('./app.js?v=3','./app.js?v=10')
p.write_text(s)

p=dst/'app.js'
s=p.read_text()
s=s.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';",1)
s=s.replace('?v=pass9b','?v=pass10')
s=s.replace('WORLD 1 ROUTE COMPLETE · PASS 9C','WORLD 1 ROUTE COMPLETE · PASS 10')
s=s.replace("window.__worldSource='pass9c-continuous-terrain'","window.__worldSource='pass10-continuous-terrain-plus-kit-assets'")

marker='const heightCache=new Map();'
addon="""

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
 const village=[['building-small-a.glb',-9,-5,6,.10],['building-small-b.glb',9,-7,6.2,-.12],['building-small-c.glb',-10,-15,6.3,.06],['building-small-d.glb',10,-17,6,-.08],['building-small-b.glb',-8,-24,5.5,.08],['building-small-a.glb',8,-25,5.6,-.05]];
 for(const [f,x,z,h,r] of village)jobs.push(placeAsset(cityBase+f,{x,z,height:h,ry:r,name:'kenney-village-building'}));
 jobs.push(placeAsset(cityBase+'pavement-fountain.glb',{x:-4,z:-15,width:3.8,name:'kenney-village-fountain'}));
 for(const [x,z,h,r] of [[-13,29,5.5,0],[13,27,4.8,.4],[-13,11,4.8,.7],[13,4,5.2,.2],[-14,-28,5,0],[14,-29,5,.5]])jobs.push(placeAsset(cityBase+'grass-trees.glb',{x,z,height:h,ry:r,name:'kenney-tree-cluster'}));
 for(const [x,z,r] of [[-6,-20,0],[6,-22,.6],[-8,-96,.4],[8,-100,-.5]])jobs.push(placeAsset(kenneyPlat+'barrel.glb',{x,z,height:1.2,ry:r,name:'kenney-barrel'}));
 for(const [x,z,r] of [[-11,-66,0],[11,-72,Math.PI],[-12,-82,.3],[12,-88,-.3]])jobs.push(placeAsset(kenneyPlat+'block-grass-large-slope.glb',{x,z,width:5.8,ry:r,name:'kenney-slope-accent'}));
 for(const [x,z,r] of [[-15,-58,0],[15,-62,Math.PI],[-15,-90,.2],[15,-94,-.2]])jobs.push(placeAsset(kenneyPlat+'block-grass-edge.glb',{x,z,width:4.2,ry:r,name:'kenney-grass-edge'}));
 progress('Placing KayKit ruins and platformer details…',42);
 for(const [x,z,h,r] of [[0,-103,5,0],[-8,-111,4.4,.08],[8,-115,4.2,-.08],[0,-144,5.3,0]])jobs.push(placeAsset(kayBase+'arch_tall_neutral.gltf',{x,z,height:h,ry:r,name:'kaykit-ruin-arch'}));
 for(const [x,z,w,r] of [[-10,-105,4,0],[10,-108,4,Math.PI/2],[-10,-120,4,.15],[10,-124,4,-.15]])jobs.push(placeAsset(kayBase+'barrier_2x1x4_neutral.gltf',{x,z,width:w,ry:r,name:'kaykit-ruin-barrier'}));
 for(const x of [-3.2,3.2])jobs.push(placeAsset(kayBase+'barrier_1x1x4_neutral.gltf',{x,z:-40,width:3.5,ry:0,name:'kaykit-bridge-rail'}));
 for(const z of [-44,-42,-40,-38,-36])jobs.push(placeAsset(kenneyPlat+'block-grass-long.glb',{x:0,z,y:.02,width:6,ry:Math.PI/2,name:'kenney-bridge-deck-accent'}));
 await Promise.all(jobs);window.__pass10Assets=true;window.__pass10AssetCount=assetRoot.children.length;window.__movementCollisionMeshes=1;
 progress(`Imported world assets ready · ${assetRoot.children.length} placed`,58);
}
// -------------------------------------------------------------------------

"""
if marker not in s: raise SystemExit('marker missing')
s=s.replace(marker,addon+marker,1)
old='sites=buildWorld();worldBounds=new THREE.Box3().setFromObject(world);await createPlayer();'
new='sites=buildWorld();worldBounds=new THREE.Box3().setFromObject(world);await decorateWorld();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);await createPlayer();'
if old not in s: raise SystemExit('startup marker missing')
s=s.replace(old,new,1)
s=s.replace("progress('World 1 continuous-land test ready',100)","progress('World 1 Option B asset test ready',100)")
s=s.replace("window.__pass='pass9-v1b'","window.__pass='pass10-v1'")
p.write_text(s)
print('Pass 10 Option B generated')
