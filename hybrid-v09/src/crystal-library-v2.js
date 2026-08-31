// Crystal Library v2 — authored environment layer for Hybrid v0.9.
// Visible architecture is room/gallery based. Simple geometry is kept as fallback/support;
// Kenney CC0 GLB modules are loaded asynchronously so startup never waits on asset IO.

export function buildCrystalLibraryV2(opts){
  const {
    THREE, scene, parent, layout, mobile=false, resolvedQuality='balanced',
    addRectSurface, addDiscSurface, addRampSurface, glowTex=null
  }=opts;

  const root=new THREE.Group();
  root.name='CrystalLibraryV2';
  parent.add(root);

  scene.background=new THREE.Color(0x080510);
  scene.fog=new THREE.FogExp2(0x12081f,mobile?0.0135:0.0105);

  const stone=new THREE.MeshStandardMaterial({color:0x433552,roughness:.86,metalness:.03,emissive:0x130b1d,emissiveIntensity:.13});
  const stoneLight=new THREE.MeshStandardMaterial({color:0x695377,roughness:.80,metalness:.04,emissive:0x1d0e2a,emissiveIntensity:.16});
  const stoneDark=new THREE.MeshStandardMaterial({color:0x21192c,roughness:.94,metalness:.02,emissive:0x0b0711,emissiveIntensity:.10});
  const floorMat=new THREE.MeshStandardMaterial({color:0x4d4158,roughness:.72,metalness:.04,emissive:0x140b1e,emissiveIntensity:.10});
  const floorInset=new THREE.MeshStandardMaterial({color:0x2b2335,roughness:.78,metalness:.03,emissive:0x14091e,emissiveIntensity:.16});
  const railMat=new THREE.MeshStandardMaterial({color:0x806f8b,roughness:.50,metalness:.38,emissive:0x1a1020,emissiveIntensity:.12});
  const bronze=new THREE.MeshStandardMaterial({color:0x8b603b,roughness:.48,metalness:.48,emissive:0x25150b,emissiveIntensity:.16});
  const wood=new THREE.MeshStandardMaterial({color:0x4e2e35,roughness:.84,metalness:.01});
  const recessMat=new THREE.MeshStandardMaterial({color:0x110c19,roughness:1,metalness:0,side:THREE.DoubleSide});
  const bookMats=[0x6f315c,0x315d70,0x6e4a2f,0x51407b,0x2e6a5e,0x8a4c5a].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.82,metalness:.01}));
  const glowPurple=new THREE.MeshStandardMaterial({color:0xc48cff,emissive:0x7126dd,emissiveIntensity:3.0,roughness:.16,metalness:.02});
  const glowCyan=new THREE.MeshStandardMaterial({color:0x82efff,emissive:0x1689b5,emissiveIntensity:2.7,roughness:.14,metalness:.02});
  const glowPink=new THREE.MeshStandardMaterial({color:0xff80d6,emissive:0xa52678,emissiveIntensity:2.6,roughness:.15,metalness:.02});
  const warmGlow=new THREE.MeshStandardMaterial({color:0xffd090,emissive:0xff8b35,emissiveIntensity:3.2,roughness:.28,metalness:.05});

  function mesh(geo,mat,x=0,y=0,z=0,ry=0,cast=false,receive=true,into=root){
    const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=cast;m.receiveShadow=receive;into.add(m);return m;
  }
  function spriteGlow(x,y,z,color=0xb66cff,scale=3,opacity=.16,into=root){
    if(!glowTex)return null;
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false}));
    s.position.set(x,y,z);s.scale.set(scale,scale,1);into.add(s);return s;
  }

  const zones=new Map((layout.zones||[]).map(z=>[z.id,z]));
  if(zones.has('stasis'))zones.set('hub',zones.get('stasis'));
  const platformMap=new Map((layout.platforms||[]).map(p=>[p.id,p]));

  function zoneRadius(z){return z.r||Math.min(z.w||10,z.d||10)*.5;}
  function zoneEdge(z,ux,uz,inset=.32){
    if(z.shape==='rect'){
      const hx=Math.max(.5,(z.w||10)*.5-inset),hz=Math.max(.5,(z.d||10)*.5-inset);
      const tx=Math.abs(ux)>1e-5?hx/Math.abs(ux):1e9;
      const tz=Math.abs(uz)>1e-5?hz/Math.abs(uz):1e9;
      const t=Math.min(tx,tz);return {x:z.x+ux*t,z:z.z+uz*t,y:z.y};
    }
    const t=Math.max(.8,zoneRadius(z)*.86-inset);return {x:z.x+ux*t,z:z.z+uz*t,y:z.y};
  }
  function connectionEnds(za,zb){
    const dx=zb.x-za.x,dz=zb.z-za.z,d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d;
    return [zoneEdge(za,ux,uz),zoneEdge(zb,-ux,-uz)];
  }

  const roomGroups=new Map();
  function buildRectRoom(z){
    const g=new THREE.Group();g.name='zone-'+z.id;root.add(g);roomGroups.set(z.id,g);
    mesh(new THREE.BoxGeometry(z.w,.58,z.d),stoneDark,z.x,z.y-.22,z.z,0,true,true,g);
    mesh(new THREE.BoxGeometry(z.w-.34,.16,z.d-.34),floorMat,z.x,z.y+.15,z.z,0,false,true,g);
    mesh(new THREE.BoxGeometry(Math.max(1,z.w-1.25),.045,Math.max(1,z.d-1.25)),floorInset,z.x,z.y+.255,z.z,0,false,true,g);
    addRectSurface(z.x,z.z,z.w-.38,z.d-.38,z.y+.25,0);
  }
  function buildOctRoom(z){
    const g=new THREE.Group();g.name='zone-'+z.id;root.add(g);roomGroups.set(z.id,g);const r=zoneRadius(z);
    mesh(new THREE.CylinderGeometry(r,r*.98,.62,8,1,false,Math.PI/8),stoneDark,z.x,z.y-.22,z.z,0,true,true,g);
    mesh(new THREE.CylinderGeometry(r-.22,r-.22,.16,8,1,false,Math.PI/8),floorMat,z.x,z.y+.17,z.z,0,false,true,g);
    mesh(new THREE.CylinderGeometry(r*.69,r*.69,.055,8,1,false,Math.PI/8),floorInset,z.x,z.y+.285,z.z,0,false,true,g);
    const rim=mesh(new THREE.TorusGeometry(r-.18,.11,6,8),stoneLight,z.x,z.y+.31,z.z,Math.PI/8,false,true,g);rim.rotation.x=Math.PI/2;
    addDiscSurface(z.x,z.z,r*.88,z.y+.27);
  }
  for(const z of layout.zones||[]){if(z.shape==='rect')buildRectRoom(z);else buildOctRoom(z);}

  for(const z of layout.zones||[]){
    const g=roomGroups.get(z.id)||root,r=zoneRadius(z),n=z.shape==='rect'?4:8;
    for(let i=0;i<n;i++){
      let x,zp,ry=0;
      if(z.shape==='rect'){
        const pts=[[-z.w/2+.55,-z.d/2+.55],[z.w/2-.55,-z.d/2+.55],[z.w/2-.55,z.d/2-.55],[-z.w/2+.55,z.d/2-.55]];
        x=z.x+pts[i][0];zp=z.z+pts[i][1];
      }else{const a=i/n*Math.PI*2+Math.PI/8;x=z.x+Math.cos(a)*(r-.48);zp=z.z+Math.sin(a)*(r-.48);ry=-a;}
      mesh(new THREE.BoxGeometry(.58,1.45,.58),stone,x,z.y-.67,zp,ry,false,true,g);
      mesh(new THREE.BoxGeometry(.82,.18,.82),stoneLight,x,z.y+.02,zp,ry,false,true,g);
    }
  }

  function beamBetween(a,b,thickness=.12,mat=railMat,into=root){
    const mid=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5),dir=new THREE.Vector3().subVectors(b,a),len=dir.length();if(len<.001)return null;
    const m=new THREE.Mesh(new THREE.BoxGeometry(len,thickness,thickness),mat);m.position.copy(mid);m.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),dir.normalize());m.castShadow=false;m.receiveShadow=true;into.add(m);return m;
  }
  function buildBridge(b){
    const za=zones.get(b.a)||zones.get(platformMap.get(b.a)?.kind)||platformMap.get(b.a),zb=zones.get(b.b)||zones.get(platformMap.get(b.b)?.kind)||platformMap.get(b.b);if(!za||!zb)return;
    const [a,c]=connectionEnds(za,zb),dx=c.x-a.x,dz=c.z-a.z,d=Math.hypot(dx,dz);if(d<.35)return;
    const ry=Math.atan2(dx,dz),mx=(a.x+c.x)/2,mz=(a.z+c.z)/2,my=(a.y+c.y)/2,w=b.w||4.2;
    mesh(new THREE.BoxGeometry(w+.28,.55,d+.12),stoneDark,mx,my-.28,mz,ry,true,true);
    mesh(new THREE.BoxGeometry(w,.15,d),floorMat,mx,my+.08,mz,ry,false,true);addRectSurface(mx,mz,w-.18,d-.08,my+.18,ry);
    const sideX=Math.cos(ry),sideZ=-Math.sin(ry);
    for(const side of[-1,1]){
      const off=side*(w*.5-.14),p0=new THREE.Vector3(a.x+sideX*off,my+.92,a.z+sideZ*off),p1=new THREE.Vector3(c.x+sideX*off,my+.92,c.z+sideZ*off);beamBetween(p0,p1,.11,railMat);
      const count=Math.max(2,Math.floor(d/2.1));for(let i=0;i<=count;i++){const t=i/count,x=a.x+dx*t+sideX*off,z=a.z+dz*t+sideZ*off;mesh(new THREE.BoxGeometry(.12,1.05,.12),railMat,x,my+.52,z,0,false,true);}
    }
    const braceCount=Math.max(1,Math.floor(d/4));for(let i=1;i<=braceCount;i++){const t=i/(braceCount+1);mesh(new THREE.BoxGeometry(w+.62,.18,.28),bronze,a.x+dx*t,my-.55,a.z+dz*t,ry,false,true);}
  }
  for(const b of layout.bridges||[])buildBridge(b);

  const stairFallbacks=[];
  function buildStairs(r){
    const dx=r.x2-r.x1,dz=r.z2-r.z1,hd=Math.hypot(dx,dz),dy=r.y2-r.y1,ry=Math.atan2(dx,dz),mx=(r.x1+r.x2)/2,mz=(r.z1+r.z2)/2;
    addRampSurface(mx,mz,Math.max(.8,r.w-.20),Math.max(.4,hd-.04),r.y1+.22,r.y2+.22,ry);
    const g=new THREE.Group();g.name='stairs-'+r.id;root.add(g);stairFallbacks.push({route:r,group:g});
    const n=Math.max(6,Math.min(18,Math.ceil(Math.max(hd/0.65,Math.abs(dy)/.23))));
    for(let i=0;i<n;i++){const t=(i+.5)/n,topT=(i+1)/n,x=r.x1+dx*t,z=r.z1+dz*t,top=r.y1+dy*topT,stepDepth=hd/n*1.08;mesh(new THREE.BoxGeometry(r.w,.26,stepDepth),i%3===0?stoneLight:floorMat,x,top-.13,z,ry,true,true,g);}
    for(const side of[-1,1]){const sx=Math.cos(ry)*side*(r.w*.5-.10),sz=-Math.sin(ry)*side*(r.w*.5-.10);beamBetween(new THREE.Vector3(r.x1+sx,r.y1+1.0,r.z1+sz),new THREE.Vector3(r.x2+sx,r.y2+1.0,r.z2+sz),.12,railMat,g);for(let i=0;i<=4;i++){const t=i/4,x=r.x1+dx*t+sx,z=r.z1+dz*t+sz,y=r.y1+dy*t;mesh(new THREE.BoxGeometry(.12,.90,.12),railMat,x,y+.52,z,0,false,true,g);}}
  }
  for(const r of layout.ramps||[])buildStairs(r);

  const shell=new THREE.Group();shell.name='VaultedLibraryShell';root.add(shell);
  const hall=layout.architecture?.hall||{radius:31,height:21},wallX=Math.min(31,hall.radius||31),southZ=33,northZ=-38,wallH=18;
  mesh(new THREE.BoxGeometry(1.2,wallH,70),stoneDark,-wallX,wallH/2-1,0,0,true,true,shell);mesh(new THREE.BoxGeometry(1.2,wallH,70),stoneDark,wallX,wallH/2-1,0,0,true,true,shell);mesh(new THREE.BoxGeometry(62,wallH,1.2),stoneDark,0,wallH/2-1,northZ,0,true,true,shell);mesh(new THREE.BoxGeometry(24,wallH,1.2),stoneDark,-19,wallH/2-1,southZ,0,true,true,shell);mesh(new THREE.BoxGeometry(24,wallH,1.2),stoneDark,19,wallH/2-1,southZ,0,true,true,shell);

  const bayAnchors=[];function addBay(x,y,z,ry){bayAnchors.push({x,y,z,ry});}
  for(const z of [-28,-20,-12,-4,4,12,20,28]){addBay(-wallX+.72,0,z,Math.PI/2);addBay(wallX-.72,0,z,-Math.PI/2);}for(const x of [-23,-15,-7,7,15,23])addBay(x,0,northZ+.72,0);for(const x of [-23,-15,15,23])addBay(x,0,southZ-.72,Math.PI);
  const fallbackShelves=[];
  function buildBay(a,index){
    const g=new THREE.Group();g.position.set(a.x,a.y,a.z);g.rotation.y=a.ry;shell.add(g);mesh(new THREE.BoxGeometry(5.7,7.7,.32),recessMat,0,4.15,.18,0,false,false,g);
    for(const side of[-1,1]){mesh(new THREE.BoxGeometry(.62,7.7,.78),stone,side*3.02,3.85,0,0,true,true,g);mesh(new THREE.BoxGeometry(.86,.28,1.0),stoneLight,side*3.02,7.70,0,0,false,true,g);}beamBetween(new THREE.Vector3(-3.0,7.65,0),new THREE.Vector3(0,10.05,0),.54,stoneLight,g);beamBetween(new THREE.Vector3(0,10.05,0),new THREE.Vector3(3.0,7.65,0),.54,stoneLight,g);
    const shelf=new THREE.Group();shelf.name='fallback-bookcase';g.add(shelf);fallbackShelves.push({anchor:a,group:shelf,index});mesh(new THREE.BoxGeometry(4.75,5.70,.56),wood,0,3.05,.05,0,false,true,shelf);mesh(new THREE.BoxGeometry(4.25,5.28,.62),recessMat,0,3.12,-.04,0,false,true,shelf);
    for(let row=0;row<6;row++){mesh(new THREE.BoxGeometry(4.45,.13,.72),wood,0,.74+row*.86,.02,0,false,true,shelf);for(let j=0;j<10;j++){const h=.42+((j*7+row*3+index)%5)*.065,w=.25+((j+row)%3)*.055,bx=-1.92+j*.43,by=.98+row*.86;mesh(new THREE.BoxGeometry(w,h,.32),bookMats[(j+row+index)%bookMats.length],bx,by,.38,0,false,true,shelf);}}mesh(new THREE.BoxGeometry(4.9,.055,.07),bronze,0,7.42,-.45,0,false,true,g);
  }
  bayAnchors.forEach(buildBay);

  const columnAnchors=[];for(const x of[-24,24])for(const z of[-25,-8,10,27])columnAnchors.push({x,y:0,z,ry:0});for(const x of[-18,18])columnAnchors.push({x,y:0,z:-34,ry:0});
  for(const a of columnAnchors){mesh(new THREE.CylinderGeometry(.76,.92,11,8),stone,a.x,5.2,a.z,0,true,true,shell);mesh(new THREE.CylinderGeometry(1.06,1.18,.42,8),stoneLight,a.x,.12,a.z,0,false,true,shell);mesh(new THREE.CylinderGeometry(1.02,1.02,.35,8),bronze,a.x,10.45,a.z,0,false,true,shell);}

  const vaultMat=new THREE.MeshStandardMaterial({color:0x5a4268,roughness:.74,metalness:.06,emissive:0x24102f,emissiveIntensity:.22});
  for(const z of[-30,-20,-10,0,10,20,30]){const curve=new THREE.CubicBezierCurve3(new THREE.Vector3(-wallX+1,10.6,z),new THREE.Vector3(-18,22.5,z),new THREE.Vector3(18,22.5,z),new THREE.Vector3(wallX-1,10.6,z));mesh(new THREE.TubeGeometry(curve,32,.23,6,false),vaultMat,0,0,0,0,false,true,shell);}
  for(const x of[-15,0,15]){const curve=new THREE.CubicBezierCurve3(new THREE.Vector3(x,13,southZ-2),new THREE.Vector3(x,20,14),new THREE.Vector3(x,20,-18),new THREE.Vector3(x,13,northZ+2));mesh(new THREE.TubeGeometry(curve,34,.16,6,false),bronze,0,0,0,0,false,true,shell);}

  const stasis=zones.get('stasis')||{x:0,z:0,y:0,r:7},ringGeo=new THREE.TorusGeometry(5.45,.18,8,48);for(const y of[stasis.y+.45,stasis.y+5.9]){const r=mesh(ringGeo,bronze,stasis.x,y,stasis.z,0,false,true);r.rotation.x=Math.PI/2;}for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=stasis.x+Math.cos(a)*5.45,z=stasis.z+Math.sin(a)*5.45;mesh(new THREE.BoxGeometry(.22,5.45,.22),bronze,x,stasis.y+3.18,z,-a,false,true);}spriteGlow(stasis.x,stasis.y+3.2,stasis.z,0xa35cff,7.2,.08);

  const cg={shaft:new THREE.CylinderGeometry(.42,.52,1.8,6,1,false),tip:new THREE.ConeGeometry(.52,.75,6)},overheadCount=mobile?(layout.architecture?.overheadCrystalCount?.performance||82):(resolvedQuality==='high'?(layout.architecture?.overheadCrystalCount?.high||180):(layout.architecture?.overheadCrystalCount?.balanced||130)),shardMat=[glowPurple,glowCyan,glowPink],overhead=[],overheadTips=[];
  for(let i=0;i<3;i++){const inst=new THREE.InstancedMesh(cg.shaft,shardMat[i],Math.ceil(overheadCount/3));inst.castShadow=false;inst.receiveShadow=false;root.add(inst);overhead.push(inst);const tip=new THREE.InstancedMesh(cg.tip,shardMat[i],Math.ceil(overheadCount/3));tip.castShadow=false;tip.receiveShadow=false;root.add(tip);overheadTips.push(tip);}const dummy=new THREE.Object3D(),counts=[0,0,0];let seed=1337;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<overheadCount;i++){const band=i%3,a=(rnd()-.5)*Math.PI*.82,r=6+rnd()*24,x=Math.sin(a)*r+(rnd()-.5)*6,z=-5+Math.cos(a)*r*.82+(rnd()-.5)*10,y=13+rnd()*6.4,sc=.38+rnd()*.95,tilt=(rnd()-.5)*.55;dummy.position.set(x,y,z);dummy.rotation.set(tilt,rnd()*Math.PI*2,(rnd()-.5)*.45);dummy.scale.set(sc*.55,sc,sc*.55);dummy.updateMatrix();overhead[band].setMatrixAt(counts[band],dummy.matrix);dummy.position.y-=1.25*sc;dummy.rotation.x+=Math.PI;dummy.scale.set(sc*.56,sc*.60,sc*.56);dummy.updateMatrix();overheadTips[band].setMatrixAt(counts[band],dummy.matrix);counts[band]++;}overhead.forEach(m=>m.instanceMatrix.needsUpdate=true);overheadTips.forEach(m=>m.instanceMatrix.needsUpdate=true);

  for(const c of layout.crystals||[]){const g=new THREE.Group();g.position.set(c.x,c.y,c.z);root.add(g);const mat=c.color==='cyan'?glowCyan:c.color==='pink'?glowPink:glowPurple;for(let k=0;k<4;k++){const m=mesh(new THREE.CylinderGeometry(.26,.38,1.5,6),mat,(k-1.5)*.36,.75+k*.22,(k%2?-.18:.18),0,false,false,g),sc=c.scale*(.62+k*.11);m.scale.set(sc*.7,sc,sc*.7);m.rotation.z=(k-1.5)*.12;}spriteGlow(0,1.4*c.scale,0,c.color==='cyan'?0x62e5ff:c.color==='pink'?0xff66cf:0xa26cff,2.8*c.scale,.18,g);}

  const sconceAnchors=[];for(const z of[-24,-8,8,24]){sconceAnchors.push({x:-wallX+1,y:5.8,z,ry:Math.PI/2});sconceAnchors.push({x:wallX-1,y:5.8,z,ry:-Math.PI/2});}for(const a of sconceAnchors){const g=new THREE.Group();g.position.set(a.x,a.y,a.z);g.rotation.y=a.ry;shell.add(g);mesh(new THREE.BoxGeometry(.16,.72,.35),bronze,0,0,0,0,false,true,g);mesh(new THREE.SphereGeometry(.18,8,6),warmGlow,0,-.06,.30,0,false,false,g);spriteGlow(0,-.05,.34,0xffa85b,1.15,.17,g);}const fillA=new THREE.PointLight(0x9b55ff,mobile?16:24,28,2);fillA.position.set(-11,8,4);fillA.castShadow=false;root.add(fillA);const fillB=new THREE.PointLight(0x47cfff,mobile?13:20,25,2);fillB.position.set(12,9,-12);fillB.castShadow=false;root.add(fillB);

  const crateSpots=[[-5,10,0],[6,9,0],[-18,2,2.4],[18,-1,2.4],[-8,-19,5.2],[8,-20,5.2]];for(const [x,z,y] of crateSpots){const g=new THREE.Group();g.position.set(x,y+.55,z);g.rotation.y=(x+z)*.17;root.add(g);mesh(new THREE.BoxGeometry(1.15,1,1.05),wood,0,0,0,0,false,true,g);mesh(new THREE.BoxGeometry(1.28,.10,1.16),bronze,0,.40,0,0,false,true,g);mesh(new THREE.BoxGeometry(.10,1.06,1.15),bronze,0,0,0,Math.PI/4,false,true,g);}

  const ASSET_BASE_FURN=new URL('../assets/kenney/furniture/',import.meta.url).href;
  const ASSET_BASE_DUNGEON=new URL('../assets/kenney/dungeon/',import.meta.url).href;
  const assetState={started:false,loaded:0,failed:0,total:5};
  function cloneMaterials(obj,tint=null){obj.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=true;const mats=Array.isArray(o.material)?o.material:[o.material],next=mats.map(mat=>{if(!mat)return mat;const m=mat.clone();if(tint&&m.color)m.color.multiply(new THREE.Color(tint));if('roughness' in m)m.roughness=Math.max(.55,m.roughness??.75);return m;});o.material=Array.isArray(o.material)?next:next[0];});return obj;}
  function normalizeAsset(template,{w=null,h=null,d=null,uniform=true,tint=null}={}){const wrap=new THREE.Group(),obj=cloneMaterials(template.clone(true),tint);wrap.add(obj);obj.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(obj),size=box.getSize(new THREE.Vector3());const sx=w&&size.x>1e-5?w/size.x:1,sy=h&&size.y>1e-5?h/size.y:1,sz=d&&size.z>1e-5?d/size.z:1;if(uniform){const vals=[w?sx:null,h?sy:null,d?sz:null].filter(v=>v!=null),s=Math.min(...vals);obj.scale.setScalar(s);}else obj.scale.set(sx,sy,sz);obj.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(obj);const ctr=box.getCenter(new THREE.Vector3());obj.position.x-=ctr.x;obj.position.z-=ctr.z;obj.position.y-=box.min.y;return wrap;}
  function loadAsset(loader,url){return new Promise((resolve,reject)=>loader.load(url,g=>resolve(g.scene||g.scenes?.[0]),undefined,reject));}
  function placeGate(template,a){const g=normalizeAsset(template,{w:6.5,h:9.6,d:2.4,uniform:true,tint:0x8c78a0});g.position.set(a.x,a.y,a.z);g.rotation.y=a.ry;shell.add(g);}
  function placeBookcase(template,e){const a=e.anchor,g=normalizeAsset(template,{w:4.45,h:5.85,d:1.35,uniform:false});g.position.set(a.x,a.y+.25,a.z);g.rotation.y=a.ry;shell.add(g);e.group.visible=false;}
  function placeColumn(template,a){const g=normalizeAsset(template,{w:1.7,h:10.8,d:1.7,uniform:false,tint:0x8d7aa0});g.position.set(a.x,a.y,a.z);g.rotation.y=a.ry||0;shell.add(g);}
  function placeLamp(template,a){const g=normalizeAsset(template,{w:1,h:1.5,d:1,uniform:true});g.position.set(a.x,a.y-.65,a.z);g.rotation.y=a.ry;shell.add(g);}
  function placeStairAsset(template,e){const r=e.route,dx=r.x2-r.x1,dz=r.z2-r.z1,hd=Math.hypot(dx,dz),dy=Math.abs(r.y2-r.y1),ry=Math.atan2(dx,dz),g=normalizeAsset(template,{w:r.w,h:Math.max(.65,dy+.25),d:hd,uniform:false,tint:0x8c7b9a});g.position.set((r.x1+r.x2)/2,Math.min(r.y1,r.y2)+.05,(r.z1+r.z2)/2);g.rotation.y=ry;if(r.y1>r.y2)g.rotation.y+=Math.PI;root.add(g);e.group.visible=false;}

  queueMicrotask(()=>{assetState.started=true;import('three/addons/loaders/GLTFLoader.js').then(async({GLTFLoader})=>{const loader=new GLTFLoader(),jobs=[['gate',ASSET_BASE_DUNGEON+'gate.glb'],['stairs',ASSET_BASE_DUNGEON+'stairs.glb'],['bookOpen',ASSET_BASE_FURN+'bookcaseOpen.glb'],['bookWide',ASSET_BASE_FURN+'bookcaseClosedWide.glb'],['lamp',ASSET_BASE_FURN+'lampWall.glb']],results=await Promise.allSettled(jobs.map(async([name,url])=>[name,await loadAsset(loader,url)])),assets={};for(const r of results){if(r.status==='fulfilled'){assets[r.value[0]]=r.value[1];assetState.loaded++;}else assetState.failed++;}if(assets.gate)bayAnchors.forEach((a,i)=>{if(i%2===0||!mobile)placeGate(assets.gate,a);});if(assets.bookOpen||assets.bookWide)fallbackShelves.forEach((e,i)=>placeBookcase((i%3===0?assets.bookWide:assets.bookOpen)||assets.bookOpen||assets.bookWide,e));if(assets.column)columnAnchors.forEach(a=>placeColumn(assets.column,a));if(assets.lamp)sconceAnchors.forEach((a,i)=>{if(i%2===0||!mobile)placeLamp(assets.lamp,a);});if(assets.stairs)stairFallbacks.forEach(e=>placeStairAsset(assets.stairs,e));root.userData.assetState=assetState;}).catch(()=>{assetState.failed=assetState.total;root.userData.assetState=assetState;});});

  root.userData.assetState=assetState;root.userData.zoneCount=(layout.zones||[]).length;root.userData.crystalLibraryV2=true;return {root,assetState,zones};
}
