// Crystal Library v2.4 — authored environment layer for Hybrid v0.9.
// The gameplay collision stays analytic; visible architecture is a separate, asset-driven scene.

export function buildCrystalLibraryV2(opts){
  const {
    THREE, scene, parent, layout, mobile=false, resolvedQuality='balanced',
    addRectSurface, addDiscSurface, addRampSurface, glowTex=null,
    stoneMap=null, stoneNormal=null, floorMap=null, floorRough=null
  }=opts;

  const root=new THREE.Group();
  root.name='CrystalLibraryV24';
  parent.add(root);

  scene.background=new THREE.Color(0x07040e);
  scene.fog=new THREE.FogExp2(0x10061c,mobile?0.0122:0.0096);

  const stone=new THREE.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,color:0x574568,roughness:.88,metalness:.02,emissive:0x13071d,emissiveIntensity:.11});
  const stoneDark=new THREE.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,color:0x251a32,roughness:.94,metalness:.01,emissive:0x09040e,emissiveIntensity:.08});
  const stoneTrim=new THREE.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,color:0x755a85,roughness:.76,metalness:.04,emissive:0x1b0928,emissiveIntensity:.14});
  const floorMat=new THREE.MeshStandardMaterial({map:floorMap,roughnessMap:floorRough,color:0x5a4965,roughness:.76,metalness:.02,emissive:0x12071b,emissiveIntensity:.09});
  const floorInset=new THREE.MeshStandardMaterial({map:floorMap,roughnessMap:floorRough,color:0x30243b,roughness:.80,metalness:.03,emissive:0x190728,emissiveIntensity:.15});
  const bronze=new THREE.MeshStandardMaterial({color:0x7f5a43,roughness:.47,metalness:.52,emissive:0x251109,emissiveIntensity:.12});
  const wood=new THREE.MeshStandardMaterial({color:0x40252d,roughness:.88,metalness:.01});
  const recess=new THREE.MeshStandardMaterial({color:0x09060e,roughness:1,metalness:0,side:THREE.DoubleSide});
  const crystalMats=[
    new THREE.MeshStandardMaterial({color:0xb987ff,emissive:0x6c27dd,emissiveIntensity:2.8,roughness:.13,metalness:.02}),
    new THREE.MeshStandardMaterial({color:0x7aeaff,emissive:0x1788bd,emissiveIntensity:2.7,roughness:.12,metalness:.02}),
    new THREE.MeshStandardMaterial({color:0xff82db,emissive:0xa42980,emissiveIntensity:2.55,roughness:.13,metalness:.02})
  ];
  const warmGlow=new THREE.MeshStandardMaterial({color:0xffd39a,emissive:0xff8a38,emissiveIntensity:3.0,roughness:.25});

  function mesh(geo,mat,x=0,y=0,z=0,ry=0,cast=false,receive=true,into=root){
    const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=cast;m.receiveShadow=receive;into.add(m);return m;
  }
  function glow(x,y,z,color=0xa15cff,s=3,opacity=.15,into=root){
    if(!glowTex)return null;
    const q=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false}));
    q.position.set(x,y,z);q.scale.set(s,s,1);into.add(q);return q;
  }
  function beam(a,b,r=.16,mat=bronze,into=root){
    const dir=new THREE.Vector3().subVectors(b,a),len=dir.length();if(len<.01)return null;
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,7),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());m.castShadow=false;m.receiveShadow=true;into.add(m);return m;
  }
  function seeded(seed){let n=seed>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
  const rnd=seeded(0xC1A57A1);

  const zones=new Map((layout.zones||[]).map(z=>[z.id,z]));
  if(zones.has('stasis'))zones.set('hub',zones.get('stasis'));
  const platformMap=new Map((layout.platforms||[]).map(p=>[p.id,p]));
  const roomGroups=new Map();
  function zoneRadius(z){return z.r||Math.min(z.w||10,z.d||10)*.5;}

  function chamferShape(w,d,c=.9){
    const h=w/2,k=d/2,s=new THREE.Shape();
    s.moveTo(-h+c,-k);s.lineTo(h-c,-k);s.lineTo(h,-k+c);s.lineTo(h,k-c);s.lineTo(h-c,k);s.lineTo(-h+c,k);s.lineTo(-h,k-c);s.lineTo(-h,-k+c);s.closePath();return s;
  }
  function platformShape(z){
    if(z.shape==='rect')return chamferShape(z.w,z.d,Math.min(1.15,(Math.min(z.w,z.d))*0.12));
    const r=zoneRadius(z),s=new THREE.Shape(),n=10;
    for(let i=0;i<n;i++){const a=Math.PI/2+i*Math.PI*2/n,x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();return s;
  }
  function addEdgeBlocks(z,g){
    if(z.shape==='rect'){
      const w=z.w,d=z.d,y=z.y-.20;
      for(const [axis,len,fixed,rot] of [['x',w,d/2,0],['x',w,-d/2,0],['z',d,w/2,Math.PI/2],['z',d,-w/2,Math.PI/2]]){
        const n=Math.max(3,Math.floor(len/1.55));for(let i=0;i<n;i++){const t=(i+.5)/n-.5,x=axis==='x'?z.x+t*(len-.9):z.x+fixed,zp=axis==='x'?z.z+fixed:z.z+t*(len-.9);mesh(new THREE.BoxGeometry(1.15,.72,.42),i%3?stone:stoneTrim,x,y,zp,rot,false,true,g);}
      }
    }else{
      const r=zoneRadius(z),n=12;for(let i=0;i<n;i++){const a=i*Math.PI*2/n+Math.PI/n,x=z.x+Math.cos(a)*(r-.05),zp=z.z+Math.sin(a)*(r-.05);mesh(new THREE.BoxGeometry(1.38,.72,.46),i%3?stone:stoneTrim,x,z.y-.20,zp,-a+Math.PI/2,false,true,g);}
    }
  }
  function buildZone(z){
    const g=new THREE.Group();g.name='zone-'+z.id;root.add(g);roomGroups.set(z.id,g);
    const shape=platformShape(z);
    const baseGeo=new THREE.ExtrudeGeometry(shape,{depth:.82,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.16,bevelThickness:.10});baseGeo.rotateX(Math.PI/2);baseGeo.translate(0,.38,0);
    mesh(baseGeo,stoneDark,z.x,z.y-.64,z.z,0,true,true,g);
    const topGeo=new THREE.ShapeGeometry(shape);topGeo.rotateX(-Math.PI/2);mesh(topGeo,floorMat,z.x,z.y+.20,z.z,0,false,true,g);
    const insetScale=z.shape==='rect'?.78:.68,inset=mesh(new THREE.ShapeGeometry(shape),floorInset,z.x,z.y+.225,z.z,0,false,true,g);inset.rotation.x=-Math.PI/2;inset.scale.set(insetScale,insetScale,insetScale);
    addEdgeBlocks(z,g);
    if(z.shape==='rect')addRectSurface(z.x,z.z,z.w-.35,z.d-.35,z.y+.25,0);else addDiscSurface(z.x,z.z,zoneRadius(z)*.88,z.y+.25);
    if(['entrance','atrium','stasis','sanctuary','summit'].includes(z.id)){
      const r=zoneRadius(z)*.58,ring=mesh(new THREE.TorusGeometry(r,.10,7,48),bronze,z.x,z.y+.30,z.z,0,false,true,g);ring.rotation.x=Math.PI/2;
      const r2=mesh(new THREE.TorusGeometry(r*.68,.055,6,40),z.id==='stasis'?crystalMats[1]:stoneTrim,z.x,z.y+.31,z.z,0,false,true,g);r2.rotation.x=Math.PI/2;
    }
  }
  for(const z of layout.zones||[])buildZone(z);

  function zoneEdge(z,ux,uz,inset=.28){
    if(z.shape==='rect'){
      const hx=Math.max(.6,z.w/2-inset),hz=Math.max(.6,z.d/2-inset),tx=Math.abs(ux)>1e-5?hx/Math.abs(ux):1e9,tz=Math.abs(uz)>1e-5?hz/Math.abs(uz):1e9,t=Math.min(tx,tz);return{x:z.x+ux*t,z:z.z+uz*t,y:z.y};
    }
    const t=Math.max(.8,zoneRadius(z)*.86-inset);return{x:z.x+ux*t,z:z.z+uz*t,y:z.y};
  }
  function connectionEnds(a,b){const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d;return[zoneEdge(a,ux,uz),zoneEdge(b,-ux,-uz)];}
  function buildBridge(b){
    const za=zones.get(b.a)||zones.get(platformMap.get(b.a)?.kind)||platformMap.get(b.a),zb=zones.get(b.b)||zones.get(platformMap.get(b.b)?.kind)||platformMap.get(b.b);if(!za||!zb)return;
    const [a,c]=connectionEnds(za,zb),dx=c.x-a.x,dz=c.z-a.z,d=Math.hypot(dx,dz);if(d<.25)return;const ry=Math.atan2(dx,dz),mx=(a.x+c.x)/2,mz=(a.z+c.z)/2,my=(a.y+c.y)/2,w=b.w||4.4;
    mesh(new THREE.BoxGeometry(w+.45,.60,d+.25),stoneDark,mx,my-.30,mz,ry,true,true);mesh(new THREE.BoxGeometry(w,.15,d),floorMat,mx,my+.08,mz,ry,false,true);addRectSurface(mx,mz,w-.18,d-.05,my+.20,ry);
    const rail=b.id!=='entrance_atrium'&&b.id!=='atrium_stasis';
    if(rail){const sx=Math.cos(ry),sz=-Math.sin(ry),n=Math.max(2,Math.floor(d/2.4));for(const side of[-1,1]){const off=side*(w/2-.18);for(let i=0;i<=n;i++){const t=i/n,x=a.x+dx*t+sx*off,z=a.z+dz*t+sz*off;mesh(new THREE.BoxGeometry(.18,.86,.18),bronze,x,my+.54,z,0,false,true);}beam(new THREE.Vector3(a.x+sx*off,my+.92,a.z+sz*off),new THREE.Vector3(c.x+sx*off,my+.92,c.z+sz*off),.07,bronze);}}
    const braces=Math.max(1,Math.floor(d/3));for(let i=1;i<=braces;i++){const t=i/(braces+1);mesh(new THREE.BoxGeometry(w+.65,.19,.35),bronze,a.x+dx*t,my-.66,a.z+dz*t,ry,false,true);}
  }
  for(const b of layout.bridges||[])buildBridge(b);

  const stairFallbacks=[];
  function buildStairs(r){
    const dx=r.x2-r.x1,dz=r.z2-r.z1,d=Math.hypot(dx,dz),dy=r.y2-r.y1,ry=Math.atan2(dx,dz),mx=(r.x1+r.x2)/2,mz=(r.z1+r.z2)/2;addRampSurface(mx,mz,Math.max(.8,r.w-.18),Math.max(.45,d-.03),r.y1+.22,r.y2+.22,ry);
    const g=new THREE.Group();g.name='fallback-stairs-'+r.id;root.add(g);stairFallbacks.push({route:r,group:g});const n=Math.max(6,Math.min(18,Math.ceil(Math.max(d/.58,Math.abs(dy)/.22))));
    for(let i=0;i<n;i++){const t=(i+.5)/n,tt=(i+1)/n;mesh(new THREE.BoxGeometry(r.w,.26,d/n*1.08),i%3===0?stoneTrim:floorMat,r.x1+dx*t,r.y1+dy*tt-.13,r.z1+dz*t,ry,true,true,g);}
  }
  for(const r of layout.ramps||[])buildStairs(r);

  const voidMat=new THREE.MeshBasicMaterial({color:0x090315,transparent:true,opacity:.96,side:THREE.DoubleSide});const voidPlane=mesh(new THREE.PlaneGeometry(68,86),voidMat,0,-6.8,-2,0,false,false);voidPlane.rotation.x=-Math.PI/2;
  for(let i=0;i<32;i++){const x=(rnd()-.5)*46,z=-36+rnd()*70,y=-5-rnd()*10,s=.07+rnd()*.13;const q=mesh(new THREE.OctahedronGeometry(.38,0),crystalMats[i%3],x,y,z,rnd()*Math.PI,false,false);q.scale.set(s,s*3.5,s);}

  const shell=new THREE.Group();shell.name='GrandVaultShell';root.add(shell);const wallX=25.3,northZ=-42,southZ=44,wallH=20.5;
  mesh(new THREE.BoxGeometry(1.15,wallH,86),stoneDark,-wallX,wallH/2-1,-1,0,true,true,shell);mesh(new THREE.BoxGeometry(1.15,wallH,86),stoneDark,wallX,wallH/2-1,-1,0,true,true,shell);mesh(new THREE.BoxGeometry(51,wallH,1.15),stoneDark,0,wallH/2-1,northZ,0,true,true,shell);
  for(const x of[-wallX,wallX])for(const z of[-36,-27,-18,-9,0,9,18,27,36]){mesh(new THREE.BoxGeometry(1.75,12.5,1.8),stone,x,5.5,z,0,true,true,shell);mesh(new THREE.BoxGeometry(2.15,.42,2.05),stoneTrim,x,11.6,z,0,false,true,shell);}
  for(const y of[4.4,10.8,17.3]){mesh(new THREE.BoxGeometry(.42,.34,84),stoneTrim,-wallX+.36,y,-1,0,false,true,shell);mesh(new THREE.BoxGeometry(.42,.34,84),stoneTrim,wallX-.36,y,-1,0,false,true,shell);}

  const bayEntries=[];
  function fallbackBay(x,z,ry,index){
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;shell.add(g);bayEntries.push({x,z,ry,index,group:g});
    mesh(new THREE.BoxGeometry(5.5,8.6,.34),recess,0,4.6,.06,0,false,false,g);for(const side of[-1,1])mesh(new THREE.BoxGeometry(.58,9.0,.78),stone,side*2.85,4.45,0,0,true,true,g);beam(new THREE.Vector3(-2.85,8.65,0),new THREE.Vector3(0,10.75,0),.30,stoneTrim,g);beam(new THREE.Vector3(0,10.75,0),new THREE.Vector3(2.85,8.65,0),.30,stoneTrim,g);
    const shelf=new THREE.Group();shelf.name='fallback-shelf';g.add(shelf);mesh(new THREE.BoxGeometry(4.55,5.9,.74),wood,0,3.25,.12,0,false,true,shelf);mesh(new THREE.BoxGeometry(4.15,5.45,.78),recess,0,3.30,.03,0,false,true,shelf);for(let row=0;row<5;row++){mesh(new THREE.BoxGeometry(4.2,.14,.88),wood,0,.9+row*1.08,.02,0,false,true,shelf);for(let b=0;b<8;b++){const bw=.24+rnd()*.18,bh=.62+rnd()*.32,bx=-1.75+b*.49+(rnd()-.5)*.08;mesh(new THREE.BoxGeometry(bw,bh,.36),new THREE.MeshStandardMaterial({color:[0x693a54,0x365b69,0x7b5434,0x55406f][(b+row)%4],roughness:.85}),bx,.53+row*1.08+bh*.5,-.40,0,false,true,shelf);}}
  }
  let bi=0;for(const z of[-34,-25,-16,-7,2,11,20,29,38]){fallbackBay(-wallX+.72,z,Math.PI/2,bi++);fallbackBay(wallX-.72,z,-Math.PI/2,bi++);}for(const x of[-20,-13,-6,6,13,20])fallbackBay(x,northZ+.72,0,bi++);

  const vaultMat=new THREE.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,color:0x604670,roughness:.80,metalness:.04,emissive:0x1d0829,emissiveIntensity:.15});
  for(const z of[-36,-27,-18,-9,0,9,18,27,36]){const c=new THREE.CubicBezierCurve3(new THREE.Vector3(-wallX+1,10.5,z),new THREE.Vector3(-17,23,z),new THREE.Vector3(17,23,z),new THREE.Vector3(wallX-1,10.5,z));const q=new THREE.Mesh(new THREE.TubeGeometry(c,34,.34,7,false),vaultMat);q.receiveShadow=true;shell.add(q);}
  for(const x of[-12,0,12]){const c=new THREE.CubicBezierCurve3(new THREE.Vector3(x,13,southZ-2),new THREE.Vector3(x,21,20),new THREE.Vector3(x,21,-20),new THREE.Vector3(x,13,northZ+2));const q=new THREE.Mesh(new THREE.TubeGeometry(c,38,.18,6,false),bronze);q.receiveShadow=true;shell.add(q);}

  const st=zones.get('stasis')||{x:0,z:0,y:0,r:6.8};mesh(new THREE.CylinderGeometry(5.1,5.55,.78,16),stoneDark,st.x,st.y+.10,st.z,0,true,true);const stTop=mesh(new THREE.TorusGeometry(4.85,.18,8,48),bronze,st.x,st.y+.55,st.z,0,false,true);stTop.rotation.x=Math.PI/2;glow(st.x,st.y+3.2,st.z,0x84dfff,7.5,.09);

  const overheadCount=mobile?(layout.architecture?.overheadCrystalCount?.performance||96):(resolvedQuality==='high'?(layout.architecture?.overheadCrystalCount?.high||210):(layout.architecture?.overheadCrystalCount?.balanced||155));
  const shardGeo=new THREE.OctahedronGeometry(.38,0),inst=[];for(let c=0;c<3;c++){const im=new THREE.InstancedMesh(shardGeo,crystalMats[c],Math.ceil(overheadCount/3));im.castShadow=false;im.receiveShadow=false;root.add(im);inst.push({mesh:im,count:0});}
  const dummy=new THREE.Object3D();for(let i=0;i<overheadCount;i++){const c=i%3,q=inst[c],x=(rnd()-.5)*43,z=-37+rnd()*76,arch=13.0+7.2*(1-Math.pow(Math.abs(x)/23,1.7)),y=arch+(rnd()-.5)*4.8,sc=.32+rnd()*.92;dummy.position.set(x,y,z);dummy.rotation.set(rnd()*.5,rnd()*Math.PI*2,rnd()*.6);dummy.scale.set(sc*.58,sc*(1.25+rnd()*1.6),sc*.58);dummy.updateMatrix();q.mesh.setMatrixAt(q.count++,dummy.matrix);}for(const q of inst){q.mesh.count=q.count;q.mesh.instanceMatrix.needsUpdate=true;}
  for(const [x,z,y,s,c] of [[-18,23,13,2.4,0],[17,14,15,2.0,1],[-12,1,17,2.8,2],[13,-12,15,2.2,0],[-5,-28,18,2.4,1]]){const q=mesh(new THREE.OctahedronGeometry(.68,0),crystalMats[c],x,y,z,.3,false,false);q.scale.set(s*.55,s*1.45,s*.55);glow(x,y,z,[0xb477ff,0x64e9ff,0xff75d4][c],s*3.0,.12);}

  const sconceAnchors=[];for(const z of[-30,-12,6,24]){sconceAnchors.push({x:-wallX+1.1,y:6.2,z,ry:Math.PI/2});sconceAnchors.push({x:wallX-1.1,y:6.2,z,ry:-Math.PI/2});}
  for(const a of sconceAnchors){const g=new THREE.Group();g.position.set(a.x,a.y,a.z);g.rotation.y=a.ry;shell.add(g);mesh(new THREE.BoxGeometry(.16,.65,.30),bronze,0,0,0,0,false,true,g);mesh(new THREE.SphereGeometry(.15,8,6),warmGlow,0,-.04,.28,0,false,false,g);glow(0,-.04,.32,0xffa45d,1.1,.12,g);}
  for(const [x,z,y] of [[-3.7,27,0],[4.5,14,0],[-17,1,2.4],[17,-1,2.4],[-9,-21,5.2]]){const g=new THREE.Group();g.position.set(x,y+.55,z);g.rotation.y=(x+z)*.13;root.add(g);mesh(new THREE.BoxGeometry(1.2,1.05,1.1),wood,0,0,0,0,false,true,g);mesh(new THREE.BoxGeometry(1.34,.12,1.22),bronze,0,.42,0,0,false,true,g);}

  const fillPurple=new THREE.PointLight(0x873cff,mobile?11:18,34,2);fillPurple.position.set(-11,11,6);fillPurple.castShadow=false;root.add(fillPurple);const fillBlue=new THREE.PointLight(0x3bcfff,mobile?9:15,30,2);fillBlue.position.set(12,10,-13);fillBlue.castShadow=false;root.add(fillBlue);

  const ASSET_BASE_FURN=new URL('../assets/kenney/furniture/',import.meta.url).href;
  const ASSET_BASE_DUNGEON=new URL('../assets/kenney/dungeon/',import.meta.url).href;
  const assetState={started:false,loaded:0,failed:0,total:5};
  function cloneMaterials(obj,tint=null){obj.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=true;const src=Array.isArray(o.material)?o.material:[o.material],out=src.map(mat=>{if(!mat)return mat;const m=mat.clone();if(tint&&m.color)m.color.multiply(new THREE.Color(tint));if('roughness' in m)m.roughness=Math.max(.5,m.roughness??.72);return m;});o.material=Array.isArray(o.material)?out:out[0];});return obj;}
  function normalize(template,{w=null,h=null,d=null,uniform=false,tint=null}={}){const wrap=new THREE.Group(),obj=cloneMaterials(template.clone(true),tint);wrap.add(obj);obj.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(obj),size=box.getSize(new THREE.Vector3()),sx=w&&size.x>1e-5?w/size.x:1,sy=h&&size.y>1e-5?h/size.y:1,sz=d&&size.z>1e-5?d/size.z:1;if(uniform){const a=[w?sx:null,h?sy:null,d?sz:null].filter(v=>v!=null),s=Math.min(...a);obj.scale.setScalar(s);}else obj.scale.set(sx,sy,sz);obj.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(obj);const ctr=box.getCenter(new THREE.Vector3());obj.position.x-=ctr.x;obj.position.z-=ctr.z;obj.position.y-=box.min.y;return wrap;}
  function load(loader,url){return new Promise((res,rej)=>loader.load(url,g=>res(g.scene||g.scenes?.[0]),undefined,rej));}
  function addBayAssets(gate,book,e){const a=e;const arch=normalize(gate,{w:6.25,h:10.7,d:1.35,tint:0x8c729d});arch.position.set(a.x,0,a.z);arch.rotation.y=a.ry;shell.add(arch);const shelf=normalize(book,{w:4.7,h:6.2,d:1.25});shelf.position.set(a.x,.20,a.z);shelf.rotation.y=a.ry;shell.add(shelf);a.group.visible=false;}
  function addLamp(template,a){const q=normalize(template,{h:1.35,w:.9,d:.9,uniform:true});q.position.set(a.x,a.y-.7,a.z);q.rotation.y=a.ry;shell.add(q);}
  function addStair(template,e){const r=e.route,dx=r.x2-r.x1,dz=r.z2-r.z1,hd=Math.hypot(dx,dz),dy=Math.abs(r.y2-r.y1),ry=Math.atan2(dx,dz),q=normalize(template,{w:r.w,h:Math.max(.8,dy+.28),d:hd,tint:0x8c7899});q.position.set((r.x1+r.x2)/2,Math.min(r.y1,r.y2)+.04,(r.z1+r.z2)/2);q.rotation.y=ry+(r.y1>r.y2?Math.PI:0);root.add(q);e.group.visible=false;}
  queueMicrotask(()=>{assetState.started=true;import('three/addons/loaders/GLTFLoader.js').then(async({GLTFLoader})=>{const loader=new GLTFLoader(),jobs=[['gate',ASSET_BASE_DUNGEON+'gate.glb'],['stairs',ASSET_BASE_DUNGEON+'stairs.glb'],['bookOpen',ASSET_BASE_FURN+'bookcaseOpen.glb'],['bookWide',ASSET_BASE_FURN+'bookcaseClosedWide.glb'],['lamp',ASSET_BASE_FURN+'lampWall.glb']],results=await Promise.allSettled(jobs.map(async([n,u])=>[n,await load(loader,u)])),a={};for(const r of results){if(r.status==='fulfilled'){a[r.value[0]]=r.value[1];assetState.loaded++;}else assetState.failed++;}if(a.gate&&(a.bookOpen||a.bookWide))bayEntries.forEach((e,i)=>{if(mobile&&i%2===1)return;addBayAssets(a.gate,(i%3===0?a.bookWide:a.bookOpen)||a.bookOpen||a.bookWide,e);});if(a.lamp)sconceAnchors.forEach((e,i)=>{if(!mobile||i%2===0)addLamp(a.lamp,e);});if(a.stairs)stairFallbacks.forEach(e=>addStair(a.stairs,e));root.userData.assetState=assetState;}).catch(()=>{assetState.failed=assetState.total;root.userData.assetState=assetState;});});

  root.userData.assetState=assetState;root.userData.zoneCount=(layout.zones||[]).length;root.userData.crystalLibraryV2=true;return{root,assetState,zones};
}
