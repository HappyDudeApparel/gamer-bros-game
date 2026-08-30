import fs from 'node:fs';

const file='hybrid-v09/src/game.js';
let s=fs.readFileSync(file,'utf8');
const start=s.indexOf('    function terrainTex90');
const end=s.indexOf('    // Abyss cue only outside the room; quality stays in geometry/materials above it.',start);
if(start<0||end<0)throw new Error('Could not locate old Hybrid corridor landscape block.');

const arena=`    // ------------------------------------------------------------
    // M4A DATA-DRIVEN VERTICAL ARENA BLOCKOUT
    // This replaces the old z=0→90 corridor. Visual modules are intentionally
    // replaceable placeholders; layout + collision data are now authoritative.
    // ------------------------------------------------------------
    ext.clear();
    walkSurfaces.length=0;
    const arenaLayout=await fetch(new URL('../arena.layout.json',import.meta.url),{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('Arena layout '+r.status);return r.json();});
    const arenaRoot=new THREE.Group();arenaRoot.name='HybridM4AArena';ext.add(arenaRoot);
    const arenaStone=new THREE.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,color:0x62556f,roughness:.82,metalness:.04,envMapIntensity:.70});
    const arenaStoneDark=new THREE.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,color:0x332941,roughness:.90,metalness:.02,envMapIntensity:.52});
    const arenaEdge=new THREE.MeshStandardMaterial({color:0x8b6db0,roughness:.62,metalness:.12,emissive:0x28123f,emissiveIntensity:.20});
    const arenaTop=new THREE.MeshStandardMaterial({map:floorMap,roughnessMap:floorRough,color:0x776780,roughness:.70,metalness:.03,envMapIntensity:.72});
    const runeArena=new THREE.MeshBasicMaterial({map:runeMap,color:0xc58cff,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const crystalM4A={
      violet:new THREE.MeshStandardMaterial({color:0x9d6cff,emissive:0x5a20c8,emissiveIntensity:2.1,roughness:.18,metalness:.04}),
      cyan:new THREE.MeshStandardMaterial({color:0x65e5ff,emissive:0x167da6,emissiveIntensity:1.9,roughness:.16,metalness:.04}),
      pink:new THREE.MeshStandardMaterial({color:0xff69ce,emissive:0x9e175e,emissiveIntensity:1.8,roughness:.16,metalness:.04})
    };
    const platformMap=new Map(arenaLayout.platforms.map(p=>[p.id,p]));
    function arenaMesh(geo,mat,x,y,z,ry=0,cast=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=cast;m.receiveShadow=true;arenaRoot.add(m);return m;}
    function buildPlatform(p){
      arenaMesh(new THREE.CylinderGeometry(p.r*.86,p.r,2.15,48),arenaStoneDark,p.x,p.y-.98,p.z,0,true);
      arenaMesh(new THREE.CylinderGeometry(p.r*.94,p.r*.96,.30,48),arenaTop,p.x,p.y,p.z,0,false);
      const rim=arenaMesh(new THREE.TorusGeometry(p.r*.87,.12,8,48),arenaEdge,p.x,p.y+.16,p.z,0,false);rim.rotation.x=Math.PI/2;
      const rune=arenaMesh(new THREE.CircleGeometry(p.r*.48,40),runeArena,p.x,p.y+.175,p.z,0,false);rune.rotation.x=-Math.PI/2;
      for(let i=0;i<8;i++){const a=i*Math.PI/4,r=p.r*.88,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;const b=arenaMesh(new THREE.BoxGeometry(.60,1.65,1.15),arenaStone,x,p.y-.62,z,-a,false);b.scale.y=.82;}
      addDiscSurface(p.x,p.z,p.r*.91,p.y+.16);
    }
    function buildStraight(a,b,w,kind='bridge'){
      const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),ry=Math.atan2(dx,dz),y=(a.y+b.y)/2;
      const deck=arenaMesh(new THREE.BoxGeometry(w,.42,d),arenaStoneDark,(a.x+b.x)/2,y-.12,(a.z+b.z)/2,ry,true);
      arenaMesh(new THREE.BoxGeometry(w-.18,.16,d-.12),arenaTop,(a.x+b.x)/2,y+.10,(a.z+b.z)/2,ry,false);
      if(kind==='bridge'){
        const rx=Math.cos(ry),rz=-Math.sin(ry);for(const side of[-1,1]){const off=side*(w/2-.18);arenaMesh(new THREE.BoxGeometry(.18,.34,d-.35),arenaEdge,(a.x+b.x)/2+rx*off,y+.28,(a.z+b.z)/2+rz*off,ry,false);}
      }
      addRectSurface((a.x+b.x)/2,(a.z+b.z)/2,w-.22,d-.18,y+.18,ry);
      return deck;
    }
    function buildRamp(r){
      const dx=r.x2-r.x1,dz=r.z2-r.z1,d=Math.hypot(dx,dz),ry=Math.atan2(dx,dz),midX=(r.x1+r.x2)/2,midZ=(r.z1+r.z2)/2,midY=(r.y1+r.y2)/2;
      const m=arenaMesh(new THREE.BoxGeometry(r.w,.30,d),arenaTop,midX,midY,midZ,ry,true);m.rotation.x=Math.atan2(r.y1-r.y2,d);
      const under=arenaMesh(new THREE.BoxGeometry(r.w+.30,.48,d),arenaStoneDark,midX,midY-.25,midZ,ry,true);under.rotation.x=m.rotation.x;
      addRampSurface(midX,midZ,r.w-.25,d-.18,r.y1+.16,r.y2+.16,ry);
    }
    arenaLayout.platforms.forEach(buildPlatform);
    arenaLayout.ramps.forEach(buildRamp);
    arenaLayout.bridges.forEach(b=>{const a=platformMap.get(b.a),c=platformMap.get(b.b);if(a&&c)buildStraight(a,c,b.w,'bridge');});
    arenaLayout.floaters.forEach(f=>{arenaMesh(new THREE.CylinderGeometry(f.r*.82,f.r,.55,28),arenaStoneDark,f.x,f.y-.18,f.z);arenaMesh(new THREE.CylinderGeometry(f.r*.90,f.r*.92,.16,28),arenaTop,f.x,f.y+.08,f.z,0,false);const rr=arenaMesh(new THREE.TorusGeometry(f.r*.72,.07,7,28),arenaEdge,f.x,f.y+.18,f.z,0,false);rr.rotation.x=Math.PI/2;addDiscSurface(f.x,f.z,f.r*.86,f.y+.18);});
    const crystalGeo=new THREE.OctahedronGeometry(.52,0);
    arenaLayout.crystals.forEach((c,i)=>{const g=new THREE.Group();g.position.set(c.x,c.y,c.z);g.rotation.y=i*.71;arenaRoot.add(g);for(let k=0;k<4;k++){const m=new THREE.Mesh(crystalGeo,crystalM4A[c.color]||crystalM4A.violet);m.position.set((k-1.5)*.31,k*.27,(k%2?-.12:.12));const sc=c.scale*(.58+k*.13);m.scale.set(sc,sc*(1.28+k*.15),sc);m.rotation.z=(k-1.5)*.13;m.castShadow=true;g.add(m);}const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:c.color==='cyan'?0x67e7ff:c.color==='pink'?0xff68cf:0xa16cff,transparent:true,opacity:.24,blending:THREE.AdditiveBlending,depthWrite:false}));glow.position.y=1.05*c.scale;glow.scale.setScalar(2.7*c.scale);g.add(glow);});
    const towerMat=new THREE.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,color:0x30263d,roughness:.94,metalness:.02});
    const towerTrim=new THREE.MeshStandardMaterial({color:0x5a4070,roughness:.82,metalness:.05,emissive:0x180b29,emissiveIntensity:.16});
    arenaLayout.backdrop.forEach((q,qi)=>{const g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=q.rot||0;arenaRoot.add(g);const shaft=new THREE.Mesh(new THREE.BoxGeometry(q.w,q.h,q.w*.72),towerMat);shaft.position.y=q.h/2;g.add(shaft);for(let k=0;k<4;k++){const ledge=new THREE.Mesh(new THREE.BoxGeometry(q.w*1.10,.34,q.w*.82),towerTrim);ledge.position.y=q.h*(.18+k*.22);g.add(ledge);}for(let k=-1;k<=1;k+=2){const fin=new THREE.Mesh(new THREE.BoxGeometry(q.w*.22,q.h*.42,q.w*.22),towerMat);fin.position.set(k*q.w*.54,q.h*.79,0);g.add(fin);}const crown=new THREE.Mesh(new THREE.CylinderGeometry(q.w*.44,q.w*.54,1.3,8),towerTrim);crown.position.y=q.h+.45;g.add(crown);});
    const archMat=arenaStone;
    function gateway(x,z,ry,y=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;arenaRoot.add(g);for(const side of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.72,4.8,.95),archMat);p.position.set(side*2.45,2.35,0);g.add(p);}const top=new THREE.Mesh(new THREE.TorusGeometry(2.45,.48,10,32,Math.PI),archMat);top.position.y=4.65;top.rotation.z=Math.PI;g.add(top);}
    gateway(0,7.7,0);gateway(7.7,0,Math.PI/2);gateway(-7.7,0,Math.PI/2);gateway(0,-7.7,0);
    const skySpireMat=new THREE.MeshBasicMaterial({color:0x251631,transparent:true,opacity:.82});
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=68+(i%3)*4,h=12+(i%5)*3;const m=arenaMesh(new THREE.ConeGeometry(5+(i%3),h,7),skySpireMat,Math.cos(a)*r,h/2-7,Math.sin(a)*r,a,false);m.castShadow=false;}
`;

