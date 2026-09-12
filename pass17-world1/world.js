import * as THREE from 'three';

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
 return {root,walkMeshes,springs,hazards,collectibles,build,decorate,groundAt,refreshBounds,validateRoutes,update,getBounds:()=>bounds};
}
