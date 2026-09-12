import * as THREE from 'three';

export function createPrismValleyWorld({scene,assets,mobile=false,setPhase=()=>{}}){
 const root=new THREE.Group();root.name='pass16-prism-valley';scene.add(root);
 const walkMeshes=[],springs=[],hazards=[],collectibles=[],routeSegments=[],optionalSegments=[],scenery=[];
 const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);let bounds=new THREE.Box3(),decorated=false;
 const meshes=g=>{const a=[];g.traverse(o=>{if(o.isMesh)a.push(o)});return a};
 function groundHits(x,z){ray.set(new THREE.Vector3(x,120,z),down);return ray.intersectObjects(walkMeshes,false).map(h=>h.point.y)}
 function groundAt(x,z,maxY=Infinity){const ys=groundHits(x,z);if(!ys.length)return null;if(!Number.isFinite(maxY))return ys[0];for(const y of ys)if(y<=maxY+.08)return y;return null}
 function surfaceOn(g,x,z){ray.set(new THREE.Vector3(x,120,z),down);const h=ray.intersectObjects(meshes(g),false);return h.length?h[0].point.y:null}
 function refreshBounds(){bounds.setFromObject(root);return bounds}
 function addRoute(a,b,opt=false){const aa={...a},bb={...b};if(aa.y==null)aa.y=groundAt(aa.x,aa.z);if(bb.y==null)bb.y=groundAt(bb.x,bb.z);(opt?optionalSegments:routeSegments).push({a:aa,b:bb})}
 async function place(name,opts={}){return assets.instantiateStatic(name,{...opts,parent:root,walkMeshes:opts.walkable===false?null:walkMeshes})}
 async function decor(name,opts={}){const p=await assets.instantiateStatic(name,{...opts,parent:root,walkMeshes:null});scenery.push(p.root);return p}
 async function ramp(name,a,b,lowY,{span=18,opt=false}={}){const raw=await assets.load(name);raw.scene.updateMatrixWorld(true);const sz=new THREE.Box3().setFromObject(raw.scene).getSize(new THREE.Vector3()),dx=b.x-a.x,dz=b.z-a.z,heading=Math.atan2(dx,dz),axis=sz.x>sz.z?Math.PI/2:0,mid={x:(a.x+b.x)/2,z:(a.z+b.z)/2};const p=await assets.instantiateStatic(name,{x:mid.x,z:mid.z,bottomY:0,targetXZ:span,rotationY:heading+axis,parent:root,walkMeshes});let s=surfaceOn(p.root,a.x+(b.x-a.x)*.22,a.z+(b.z-a.z)*.22),e=surfaceOn(p.root,a.x+(b.x-a.x)*.78,a.z+(b.z-a.z)*.78);if(s===null||e===null)throw new Error(name+' connector miss');if(s>e){p.root.rotation.y+=Math.PI;p.root.updateMatrixWorld(true);const c=new THREE.Box3().setFromObject(p.root).getCenter(new THREE.Vector3());p.root.position.x+=mid.x-c.x;p.root.position.z+=mid.z-c.z;p.root.updateMatrixWorld(true);s=surfaceOn(p.root,a.x+(b.x-a.x)*.22,a.z+(b.z-a.z)*.22);e=surfaceOn(p.root,a.x+(b.x-a.x)*.78,a.z+(b.z-a.z)*.78)}p.root.position.y+=lowY-s;p.root.updateMatrixWorld(true);e=surfaceOn(p.root,a.x+(b.x-a.x)*.78,a.z+(b.z-a.z)*.78);addRoute(a,b,opt);return e}
 async function patch(name,x,z,y,size=18){return place(name,{x,z,topY:y,targetXZ:size})}
 async function buildRecovery(){for(let x=-56;x<=56;x+=28)for(let z=-76;z<=76;z+=28)await patch('block-grass-low-large.glb',x,z,-2.4,28)}
 async function build(){
  setPhase('Loading Prism Valley terrain…',12);
  await assets.prewarm(['block-grass-low-large.glb','block-grass-large.glb','block-grass-long.glb','block-grass-large-slope.glb','block-grass-curve.glb','block-grass-corner.glb','block-grass-overhang-large.glb','platform-fortified.glb','platform-ramp.glb','spring.glb']);
  await buildRecovery(); setPhase('Massing the valley…',28);
  const meadow=.5, creek=.8,works=2.0,cliff=5.0,ruin=7.4,ridge=10.2;
  // A: broad meadow, offset left of the ravine.
  await patch('block-grass-large.glb',-35,55,meadow,26);await patch('block-grass-long.glb',-20,48,meadow,24);await patch('block-grass-large.glb',-24,41,meadow,18);await patch('block-grass-curve.glb',-41,36,meadow,20);await patch('block-grass-corner.glb',-25,32,meadow,18);addRoute({x:-39,z:61},{x:-22,z:47});addRoute({x:-22,z:47},{x:-24,z:33});
  // B: creek crossing curves toward the central ravine.
  await patch('block-grass-large.glb',-12,28,creek,20);await patch('platform-fortified.glb',0,20,creek+.1,21);await patch('block-grass-large.glb',12,14,creek,21);addRoute({x:-24,z:33},{x:-12,z:28});addRoute({x:-12,z:28},{x:0,z:20});addRoute({x:0,z:20},{x:12,z:14});
  const s1=await decor('spring.glb',{x:16,z:9,topY:creek+.12,targetXZ:2.5});springs.push({root:s1.root,x:16,z:9,target:{x:27,z:-2},strengthY:7.4,strengthForward:9.3,mandatory:false});
  // C: Riverworks on east side, looking back across meadow.
  const worksTop=1.6;
  await patch('block-grass-large.glb',15,11,.8,13);
  await patch('block-grass-large.glb',19,8,1.15,13);
  await patch('block-grass-large.glb',22,5,worksTop,14);
  await patch('block-grass-large.glb',24,4,worksTop,22);
  addRoute({x:12,z:14,y:.8},{x:15,z:11,y:.8});
  addRoute({x:15,z:11,y:.8},{x:19,z:8,y:1.15});
  addRoute({x:19,z:8,y:1.15},{x:24,z:4,y:worksTop});
  await patch('block-grass-large.glb',30,-6,worksTop,17);
  await patch('block-grass-large.glb',31,-14,worksTop,17);
  await decor('platform-fortified.glb',{x:33,z:-8,topY:worksTop+.15,targetXZ:19});
  await patch('block-grass-large.glb',29,-22,worksTop,18);
  addRoute({x:24,z:4,y:worksTop},{x:30,z:-6,y:worksTop});
  addRoute({x:30,z:-6,y:worksTop},{x:31,z:-14,y:worksTop});
  addRoute({x:31,z:-14,y:worksTop},{x:29,z:-23,y:worksTop});
  // Riverworks rises into the cliff approach through broad real grass terraces.
  const c1=3.2;
  await patch('block-grass-large.glb',27,-28,worksTop,14);
  await patch('block-grass-large.glb',25,-32,2.0,14);
  await patch('block-grass-large.glb',22,-36,2.4,14);
  await patch('block-grass-large.glb',19,-40,2.8,14);
  await patch('block-grass-large.glb',16,-44,c1,15);
  await patch('block-grass-large.glb',15,-48,c1,20);
  addRoute({x:29,z:-23,y:worksTop},{x:27,z:-28,y:worksTop});
  addRoute({x:27,z:-28,y:worksTop},{x:25,z:-32,y:2.0});
  addRoute({x:25,z:-32,y:2.0},{x:22,z:-36,y:2.4});
  addRoute({x:22,z:-36,y:2.4},{x:19,z:-40,y:2.8});
  addRoute({x:19,z:-40,y:2.8},{x:15,z:-48,y:c1});
  // D: Clover Cliffs swing west around the ravine with real elevation.
  const c2=4.8,c3=6.0;
  await patch('block-grass-large.glb',10,-51,c1,15);
  await patch('block-grass-large.glb',6,-54,3.6,14);
  await patch('block-grass-large.glb',2,-57,4.0,14);
  await patch('block-grass-large.glb',-2,-60,4.4,14);
  await patch('block-grass-large.glb',-8,-63,c2,20);
  addRoute({x:15,z:-48,y:c1},{x:10,z:-51,y:c1});
  addRoute({x:10,z:-51,y:c1},{x:6,z:-54,y:3.6});
  addRoute({x:6,z:-54,y:3.6},{x:2,z:-57,y:4.0});
  addRoute({x:2,z:-57,y:4.0},{x:-2,z:-60,y:4.4});
  addRoute({x:-2,z:-60,y:4.4},{x:-8,z:-63,y:c2});
  await patch('block-grass-large.glb',-14,-62,c2,15);
  await patch('block-grass-large.glb',-18,-59,5.2,14);
  await patch('block-grass-large.glb',-23,-55,5.6,14);
  await patch('block-grass-large.glb',-28,-51,c3,15);
  await patch('block-grass-large.glb',-32,-47,c3,22);
  addRoute({x:-8,z:-63,y:c2},{x:-14,z:-62,y:c2});
  addRoute({x:-14,z:-62,y:c2},{x:-18,z:-59,y:5.2});
  addRoute({x:-18,z:-59,y:5.2},{x:-23,z:-55,y:5.6});
  addRoute({x:-23,z:-55,y:5.6},{x:-32,z:-47,y:c3});
  // Optional mastery shelves above the cliff wall.
  const s2=await decor('spring.glb',{x:-18,z:-60,topY:c2+.12,targetXZ:2.5});springs.push({root:s2.root,x:-18,z:-60,target:{x:-27,z:-70},strengthY:8.6,strengthForward:7.8,mandatory:false});
  const high=c2+5.3;await patch('block-grass-overhang-large.glb',-28,-70,high,15);await patch('block-grass-overhang-large.glb',-38,-62,high+.3,14);await patch('block-grass-overhang-large.glb',-43,-50,high+.5,14);addRoute({x:-28,z:-70},{x:-38,z:-62},true);addRoute({x:-38,z:-62},{x:-43,z:-50},true);
  // E: Ruin Courtyard occupies west/northwest, with broad fight space and two bypasses.
  await patch('block-grass-large.glb',-35,-43,6.2,19);
  await patch('block-grass-large.glb',-38,-40,6.4,19);
  await patch('block-grass-large.glb',-40,-36,6.8,19);
  await patch('block-grass-large.glb',-41,-33,7.1,19);
  await patch('block-grass-large.glb',-42,-30,ruin,25);
  await patch('block-grass-large.glb',-42,-10,ruin,25);
  await patch('block-grass-large.glb',-31,2,ruin,20);
  await decor('platform-fortified.glb',{x:-31,z:2,topY:ruin+.1,targetXZ:20});
  addRoute({x:-32,z:-47,y:c3},{x:-35,z:-43,y:6.2});
  addRoute({x:-35,z:-43,y:6.2},{x:-38,z:-40,y:6.4});
  addRoute({x:-38,z:-40,y:6.4},{x:-40,z:-36,y:6.8});
  addRoute({x:-40,z:-36,y:6.8},{x:-41,z:-33,y:7.1});
  addRoute({x:-41,z:-33,y:7.1},{x:-42,z:-30,y:ruin});
  addRoute({x:-42,z:-30,y:ruin},{x:-42,z:-10,y:ruin});
  addRoute({x:-42,z:-10,y:ruin},{x:-31,z:2,y:ruin});
  // Lower bypass returns near the bridge; upper mastery route drops into courtyard.
  await patch('block-grass-large.glb',-49,-29,7.2,13);
  await patch('block-grass-large.glb',-53,-25,6.9,13);
  await patch('block-grass-large.glb',-55,-20,6.6,14);
  await patch('block-grass-large.glb',-53,-14,6.9,13);
  await patch('block-grass-large.glb',-49,-8,ruin,14);
  addRoute({x:-46,z:-30,y:ruin},{x:-49,z:-29,y:7.2},true);
  addRoute({x:-49,z:-29,y:7.2},{x:-53,z:-25,y:6.9},true);
  addRoute({x:-53,z:-25,y:6.9},{x:-55,z:-20,y:6.6},true);
  addRoute({x:-55,z:-20,y:6.6},{x:-53,z:-14,y:6.9},true);
  addRoute({x:-53,z:-14,y:6.9},{x:-49,z:-8,y:ruin},true);
  // F: final ridge rises behind the starting meadow, closing the spatial loop.
  const r1=8.8,r2=10.2;
  await patch('block-grass-large.glb',-28,7,ruin,15);
  await patch('block-grass-large.glb',-25,12,7.8,14);
  await patch('block-grass-large.glb',-22,17,8.2,14);
  await patch('block-grass-large.glb',-18,22,r1,15);
  await patch('block-grass-large.glb',-15,27,r1,20);
  addRoute({x:-31,z:2,y:ruin},{x:-28,z:7,y:ruin});
  addRoute({x:-28,z:7,y:ruin},{x:-25,z:12,y:7.8});
  addRoute({x:-25,z:12,y:7.8},{x:-22,z:17,y:8.2});
  addRoute({x:-22,z:17,y:8.2},{x:-15,z:27,y:r1});
  await patch('block-grass-large.glb',-10,31,r1,15);
  await patch('block-grass-large.glb',-6,36,9.2,14);
  await patch('block-grass-large.glb',-3,41,9.6,14);
  await patch('block-grass-large.glb',0,45,r2,15);
  await patch('block-grass-large.glb',4,50,r2,22);
  await patch('block-grass-large.glb',4,58,r2,24);
  await decor('platform-fortified.glb',{x:4,z:58,topY:r2+.08,targetXZ:24});
  addRoute({x:-15,z:27,y:r1},{x:-10,z:31,y:r1});
  addRoute({x:-10,z:31,y:r1},{x:-6,z:36,y:9.2});
  addRoute({x:-6,z:36,y:9.2},{x:-3,z:41,y:9.6});
  addRoute({x:-3,z:41,y:9.6},{x:0,z:45,y:r2});
  addRoute({x:0,z:45,y:r2},{x:4,z:58,y:r2});
  refreshBounds();
  const spawn={x:-39,z:59,y:groundAt(-39,59)??meadow},tube={x:4,z:58,y:(groundAt(4,58)??ridge)+.1};
  const checkpoints=[spawn,{x:27,z:-20,y:groundAt(27,-20)??works},{x:-31,z:-45,y:groundAt(-31,-45)??cliff},{x:-40,z:-12,y:groundAt(-40,-12)??ruin}];
  const enemySpawns=[{x:27,z:-4,y:groundAt(27,-4)??works,kind:'character-oobi.glb'},{x:15,z:-47,y:groundAt(15,-47)??cliff,kind:'character-oodi.glb'},{x:-39,z:-28,y:groundAt(-39,-28)??ruin,kind:'character-oozi.glb'},{x:-45,z:-12,y:groundAt(-45,-12)??ruin,kind:'character-oobi.glb'},{x:-20,z:26,y:groundAt(-20,26)??ridge,kind:'character-oodi.glb'}];
  window.__pass16DecorDeferred=true;
  return {spawn,tube,enemySpawns,checkpoints,zones:[{id:'meadow',name:'PORTAL MEADOW',x:-34,z:48,r:28},{id:'creek',name:'CREEK CROSSING',x:0,z:20,r:25},{id:'works',name:'RIVERWORKS',x:28,z:-12,r:30},{id:'cliffs',name:'CLOVER CLIFFS',x:-8,z:-55,r:34},{id:'ruins',name:'RUIN COURTYARD',x:-42,z:-18,r:30},{id:'ridge',name:'PRISM RIDGE',x:-4,z:42,r:30}]};
 }
 async function decorate(y){if(decorated)return;decorated=true;await assets.prewarm(['coin-gold.glb','jewel.glb','chest.glb','heart.glb','tree.glb','tree-pine.glb','flowers.glb','rocks.glb','arrow.glb','sign.glb','saw.glb']);
  const treePts=[[-54,57],[-50,39],[-34,25],[-3,7],[20,23],[43,3],[42,-25],[28,-51],[2,-75],[-24,-78],[-53,-54],[-61,-25],[-58,5],[-42,22],[-18,54],[22,55]];for(const [x,z] of treePts)await decor((x+z)%3?'tree.glb':'tree-pine.glb',{x,z,topY:-2.2,targetXZ:5.5});
  for(const [x,z] of [[-43,45],[-15,35],[8,25],[38,-5],[22,-36],[-2,-54],[-35,-40],[-52,-8],[-28,16],[14,47]])await decor('rocks.glb',{x,z,topY:-2.15,targetXZ:3});
  const coinPts=[[-38,57],[-31,50],[-23,41],[-18,33],[-10,28],[-2,21],[8,17],[16,10],[23,3],[30,-8],[30,-19],[25,-30],[17,-42],[9,-52],[-2,-59],[-15,-59],[-26,-52],[-35,-43],[-41,-31],[-42,-20],[-41,-9],[-34,0],[-27,8],[-20,18],[-13,29],[-5,40],[3,50]];for(const [x,z] of coinPts){const gy=groundAt(x,z);if(gy===null)continue;const c=await decor('coin-gold.glb',{x,z,bottomY:gy+.8,targetXZ:.55});collectibles.push({type:'coin',root:c.root,x,z,baseY:c.root.position.y,taken:false})}
  for(const [x,z] of [[-28,-70],[-38,-62],[-43,-50],[-55,-20]]){const gy=groundAt(x,z);if(gy===null)continue;const g=await decor('jewel.glb',{x,z,bottomY:gy+.9,targetXZ:.62});collectibles.push({type:'gem',root:g.root,x,z,baseY:g.root.position.y,taken:false})}
  const chestPos=[-43,-50],cy=groundAt(...chestPos);if(cy!==null){const ch=await decor('chest.glb',{x:chestPos[0],z:chestPos[1],bottomY:cy+.12,targetXZ:1.8});collectibles.push({type:'chest',root:ch.root,x:chestPos[0],z:chestPos[1],baseY:ch.root.position.y,taken:false,rewardGems:3})}
  const heartY=groundAt(-42,-10);if(heartY!==null){const h=await decor('heart.glb',{x:-42,z:-10,bottomY:heartY+.8,targetXZ:.75});collectibles.push({type:'heart',root:h.root,x:-42,z:-10,baseY:h.root.position.y,taken:false})}
  window.__pass16DecorReady=true;document.documentElement.dataset.decor='1';
 }
 function probe(segs){const failures=[];let samples=0;for(const seg of segs){const len=Math.hypot(seg.b.x-seg.a.x,seg.b.z-seg.a.z),n=Math.max(2,Math.ceil(len/.6));let prev=seg.a.y;for(let i=0;i<=n;i++){const t=i/n,x=THREE.MathUtils.lerp(seg.a.x,seg.b.x,t),z=THREE.MathUtils.lerp(seg.a.z,seg.b.z,t),target=THREE.MathUtils.lerp(seg.a.y??prev??0,seg.b.y??prev??0,t),ys=groundHits(x,z);samples++;if(!ys.length){failures.push({reason:'hole',x,z});continue}let yy=ys[0],best=Math.abs(yy-target);for(const y of ys){const d=Math.abs(y-target);if(d<best){best=d;yy=y}}if(best>1.1){failures.push({reason:'wrong-layer',x,z,target,to:yy});prev=yy;continue}if(prev!==null&&Math.abs(yy-prev)>.95)failures.push({reason:'step',x,z,from:prev,to:yy});prev=yy}}return {ok:failures.length===0,samples,failures:failures.slice(0,18)}}
 function validateRoutes(){return {main:probe(routeSegments),optional:probe(optionalSegments)}}
 function zoneAt(x,z){let best=null,d=1e9;for(const q of (this?.zones||[])){const dd=Math.hypot(x-q.x,z-q.z);if(dd<q.r&&dd<d){best=q;d=dd}}return best}
 function update(dt,t){for(const c of collectibles){if(c.taken)continue;c.root.rotation.y+=dt*(c.type==='coin'?2.5:1.2);if(c.type!=='chest')c.root.position.y=c.baseY+Math.sin(t*2.2+c.x*.08)*.07}}
 return {root,walkMeshes,springs,hazards,collectibles,build,decorate,groundAt,refreshBounds,validateRoutes,update,getBounds:()=>bounds};
}
