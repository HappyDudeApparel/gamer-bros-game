import * as THREE from 'three';

export function createPrismValleyWorld({scene,assets,mobile=false,setPhase=()=>{}}){
  const root=new THREE.Group();root.name='pass17-prism-valley-v2';scene.add(root);
  const walkMeshes=[],springs=[],hazards=[],collectibles=[],routeSegments=[],optionalSegments=[],scenery=[];
  const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);let bounds=new THREE.Box3(),decorated=false;
  const grassMat=new THREE.MeshStandardMaterial({color:0x71b95b,roughness:.82,metalness:0});
  const grassHiMat=new THREE.MeshStandardMaterial({color:0x8fd66a,roughness:.78});
  const cliffMat=new THREE.MeshStandardMaterial({color:0x777b72,roughness:.92,flatShading:true});
  const pathMat=new THREE.MeshStandardMaterial({color:0xc99a58,roughness:.95});
  const stoneMat=new THREE.MeshStandardMaterial({color:0x747b7c,roughness:.92,flatShading:true});
  const stoneHiMat=new THREE.MeshStandardMaterial({color:0x9aa09c,roughness:.86,flatShading:true});
  const woodMat=new THREE.MeshStandardMaterial({color:0x7c4b29,roughness:.9});
  const metalMat=new THREE.MeshStandardMaterial({color:0x315769,roughness:.36,metalness:.62});
  const metalBandMat=new THREE.MeshStandardMaterial({color:0x6aa8bb,roughness:.28,metalness:.72});
  const waterMat=new THREE.MeshStandardMaterial({color:0x36aee5,roughness:.2,metalness:.06,transparent:true,opacity:.82,emissive:0x0b4e74,emissiveIntensity:.12,side:THREE.DoubleSide});
  const foamMat=new THREE.MeshBasicMaterial({color:0xdffbff,transparent:true,opacity:.72,side:THREE.DoubleSide,depthWrite:false});
  const bannerBlue=new THREE.MeshStandardMaterial({color:0x2766ad,roughness:.65});
  const bannerPurple=new THREE.MeshStandardMaterial({color:0x7649a6,roughness:.65});
  const crystalCyan=new THREE.MeshStandardMaterial({color:0x5de8ff,emissive:0x29b9ef,emissiveIntensity:.7,roughness:.22,transparent:true,opacity:.86});
  const crystalPink=new THREE.MeshStandardMaterial({color:0xff62cf,emissive:0xc6248e,emissiveIntensity:.65,roughness:.22,transparent:true,opacity:.86});
  function meshes(g){const a=[];g.traverse(o=>{if(o.isMesh)a.push(o)});return a}
  function groundHits(x,z){ray.set(new THREE.Vector3(x,140,z),down);return ray.intersectObjects(walkMeshes,false).map(h=>h.point.y)}
  function groundAt(x,z,maxY=Infinity){const ys=groundHits(x,z);if(!ys.length)return null;if(!Number.isFinite(maxY))return ys[0];for(const y of ys)if(y<=maxY+.08)return y;return null}
  function refreshBounds(){bounds.setFromObject(root);return bounds}
  function addRoute(a,b,opt=false){const aa={...a},bb={...b};if(aa.y==null)aa.y=groundAt(aa.x,aa.z);if(bb.y==null)bb.y=groundAt(bb.x,bb.z);(opt?optionalSegments:routeSegments).push({a:aa,b:bb})}
  function terrain(name,pts,y,depth=5,mat=grassMat){
    const shape=new THREE.Shape();shape.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)shape.lineTo(pts[i][0],pts[i][1]);shape.closePath();
    const top=new THREE.Mesh(new THREE.ShapeGeometry(shape),mat);top.rotation.x=-Math.PI/2;top.position.y=y;top.name=`terrain-top:${name}`;top.receiveShadow=!mobile;top.castShadow=false;root.add(top);walkMeshes.push(top);
    const sidePos=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];sidePos.push(a[0],y,a[1], b[0],y-depth,b[1], b[0],y,b[1], a[0],y,a[1], a[0],y-depth,a[1], b[0],y-depth,b[1]);}
    const sides=new THREE.Mesh(new THREE.BufferGeometry(),cliffMat);sides.geometry.setAttribute('position',new THREE.Float32BufferAttribute(sidePos,3));sides.geometry.computeVertexNormals();sides.name=`terrain-cliff:${name}`;sides.receiveShadow=!mobile;sides.castShadow=!mobile;root.add(sides);scenery.push(sides);return top;
  }
  function deck(name,x,z,w,d,y,material=stoneMat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,.55,d),material);m.position.set(x,y-.275,z);m.name=name;m.castShadow=!mobile;m.receiveShadow=true;root.add(m);walkMeshes.push(m);return m}
  function railLine(x1,z1,x2,z2,y,count=6){for(let i=0;i<=count;i++){const t=i/count,x=THREE.MathUtils.lerp(x1,x2,t),z=THREE.MathUtils.lerp(z1,z2,t);const p=new THREE.Mesh(new THREE.BoxGeometry(.16,1.05,.16),woodMat);p.position.set(x,y+.5,z);root.add(p)}const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),r=new THREE.Mesh(new THREE.BoxGeometry(.12,.14,len),woodMat);r.position.set((x1+x2)/2,y+.88,(z1+z2)/2);r.rotation.y=Math.atan2(dx,dz);root.add(r)}
  function pathRibbon(points,width=.85,y=.04){for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);const m=new THREE.Mesh(new THREE.BoxGeometry(width,.05,len),pathMat);m.position.set((a[0]+b[0])/2,(a[2]??0)+y,(a[1]+b[1])/2);m.rotation.y=Math.atan2(dx,dz);root.add(m);scenery.push(m)}}
  function waterStrip(x,z,w,d,y=-1.55){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d,1,1),waterMat);m.rotation.x=-Math.PI/2;m.position.set(x,y,z);root.add(m);scenery.push(m);return m}
  function waterfall(x,yTop,z,w,h,rotY=0){const g=new THREE.Group();g.position.set(x,yTop-h/2,z);g.rotation.y=rotY;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h,1,1),waterMat);m.position.z=.02;g.add(m);const f=new THREE.Mesh(new THREE.PlaneGeometry(w*.9,.45),foamMat);f.position.set(0,-h/2+.12,.04);g.add(f);root.add(g);scenery.push(g);return g}
  function cylinderBetween(a,b,r,material=metalMat){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),mid=A.clone().add(B).multiplyScalar(.5),dir=B.clone().sub(A),len=dir.length();const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,18),material);m.position.copy(mid);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());m.castShadow=!mobile;m.receiveShadow=true;root.add(m);return m}
  function pipeRun(points,r=.52){for(let i=0;i<points.length-1;i++){cylinderBetween(points[i],points[i+1],r,metalMat);const A=points[i],band=new THREE.Mesh(new THREE.TorusGeometry(r*1.04,.07,7,18),metalBandMat);band.position.set(A[0],A[1],A[2]);const d=new THREE.Vector3(points[i+1][0]-A[0],points[i+1][1]-A[1],points[i+1][2]-A[2]).normalize();band.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d);root.add(band)}}
  function stoneArch(x,z,y,scale=1,rot=0,banner=false){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;const add=(geo,mat,pos)=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=!mobile;m.receiveShadow=true;g.add(m);return m};add(new THREE.BoxGeometry(1.15*scale,4.2*scale,1.25*scale),stoneMat,[-2.1*scale,2.1*scale,0]);add(new THREE.BoxGeometry(1.15*scale,4.2*scale,1.25*scale),stoneMat,[2.1*scale,2.1*scale,0]);const arch=new THREE.Mesh(new THREE.TorusGeometry(2.1*scale,.58*scale,8,24,Math.PI),stoneHiMat);arch.rotation.z=Math.PI;arch.position.y=4.15*scale;arch.castShadow=!mobile;g.add(arch);if(banner){const b=add(new THREE.PlaneGeometry(1.1*scale,2.0*scale),bannerPurple,[0,3.0*scale,.68*scale]);b.material.side=THREE.DoubleSide}root.add(g);scenery.push(g);return g}
  function crystal(x,z,y,h=3,pink=false){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.8,0),pink?crystalPink:crystalCyan);m.scale.set(1,h/.8,.85);m.position.set(x,y+h,z);m.castShadow=!mobile;root.add(m);return m}
  async function asset(name,opts={}){const p=await assets.instantiateStatic(name,{...opts,parent:root,walkMeshes:opts.walkable?walkMeshes:null});scenery.push(p.root);return p}
  async function build(){
    setPhase('Shaping seamless Portal Meadow…',12);
    // A — Portal Meadow: one broad irregular mass, not square tiles.
    terrain('portal-meadow',[[-62,72],[-48,78],[-25,72],[-18,60],[-20,43],[-34,34],[-54,39],[-66,54]],.55,6,grassHiMat);
    terrain('meadow-overlook',[[-60,42],[-51,36],[-39,37],[-37,45],[-45,51],[-58,49]],2.35,7);
    pathRibbon([[-54,68,.55],[-47,58,.55],[-39,50,.55],[-31,43,.55],[-24,35,.55]]);
    setPhase('Cutting the creek and crossing…',24);
    // Central ravine water establishes the whole world composition.
    waterStrip(-3,3,17,125,-1.65);waterStrip(9,-29,24,52,-1.72);waterfall(4,1.0,28,10,3.0);waterfall(10,1.2,-14,12,3.2);
    terrain('creek-west',[[-38,40],[-20,43],[-12,32],[-14,16],[-28,10],[-42,19]],.85,7);
    terrain('creek-east',[[9,31],[24,32],[34,22],[32,7],[19,1],[8,11]],1.05,7);
    deck('creek-fortified-bridge',-2,23,22,7,1.18,stoneHiMat);railLine(-12,19.8,8,19.8,1.18,8);railLine(-12,26.2,8,26.2,1.18,8);
    stoneArch(-2,23,-1.45,.78,Math.PI/2,false);
    addRoute({x:-54,z:68,y:.55},{x:-31,z:43,y:.55});addRoute({x:-31,z:43,y:.55},{x:-22,z:30,y:.85});addRoute({x:-12,z:23,y:1.18},{x:8,z:23,y:1.18});addRoute({x:8,z:23,y:1.18},{x:18,z:18,y:1.05});
    const s1=await asset('spring.glb',{x:-15,z:15,topY:.98,targetXZ:2.7});springs.push({root:s1.root,x:-15,z:15,target:{x:-5,z:5},strengthY:7.5,strengthForward:9.2,mandatory:false});
    // B spring shortcut landing: visible natural shelf.
    terrain('spring-shelf',[[-9,9],[2,9],[6,1],[1,-7],[-10,-5],[-15,2]],3.1,6);addRoute({x:-6,z:5,y:3.1},{x:0,z:-3,y:3.1},true);
    setPhase('Building Riverworks landmark…',38);
    // C — Riverworks east bank.
    terrain('riverworks-low',[[17,20],[39,19],[49,7],[47,-17],[35,-27],[18,-20],[11,-4]],1.7,8);
    terrain('riverworks-upper',[[34,5],[55,3],[58,-21],[49,-34],[31,-31],[27,-14]],4.1,9);
    deck('riverworks-walk-1',27,-4,22,5,2.08,woodMat);railLine(17,-6.3,37,-6.3,2.08,8);railLine(17,-1.7,37,-1.7,2.08,8);
    deck('riverworks-walk-2',41,-20,19,4.5,4.5,woodMat);railLine(32,-22,50,-22,4.5,7);
    pipeRun([[20,1.0,9],[33,1.0,9],[33,2.2,-8],[47,2.2,-8],[47,3.2,-25]],.58);pipeRun([[22,.2,-16],[35,.2,-16],[35,1.8,-29],[50,1.8,-29]],.46);
    waterfall(20,1.2,-21,9,3.5);waterfall(48,3.5,-30,8,5.0);
    addRoute({x:18,z:18,y:1.05},{x:22,z:10,y:1.7});addRoute({x:22,z:10,y:1.7},{x:30,z:-3,y:2.08});addRoute({x:30,z:-3,y:2.08},{x:38,z:-15,y:4.1});addRoute({x:38,z:-15,y:4.1},{x:33,z:-27,y:4.1});
    // Pipe loop is an authored high optional shelf around the actual pipe landmark.
    deck('pipe-loop-a',49,-12,5,15,5.05,woodMat);deck('pipe-loop-b',44,-29,15,4.5,5.05,woodMat);addRoute({x:49,z:-5,y:5.05},{x:49,z:-19,y:5.05},true);addRoute({x:49,z:-19,y:5.05},{x:38,z:-29,y:5.05},true);
    setPhase('Raising Clover Cliffs…',52);
    // D — northwest terraced climb with overlapping irregular land masses.
    terrain('clover-lower',[[12,-18],[28,-23],[28,-39],[18,-50],[-1,-50],[-12,-39],[-8,-24]],3.3,9);
    terrain('clover-mid',[[7,-41],[20,-47],[18,-63],[4,-72],[-15,-68],[-23,-55],[-14,-43]],5.55,10);
    terrain('clover-high',[[-15,-58],[1,-68],[-3,-83],[-19,-89],[-36,-81],[-42,-67],[-32,-57]],7.8,12);
    pathRibbon([[22,-27,3.3],[14,-38,3.3],[8,-47,5.55],[-3,-57,5.55],[-15,-68,7.8],[-26,-75,7.8]],1.0,.06);
    addRoute({x:33,z:-27,y:4.1},{x:22,z:-29,y:3.3});addRoute({x:22,z:-29,y:3.3},{x:10,z:-44,y:5.55});addRoute({x:10,z:-44,y:5.55},{x:-5,z:-58,y:5.55});addRoute({x:-5,z:-58,y:5.55},{x:-21,z:-73,y:7.8});
    const s2=await asset('spring.glb',{x:-7,z:-55,topY:5.7,targetXZ:2.7});springs.push({root:s2.root,x:-7,z:-55,target:{x:-24,z:-63},strengthY:8.8,strengthForward:8.1,mandatory:false});
    terrain('clover-mastery',[[-30,-60],[-20,-62],[-18,-72],[-27,-79],[-39,-76],[-42,-66]],11.7,8);terrain('clover-lookout',[[-43,-73],[-34,-79],[-34,-89],[-46,-94],[-55,-85],[-53,-76]],12.0,9);addRoute({x:-26,z:-66,y:11.7},{x:-37,z:-74,y:11.7},true);addRoute({x:-37,z:-74,y:11.7},{x:-45,z:-83,y:12},true);
    setPhase('Assembling Ruin Courtyard…',67);
    // E — northeast/upper courtyard, three traversals through one place.
    terrain('ruin-court',[[2,-66],[23,-72],[47,-68],[57,-56],[52,-38],[34,-32],[15,-39],[4,-51]],8.2,11);
    terrain('ruin-high',[[36,-57],[55,-60],[62,-72],[55,-84],[39,-82],[31,-70]],11.3,10);
    deck('ruin-center',28,-55,24,15,8.55,stoneHiMat);stoneArch(17,-57,8.25,.85,0,true);stoneArch(30,-58,8.25,1.0,0,true);stoneArch(44,-58,8.25,.82,0,true);stoneArch(48,-72,11.25,.72,0,true);
    addRoute({x:-21,z:-73,y:7.8},{x:3,z:-67,y:8.2});addRoute({x:3,z:-67,y:8.2},{x:20,z:-57,y:8.55});addRoute({x:20,z:-57,y:8.55},{x:39,z:-52,y:8.2});
    // Lower bypass follows the ravine edge; high route crosses ruin arches/ledge.
    terrain('ruin-lower-bypass',[[5,-55],[16,-48],[23,-38],[15,-30],[2,-37],[-4,-46]],6.65,8);addRoute({x:7,z:-55,y:6.65},{x:15,z:-44,y:6.65},true);addRoute({x:15,z:-44,y:6.65},{x:19,z:-36,y:6.65},true);
    deck('ruin-high-route',40,-66,7,22,11.55,stoneHiMat);addRoute({x:40,z:-58,y:11.55},{x:40,z:-76,y:11.55},true);
    setPhase('Carving final Prism Ridge…',81);
    // F — final ridge centered beyond the courtyard, visible from spawn through the valley gap.
    terrain('prism-ridge',[[15,-78],[33,-85],[36,-105],[22,-117],[-1,-115],[-14,-101],[-10,-86]],11.0,14,grassHiMat);
    terrain('portal-court',[[0,-101],[24,-103],[28,-117],[16,-127],[-5,-126],[-13,-116]],13.1,10,grassHiMat);
    deck('portal-stairs',9,-103,10,22,11.45,stoneHiMat);deck('portal-plaza',9,-117,24,15,13.42,stoneHiMat);
    crystal(-2,-116,13.4,3.4,false);crystal(20,-116,13.4,3.5,true);crystal(0,-122,13.4,2.5,true);crystal(18,-123,13.4,2.5,false);
    addRoute({x:39,z:-52,y:8.2},{x:28,z:-72,y:11.0});addRoute({x:28,z:-72,y:11.0},{x:19,z:-89,y:11.0});addRoute({x:19,z:-89,y:11.0},{x:9,z:-104,y:11.45});addRoute({x:9,z:-104,y:11.45},{x:9,z:-117,y:13.42});
    // Small visual recovery banks along the creek, not invisible safety geometry.
    terrain('ravine-recovery-west',[[-12,14],[-6,12],[-6,-35],[-13,-39],[-18,-23]],-1.0,3);terrain('ravine-recovery-east',[[5,10],[11,8],[13,-38],[7,-42],[2,-21]],-1.0,3);
    refreshBounds();
    const spawn={x:-54,z:67,y:groundAt(-54,67)??.55},tube={x:9,z:-117,y:(groundAt(9,-117)??13.42)+.08};
    const checkpoints=[spawn,{x:24,z:5,y:groundAt(24,5)??1.7},{x:-2,z:-56,y:groundAt(-2,-56)??5.55},{x:23,z:-56,y:groundAt(23,-56)??8.55}];
    const enemySpawns=[{x:26,z:-5,y:groundAt(26,-5)??2.08,kind:'patrol'},{x:12,z:-45,y:groundAt(12,-45)??5.55,kind:'spiker'},{x:20,z:-58,y:groundAt(20,-58)??8.55,kind:'patrol'},{x:36,z:-55,y:groundAt(36,-55)??8.55,kind:'spiker'},{x:39,z:-71,y:groundAt(39,-71)??11.55,kind:'flyer'}];
    window.__pass17Terrain='continuous-visible';
    return{spawn,tube,enemySpawns,checkpoints,zones:[{id:'meadow',name:'PORTAL MEADOW',x:-45,z:56,r:28},{id:'creek',name:'CREEK CROSSING',x:-5,z:23,r:24},{id:'works',name:'RIVERWORKS',x:35,z:-8,r:32},{id:'cliffs',name:'CLOVER CLIFFS',x:-10,z:-56,r:34},{id:'ruins',name:'RUIN COURTYARD',x:31,z:-57,r:34},{id:'ridge',name:'PRISM RIDGE',x:9,z:-104,r:32}]};
  }
  async function decorate(){if(decorated)return;decorated=true;setPhase('Planting Prism Valley…',90);await assets.prewarm(['coin-gold.glb','jewel.glb','chest.glb','heart.glb','tree.glb','tree-pine.glb','flowers.glb','rocks.glb','sign.glb']);
    const treePts=[[-58,58],[-43,70],[-48,43],[-31,37],[-28,18],[18,28],[39,12],[51,-9],[21,-31],[1,-34],[-17,-48],[-29,-67],[-41,-80],[10,-73],[50,-48],[47,-78],[25,-95],[-6,-99]];for(const [x,z] of treePts){const gy=groundAt(x,z);if(gy===null)continue;await asset(((x+z)%3)?'tree-pine.glb':'tree.glb',{x,z,topY:gy,targetXZ:4.8})}
    for(const [x,z] of [[-48,53],[-25,30],[16,21],[41,-18],[-2,-49],[-31,-77],[12,-69],[48,-64],[21,-96]]){const gy=groundAt(x,z);if(gy!==null)await asset('rocks.glb',{x,z,topY:gy,targetXZ:2.8})}
    const coinPts=[[-53,65],[-47,57],[-39,49],[-30,41],[-22,31],[-12,23],[-3,23],[7,23],[18,17],[23,8],[28,-2],[34,-13],[31,-25],[22,-30],[15,-39],[8,-48],[-2,-56],[-12,-64],[-20,-72],[-8,-67],[3,-66],[14,-61],[24,-57],[35,-53],[37,-66],[31,-78],[24,-88],[17,-97],[10,-106],[9,-116]];
    for(const [x,z] of coinPts){const gy=groundAt(x,z);if(gy===null)continue;const c=await asset('coin-gold.glb',{x,z,bottomY:gy+.8,targetXZ:.55});collectibles.push({type:'coin',root:c.root,x,z,baseY:c.root.position.y,taken:false})}
    for(const [x,z] of [[-27,-67],[-43,-82],[48,-70],[40,-73],[18,-91]]){const gy=groundAt(x,z);if(gy===null)continue;const g=await asset('jewel.glb',{x,z,bottomY:gy+.95,targetXZ:.68});collectibles.push({type:'gem',root:g.root,x,z,baseY:g.root.position.y,taken:false})}
    const cy=groundAt(44,-74);if(cy!==null){const ch=await asset('chest.glb',{x:44,z:-74,bottomY:cy+.12,targetXZ:1.8});collectibles.push({type:'chest',root:ch.root,x:44,z:-74,baseY:ch.root.position.y,taken:false,rewardGems:3})}
    document.documentElement.dataset.decor='1';window.__pass17DecorReady=true;
  }
  function probe(segs){const failures=[];let samples=0;for(const seg of segs){const len=Math.hypot(seg.b.x-seg.a.x,seg.b.z-seg.a.z),n=Math.max(2,Math.ceil(len/.55));let prev=seg.a.y;for(let i=0;i<=n;i++){const t=i/n,x=THREE.MathUtils.lerp(seg.a.x,seg.b.x,t),z=THREE.MathUtils.lerp(seg.a.z,seg.b.z,t),target=THREE.MathUtils.lerp(seg.a.y??prev??0,seg.b.y??prev??0,t),ys=groundHits(x,z);samples++;if(!ys.length){failures.push({reason:'hole',x,z});continue}let yy=ys[0],best=Math.abs(yy-target);for(const y of ys){const d=Math.abs(y-target);if(d<best){best=d;yy=y}}if(best>1.25){failures.push({reason:'wrong-layer',x,z,target,to:yy});prev=yy;continue}if(prev!==null&&Math.abs(yy-prev)>.98)failures.push({reason:'step',x,z,from:prev,to:yy});prev=yy}}return{ok:failures.length===0,samples,failures:failures.slice(0,20)}}
  function validateRoutes(){return{main:probe(routeSegments),optional:probe(optionalSegments)}}
  function update(dt,t){for(const c of collectibles){if(c.taken)continue;c.root.rotation.y+=dt*(c.type==='coin'?2.5:1.15);if(c.type!=='chest')c.root.position.y=c.baseY+Math.sin(t*2.2+c.x*.08)*.07}}
  return{root,walkMeshes,springs,hazards,collectibles,build,decorate,groundAt,refreshBounds,validateRoutes,update,getBounds:()=>bounds};
}
