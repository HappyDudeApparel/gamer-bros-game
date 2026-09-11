import * as THREE from 'three';

export function createLevelLabWorld({scene,assets,mobile=false,setPhase=()=>{}}){
  const root=new THREE.Group();root.name='pass14-springline-terrace';scene.add(root);
  const walkMeshes=[];const ray=new THREE.Raycaster();const down=new THREE.Vector3(0,-1,0);
  const routeSegments=[];const optionalSegments=[];const springs=[];const hazards=[];const collectibles=[];const scenery=[];
  let bounds=new THREE.Box3();

  function rootMeshes(group){const a=[];group.traverse(o=>{if(o.isMesh)a.push(o)});return a}
  function surfaceOn(group,x,z){const ms=rootMeshes(group);ray.set(new THREE.Vector3(x,80,z),down);const h=ray.intersectObjects(ms,false);return h.length?h[0].point.y:null}
  function groundAt(x,z){ray.set(new THREE.Vector3(x,80,z),down);const h=ray.intersectObjects(walkMeshes,false);return h.length?h[0].point.y:null}
  function refreshBounds(){bounds.setFromObject(root);return bounds}
  function addRoute(a,b,optional=false){(optional?optionalSegments:routeSegments).push({a:{...a},b:{...b}})}

  async function place(name,opts={}){
    const p=await assets.instantiateStatic(name,{...opts,parent:root,walkMeshes:opts.walkable===false?null:walkMeshes});
    return p;
  }
  async function placeDecor(name,opts={}){
    const p=await assets.instantiateStatic(name,{...opts,parent:root,walkMeshes:null});
    scenery.push(p.root);return p;
  }
  async function placeRamp(name,start,end,lowY,{span=16,optional=false}={}){
    const raw=await assets.load(name);raw.scene.updateMatrixWorld(true);const rawSize=new THREE.Box3().setFromObject(raw.scene).getSize(new THREE.Vector3());
    const dx=end.x-start.x,dz=end.z-start.z,heading=Math.atan2(dx,dz),axisOffset=rawSize.x>rawSize.z?Math.PI/2:0;
    const mid={x:(start.x+end.x)/2,z:(start.z+end.z)/2};
    const p=await assets.instantiateStatic(name,{x:mid.x,z:mid.z,bottomY:0,targetXZ:span,rotationY:heading+axisOffset,parent:root,walkMeshes});
    const spt={x:THREE.MathUtils.lerp(start.x,end.x,.22),z:THREE.MathUtils.lerp(start.z,end.z,.22)};
    const ept={x:THREE.MathUtils.lerp(start.x,end.x,.78),z:THREE.MathUtils.lerp(start.z,end.z,.78)};
    let hs=surfaceOn(p.root,spt.x,spt.z),he=surfaceOn(p.root,ept.x,ept.z);
    if(hs===null||he===null) throw new Error(`Ramp ${name} does not cover its authored connector points`);
    if(hs>he){
      p.root.rotation.y+=Math.PI;p.root.updateMatrixWorld(true);
      const box=new THREE.Box3().setFromObject(p.root),ctr=box.getCenter(new THREE.Vector3());
      p.root.position.x+=mid.x-ctr.x;p.root.position.z+=mid.z-ctr.z;p.root.updateMatrixWorld(true);
      hs=surfaceOn(p.root,spt.x,spt.z);he=surfaceOn(p.root,ept.x,ept.z);
    }
    if(hs===null||he===null) throw new Error(`Ramp ${name} lost connector coverage after orientation`);
    p.root.position.y+=lowY-hs;p.root.updateMatrixWorld(true);he=surfaceOn(p.root,ept.x,ept.z);
    addRoute(start,end,optional);
    return {placement:p,highY:he,lowSample:spt,highSample:ept};
  }

  async function buildRecoveryFloor(){
    const rows=[30,10,-10,-30,-50,-70,-90,-110,-130];
    for(const z of rows){
      await place('block-grass-low-large.glb',{x:-11,z,topY:-1.35,targetXZ:22});
      await place('block-grass-low-large.glb',{x:11,z,topY:-1.35,targetXZ:22});
    }
  }

  async function build(){
    setPhase('Loading the real platform kit…',14);
    await assets.prewarm([
      'block-grass-low-large.glb','block-grass-large.glb','block-grass-long.glb','block-grass-large-slope.glb','block-grass-overhang-large.glb',
      'platform-ramp.glb','platform.glb','platform-fortified.glb','spring.glb','saw.glb',
      'coin-gold.glb','jewel.glb','chest.glb','heart.glb','arrow.glb','sign.glb','tree.glb','tree-pine.glb','flowers.glb','grass.glb','rocks.glb'
    ]);
    setPhase('Authoring Springline Terrace…',28);
    await buildRecoveryFloor();

    const startTop=.45;
    await place('block-grass-large.glb',{x:0,z:28,topY:startTop,targetXZ:22});
    await place('block-grass-long.glb',{x:-1,z:17,topY:startTop,targetXZ:18});
    await place('block-grass-large.glb',{x:-1,z:11,topY:startTop,targetXZ:9});
    addRoute({x:0,z:34},{x:-1,z:11});

    const r1=await placeRamp('block-grass-large-slope.glb',{x:-1,z:11},{x:-6,z:-4},startTop,{span:19});
    const terrace1=r1.highY;
    await place('block-grass-large.glb',{x:-6,z:-10,topY:terrace1,targetXZ:19});
    addRoute({x:-6,z:-4},{x:-6,z:-13});

    const spring1=await placeDecor('spring.glb',{x:-6,z:-13,topY:terrace1+.12,targetXZ:2.5});
    springs.push({root:spring1.root,x:-6,z:-13,target:{x:4,z:-29},strengthY:7.4,strengthForward:10.2,mandatory:true});
    const landingTop=terrace1+1.55;
    await place('block-grass-large.glb',{x:4,z:-30,topY:landingTop,targetXZ:21});

    const r2=await placeRamp('block-grass-large-slope.glb',{x:4,z:-36},{x:11,z:-50},landingTop,{span:19});
    const splitTop=r2.highY;
    await place('block-grass-large.glb',{x:11,z:-56,topY:splitTop,targetXZ:20});
    addRoute({x:4,z:-28},{x:4,z:-36});addRoute({x:11,z:-50},{x:11,z:-59});

    await place('platform-fortified.glb',{x:4,z:-67,topY:splitTop,targetXZ:19});
    await place('block-grass-large.glb',{x:3,z:-70,topY:splitTop,targetXZ:10});
    addRoute({x:11,z:-59},{x:5,z:-66});

    const r3=await placeRamp('block-grass-large-slope.glb',{x:2,z:-72},{x:-5,z:-85},splitTop,{span:18});
    const arenaTop=r3.highY;
    await place('block-grass-large.glb',{x:-5,z:-91,topY:arenaTop,targetXZ:22});
    addRoute({x:4,z:-68},{x:2,z:-72});addRoute({x:-5,z:-85},{x:-5,z:-95});

    const r4=await placeRamp('block-grass-large-slope.glb',{x:-5,z:-98},{x:0,z:-111},arenaTop,{span:18});
    const goalTop=r4.highY;
    await place('block-grass-large.glb',{x:0,z:-116,topY:goalTop,targetXZ:22});
    await placeDecor('platform-fortified.glb',{x:0,z:-116,topY:goalTop-.32,targetXZ:24});
    addRoute({x:-5,z:-95},{x:-5,z:-98});addRoute({x:0,z:-111},{x:0,z:-118});

    // Mechanical platform-ramp is a safe side toy, not a mandatory connector.
    await place('platform-ramp.glb',{x:-10,z:-62,topY:splitTop+.28,targetXZ:9});
    const sideCoinY=(groundAt(-10,-62)??splitTop)+.8;
    const sideCoin=await placeDecor('coin-gold.glb',{x:-10,z:-62,bottomY:sideCoinY,targetXZ:.6});
    collectibles.push({type:'coin',root:sideCoin.root,x:-10,z:-62,baseY:sideCoin.root.position.y,taken:false});

    // Optional mastery loop: dedicated grass-overhang blocks make the visible high route the walkable route.
    const spring2=await placeDecor('spring.glb',{x:16,z:-56,topY:splitTop+.12,targetXZ:2.4});
    springs.push({root:spring2.root,x:16,z:-56,target:{x:23,z:-68},strengthY:8.8,strengthForward:8.5,mandatory:false});
    const highTop=splitTop+5.1;
    await place('block-grass-overhang-large.glb',{x:23,z:-69,topY:highTop,targetXZ:14});
    await place('block-grass-overhang-large.glb',{x:20,z:-78,topY:highTop+.25,targetXZ:14});
    await place('block-grass-overhang-large.glb',{x:14,z:-86,topY:highTop+.45,targetXZ:14});
    await place('block-grass-overhang-large.glb',{x:10,z:-89,topY:highTop+.45,targetXZ:13});
    addRoute({x:23,z:-68},{x:20,z:-78},true);addRoute({x:20,z:-78},{x:14,z:-86},true);addRoute({x:14,z:-86},{x:10,z:-89},true);
    // The loop ends in an intentional broad drop onto the combat terrace; validate the landing itself.
    addRoute({x:4,z:-91},{x:4,z:-91},true);

    // Real, visible hazards live off the safe centerline.
    const sawA=await placeDecor('saw.glb',{x:-12,z:-91,topY:arenaTop+.28,targetXZ:2.7});hazards.push({type:'saw',root:sawA.root,x:-12,z:-91,radius:1.15});
    const sawB=await placeDecor('saw.glb',{x:4,z:-90,topY:arenaTop+.28,targetXZ:2.7});hazards.push({type:'saw',root:sawB.root,x:4,z:-90,radius:1.15});

    // Route language is sparse and deliberate.
    await placeDecor('arrow.glb',{x:-1,z:9,topY:startTop+.2,targetXZ:1.7,rotationY:Math.PI});
    await placeDecor('sign.glb',{x:13,z:-53,topY:splitTop+.12,targetXZ:2.2,rotationY:-.6});
    await placeDecor('arrow.glb',{x:15,z:-54,topY:splitTop+.2,targetXZ:1.7,rotationY:-.65});
    await placeDecor('arrow.glb',{x:9,z:-88,topY:highTop+.7,targetXZ:1.6,rotationY:Math.PI*.9});

    // Same-kit scenery frames the path without forming invisible barriers.
    const treeSpots=[[-16,27,6],[-17,8,5],[15,18,5],[18,-8,5],[-18,-30,5],[-17,-57,5],[18,-98,6],[-18,-112,6]];
    for(const [x,z,s] of treeSpots)await placeDecor((x+z)%2?'tree.glb':'tree-pine.glb',{x,z,topY:-1.25,targetXZ:s});
    for(const [x,z] of [[-12,18],[10,5],[-14,-14],[13,-34],[-14,-71],[13,-106]])await placeDecor('rocks.glb',{x,z,topY:-1.2,targetXZ:3.4});
    for(const [x,z] of [[-9,24],[8,25],[-11,2],[12,-18],[-13,-46],[14,-101]])await placeDecor('flowers.glb',{x,z,topY:-1.18,targetXZ:2.2});

    // Actual collectible models trace the safe route and reward the high loop.
    const coinSpots=[[0,30],[-1,20],[-2,10],[-5,0],[-6,-8],[-6,-13],[4,-28],[4,-34],[7,-42],[10,-50],[10,-57],[7,-64],[2,-72],[-2,-80],[-5,-88],[-5,-96],[-3,-103],[0,-111],[0,-116]];
    for(const [x,z] of coinSpots){const y=(groundAt(x,z)??-1.35)+.82;const c=await placeDecor('coin-gold.glb',{x,z,bottomY:y,targetXZ:.55});collectibles.push({type:'coin',root:c.root,x,z,baseY:c.root.position.y,taken:false});}
    for(const [x,z] of [[23,-69],[20,-78],[14,-86],[10,-89]]){const y=(groundAt(x,z)??highTop)+.92;const g=await placeDecor('jewel.glb',{x,z,bottomY:y,targetXZ:.62});collectibles.push({type:'gem',root:g.root,x,z,baseY:g.root.position.y,taken:false});}
    const chestY=(groundAt(14,-86)??highTop)+.2;const chest=await placeDecor('chest.glb',{x:11.5,z:-86,bottomY:chestY,targetXZ:1.8,rotationY:-.7});collectibles.push({type:'chest',root:chest.root,x:11.5,z:-86,baseY:chest.root.position.y,taken:false,rewardGems:3});
    const heartY=(groundAt(-5,-91)??arenaTop)+.2;const heart=await placeDecor('heart.glb',{x:-5,z:-91,bottomY:heartY,targetXZ:.8});collectibles.push({type:'heart',root:heart.root,x:-5,z:-91,baseY:heart.root.position.y,taken:false});

    refreshBounds();
    const spawn={x:0,z:32,y:groundAt(0,32)??startTop};
    const enemySpawns=[{x:9,z:-55,y:groundAt(9,-55)??splitTop,kind:'character-oobi.glb'},{x:-2,z:-89,y:groundAt(-2,-89)??arenaTop,kind:'character-oodi.glb'},{x:-8,z:-93,y:groundAt(-8,-93)??arenaTop,kind:'character-oozi.glb'}];
    const tube={x:0,z:-116,y:(groundAt(0,-116)??goalTop)+.1};
    return {spawn,tube,enemySpawns,mainRoute:routeSegments,optionalRoute:optionalSegments,landing1:{x:4,z:-30,y:landingTop},split:{x:11,z:-56,y:splitTop},arena:{x:-5,z:-91,y:arenaTop},goal:{x:0,z:-116,y:goalTop}};
  }

  function probe(segments){
    const failures=[];let samples=0;let prev=null;
    for(const seg of segments){
      const dx=seg.b.x-seg.a.x,dz=seg.b.z-seg.a.z,len=Math.hypot(dx,dz),n=Math.max(2,Math.ceil(len/.55));
      prev=null;
      for(let i=0;i<=n;i++){
        const t=i/n,x=THREE.MathUtils.lerp(seg.a.x,seg.b.x,t),z=THREE.MathUtils.lerp(seg.a.z,seg.b.z,t),y=groundAt(x,z);samples++;
        if(y===null){failures.push({reason:'hole',x,z});prev=null;continue;}
        if(prev!==null&&Math.abs(y-prev)>.92)failures.push({reason:'step',x,z,from:prev,to:y});
        prev=y;
      }
    }
    return {ok:failures.length===0,samples,failures:failures.slice(0,16)};
  }
  function validateRoutes(){return {main:probe(routeSegments),optional:probe(optionalSegments)}}
  function update(dt,t){
    for(const h of hazards)if(h.type==='saw')h.root.rotation.z+=dt*3.7;
    for(const c of collectibles){if(c.taken)continue;c.root.rotation.y+=dt*(c.type==='coin'?2.6:1.4);if(c.type!=='chest')c.root.position.y=c.baseY+Math.sin(t*2.4+c.x*.1)*.08;}
  }
  return {root,walkMeshes,springs,hazards,collectibles,build,groundAt,refreshBounds,validateRoutes,update,getBounds:()=>bounds};
}