s=s.slice(0,start)+arena+s.slice(end);
s=s.replace('const camera=new THREE.PerspectiveCamera(36,1,.15,70);','const camera=new THREE.PerspectiveCamera(36,1,.15,125);');
s=s.replace("const safeX=0,safeZ=57,safeSurface=surfaceHeight(safeX,safeZ);","const safeX=arenaLayout.spawn.x,safeZ=arenaLayout.spawn.z,safeSurface=surfaceHeight(safeX,safeZ);");
s=s.replace("player.yaw=Math.PI;player.vy=0;","player.yaw=arenaLayout.spawn.yaw;player.vy=0;");
s=s.replace("const abyss=extMesh(new THREE.PlaneGeometry(28,26),abyssMat,new THREE.Vector3(0,-5.0,17.2),0,false);","const abyss=extMesh(new THREE.PlaneGeometry(118,118),abyssMat,new THREE.Vector3(0,-6.2,14),0,false);");
s=s.replace("[archFoot,archBlocks,archCaps,archTrim,reliefOuter,reliefInner,voussoir,alcoves].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.visible=false;});","[archFoot,archBlocks,archCaps,archTrim,reliefOuter,reliefInner,voussoir,alcoves].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;});");
s=s.replace("[buttBase,buttBlocks,buttCaps].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.visible=false;});","[buttBase,buttBlocks,buttCaps].forEach(m=>{m.instanceMatrix.needsUpdate=true;});");
fs.writeFileSync(file,s);

let html=fs.readFileSync('hybrid-v09/index.html','utf8');
html=html.replace(/M2 Clean Portal/g,'M4A Vertical Arena').replace(/M2 CLEAN PORTAL/g,'M4A VERTICAL ARENA').replace('Loading the promoted clean source and rebuilt portal transmission timeline.','Loading the clean portal timeline and new five-tier vertical arena foundation.');
html=html.replace('./src/game.js?v=090m2','./src/game.js?v=090m4a');
fs.writeFileSync('hybrid-v09/index.html',html);
console.log('M4A arena source migration complete');
