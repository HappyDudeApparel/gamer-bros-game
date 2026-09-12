import * as THREE from 'three';
import {createStraightPipe,createElbowPipe,createTJunction,createPipeSupport,createWalkway} from '../src/pass17-riverworks-kit.js';

export function createPrismValleyWorld({scene,assets,mobile=false,setPhase=()=>{}}){
 const root=new THREE.Group();root.name='pass17-prism-valley-v2';scene.add(root);
 const walkMeshes=[],springs=[],hazards=[],collectibles=[],routeSegments=[],optionalSegments=[],scenery=[];
 const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);let bounds=new THREE.Box3(),decorated=false,water=null;
 function groundHits(x,z){ray.set(new THREE.Vector3(x,140,z),down);return ray.intersectObjects(walkMeshes,false).map(h=>h.point.y)}
 function groundAt(x,z,maxY=Infinity){const ys=groundHits(x,z);if(!ys.length)return null;if(!Number.isFinite(maxY))return ys[0];for(const y of ys)if(y<=maxY+.08)return y;return null}
 function refreshBounds(){bounds.setFromObject(root);return bounds}
 function addRoute(a,b,opt=false){const aa={...a},bb={...b};if(aa.y==null)aa.y=groundAt(aa.x,aa.z);if(bb.y==null)bb.y=groundAt(bb.x,bb.z);(opt?optionalSegments:routeSegments).push({a:aa,b:bb})}
 async function place(name,opts={}){return assets.instantiateStatic(name,{...opts,parent:root,walkMeshes:opts.walkable===false?null:walkMeshes})}
 async function decor(name,opts={}){const p=await assets.instantiateStatic(name,{...opts,parent:root,walkMeshes:null});scenery.push(p.root);return p}
 function g(dx,dz,r){return Math.exp(-(dx*dx+dz*dz)/(2*r*r))}
 function creekX(z){return 7*Math.sin((z-20)*.036)}
 function terrainHeight(x,z){
   let h=.48+.10*Math.sin(x*.09)+.08*Math.cos(z*.075)+.05*Math.sin((x+z)*.055);
   h+=1.45*g(x-29,z+5,27);
   h+=5.15*g(x+30,z+31,29);
   h+=6.45*g(x-20,z+39,27);
   h+=9.55*g(x-5,z+68,25);
   h+=1.00*g(x+46,z-51,24);
   const cx=creekX(z),channel=g(x-cx,0,5.7)*g(0,z+4,68);
   h-=3.15*channel;
   return h;
 }
 function terrainColor(y){if(y<-.65)return new THREE.Color(0x58714c);if(y<2.2)return new THREE.Color(0x74ad55);if(y<6.2)return new THREE.Color(0x68a34c);return new THREE.Color(0x5f9746)}
 function buildTerrain(){
   const geo=new THREE.PlaneGeometry(170,180,85,90);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,colors=new Float32Array(pos.count*3);
   for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=terrainHeight(x,z);pos.setY(i,y);const c=terrainColor(y);colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b}
   geo.setAttribute('color',new THREE.BufferAttribute(colors,3));geo.computeVertexNormals();
   const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94,metalness:0,side:THREE.DoubleSide});const terrain=new THREE.Mesh(geo,mat);terrain.receiveShadow=!mobile;terrain.name='continuous-prism-valley-terrain';root.add(terrain);walkMeshes.push(terrain);
   const wgeo=new THREE.PlaneGeometry(150,165,1,1);wgeo.rotateX(-Math.PI/2);const wmat=new THREE.MeshStandardMaterial({color:0x3aa8d1,roughness:.28,metalness:.06,transparent:true,opacity:.90});water=new THREE.Mesh(wgeo,wmat);water.position.y=-1.02;water.name='prism-creek-water';root.add(water);
 }
 function route(points,opt=false){for(let i=0;i<points.length-1;i++)addRoute(points[i],points[i+1],opt)}
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

   const wy=groundAt(35,-8)??terrainHeight(35,-8),wy2=groundAt(41,-14)??terrainHeight(41,-14);
   addSceneObject(createStraightPipe({start:[27,wy+1.35,-3],end:[43,wy+1.35,-3],radius:.72}),'riverworks-main-pipe');
   addSceneObject(createElbowPipe({start:[43,wy+1.35,-3],corner:[47,wy+1.35,-3],end:[47,wy2+1.35,-10],radius:.72}),'riverworks-elbow');
   addSceneObject(createStraightPipe({start:[47,wy2+1.35,-10],end:[47,wy2+1.35,-20],radius:.72}),'riverworks-lower-pipe');
   addSceneObject(createTJunction({center:[33,wy+1.35,-3],mainLength:5,branchLength:4,radius:.72,yaw:0}),'riverworks-junction');
   for(const p of [[30,wy,-3],[38,wy,-3],[47,wy2,-12],[47,wy2,-18]])addSceneObject(createPipeSupport({position:p,height:1.25,width:2.8}),'riverworks-pipe-support');
   const rw=createWalkway({length:11,width:3.2});rw.position.set(38,wy+2.55,-9);rw.rotation.y=-.36;addSceneObject(rw,'riverworks-high-walkway');
   await decor('dungeon:wall_scaffold.gltf.glb',{x:34,z:-11,bottomY:(groundAt(34,-11)??terrainHeight(34,-11))+.02,targetXZ:5.5,rotationY:.25});
   await decor('dungeon:wall_open_scaffold.gltf.glb',{x:41,z:-15,bottomY:(groundAt(41,-15)??terrainHeight(41,-15))+.02,targetXZ:5.5,rotationY:-.35});
   await decor('dungeon:crates_stacked.gltf.glb',{x:32,z:-5,bottomY:(groundAt(32,-5)??terrainHeight(32,-5))+.02,targetXZ:2.6});
   await decor('dungeon:barrel_large.gltf.glb',{x:39,z:-19,bottomY:(groundAt(39,-19)??terrainHeight(39,-19))+.02,targetXZ:1.8});
   await decor('dungeon:torch_lit.gltf.glb',{x:35,z:-10,bottomY:(groundAt(35,-10)??terrainHeight(35,-10))+.02,targetXZ:1.2});
   addWaterfall(43,(groundAt(43,-18)??wy2)+.4,-19,3.3,5.8,0);

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

   await decor('dungeon:stairs_wide.gltf.glb',{x:9,z:-62,bottomY:rg(9,-62)+.02,targetXZ:8,rotationY:Math.PI});
   await decor('dungeon:wall_pillar.gltf.glb',{x:1,z:-68,bottomY:rg(1,-68)+.02,targetXZ:5.2});
   await decor('dungeon:wall_pillar.gltf.glb',{x:13,z:-68,bottomY:rg(13,-68)+.02,targetXZ:5.2});
   await decor('dungeon:banner_patternA_blue.gltf.glb',{x:1,z:-64,bottomY:rg(1,-64)+.25,targetXZ:2.2});
   await decor('dungeon:banner_patternA_red.gltf.glb',{x:14,z:-64,bottomY:rg(14,-64)+.25,targetXZ:2.2});
   await decor('dungeon:torch_lit.gltf.glb',{x:4,z:-64,bottomY:rg(4,-64)+.02,targetXZ:1.3});
   await decor('dungeon:torch_lit.gltf.glb',{x:12,z:-64,bottomY:rg(12,-64)+.02,targetXZ:1.3});
   addCrystalCluster(-1,rg(-1,-69)+.05,-69,1.15);addCrystalCluster(15,rg(15,-69)+.05,-69,1.0);

   for(const q of [
    ['block-grass-curve-low.glb',-45,-29,12,0],['block-grass-corner-overhang-low.glb',-42,-45,11,.4],
    ['block-grass-curve-half.glb',-20,-58,11,-.4],['block-grass-corner-low.glb',-47,-12,10,.25]
   ]){const [name,x,z,size,rot]=q,gy=groundAt(x,z);if(gy!==null)await place(name,{x,z,topY:gy+.05,targetXZ:size,rotationY:rot});}

   window.__pass17ConceptLandmarksReady=true;document.documentElement.dataset.conceptLandmarks='1';
 }
 function addMeadowPath(){
   if(root.getObjectByName('portal-meadow-dirt-path'))return;
   const pts=[[-55,61],[-49,57],[-44,50],[-38,43],[-32,36],[-25,29],[-18,23],[-12,20]].map(([x,z])=>new THREE.Vector3(x,terrainHeight(x,z)+.045,z));
   const curve=new THREE.CatmullRomCurve3(pts,false,'centripetal'),positions=[],indices=[],steps=48,width=3.1;
   for(let i=0;i<=steps;i++){
     const t=i/steps,p=curve.getPoint(t),ta=curve.getTangent(t);ta.y=0;ta.normalize();
     const nx=-ta.z,nz=ta.x,gy=terrainHeight(p.x,p.z)+.055;
     positions.push(p.x+nx*width*.5,gy,p.z+nz*width*.5,p.x-nx*width*.5,gy,p.z-nz*width*.5);
   }
   for(let i=0;i<steps;i++){const a=i*2,b=a+1,c=a+2,d=a+3;indices.push(a,b,c,c,b,d)}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
   const mat=new THREE.MeshStandardMaterial({color:0xc79c5c,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
   const mesh=new THREE.Mesh(geo,mat);mesh.name='portal-meadow-dirt-path';mesh.receiveShadow=!mobile;root.add(mesh);scenery.push(mesh);
 }
 async function decoratePortalMeadow(){
   addMeadowPath();
   const flowers=[[-55,57],[-52,53],[-49,50],[-46,46],[-42,43],[-39,39],[-35,36],[-31,33],[-28,29],[-23,27],[-19,25],[-15,22]];
   for(let i=0;i<flowers.length;i++){
     const [x,z]=flowers[i],side=i%2?-1:1,fx=x+side*(2.0+(i%3)*.55),fz=z-side*.8,gy=groundAt(fx,fz);
     if(gy!==null)await decor('flowers.glb',{x:fx,z:fz,topY:gy+.025,targetXZ:1.15+(i%3)*.18,rotationY:(i*.73)%6.28});
   }
   for(const [x,z,size] of [[-57,51,2.2],[-47,39,1.7],[-34,30,1.8],[-22,22,1.6]]){
     const gy=groundAt(x,z);if(gy!==null)await decor('rocks.glb',{x,z,topY:gy+.02,targetXZ:size});
   }
   const sy=groundAt(-53,52);if(sy!==null)await decor('sign.glb',{x:-53,z:52,topY:sy+.03,targetXZ:2.35,rotationY:.55});
   window.__pass17PortalMeadowDressed=true;document.documentElement.dataset.meadowDressed='1';
 }
 async function build(){
   setPhase('Shaping continuous Prism Valley terrain…',12);buildTerrain();
   await assets.prewarm(['platform-fortified.glb','block-grass-overhang-large.glb','spring.glb']);
   setPhase('Blocking the approved Prism Valley V2 map…',28);
   const bankL={x:-12,z:20},bankR={x:11,z:18};const bridgeY=Math.max(terrainHeight(bankL.x,bankL.z),terrainHeight(bankR.x,bankR.z))+.34;
   // The fortified kit piece supplies the bridge silhouette. The visible stone deck is the real walkable surface
   // and slopes continuously from each bank to the centre instead of creating a hidden collision step.
   await decor('platform-fortified.glb',{x:0,z:19,topY:bridgeY,targetXZ:26,rotationY:Math.PI/2});
   const bridgeMat=new THREE.MeshStandardMaterial({color:0x8b9290,roughness:.92,metalness:0,side:THREE.DoubleSide});
   function addBridgeHalf(a,b,width,name){
     const dx=b.x-a.x,dz=b.z-a.z,len=Math.max(.001,Math.hypot(dx,dz)),nx=-dz/len*width*.5,nz=dx/len*width*.5;
     const geo=new THREE.BufferGeometry();
     geo.setAttribute('position',new THREE.Float32BufferAttribute([
       a.x+nx,a.y,a.z+nz, a.x-nx,a.y,a.z-nz,
       b.x+nx,b.y,b.z+nz, b.x-nx,b.y,b.z-nz
     ],3));
     geo.setIndex([0,1,2,2,1,3]);geo.computeVertexNormals();
     const mesh=new THREE.Mesh(geo,bridgeMat);mesh.receiveShadow=!mobile;mesh.name=name;root.add(mesh);walkMeshes.push(mesh);return mesh;
   }
   const leftBridgeY=terrainHeight(-12,20)+.06,rightBridgeY=terrainHeight(11,18)+.06;
   addBridgeHalf({x:-12,z:20,y:leftBridgeY},{x:0,z:19,y:bridgeY},7.5,'creek-crossing-stone-deck-left');
   addBridgeHalf({x:0,z:19,y:bridgeY},{x:11,z:18,y:rightBridgeY},7.5,'creek-crossing-stone-deck-right');
   const s1=await decor('spring.glb',{x:-17,z:13,topY:terrainHeight(-17,13)+.10,targetXZ:2.5});springs.push({root:s1.root,x:-17,z:13,target:{x:-25,z:2},strengthY:7.2,strengthForward:8.8,mandatory:false});
   const dShelf=terrainHeight(-31,-31)+4.7;
   await place('block-grass-overhang-large.glb',{x:-31,z:-31,topY:dShelf,targetXZ:15});
   await place('block-grass-overhang-large.glb',{x:-38,z:-39,topY:dShelf+.25,targetXZ:14});
   await place('block-grass-overhang-large.glb',{x:-31,z:-49,topY:dShelf+.45,targetXZ:14});
   // Two real grass terraces descend from the high mastery shelf back to the continuous hillside.
   // Their top faces are visible, walkable, and overlap enough to avoid a gap or blind drop.
   await place('block-grass-large.glb',{x:-25,z:-47,topY:dShelf-.25,targetXZ:10});
   await place('block-grass-large.glb',{x:-20,z:-45,topY:dShelf-1.15,targetXZ:10});
   // Keep the spring physically clear of the upper overhang. The player approaches on hillside terrain,
   // launches through open air, then lands on the mastery shelf; no stacked layer exists under the spring.
   const s2=await decor('spring.glb',{x:-27,z:-22,topY:terrainHeight(-27,-22)+.10,targetXZ:2.5});springs.push({root:s2.root,x:-27,z:-22,target:{x:-31,z:-31},strengthY:8.8,strengthForward:10.2,mandatory:false});
   route([
    {x:-49,z:57},{x:-44,z:50},{x:-38,z:43},{x:-32,z:36},{x:-25,z:29},{x:-18,z:23},{x:-12,z:20},
    {x:0,z:19,y:bridgeY},{x:11,z:18},{x:17,z:13},{x:24,z:8},{x:30,z:2},{x:34,z:-6},{x:31,z:-14},{x:27,z:-21},
    {x:25,z:-27},{x:23,z:-33},{x:21,z:-39},{x:19,z:-44},{x:17,z:-50},{x:14,z:-56},{x:10,z:-62},{x:6,z:-69}
   ]);
   route([
    {x:-16,z:20},{x:-20,z:12},{x:-23,z:4},{x:-27,z:-5},{x:-30,z:-14},
    {x:-29.2,z:-16},{x:-28.5,z:-18},{x:-27.8,z:-20},{x:-27,z:-22}
   ],true);
   route([{x:-31,z:-31,y:dShelf},{x:-38,z:-39,y:dShelf+.25},{x:-31,z:-49,y:dShelf+.45}],true);
   route([
    {x:-31,z:-49,y:dShelf+.45},{x:-25,z:-47,y:dShelf-.25},{x:-20,z:-45,y:dShelf-1.15},
    {x:-14,z:-44},{x:-8,z:-42},{x:-5,z:-41.7},{x:-2,z:-41.3},{x:1,z:-41},{x:4,z:-40.5},
    {x:7,z:-40},{x:10,z:-39.7},{x:13,z:-39.4},{x:16,z:-39.1},{x:18,z:-39}
   ],true);
   route([{x:30,z:2},{x:39,z:0},{x:44,z:-8},{x:40,z:-17},{x:32,z:-22},{x:27,z:-21}],true);
   route([{x:24,z:-34},{x:31,z:-39},{x:33,z:-47},{x:27,z:-53},{x:18,z:-50}],true);
   route([{x:21,z:-39},{x:28,z:-43},{x:31,z:-49},{x:24,z:-56},{x:15,z:-57}],true);
   refreshBounds();
   const spawn={x:-49,z:57,y:groundAt(-49,57)??.5},tube={x:6,z:-69,y:(groundAt(6,-69)??10)+.1};
   const checkpoints=[spawn,{x:25,z:8,y:groundAt(25,8)??2},{x:21,z:-39,y:groundAt(21,-39)??7},{x:12,z:-58,y:groundAt(12,-58)??9}];
   const enemySpawns=[
    {x:28,z:5,y:groundAt(28,5)??2,kind:'character-oobi.glb'},
    {x:35,z:-13,y:groundAt(35,-13)??2,kind:'character-oodi.glb'},
    {x:20,z:-38,y:groundAt(20,-38)??7,kind:'character-oozi.glb'},
    {x:28,z:-47,y:groundAt(28,-47)??7,kind:'character-oobi.glb'},
    {x:14,z:-58,y:groundAt(14,-58)??9,kind:'character-oodi.glb'}
   ];
   window.__pass17ContinuousTerrain=true;document.documentElement.dataset.continuousTerrain='1';window.__pass17DecorDeferred=true;
   return {spawn,tube,enemySpawns,checkpoints,zones:[
    {id:'meadow',name:'PORTAL MEADOW',x:-45,z:50,r:25},
    {id:'creek',name:'CREEK CROSSING',x:-5,z:19,r:22},
    {id:'works',name:'RIVERWORKS',x:31,z:-7,r:27},
    {id:'cliffs',name:'CLOVER CLIFFS',x:-29,z:-26,r:30},
    {id:'ruins',name:'RUIN COURTYARD',x:22,z:-41,r:24},
    {id:'ridge',name:'PRISM RIDGE',x:9,z:-62,r:22}
   ]};
 }
 async function decorate(){if(decorated)return;decorated=true;await assets.prewarm(['coin-gold.glb','jewel.glb','chest.glb','heart.glb','tree.glb','tree-pine.glb','flowers.glb','rocks.glb','arrow.glb','sign.glb']);
   await decorateConceptLandmarks();
   await decoratePortalMeadow();
   const trees=[[-58,54],[-52,38],[-37,31],[-20,31],[-7,30],[16,28],[43,14],[48,-10],[40,-30],[30,-58],[7,-80],[-18,-69],[-44,-52],[-52,-25],[-44,-3],[-28,9]];
   for(let i=0;i<trees.length;i++){const [x,z]=trees[i],gy=groundAt(x,z);if(gy!==null)await decor(i%3?'tree-pine.glb':'tree.glb',{x,z,topY:gy+.03,targetXZ:i%3?5:6})}
   for(const [x,z] of [[-45,45],[-20,27],[8,22],[39,5],[38,-24],[-15,-20],[-40,-34],[16,-48],[4,-61]]){const gy=groundAt(x,z);if(gy!==null)await decor('rocks.glb',{x,z,topY:gy+.03,targetXZ:3})}
   const coins=[[-48,55],[-42,48],[-36,41],[-29,34],[-22,27],[-14,21],[4,19],[14,15],[22,9],[30,2],[33,-8],[29,-17],[25,-27],[22,-37],[19,-47],[14,-56],[8,-65]];
   for(const [x,z] of coins){const gy=groundAt(x,z);if(gy===null)continue;const c=await decor('coin-gold.glb',{x,z,bottomY:gy+.8,targetXZ:.55});collectibles.push({type:'coin',root:c.root,x,z,baseY:c.root.position.y,taken:false})}
   for(const [x,z] of [[-31,-31],[-38,-39],[-31,-49],[44,-8],[33,-47]]){const gy=groundAt(x,z);if(gy===null)continue;const q=await decor('jewel.glb',{x,z,bottomY:gy+.9,targetXZ:.62});collectibles.push({type:'gem',root:q.root,x,z,baseY:q.root.position.y,taken:false})}
   const cy=groundAt(-31,-49);if(cy!==null){const ch=await decor('chest.glb',{x:-31,z:-49,bottomY:cy+.12,targetXZ:1.8});collectibles.push({type:'chest',root:ch.root,x:-31,z:-49,baseY:ch.root.position.y,taken:false,rewardGems:3})}
   window.__pass17DecorReady=true;document.documentElement.dataset.decor='1';
 }
 function probe(segs){const failures=[];let samples=0;for(const seg of segs){const len=Math.hypot(seg.b.x-seg.a.x,seg.b.z-seg.a.z),n=Math.max(2,Math.ceil(len/.6));let prev=seg.a.y;for(let i=0;i<=n;i++){const t=i/n,x=THREE.MathUtils.lerp(seg.a.x,seg.b.x,t),z=THREE.MathUtils.lerp(seg.a.z,seg.b.z,t),target=THREE.MathUtils.lerp(seg.a.y??prev??0,seg.b.y??prev??0,t),ys=groundHits(x,z);samples++;if(!ys.length){failures.push({reason:'hole',x,z});continue}let yy=ys[0],best=Math.abs(yy-target);for(const y of ys){const d=Math.abs(y-target);if(d<best){best=d;yy=y}}if(best>1.15){failures.push({reason:'wrong-layer',x,z,target,to:yy});prev=yy;continue}if(prev!==null&&Math.abs(yy-prev)>.95)failures.push({reason:'step',x,z,from:prev,to:yy});prev=yy}}return {ok:failures.length===0,samples,failures:failures.slice(0,20)}}
 function validateRoutes(){return {main:probe(routeSegments),optional:probe(optionalSegments)}}
 function update(dt,t){for(const c of collectibles){if(c.taken)continue;c.root.rotation.y+=dt*(c.type==='coin'?2.5:1.2);if(c.type!=='chest')c.root.position.y=c.baseY+Math.sin(t*2.2+c.x*.08)*.07}if(water)water.material.opacity=.86+.04*Math.sin(t*.8)}
 return {root,walkMeshes,springs,hazards,collectibles,build,decorate,checkpointDecor:async()=>{await decorateConceptLandmarks();await decoratePortalMeadow();return {landmarks:window.__pass17ConceptLandmarksReady===true,meadow:window.__pass17PortalMeadowDressed===true}},groundAt,refreshBounds,validateRoutes,update,getBounds:()=>bounds};
}
