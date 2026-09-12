from pathlib import Path
import shutil

ROOT=Path(__file__).resolve().parents[1]
world=ROOT/'pass17-world1'/'world.js'
assets=ROOT/'pass17-world1'/'assets.js'
shutil.copyfile(ROOT/'src'/'pass17-asset-library.js', assets)
s=world.read_text()

old="import * as THREE from 'three';\n"
new="import * as THREE from 'three';\nimport {createStraightPipe,createElbowPipe,createTJunction,createPipeSupport,createWalkway} from '../src/pass17-riverworks-kit.js';\n"
if old not in s: raise SystemExit('Three import marker missing')
s=s.replace(old,new,1)

marker=""" function route(points,opt=false){for(let i=0;i<points.length-1;i++)addRoute(points[i],points[i+1],opt)}
"""
insert=r''' function route(points,opt=false){for(let i=0;i<points.length-1;i++)addRoute(points[i],points[i+1],opt)}
 function addSceneObject(o,name){o.name=name||o.name;root.add(o);scenery.push(o);return o}
 function addCrystalCluster(x,y,z,scale=1){
   const g=new THREE.Group();g.name='prism-crystal-cluster';g.position.set(x,y,z);
   const colors=[0x64eaff,0xff61d1,0xa879ff],offs=[[-.7,0,.2],[.3,0,-.1],[.95,0,.45]];
   for(let i=0;i<3;i++){const h=(2.7+i*.75)*scale,r=.42*scale,m=new THREE.Mesh(new THREE.ConeGeometry(r,h,6),new THREE.MeshStandardMaterial({color:colors[i],emissive:colors[i],emissiveIntensity:.42,roughness:.22,metalness:.05,transparent:true,opacity:.93}));m.position.set(offs[i][0]*scale,h*.5,offs[i][2]*scale);m.castShadow=!mobile;g.add(m)}
   return addSceneObject(g,'prism-crystal-cluster');
 }
 function addWaterfall(x,y,z,w=4,h=7,rotY=0){
   const geo=new THREE.PlaneGeometry(w,h,1,8),mat=new THREE.MeshStandardMaterial({color:0x68d9ff,emissive:0x157aa5,emissiveIntensity:.15,transparent:true,opacity:.72,roughness:.15,metalness:0,side:THREE.DoubleSide});
   const m=new THREE.Mesh(geo,mat);m.position.set(x,y-h*.5,z);m.rotation.y=rotY;m.name='prism-waterfall';addSceneObject(m);return m;
 }
 async function decorateConceptLandmarks(){
   setPhase('Matching Riverworks, Ruins and Prism Ridge…',82);
   const dungeon=[
    'dungeon:floor_wood_large.gltf.glb','dungeon:wall_scaffold.gltf.glb','dungeon:wall_open_scaffold.gltf.glb','dungeon:barrier.gltf.glb',
    'dungeon:barrel_large.gltf.glb','dungeon:crates_stacked.gltf.glb','dungeon:torch_lit.gltf.glb','dungeon:wall_arched.gltf.glb',
    'dungeon:wall_broken.gltf.glb','dungeon:wall_pillar.gltf.glb','dungeon:pillar_decorated.gltf.glb','dungeon:stairs_wide.gltf.glb',
    'dungeon:banner_patternA_blue.gltf.glb','dungeon:banner_patternA_red.gltf.glb','dungeon:chest_gold.glb'
   ];
   await assets.prewarm(dungeon);

   // C — RIVERWORKS. Signature pipes are actual production meshes, with real KayKit scaffolds and props.
   const wy=groundAt(35,-8)??terrainHeight(35,-8),wy2=groundAt(41,-14)??terrainHeight(41,-14);
   addSceneObject(createStraightPipe({start:[27,wy+1.35,-3],end:[43,wy+1.35,-3],radius:.72}),'riverworks-main-pipe');
   addSceneObject(createElbowPipe({start:[43,wy+1.35,-3],corner:[47,wy+1.35,-3],end:[47,wy2+1.35,-10],radius:.72}),'riverworks-elbow');
   addSceneObject(createStraightPipe({start:[47,wy2+1.35,-10],end:[47,wy2+1.35,-20],radius:.72}),'riverworks-lower-pipe');
   addSceneObject(createTJunction({center:[33,wy+1.35,-3],mainLength:5,branchLength:4,radius:.72,yaw:0}),'riverworks-junction');
   for(const p of [[30,wy,-3],[38,wy,-3],[47,wy2,-12],[47,wy2,-18]])addSceneObject(createPipeSupport({position:p,height:1.25,width:2.8}),'riverworks-pipe-support');
   const rw=createWalkway({length:11,width:3.2});rw.position.set(38,wy+2.55,-9);rw.rotation.y=-.36;addSceneObject(rw,'riverworks-high-walkway');
   await decor('dungeon:wall_scaffold.gltf.glb',{x:34,z:-11,bottomY:groundAt(34,-11)+.02,targetXZ:5.5,rotationY:.25});
   await decor('dungeon:wall_open_scaffold.gltf.glb',{x:41,z:-15,bottomY:groundAt(41,-15)+.02,targetXZ:5.5,rotationY:-.35});
   await decor('dungeon:crates_stacked.gltf.glb',{x:32,z:-5,bottomY:groundAt(32,-5)+.02,targetXZ:2.6});
   await decor('dungeon:barrel_large.gltf.glb',{x:39,z:-19,bottomY:groundAt(39,-19)+.02,targetXZ:1.8});
   await decor('dungeon:torch_lit.gltf.glb',{x:35,z:-10,bottomY:groundAt(35,-10)+.02,targetXZ:1.2});
   addWaterfall(43,(groundAt(43,-18)??wy2)+.4,-19,3.3,5.8,0);

   // E — RUIN COURTYARD. Verified KayKit arched walls, broken walls, pillars, stairs, banners and gold reward.
   const rg=(x,z)=>groundAt(x,z)??terrainHeight(x,z);
   await decor('dungeon:wall_arched.gltf.glb',{x:21,z:-41,bottomY:rg(21,-41)+.02,targetXZ:8.5,rotationY:0});
   await decor('dungeon:wall_arched.gltf.glb',{x:29,z:-45,bottomY:rg(29,-45)+.02,targetXZ:7.5,rotationY:Math.PI/2});
   await decor('dungeon:wall_broken.gltf.glb',{x:15,z:-44,bottomY:rg(15,-44)+.02,targetXZ:7,rotationY:-.2});
   await decor('dungeon:wall_pillar.gltf.glb',{x:24,z:-36,bottomY:rg(24,-36)+.02,targetXZ:5.5});
   await decor('dungeon:pillar_decorated.gltf.glb',{x:17,z:-52,bottomY:rg(17,-52)+.02,targetXZ:3.2});
   await decor('dungeon:stairs_wide.gltf.glb',{x:18,z:-48,bottomY:rg(18,-48)+.02,targetXZ:7,rotationY:Math.PI});
   await decor('dungeon:banner_patternA_blue.gltf.glb',{x:20,z:-40,bottomY:rg(20,-40)+.35,targetXZ:2.1});
   await decor('dungeon:banner_patternA_red.gltf.glb',{x:28,z:-48,bottomY:rg(28,-48)+.35,targetXZ:2.1});
   await decor('dungeon:torch_lit.gltf.glb',{x:17,z:-40,bottomY:rg(17,-40)+.02,targetXZ:1.2});
   await decor('dungeon:torch_lit.gltf.glb',{x:25,z:-45,bottomY:rg(25,-45)+.02,targetXZ:1.2});
   await decor('dungeon:chest_gold.glb',{x:31,z:-49,bottomY:rg(31,-49)+.12,targetXZ:2.1});

   // F — PRISM RIDGE. Ceremonial framing only; the canonical portal object/behavior remains owned by app.js.
   const py=rg(7,-66);
   await decor('dungeon:stairs_wide.gltf.glb',{x:9,z:-62,bottomY:rg(9,-62)+.02,targetXZ:8,rotationY:Math.PI});
   await decor('dungeon:wall_pillar.gltf.glb',{x:1,z:-68,bottomY:rg(1,-68)+.02,targetXZ:5.2});
   await decor('dungeon:wall_pillar.gltf.glb',{x:13,z:-68,bottomY:rg(13,-68)+.02,targetXZ:5.2});
   await decor('dungeon:banner_patternA_blue.gltf.glb',{x:1,z:-64,bottomY:rg(1,-64)+.25,targetXZ:2.2});
   await decor('dungeon:banner_patternA_red.gltf.glb',{x:14,z:-64,bottomY:rg(14,-64)+.25,targetXZ:2.2});
   await decor('dungeon:torch_lit.gltf.glb',{x:4,z:-64,bottomY:rg(4,-64)+.02,targetXZ:1.3});
   await decor('dungeon:torch_lit.gltf.glb',{x:12,z:-64,bottomY:rg(12,-64)+.02,targetXZ:1.3});
   addCrystalCluster(-1,rg(-1,-69)+.05,-69,1.15);addCrystalCluster(15,rg(15,-69)+.05,-69,1.0);

   // D — CLOVER CLIFFS gets curved/corner grass silhouettes around, not on top of, the validated route.
   for(const q of [
    ['block-grass-curve-low.glb',-45,-29,12,0],['block-grass-corner-overhang-low.glb',-42,-45,11,.4],
    ['block-grass-curve-half.glb',-20,-58,11,-.4],['block-grass-corner-low.glb',-47,-12,10,.25]
   ]){const [name,x,z,size,rot]=q,gy=groundAt(x,z);if(gy!==null)await place(name,{x,z,topY:gy+.05,targetXZ:size,rotationY:rot});}

   window.__pass17ConceptLandmarksReady=true;document.documentElement.dataset.conceptLandmarks='1';
 }
'''
if marker not in s: raise SystemExit('route helper marker missing')
s=s.replace(marker,insert,1)

old_dec=""" async function decorate(){if(decorated)return;decorated=true;await assets.prewarm(['coin-gold.glb','jewel.glb','chest.glb','heart.glb','tree.glb','tree-pine.glb','flowers.glb','rocks.glb','arrow.glb','sign.glb']);
"""
new_dec=""" async function decorate(){if(decorated)return;decorated=true;await assets.prewarm(['coin-gold.glb','jewel.glb','chest.glb','heart.glb','tree.glb','tree-pine.glb','flowers.glb','rocks.glb','arrow.glb','sign.glb']);
   await decorateConceptLandmarks();
"""
if old_dec not in s: raise SystemExit('decorate marker missing')
s=s.replace(old_dec,new_dec,1)
world.write_text(s)
print('PASS17B_LANDMARKS_OK')
