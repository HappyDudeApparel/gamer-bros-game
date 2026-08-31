// Hybrid v0.9 — promoted clean source (M1) + portal timeline rebuild (M2)
// Generated once from the last Phase 2D runtime. Do not reintroduce runtime string patching.
(async()=>{
  const boot=document.getElementById('boot');
  const fatal=document.getElementById('fatal');
  const fatalText=document.getElementById('fatalText');
  const ui=document.getElementById('ui');
  const stage=document.getElementById('stage');
  const statsLine=document.getElementById('statsLine');
  const qualityLine=document.getElementById('qualityLine');
  const phaseLine=document.getElementById('phaseLine');
  const qualityBtn=document.getElementById('qualityBtn');
  const orbitBtn=document.getElementById('orbitBtn');
  const followLockBtn=document.getElementById('followLockBtn');
  const actionTouchBtn=document.getElementById('actionTouchBtn');
  const runTouchBtn=document.getElementById('runTouchBtn');
  const jumpTouchBtn=document.getElementById('jumpTouchBtn');
  const activateBtn=document.getElementById('activateBtn');
  const dropBtn=document.getElementById('dropBtn');
  const resetBtn=document.getElementById('resetBtn');
  const viewBtn=document.getElementById('viewBtn');
  const hint=document.getElementById('hint');
  const lightingSlider=document.getElementById('lightingSlider');
  const lightingValue=document.getElementById('lightingValue');
  const motionBtn=document.getElementById('motionBtn');
  const characterBtn=document.getElementById('characterBtn');
  const characterStatus=document.getElementById('characterStatus');
  hint.textContent='WASD / arrows or the on-screen pad to move · Shift/RUN to sprint · Space/JUMP · CAM cycles ORBIT/FOLLOW/TIGHT · FOLLOW LOCK keeps the camera behind the hero';

  try{
    const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');

    // ------------------------------------------------------------
    // RENDERER / QUALITY FOUNDATION
    // ------------------------------------------------------------
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.AgXToneMapping;
    renderer.toneMappingExposure=1.40;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate=true;
    renderer.shadowMap.needsUpdate=true;
    renderer.setClearColor(0x090812,1);
    stage.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x090812);
    scene.fog=new THREE.FogExp2(0x120d1b,0.0100);
    const camera=new THREE.PerspectiveCamera(36,1,.15,125);
    camera.layers.enable(1);

    const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const memory=navigator.deviceMemory||4;
    const presets={
      performance:{label:'PERFORMANCE',dpr:1.0,shadow:1024,particles:140,arcs:14,doubleGlass:false},
      balanced:{label:'BALANCED',dpr:Math.min(devicePixelRatio||1,1.35),shadow:1536,particles:240,arcs:24,doubleGlass:false},
      high:{label:'HIGH',dpr:Math.min(devicePixelRatio||1,1.8),shadow:2048,particles:360,arcs:36,doubleGlass:true}
    };
    let qualityMode='auto';
    let resolvedQuality=(mobile||memory<=3)?'performance':(memory>=8?'high':'balanced');
    let particleBudget=240,arcBudget=24,dprScale=1,fpsAvg=60,dprCooldown=0;
    let shadowFramesLeft=2;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const smooth=t=>t*t*(3-2*t);
    const easeInOutCubic=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    function requestShadowUpdate(frames=1){shadowFramesLeft=0;} // room shadow is baked before the moving hero is added

    // ------------------------------------------------------------
    // PROCEDURAL PBR TEXTURE SET
    // ------------------------------------------------------------
    function finishTexture(t,isColor=true){
      t.colorSpace=isColor?THREE.SRGBColorSpace:THREE.NoColorSpace;
      t.wrapS=t.wrapT=THREE.RepeatWrapping;
      t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      return t;
    }
    function stoneAlbedo(size=768){
      const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
      const grad=g.createLinearGradient(0,0,size,size);
      grad.addColorStop(0,'#39323b');grad.addColorStop(.28,'#504651');grad.addColorStop(.55,'#322c35');grad.addColorStop(.78,'#46404a');grad.addColorStop(1,'#362f39');
      g.fillStyle=grad;g.fillRect(0,0,size,size);
      for(let i=0;i<260;i++){
        const x=Math.random()*size,y=Math.random()*size,r=size*(.045+Math.random()*.15);
        const warm=Math.random()<.42;const col=warm?[96,79,74]:[75,72,91];const a=.035+Math.random()*.105;
        const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},${a})`);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
      }
      g.lineCap='round';
      for(let i=0;i<48;i++){
        let x=Math.random()*size,y=Math.random()*size;g.strokeStyle=`rgba(14,11,17,${.13+Math.random()*.20})`;g.lineWidth=2+Math.random()*5;g.beginPath();g.moveTo(x,y);
        for(let k=0;k<3+Math.random()*4;k++){x+=(Math.random()-.5)*size*.18;y+=(Math.random()-.5)*size*.14;g.lineTo(x,y);}g.stroke();
      }
      for(let i=0;i<size*4;i++){
        const v=58+Math.random()*46,a=.018+Math.random()*.055;g.fillStyle=`rgba(${v|0},${(v*.91)|0},${(v*1.04)|0},${a})`;const q=2+Math.random()*2;g.fillRect(Math.random()*size,Math.random()*size,q,q);
      }
      // Dark mortar / weathered edge border; every block face maps 0..1.
      const b=Math.round(size*.055);const eg=g.createLinearGradient(0,0,0,b);eg.addColorStop(0,'rgba(8,6,11,.78)');eg.addColorStop(.42,'rgba(24,20,28,.35)');eg.addColorStop(1,'rgba(8,6,11,0)');
      for(let s=0;s<4;s++){g.save();g.translate(size/2,size/2);g.rotate(s*Math.PI/2);g.translate(-size/2,-size/2);g.fillStyle=eg;g.fillRect(0,0,size,b);g.restore();}
      return finishTexture(new THREE.CanvasTexture(c),true);
    }
    function stoneHeightCanvas(size=512){
      const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
      g.fillStyle='#8a8a8a';g.fillRect(0,0,size,size);
      for(let i=0;i<250;i++){
        const x=Math.random()*size,y=Math.random()*size,r=size*(.035+Math.random()*.145),v=100+Math.random()*88;
        const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,`rgba(${v|0},${v|0},${v|0},.32)`);rg.addColorStop(1,'rgba(138,138,138,0)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
      }
      g.lineCap='round';
      for(let i=0;i<44;i++){
        let x=Math.random()*size,y=Math.random()*size;g.strokeStyle=`rgba(36,36,36,${.30+Math.random()*.35})`;g.lineWidth=size*(.004+Math.random()*.010);g.beginPath();g.moveTo(x,y);
        for(let k=0;k<3+Math.random()*3;k++){x+=(Math.random()-.5)*size*.22;y+=(Math.random()-.5)*size*.18;g.lineTo(x,y);}g.stroke();
      }
      for(const [cx,cy] of [[0,0],[size,0],[0,size],[size,size]])if(Math.random()>.45){g.fillStyle='rgba(50,50,50,.52)';g.beginPath();g.arc(cx,cy,size*(.025+Math.random()*.05),0,Math.PI*2);g.fill();}
      const b=Math.round(size*.055);const edge=g.createLinearGradient(0,0,0,b);edge.addColorStop(0,'rgba(24,24,24,1)');edge.addColorStop(.52,'rgba(88,88,88,.72)');edge.addColorStop(1,'rgba(138,138,138,0)');
      for(let s=0;s<4;s++){g.save();g.translate(size/2,size/2);g.rotate(s*Math.PI/2);g.translate(-size/2,-size/2);g.fillStyle=edge;g.fillRect(0,0,size,b);g.restore();}
      return c;
    }
    function normalFromHeight(hc,strength=2.6){
      const size=hc.width,src=hc.getContext('2d').getImageData(0,0,size,size).data;
      const out=document.createElement('canvas');out.width=out.height=size;const ctx=out.getContext('2d'),img=ctx.createImageData(size,size),d=img.data,M=size-1;
      const H=(x,y)=>src[((((y+size)&M)*size)+((x+size)&M))*4]/255;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const dx=H(x+1,y)-H(x-1,y),dy=H(x,y+1)-H(x,y-1);let nx=-dx*strength,ny=-dy*strength,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;const i=(y*size+x)*4;
        d[i]=(nx*.5+.5)*255;d[i+1]=(ny*.5+.5)*255;d[i+2]=(nz*.5+.5)*255;d[i+3]=255;
      }
      ctx.putImageData(img,0,0);return finishTexture(new THREE.CanvasTexture(out),false);
    }
    function floorAlbedo(size=768){
      const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
      const grad=g.createLinearGradient(0,0,size,size);grad.addColorStop(0,'#4e454d');grad.addColorStop(.48,'#332e36');grad.addColorStop(1,'#453d46');g.fillStyle=grad;g.fillRect(0,0,size,size);
      for(let i=0;i<180;i++){
        const x=Math.random()*size,y=Math.random()*size,r=size*(.04+Math.random()*.18),warm=Math.random()>.55;const rg=g.createRadialGradient(x,y,0,x,y,r);
        rg.addColorStop(0,warm?'rgba(118,86,70,.10)':'rgba(78,80,98,.10)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
      }
      // worn polished sweeps
      for(let i=0;i<18;i++){
        const x=Math.random()*size,y=Math.random()*size,w=80+Math.random()*220,h=12+Math.random()*44,a=Math.random()*Math.PI;g.save();g.translate(x,y);g.rotate(a);const rg=g.createLinearGradient(-w/2,0,w/2,0);rg.addColorStop(0,'rgba(125,118,127,0)');rg.addColorStop(.5,'rgba(150,140,148,.16)');rg.addColorStop(1,'rgba(125,118,127,0)');g.fillStyle=rg;g.beginPath();g.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);g.fill();g.restore();
      }
      const b=Math.round(size*.045);const eg=g.createLinearGradient(0,0,0,b);eg.addColorStop(0,'rgba(7,6,9,.84)');eg.addColorStop(1,'rgba(7,6,9,0)');for(let s=0;s<4;s++){g.save();g.translate(size/2,size/2);g.rotate(s*Math.PI/2);g.translate(-size/2,-size/2);g.fillStyle=eg;g.fillRect(0,0,size,b);g.restore();}
      return finishTexture(new THREE.CanvasTexture(c),true);
    }
    function floorRoughness(size=512){
      const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');g.fillStyle='rgb(210,210,210)';g.fillRect(0,0,size,size);
      for(let i=0;i<90;i++){
        const x=Math.random()*size,y=Math.random()*size,r=15+Math.random()*80,v=85+Math.random()*105;const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,`rgb(${v|0},${v|0},${v|0})`);rg.addColorStop(1,'rgba(210,210,210,0)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
      }
      return finishTexture(new THREE.CanvasTexture(c),false);
    }
    function runeTexture(size=256){
      const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');g.clearRect(0,0,size,size);g.translate(size/2,size/2);g.strokeStyle='#d886ff';g.lineWidth=11;g.shadowColor='#8c45ff';g.shadowBlur=22;
      g.beginPath();g.moveTo(0,-65);g.lineTo(58,0);g.lineTo(0,65);g.lineTo(-58,0);g.closePath();g.stroke();g.lineWidth=7;g.strokeStyle='#79eaff';g.beginPath();g.moveTo(0,-34);g.lineTo(26,0);g.lineTo(0,34);g.lineTo(-26,0);g.closePath();g.stroke();g.beginPath();g.moveTo(-42,0);g.lineTo(42,0);g.moveTo(0,-48);g.lineTo(0,48);g.stroke();
      return finishTexture(new THREE.CanvasTexture(c),true);
    }
    function radialTexture(size=128,stops=[['0','rgba(255,255,255,1)'],['1','rgba(255,255,255,0)']]){
      const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),rg=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);for(const [p,col] of stops)rg.addColorStop(Number(p),col);g.fillStyle=rg;g.fillRect(0,0,size,size);return finishTexture(new THREE.CanvasTexture(c),true);
    }

    const stoneMap=stoneAlbedo();
    const stoneHeight=stoneHeightCanvas();
    const stoneNormal=normalFromHeight(stoneHeight,2.75);
    const floorMap=floorAlbedo();
    const floorRough=floorRoughness();
    const runeMap=runeTexture();
    const contactTex=radialTexture(128,[['0','rgba(0,0,0,.62)'],['.52','rgba(0,0,0,.28)'],['1','rgba(0,0,0,0)']]);
    const glowTex=radialTexture(128,[['0','rgba(255,255,255,1)'],['.28','rgba(220,180,255,.46)'],['1','rgba(125,55,255,0)']]);

    // ------------------------------------------------------------
    // MATERIALS
    // ------------------------------------------------------------
    const stoneMat=new THREE.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,normalScale:new THREE.Vector2(1,1),color:0x948b98,roughness:.86,metalness:.02});
    const stoneDark=new THREE.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,normalScale:new THREE.Vector2(1,1),color:0x5f5664,roughness:.90,metalness:.02});
    const floorMat=new THREE.MeshPhysicalMaterial({map:floorMap,normalMap:stoneNormal,normalScale:new THREE.Vector2(.75,.75),roughnessMap:floorRough,color:0x857b84,roughness:.82,metalness:.025,clearcoat:.08,clearcoatRoughness:.42});
    const metalDark=new THREE.MeshPhysicalMaterial({color:0x161820,metalness:.94,roughness:.20,clearcoat:.28,clearcoatRoughness:.12,anisotropy:.32,envMapIntensity:1.35});
    const metalMid=new THREE.MeshPhysicalMaterial({color:0x656b79,metalness:.93,roughness:.17,clearcoat:.34,clearcoatRoughness:.10,anisotropy:.42,anisotropyRotation:.45,envMapIntensity:1.45});
    const metalLight=new THREE.MeshPhysicalMaterial({color:0xb8c1cf,metalness:.89,roughness:.14,clearcoat:.42,clearcoatRoughness:.08,anisotropy:.48,anisotropyRotation:1.1,envMapIntensity:1.5});
    const bronze=new THREE.MeshPhysicalMaterial({color:0x9b6c36,metalness:.92,roughness:.23,clearcoat:.24,clearcoatRoughness:.16,envMapIntensity:1.35});
    const blackRubber=new THREE.MeshStandardMaterial({color:0x0e0e14,metalness:.07,roughness:.82});
    const crystalMat=new THREE.MeshPhysicalMaterial({color:0xe0d1ff,roughness:.09,metalness:0,transmission:.90,thickness:.36,ior:1.72,attenuationColor:new THREE.Color(0x5a1fd0),attenuationDistance:.50,emissive:0x3d0f96,emissiveIntensity:.65,envMapIntensity:1.55});
    const glowPurple=new THREE.MeshStandardMaterial({color:0xe1b8ff,emissive:0x8b2cff,emissiveIntensity:6.8,roughness:.17,metalness:.05});
    const glowCyan=new THREE.MeshStandardMaterial({color:0xc9faff,emissive:0x29d8ff,emissiveIntensity:6.4,roughness:.16,metalness:.04});
    const glassMat=new THREE.MeshPhysicalMaterial({color:0xd8f7ff,roughness:.025,metalness:0,transmission:.94,thickness:.50,ior:1.46,side:THREE.DoubleSide,depthWrite:false,clearcoat:1,clearcoatRoughness:.02,specularIntensity:1.35,iridescence:.10,iridescenceIOR:1.3,envMapIntensity:1.40});
    const glassEdge=new THREE.MeshPhysicalMaterial({color:0xf2fdff,roughness:.04,metalness:.01,transmission:.58,thickness:.10,ior:1.42,depthWrite:false,clearcoat:1,clearcoatRoughness:.015,emissive:0x244d75,emissiveIntensity:.16,envMapIntensity:1.45});
    const lanternGlassMat=new THREE.MeshPhysicalMaterial({color:0xffe9c2,roughness:.08,metalness:0,transmission:.82,thickness:.14,ior:1.45,attenuationColor:new THREE.Color(0xff9b4c),attenuationDistance:.28,emissive:0xff9b45,emissiveIntensity:.72});

    // ------------------------------------------------------------
    // LIGHT RIG — FEWER REAL LIGHTS, BETTER CONTRAST
    // ------------------------------------------------------------
    const ambient=new THREE.AmbientLight(0x241d33,.42);scene.add(ambient);
    const hemi=new THREE.HemisphereLight(0x554b72,0x25170d,.52);scene.add(hemi);
    const key=new THREE.DirectionalLight(0xffd4a8,1.55);key.position.set(-5,10,7);key.castShadow=true;key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=10;key.shadow.camera.bottom=-4;key.shadow.camera.near=.5;key.shadow.camera.far=30;key.shadow.bias=-.00022;key.shadow.normalBias=.038;key.shadow.mapSize.set(presets[resolvedQuality].shadow,presets[resolvedQuality].shadow);scene.add(key);key.shadow.autoUpdate=false;key.shadow.needsUpdate=true;
    const rim=new THREE.DirectionalLight(0x7a4dff,.72);rim.position.set(7,5,-4);scene.add(rim);
    const torchLightA=new THREE.PointLight(0xff8a3a,38,11,2);scene.add(torchLightA);
    const torchLightB=new THREE.PointLight(0xffa85a,29,11,2);scene.add(torchLightB);
    const portalLow=new THREE.PointLight(0x8c3dff,9,18,2);portalLow.position.set(0,1.25,.15);scene.add(portalLow);
    const portalHigh=new THREE.PointLight(0x53ddff,6,16,2);portalHigh.position.set(0,5.75,0);scene.add(portalHigh);
    const portalWash=new THREE.PointLight(0xa04dff,0,0,1);portalWash.position.set(0,3.46,0);scene.add(portalWash);

    let roomLightMult=.92,roomTrim=1,baseEnvIntensity=.87,baseFogDensity=.0100;
    const baseRoomLight={ambient:.42,hemi:.52,key:1.55,rim:.72};
    function applyRoomLight(){
      roomTrim=.84+.16*roomLightMult;
      renderer.toneMappingExposure=clamp(.65+.75*roomLightMult,.86,2.00);
      ambient.intensity=baseRoomLight.ambient*roomTrim;
      hemi.intensity=baseRoomLight.hemi*roomTrim;
      key.intensity=baseRoomLight.key*roomTrim;
      baseEnvIntensity=clamp(.62+.25*roomLightMult,.70,1.18);
      baseFogDensity=clamp(.0100-(roomLightMult-1)*.0012,.0075,.0120);
      if(scene.environment)scene.environmentIntensity=baseEnvIntensity;
      if(window.__bro)window.__bro.setRoomLight(roomLightMult);
      scene.fog.density=baseFogDensity;
    }
    function updateLightingUI(){lightingValue.textContent=Math.round(roomLightMult*100)+'%';}
    lightingSlider.min='35';lightingSlider.max='220';lightingSlider.value='92';
    lightingSlider.addEventListener('input',()=>{roomLightMult=Number(lightingSlider.value)/100;updateLightingUI();applyRoomLight();});
    updateLightingUI();applyRoomLight();

    // ------------------------------------------------------------
    // ROOM — 360° REAL GEOMETRY, MOSTLY INSTANCED
    // ------------------------------------------------------------
    const env=new THREE.Group();scene.add(env);
    const dummy=new THREE.Object3D();
    const ROOM_R=9.55,ROOM_H=7.75;
    const stoneColor=new THREE.Color(),bakeColor=new THREE.Color(),tmpV=new THREE.Vector3(),tmpN=new THREE.Vector3();
    const TORCH_ANGLES=[Math.PI*.125,Math.PI*.375,Math.PI*.625,Math.PI*.875,Math.PI*1.125,Math.PI*1.375,Math.PI*1.625,Math.PI*1.875];
    const LANTERN_ANGLES=[0,Math.PI*.25,Math.PI*.50,Math.PI*.75,Math.PI,Math.PI*1.25,Math.PI*1.50,Math.PI*1.75];
    const CRYSTAL_ANGLES=[Math.PI*.20,Math.PI*.58,Math.PI*.96,Math.PI*1.34,Math.PI*1.72];
    const STATIC_EMITTERS=[];
    for(const a of TORCH_ANGLES)STATIC_EMITTERS.push({p:new THREE.Vector3(Math.sin(a)*(ROOM_R-.95),3.06,Math.cos(a)*(ROOM_R-.95)),c:new THREE.Color(1.0,.48,.18),i:34});
    for(const a of LANTERN_ANGLES)STATIC_EMITTERS.push({p:new THREE.Vector3(Math.sin(a)*(ROOM_R-1.35),5.47,Math.cos(a)*(ROOM_R-1.35)),c:new THREE.Color(1.0,.72,.34),i:24});
    for(const a of CRYSTAL_ANGLES)STATIC_EMITTERS.push({p:new THREE.Vector3(Math.sin(a)*5.85,1.15,Math.cos(a)*5.85),c:new THREE.Color(.42,.18,1.0),i:8});
    const lightDir=new THREE.Vector3();
    function bakedLightAt(pos,n,out){
      out.setRGB(.82,.80,.86);
      for(const e of STATIC_EMITTERS){
        lightDir.copy(e.p).sub(pos);const d2=Math.max(.7,lightDir.lengthSq());lightDir.normalize();const lam=Math.max(0,lightDir.dot(n));const k=e.i*lam/d2*.34;out.r+=e.c.r*k;out.g+=e.c.g*k;out.b+=e.c.b*k;
      }
      out.r=Math.min(1.65,out.r);out.g=Math.min(1.55,out.g);out.b=Math.min(1.70,out.b);return out;
    }
    function envMesh(geo,mat,pos,cast=false){const m=new THREE.Mesh(geo,mat);m.position.copy(pos||new THREE.Vector3());m.castShadow=cast;m.receiveShadow=true;env.add(m);return m;}

    // Floor slabs — one draw call, dedicated worn/wet material.
    const floorGeo=new THREE.BoxGeometry(1.08,.18,1.08),floorTiles=[];
    for(let x=-9;x<=9;x++)for(let z=-9;z<=9;z++){
      const px=x*1.02+(Math.random()-.5)*.07,pz=z*1.02+(Math.random()-.5)*.07;if(Math.hypot(px,pz)>ROOM_R-.34)continue;
      floorTiles.push({x:px,z:pz,ry:Math.floor(Math.random()*4)*Math.PI/2+(Math.random()-.5)*.055,y:-.08+Math.random()*.03,sx:.94+Math.random()*.075,sz:.94+Math.random()*.075,c:.82+Math.random()*.16});
    }
    const floorInst=new THREE.InstancedMesh(floorGeo,floorMat,floorTiles.length);floorInst.receiveShadow=true;floorInst.castShadow=false;
    const UP=new THREE.Vector3(0,1,0);
    floorTiles.forEach((q,i)=>{
      dummy.position.set(q.x,q.y,q.z);dummy.rotation.set(0,q.ry,0);dummy.scale.set(q.sx,1,q.sz);dummy.updateMatrix();floorInst.setMatrixAt(i,dummy.matrix);
      tmpV.set(q.x,q.y+.09,q.z);bakedLightAt(tmpV,UP,bakeColor);stoneColor.setRGB(.62*q.c*bakeColor.r,.59*q.c*bakeColor.g,.64*q.c*bakeColor.b);floorInst.setColorAt(i,stoneColor);
    });
    floorInst.instanceMatrix.needsUpdate=true;if(floorInst.instanceColor)floorInst.instanceColor.needsUpdate=true;env.add(floorInst);

    // Full masonry wall — one draw call, staggered courses, mirrored block orientations.
    const wallGeo=new THREE.BoxGeometry(1.24,.72,.56),wallRows=10,wallPerRow=48,wallBlocks=[];
    for(let row=0;row<wallRows;row++){const stagger=(row%2)*.5;for(let i=0;i<wallPerRow;i++){const a=(i+stagger)/wallPerRow*Math.PI*2,y=.34+row*.71,wa=Math.atan2(Math.sin(a),Math.cos(a));if(Math.abs(wa)<.325&&y<5.35)continue;wallBlocks.push({a,y,sx:.92+Math.random()*.10,sy:.91+Math.random()*.10,rz:(Math.random()-.5)*.02,c:.76+Math.random()*.17,flip:Math.random()<.5});}}
    const wallInst=new THREE.InstancedMesh(wallGeo,stoneDark,wallBlocks.length);wallInst.castShadow=true;wallInst.receiveShadow=true;
    wallBlocks.forEach((q,i)=>{
      const wx=Math.sin(q.a)*ROOM_R,wz=Math.cos(q.a)*ROOM_R;dummy.position.set(wx,q.y,wz);dummy.rotation.set(0,q.a+(q.flip?Math.PI:0),q.rz);dummy.scale.set(q.sx,q.sy,1);dummy.updateMatrix();wallInst.setMatrixAt(i,dummy.matrix);
      tmpV.set(wx,q.y,wz);tmpN.set(-Math.sin(q.a),0,-Math.cos(q.a));bakedLightAt(tmpV,tmpN,bakeColor);stoneColor.setRGB(.52*q.c*bakeColor.r,.48*q.c*bakeColor.g,.56*q.c*bakeColor.b);wallInst.setColorAt(i,stoneColor);
    });
    wallInst.instanceMatrix.needsUpdate=true;if(wallInst.instanceColor)wallInst.instanceColor.needsUpdate=true;wallInst.visible=false;env.add(wallInst);

    const ceilingMat=stoneDark.clone();ceilingMat.side=THREE.DoubleSide;ceilingMat.color.setHex(0x4a424e);const openCeiling=envMesh(new THREE.CylinderGeometry(ROOM_R+.18,ROOM_R+.18,.32,80),ceilingMat,new THREE.Vector3(0,ROOM_H,0),false);openCeiling.visible=false;
    const cornice=new THREE.Mesh(new THREE.TorusGeometry(ROOM_R-.35,.20,10,80),stoneMat);cornice.rotation.x=Math.PI/2;cornice.position.y=ROOM_H-.29;cornice.castShadow=false;cornice.receiveShadow=true;cornice.visible=false;env.add(cornice);

    function makeInst(geo,mat,count,cast=false,receive=true){const m=new THREE.InstancedMesh(geo,mat,count);m.castShadow=cast;m.receiveShadow=receive;env.add(m);return m;}
    const archFoot=makeInst(new THREE.BoxGeometry(1.05,.34,.84),stoneMat,8,false,true);
    const archBlocks=makeInst(new THREE.BoxGeometry(.76,.70,.70),stoneMat,56,true,true);
    const archCaps=makeInst(new THREE.BoxGeometry(1.05,.28,.88),stoneMat,8,false,true);
    const archTrim=makeInst(new THREE.BoxGeometry(.18,3.86,.10),bronze,8,false,true);
    const reliefOuter=makeInst(new THREE.BoxGeometry(.36,.36,.075),metalDark,24,false,true);
    const reliefInner=makeInst(new THREE.BoxGeometry(.16,.16,.025),bronze,24,false,true);
    const voussoir=makeInst(new THREE.BoxGeometry(.68,.48,.68),stoneMat,68,true,true);
    const alcoveMat=new THREE.MeshStandardMaterial({color:0x26202b,roughness:.97,metalness:0,side:THREE.DoubleSide});
    const alcoves=makeInst(new THREE.PlaneGeometry(5.45,5.15),alcoveMat,4,false,false);
    const buttBase=makeInst(new THREE.BoxGeometry(.92,.30,.78),stoneDark,4,false,true);
    const buttBlocks=makeInst(new THREE.BoxGeometry(.62,.63,.60),stoneMat,32,true,true);
    const buttCaps=makeInst(new THREE.BoxGeometry(.92,.26,.78),stoneDark,4,false,true);

    const parentObj=new THREE.Object3D(),localObj=new THREE.Object3D(),worldM=new THREE.Matrix4();
    function setNested(inst,index,parentPos,parentRy,localPos,localEuler=new THREE.Euler(),scale=new THREE.Vector3(1,1,1),color=null){
      parentObj.position.copy(parentPos);parentObj.rotation.set(0,parentRy,0);parentObj.scale.set(1,1,1);parentObj.updateMatrix();
      localObj.position.copy(localPos);localObj.rotation.copy(localEuler);localObj.scale.copy(scale);localObj.updateMatrix();worldM.multiplyMatrices(parentObj.matrix,localObj.matrix);inst.setMatrixAt(index,worldM);if(color)inst.setColorAt(index,color);
    }
    let af=0,ab=0,ac=0,at=0,ro=0,ri=0,vo=0,al=0;
    for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
      const pp=new THREE.Vector3(Math.sin(angle)*(ROOM_R-.47),0,Math.cos(angle)*(ROOM_R-.47));
      for(const side of [-1,1]){
        const x=side*3.02;setNested(archFoot,af++,pp,angle,new THREE.Vector3(x,.17,0));
        for(let i=0;i<7;i++)setNested(archBlocks,ab++,pp,angle,new THREE.Vector3(x,.64+i*.66,0),new THREE.Euler(0,(i%2?1:-1)*.026,0),new THREE.Vector3(1,1,1),new THREE.Color().setHSL(.78,.05,.56+Math.random()*.08));
        setNested(archCaps,ac++,pp,angle,new THREE.Vector3(x,5.20,0));
        setNested(archTrim,at++,pp,angle,new THREE.Vector3(x,2.73,-.39));
        for(let k=0;k<3;k++){setNested(reliefOuter,ro++,pp,angle,new THREE.Vector3(x,1.65+k*1.05,-.43),new THREE.Euler(0,0,Math.PI/4));setNested(reliefInner,ri++,pp,angle,new THREE.Vector3(x,1.65+k*1.05,-.475),new THREE.Euler(0,0,Math.PI/4));}
      }
      for(let i=0;i<17;i++){const a=i/16*Math.PI,r=3.04;setNested(voussoir,vo++,pp,angle,new THREE.Vector3(Math.cos(a)*r,4.78+Math.sin(a)*r,0),new THREE.Euler(0,0,a-Math.PI/2),new THREE.Vector3(1.03,.98,1));}
      if(Math.abs(angle)<.001)setNested(alcoves,al++,pp,angle,new THREE.Vector3(0,-40,.33),new THREE.Euler(0,Math.PI,0));else setNested(alcoves,al++,pp,angle,new THREE.Vector3(0,2.72,.33),new THREE.Euler(0,Math.PI,0));
    }
    [archFoot,archBlocks,archCaps,archTrim,reliefOuter,reliefInner,voussoir,alcoves].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;});

    let bb=0,bbl=0,bc=0;
    for(const angle of [Math.PI/4,Math.PI*.75,Math.PI*1.25,Math.PI*1.75]){
      const pp=new THREE.Vector3(Math.sin(angle)*(ROOM_R-.62),0,Math.cos(angle)*(ROOM_R-.62));setNested(buttBase,bb++,pp,angle,new THREE.Vector3(0,.15,0));
      for(let i=0;i<8;i++)setNested(buttBlocks,bbl++,pp,angle,new THREE.Vector3(0,.58+i*.60,0),new THREE.Euler(0,(i%2?1:-1)*.025,0));
      setNested(buttCaps,bc++,pp,angle,new THREE.Vector3(0,5.32,0));
    }
    [buttBase,buttBlocks,buttCaps].forEach(m=>{m.instanceMatrix.needsUpdate=true;});

    envMesh(new THREE.CylinderGeometry(3.58,3.80,.34,72),stoneDark,new THREE.Vector3(0,.10,0),true);
    envMesh(new THREE.CylinderGeometry(3.24,3.42,.24,72),floorMat,new THREE.Vector3(0,.32,0),false);
    const daisRing=envMesh(new THREE.RingGeometry(2.58,3.14,72),new THREE.MeshStandardMaterial({color:0x5b5260,roughness:.74,metalness:.05,side:THREE.DoubleSide}),new THREE.Vector3(0,.455,0),false);daisRing.rotation.x=-Math.PI/2;

    // Contact shadow decals — one draw call, no SSAO/post pass.
    const contactMat=new THREE.MeshBasicMaterial({map:contactTex,transparent:true,depthWrite:false,color:0x000000,opacity:.72,side:THREE.DoubleSide});
    const contactInst=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),contactMat,20);contactInst.renderOrder=1;env.add(contactInst);let ci=0;
    function putContact(x,z,r,y=.012){dummy.position.set(x,y,z);dummy.rotation.set(-Math.PI/2,0,Math.random()*Math.PI);dummy.scale.set(r,r,1);dummy.updateMatrix();contactInst.setMatrixAt(ci++,dummy.matrix);}
    putContact(0,0,7.0,.008);
    for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5])for(const side of [-1,1]){const base=new THREE.Vector3(Math.sin(angle)*(ROOM_R-.47),0,Math.cos(angle)*(ROOM_R-.47));putContact(base.x+Math.cos(angle)*side*3.02,base.z-Math.sin(angle)*side*3.02,1.65);}
    for(const angle of [Math.PI/4,Math.PI*.75,Math.PI*1.25,Math.PI*1.75])putContact(Math.sin(angle)*(ROOM_R-.62),Math.cos(angle)*(ROOM_R-.62),1.35);

    // Crystals — real prism/terminated-tip silhouette, all shards in one draw call.
    function makeCrystalGeo(){
      const SIDES=6,R=.5,SHAFT=1.0,TIP=.55,pos=[],idx=[];
      const ring=(y,r)=>{const start=pos.length/3;for(let i=0;i<SIDES;i++){const a=i/SIDES*Math.PI*2,j=.92+Math.random()*.16;pos.push(Math.cos(a)*r*j,y,Math.sin(a)*r*j);}return start;};
      const r0=ring(0,R*.84),r1=ring(SHAFT,R),r2=ring(SHAFT+TIP*.48,R*.54),tip=pos.length/3;pos.push(0,SHAFT+TIP,0);const center=pos.length/3;pos.push(0,0,0);
      const band=(a,b)=>{for(let i=0;i<SIDES;i++){const n=(i+1)%SIDES;idx.push(a+i,b+i,b+n,a+i,b+n,a+n);}};band(r0,r1);band(r1,r2);for(let i=0;i<SIDES;i++){const n=(i+1)%SIDES;idx.push(r2+i,tip,r2+n);idx.push(center,r0+n,r0+i);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
    }
    const clusterData=CRYSTAL_ANGLES.map(a=>({a,scale:.80+Math.random()*.18,x:Math.sin(a)*5.85,z:Math.cos(a)*5.85}));
    const crystalBaseInst=makeInst(new THREE.CylinderGeometry(.55,.70,.32,10),stoneDark,clusterData.length,false,true);
    clusterData.forEach((q,i)=>{dummy.position.set(q.x,.45,q.z);dummy.rotation.set(0,Math.random()*Math.PI,0);dummy.scale.set(q.scale,q.scale,q.scale);dummy.updateMatrix();crystalBaseInst.setMatrixAt(i,dummy.matrix);putContact(q.x,q.z,1.25);});crystalBaseInst.instanceMatrix.needsUpdate=true;
    while(ci<20){dummy.position.set(0,-10,0);dummy.scale.set(0,0,0);dummy.updateMatrix();contactInst.setMatrixAt(ci++,dummy.matrix);}contactInst.instanceMatrix.needsUpdate=true;
    const shardSpecs=[[-.22,.10,.32,1.15],[.14,-.03,.42,1.50],[.30,.12,.25,.78],[-.06,-.19,.21,.64],[.04,.24,.18,.55],[-.28,-.12,.16,.48]];
    const crystalGeo=makeCrystalGeo(),crystalInst=new THREE.InstancedMesh(crystalGeo,crystalMat,clusterData.length*shardSpecs.length);crystalInst.castShadow=false;crystalInst.receiveShadow=false;env.add(crystalInst);let cr=0;
    for(const q of clusterData)for(const [ox,oz,w,h] of shardSpecs){dummy.position.set(q.x+ox*q.scale,.56,q.z+oz*q.scale);dummy.rotation.set((Math.random()-.5)*.35,Math.random()*Math.PI*2,(Math.random()-.5)*.35);dummy.scale.set(w*q.scale,h*q.scale,w*q.scale);dummy.updateMatrix();crystalInst.setMatrixAt(cr,dummy.matrix);const c=new THREE.Color().setHSL(.73+(Math.random()-.5)*.035,.68+.15*Math.random(),.72+.13*Math.random());crystalInst.setColorAt(cr,c);cr++;}
    crystalInst.instanceMatrix.needsUpdate=true;if(crystalInst.instanceColor)crystalInst.instanceColor.needsUpdate=true;

    // Torches — 5 shared instanced draws instead of ~40 meshes. Two real point lights roam to nearest visible torches.
    const torchBack=makeInst(new THREE.BoxGeometry(.54,.74,.12),metalDark,TORCH_ANGLES.length,false,true);
    const torchBracket=makeInst(new THREE.BoxGeometry(.16,.50,.32),bronze,TORCH_ANGLES.length,false,true);
    const torchCup=makeInst(new THREE.CylinderGeometry(.24,.13,.26,12),metalDark,TORCH_ANGLES.length,false,true);
    const flameMat=new THREE.MeshBasicMaterial({color:0xff9e3b,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false});
    const coreMat=new THREE.MeshBasicMaterial({color:0xffe69a,transparent:true,opacity:.88,blending:THREE.AdditiveBlending,depthWrite:false});
    const torchFlame=makeInst(new THREE.ConeGeometry(.15,.58,10),flameMat,TORCH_ANGLES.length,false,false);torchFlame.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const torchCore=makeInst(new THREE.SphereGeometry(.11,10,8),coreMat,TORCH_ANGLES.length,false,false);torchCore.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const torches=[];
    TORCH_ANGLES.forEach((angle,i)=>{
      const pp=new THREE.Vector3(Math.sin(angle)*(ROOM_R-.92),2.75,Math.cos(angle)*(ROOM_R-.92));const ry=angle+Math.PI;
      setNested(torchBack,i,pp,ry,new THREE.Vector3(0,-.10,.10));setNested(torchBracket,i,pp,ry,new THREE.Vector3(0,-.30,-.12),new THREE.Euler(-.15,0,0));setNested(torchCup,i,pp,ry,new THREE.Vector3(0,0,-.26));
      const wp=new THREE.Vector3(0,.34,-.68);wp.applyAxisAngle(new THREE.Vector3(0,1,0),ry).add(pp);torches.push({parent:pp,ry,worldPos:wp,seed:Math.random()*10});
    });[torchBack,torchBracket,torchCup].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.visible=false;});torchFlame.visible=false;torchCore.visible=false;

    // Lanterns — emissive/physical geometry is static and captured once in environment bake.
    const lanternChain=makeInst(new THREE.CylinderGeometry(.028,.028,.72,8),metalDark,LANTERN_ANGLES.length,false,true);
    const lanternCap=makeInst(new THREE.CylinderGeometry(.22,.16,.12,10),bronze,LANTERN_ANGLES.length,false,true);
    const lanternFrame=makeInst(new THREE.BoxGeometry(.42,.58,.42),metalDark,LANTERN_ANGLES.length,false,true);
    const lanternGlass=makeInst(new THREE.CylinderGeometry(.13,.13,.33,10),lanternGlassMat,LANTERN_ANGLES.length,false,false);
    const lanternGlowMat=new THREE.MeshBasicMaterial({color:0xffc56a,transparent:true,opacity:.33,blending:THREE.AdditiveBlending,depthWrite:false});
    const lanternGlow=makeInst(new THREE.SphereGeometry(.15,10,8),lanternGlowMat,LANTERN_ANGLES.length,false,false);
    LANTERN_ANGLES.forEach((angle,i)=>{const pp=new THREE.Vector3(Math.sin(angle)*(ROOM_R-1.35),5.75,Math.cos(angle)*(ROOM_R-1.35)),ry=angle+Math.PI;setNested(lanternChain,i,pp,ry,new THREE.Vector3(0,.42,0));setNested(lanternCap,i,pp,ry,new THREE.Vector3(0,.02,0));setNested(lanternFrame,i,pp,ry,new THREE.Vector3(0,-.30,0));setNested(lanternGlass,i,pp,ry,new THREE.Vector3(0,-.30,0));setNested(lanternGlow,i,pp,ry,new THREE.Vector3(0,-.30,0));});[lanternChain,lanternCap,lanternFrame,lanternGlass,lanternGlow].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.visible=false;});

    // ------------------------------------------------------------
    // V0.8.1 SMALL WORLD EXTENSION — SAME V0.5 MATERIALS / LIGHTING
    // Only one doorway + causeway + landing + stairs + upper platform.
    // The room and portal are intentionally NOT rebuilt or downgraded.
    // ------------------------------------------------------------
    const walkSurfaces=[];
    function addRectSurface(x,z,w,d,y,rot=0){walkSurfaces.push({type:'rect',x,z,w,d,y,rot});}
    function addDiscSurface(x,z,r,y){walkSurfaces.push({type:'disc',x,z,r,y});}
    function addRampSurface(x,z,w,d,y0,y1,rot=0){walkSurfaces.push({type:'ramp',x,z,w,d,y0,y1,rot});}
    const ext=new THREE.Group();env.add(ext);
    function extMesh(geo,mat,pos,rotY=0,cast=true){const m=new THREE.Mesh(geo,mat);m.position.copy(pos);m.rotation.y=rotY;m.castShadow=cast;m.receiveShadow=true;ext.add(m);return m;}
    // Main causeway: heavy stone underside, original v0.5 floor material on top.
    extMesh(new THREE.BoxGeometry(3.45,.62,6.40),stoneDark,new THREE.Vector3(0,-.29,12.55),0,true);
    extMesh(new THREE.BoxGeometry(3.18,.18,6.34),floorMat,new THREE.Vector3(0,.03,12.55),0,false);
    extMesh(new THREE.BoxGeometry(.14,.34,6.34),stoneMat,new THREE.Vector3(-1.62,.17,12.55),0,true);
    extMesh(new THREE.BoxGeometry(.14,.34,6.34),stoneMat,new THREE.Vector3(1.62,.17,12.55),0,true);
    addRectSurface(0,12.55,3.10,6.22,.12,0);
    // First circular landing.
    extMesh(new THREE.CylinderGeometry(3.50,3.72,.68,64),stoneDark,new THREE.Vector3(0,-.22,17.25),0,true);
    extMesh(new THREE.CylinderGeometry(3.30,3.38,.20,64),floorMat,new THREE.Vector3(0,.18,17.25),0,false);
    const extRing=extMesh(new THREE.RingGeometry(2.48,3.05,64),new THREE.MeshStandardMaterial({color:0x62566b,roughness:.72,metalness:.05,side:THREE.DoubleSide}),new THREE.Vector3(0,.295,17.25),0,false);extRing.rotation.x=-Math.PI/2;
    addDiscSurface(0,17.25,3.18,.28);
    // Stairs rising to one upper lookout only.
    const stairCount=8,stairW=2.35,stairD=.72,stairStartZ=20.00,stairRise=.19;
    for(let i=0;i<stairCount;i++){
      const y=.18+i*stairRise,z=stairStartZ+i*stairD*.72;
      extMesh(new THREE.BoxGeometry(stairW,.22,stairD),floorMat,new THREE.Vector3(0,y,z),0,true);
      extMesh(new THREE.BoxGeometry(stairW+.20,.22,stairD+.05),stoneDark,new THREE.Vector3(0,y-.20,z),0,true);
    }
    addRampSurface(0,22.02,2.18,5.10,.28,1.63,0);
    // Upper platform gives the concept-image height change without turning this into a big map.
    extMesh(new THREE.CylinderGeometry(3.05,3.30,.70,64),stoneDark,new THREE.Vector3(0,1.26,24.55),0,true);
    extMesh(new THREE.CylinderGeometry(2.88,2.96,.20,64),floorMat,new THREE.Vector3(0,1.66,24.55),0,false);
    const upperRune=extMesh(new THREE.RingGeometry(1.55,2.38,56),new THREE.MeshBasicMaterial({map:runeMap,color:0xb786ff,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}),new THREE.Vector3(0,1.775,24.55),0,false);upperRune.rotation.x=-Math.PI/2;
    addDiscSurface(0,24.55,2.78,1.76);
    // One mirrored side perch — deliberately small and reusable later.
    extMesh(new THREE.BoxGeometry(4.25,.52,1.82),stoneDark,new THREE.Vector3(4.30,.04,17.25),Math.PI/2,true);
    extMesh(new THREE.BoxGeometry(4.12,.18,1.62),floorMat,new THREE.Vector3(4.30,.34,17.25),Math.PI/2,false);
    addRectSurface(4.30,17.25,1.54,4.00,.43,Math.PI/2);
    extMesh(new THREE.CylinderGeometry(2.18,2.35,.60,56),stoneDark,new THREE.Vector3(7.15,.12,17.25),0,true);
    extMesh(new THREE.CylinderGeometry(2.02,2.10,.18,56),floorMat,new THREE.Vector3(7.15,.50,17.25),0,false);
    addDiscSurface(7.15,17.25,1.94,.59);
    // Reuse the same physical crystal geometry/material rather than introducing cheaper props.
    const extCrystal=new THREE.InstancedMesh(crystalGeo,crystalMat,14);extCrystal.castShadow=false;extCrystal.receiveShadow=false;ext.add(extCrystal);
    const extCrystalSpots=[[2.55,17.25,.80],[-2.50,17.65,.72],[1.95,24.60,.74],[-2.05,24.35,.66],[7.65,17.60,.74]];let eci=0;
    for(const [cx,cz,sc] of extCrystalSpots){for(let j=0;j<(eci<6?3:2)&&eci<14;j++){dummy.position.set(cx+(Math.random()-.5)*.34,(cx===7.65?.66:(cz>22?1.84:.38)),cz+(Math.random()-.5)*.34);dummy.rotation.set((Math.random()-.5)*.22,Math.random()*Math.PI*2,(Math.random()-.5)*.22);dummy.scale.set((.14+.08*Math.random())*sc,(.55+.38*Math.random())*sc,(.14+.08*Math.random())*sc);dummy.updateMatrix();extCrystal.setMatrixAt(eci++,dummy.matrix);}}
    extCrystal.instanceMatrix.needsUpdate=true;
    // Static warm lanterns: emissive geometry only, no extra real PointLights.
    const extLanternMat=lanternGlassMat.clone();extLanternMat.emissiveIntensity=.92;
    for(const lx of [-1.35,1.35])for(const lz of [10.15,17.25]){
      extMesh(new THREE.BoxGeometry(.14,1.18,.14),metalDark,new THREE.Vector3(lx,.66,lz),0,true);
      extMesh(new THREE.CylinderGeometry(.14,.14,.31,10),extLanternMat,new THREE.Vector3(lx,1.32,lz),0,false);
      const lg=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffb55e,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false}));lg.position.set(lx,1.32,lz);lg.scale.set(.75,.75,1);ext.add(lg);
    }

    // ------------------------------------------------------------
    // CRYSTAL LIBRARY v2 — authored room/gallery environment
    // Visible architecture lives in crystal-library-v2.js; analytic collision stays here.
    // ------------------------------------------------------------
    ext.clear();
    walkSurfaces.length=0;
    const arenaLayout=await fetch(new URL('../arena.layout.json',import.meta.url),{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('Crystal Library layout '+r.status);return r.json();});
    const {buildCrystalLibraryV2}=await import('./crystal-library-v2.js?v=clv21');
    const crystalLibrary=buildCrystalLibraryV2({THREE,scene,parent:ext,layout:arenaLayout,mobile,resolvedQuality,addRectSurface,addDiscSurface,addRampSurface,glowTex});
    const arenaRoot=crystalLibrary.root;

    // One-time environment capture. NO periodic CubeCamera renders.
    let environmentTarget=null;
    function bakeEnvironment(){
      const rt=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});const cubeCam=new THREE.CubeCamera(.5,60,rt);cubeCam.position.set(0,3.2,0);scene.add(cubeCam);renderer.shadowMap.needsUpdate=true;cubeCam.update(renderer,scene);scene.remove(cubeCam);
      const pmrem=new THREE.PMREMGenerator(renderer);pmrem.compileCubemapShader();environmentTarget=pmrem.fromCubemap(rt.texture);scene.environment=environmentTarget.texture;pmrem.dispose();rt.dispose();applyRoomLight();
    }
    // Position the two real torch lights before the one-time room reflection bake.
    if(torches.length){torchLightA.position.copy(torches[0].worldPos);torchLightB.position.copy(torches[2%torches.length].worldPos);}
    // M4A startup hotfix: skip the old six-face CubeCamera/PMREM bake.
    // The expanded arena made this a blocking preloader workload on mobile.
    scene.environment=null;environmentTarget=null;applyRoomLight();

    // ------------------------------------------------------------
    // PORTAL MACHINE — SAME SILHOUETTE, BETTER MATERIAL RESPONSE
    // ------------------------------------------------------------
    const tube=new THREE.Group();tube.position.y=.42;scene.add(tube);
    function tmesh(geo,mat,y=0,cast=true){const m=new THREE.Mesh(geo,mat);m.position.y=y;m.castShadow=cast;m.receiveShadow=true;tube.add(m);return m;}
    tmesh(new THREE.CylinderGeometry(2.30,2.42,.32,80),metalDark,.18);
    tmesh(new THREE.CylinderGeometry(2.16,2.25,.20,80),metalMid,.43);
    tmesh(new THREE.CylinderGeometry(1.94,2.03,.12,80),bronze,.60);
    tmesh(new THREE.CylinderGeometry(1.77,1.77,.09,80),blackRubber,.70);
    tmesh(new THREE.CylinderGeometry(1.62,1.62,.07,80),metalLight,.77);
    tmesh(new THREE.CylinderGeometry(1.50,1.50,.025,80),glowCyan,.82,false);
    const chamber=tmesh(new THREE.CylinderGeometry(1.52,1.52,4.40,80,1,true),glassMat,3.04,false);chamber.renderOrder=5;
    for(const a of [Math.PI*.18,Math.PI*.82,Math.PI*1.18,Math.PI*1.82]){const s=tmesh(new THREE.CylinderGeometry(.017,.017,4.18,10),glassEdge,3.04,false);s.position.x=Math.cos(a)*1.545;s.position.z=Math.sin(a)*1.545;s.renderOrder=6;}
    tmesh(new THREE.CylinderGeometry(1.70,1.70,.10,80),blackRubber,5.31);
    tmesh(new THREE.CylinderGeometry(1.92,1.82,.13,80),bronze,5.43);
    tmesh(new THREE.CylinderGeometry(2.18,2.05,.22,80),metalMid,5.60);
    tmesh(new THREE.CylinderGeometry(2.36,2.24,.34,80),metalDark,5.84);

    const ringMeshes=[];
    function ring(y,r,mat=glowPurple,tubeRadius=.04){const m=new THREE.Mesh(new THREE.TorusGeometry(r,tubeRadius,14,80),mat);m.rotation.x=Math.PI/2;m.position.y=y;m.castShadow=false;tube.add(m);ringMeshes.push(m);const h=new THREE.Mesh(new THREE.TorusGeometry(r,.11,10,72),new THREE.MeshBasicMaterial({color:mat===glowCyan?0x50dcff:0xb54cff,transparent:true,opacity:.055,blending:THREE.AdditiveBlending,depthWrite:false}));h.rotation.x=Math.PI/2;h.position.y=y;tube.add(h);ringMeshes.push(h);}
    ring(.82,1.56,glowCyan,.035);ring(.90,1.43,glowPurple,.03);ring(5.18,1.57,glowPurple,.04);ring(5.28,1.44,glowCyan,.03);
    const pylonGeo=new THREE.BoxGeometry(.16,4.72,.16),pylonInst=new THREE.InstancedMesh(pylonGeo,metalDark,4);pylonInst.castShadow=true;pylonInst.receiveShadow=true;tube.add(pylonInst);
    const pylonGlowInst=new THREE.InstancedMesh(new THREE.BoxGeometry(.055,3.85,.035),glowPurple,4);pylonGlowInst.castShadow=false;tube.add(pylonGlowInst);
    for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,x=Math.cos(a)*1.83,z=Math.sin(a)*1.83;dummy.position.set(x,3.04,z);dummy.rotation.set(0,-a+.78,0);dummy.scale.set(1,1,1);dummy.updateMatrix();pylonInst.setMatrixAt(i,dummy.matrix);dummy.position.set(x*.998,3.04,z*.998);dummy.updateMatrix();pylonGlowInst.setMatrixAt(i,dummy.matrix);}pylonInst.instanceMatrix.needsUpdate=true;pylonGlowInst.instanceMatrix.needsUpdate=true;
    const accents=new THREE.InstancedMesh(new THREE.BoxGeometry(.34,.10,.10),bronze,16);accents.castShadow=false;tube.add(accents);for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=2.03;dummy.position.set(Math.cos(a)*r,.53,Math.sin(a)*r);dummy.rotation.set(0,-a,0);dummy.scale.set(1,1,1);dummy.updateMatrix();accents.setMatrixAt(i,dummy.matrix);}accents.instanceMatrix.needsUpdate=true;
    const panelFrame=tmesh(new THREE.BoxGeometry(.94,.54,.18),metalDark,1.00);panelFrame.position.z=2.12;panelFrame.rotation.x=-.08;
    const panelScreen=tmesh(new THREE.CylinderGeometry(.20,.20,.035,8),glowCyan,1.00,false);panelScreen.rotation.x=Math.PI/2;panelScreen.position.z=2.225;
    const panelRing=tmesh(new THREE.TorusGeometry(.28,.045,10,8),bronze,1.00);panelRing.rotation.x=Math.PI/2;panelRing.position.z=2.24;panelRing.rotation.z=Math.PI/8;

    // Cheap bloom-like additive sprites. Real post bloom remains intentionally absent.
    const glowSprites=[];
    function glowAt(y,scale,color,baseOpacity){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:baseOpacity}));s.position.set(0,y,0);s.scale.set(scale,scale,1);s.userData.baseScale=scale;s.userData.baseOpacity=baseOpacity;tube.add(s);glowSprites.push(s);return s;}
    glowAt(.86,4.1,0xb54cff,.10);glowAt(5.22,3.8,0x50dcff,.09);glowAt(3.04,2.8,0x8c3dff,.035);

    // ------------------------------------------------------------
    // PORTAL FX SHADERS
    // ------------------------------------------------------------
    const energyMat=new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
      uniforms:{uTime:{value:0},uFill:{value:.10},uIntensity:{value:.20},uDissolve:{value:0}},
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`
        varying vec2 vUv;uniform float uTime;uniform float uFill;uniform float uIntensity;uniform float uDissolve;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        void main(){
          float y=vUv.y,x=vUv.x;
          float fill=1.0-smoothstep(uFill-.045,uFill+.045,y);
          float s1=sin(x*34.0+y*18.0-uTime*4.0+sin(y*13.0+uTime*1.7)*2.2);
          float s2=sin(x*21.0-y*37.0+uTime*2.8+sin(x*9.0-uTime)*1.5);
          float filament=pow(max(0.0,.5+.5*s1),5.0);
          float wisps=pow(max(0.0,.5+.5*s2),7.0);
          float braid=pow(max(0.0,.5+.5*sin(x*13.0+y*52.0-uTime*6.2)),9.0);
          float grain=hash(floor(vec2(x*118.0,y*168.0)+uTime*2.0));
          float idle=.055*(filament+wisps);
          float a=(idle+fill*(.11+.40*filament+.19*wisps+.14*braid+.12*step(.987,grain)))*uIntensity;
          float drain=1.0-smoothstep(1.0-uDissolve-.10,1.0-uDissolve+.10,y);
          a*=mix(1.0,drain,step(.001,uDissolve));
          vec3 cyan=vec3(.10,.74,1.0),violet=vec3(.68,.10,1.0);vec3 col=mix(cyan,violet,.46+.34*sin(y*9.0+uTime*1.2));
          gl_FragColor=vec4(col,a);
        }`
    });
    const energyColumn=tmesh(new THREE.CylinderGeometry(1.28,1.28,4.08,56,1,true),energyMat,3.04,false);energyColumn.receiveShadow=false;energyColumn.renderOrder=2;
    const discMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uIntensity:{value:.28}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uIntensity;void main(){vec2 p=vUv-.5;float r=length(p)*2.0,a=atan(p.y,p.x);float rings=.5+.5*sin(44.0*r-uTime*5.0+sin(a*6.0+uTime*1.8)*2.0);float spokes=.5+.5*sin(a*10.0+r*18.0-uTime*3.0);float fade=1.0-smoothstep(.72,1.0,r);float alpha=(.10+.42*pow(rings,5.0)+.18*pow(spokes,8.0))*fade*uIntensity;vec3 c=mix(vec3(.15,.8,1.0),vec3(.78,.16,1.0),r);gl_FragColor=vec4(c,alpha);}`});
    const floorDisc=new THREE.Mesh(new THREE.CircleGeometry(1.44,64),discMat);floorDisc.rotation.x=-Math.PI/2;floorDisc.position.y=.87;tube.add(floorDisc);
    const topDisc=floorDisc.clone();topDisc.material=discMat.clone();topDisc.rotation.x=Math.PI/2;topDisc.position.y=5.19;tube.add(topDisc);
    const risingRings=[];for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(1.08,.018,9,56),new THREE.MeshBasicMaterial({color:i%2?0xb44dff:0x56dcff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=Math.PI/2;m.position.y=1.0+i*.55;tube.add(m);risingRings.push(m);}

    const maxParticles=400,particleGeo=new THREE.BufferGeometry(),particlePos=new Float32Array(maxParticles*3),particleSeeds=[];
    for(let i=0;i<maxParticles;i++)particleSeeds.push({a:Math.random()*Math.PI*2,r:.22+Math.sqrt(Math.random())*1.05,s:.45+Math.random()*1.15,y:Math.random(),w:Math.random()});
    particleGeo.setAttribute('position',new THREE.BufferAttribute(particlePos,3));particleGeo.setDrawRange(0,Math.floor(particleBudget*.30));
    const particleMat=new THREE.PointsMaterial({color:0xd7a6ff,size:.030,transparent:true,opacity:.24,depthWrite:false,blending:THREE.AdditiveBlending});const particles=new THREE.Points(particleGeo,particleMat);tube.add(particles);
    const maxArcSegments=40,arcPos=new Float32Array(maxArcSegments*2*3),arcGeo=new THREE.BufferGeometry();arcGeo.setAttribute('position',new THREE.BufferAttribute(arcPos,3));arcGeo.setDrawRange(0,0);const arcMat=new THREE.LineBasicMaterial({color:0xc66cff,transparent:true,opacity:.78,blending:THREE.AdditiveBlending,depthWrite:false});const arcs=new THREE.LineSegments(arcGeo,arcMat);tube.add(arcs);let nextArcShuffle=0;

/* ============================================================================
   GAMER BRO — procedural hero character · v1.0
   Drop-in replacement for the v0.6 "TEAL MASTER VISUAL BENCHMARK" block.

   Design notes (why this looks different from the primitive-sphere version):
     · Body / head / hips / shoes are SWEPT SURFACES with authored profiles,
       not unions of intersecting spheres. No hard intersection creases.
     · Shirt and face carry real UV-mapped canvas textures with baked
       ambient occlusion, so shading survives in a dark room.
     · Visor is a genuinely curved shell that hugs the skull, with thickness
       and a rim — not a flat extruded slab.
     · Hair is swept ribbon blades with a flat cross-section, not lathed cones.
     · Character-only rim lights + a character-only shadow-casting light on
       render layer 1, giving true self-shadowing at ~1 object of shadow cost.
   ========================================================================= */

function createGamerBro(THREE, renderer, options) {
  const cfg = Object.assign({ colorway: 'teal', detail: 'high', height: 2.62 }, options || {});
  const HI = cfg.detail !== 'low';
  const Q = HI
    ? { headSeg: 56, headPts: 44, bodySeg: 52, bodyPts: 40, hipSeg: 36, hipPts: 26,
        capSeg: 44, capPts: 32, cupSeg: 26, cupPts: 16, fistSeg: 22, fistPts: 18,
        lockSeg: 14, lockRad: 9, limbSeg: 14, limbRad: 12, shoeZ: 18, shoeK: 20,
        visA: 44, visV: 6 }
    : { headSeg: 36, headPts: 30, bodySeg: 34, bodyPts: 26, hipSeg: 24, hipPts: 18,
        capSeg: 28, capPts: 22, cupSeg: 18, cupPts: 12, fistSeg: 16, fistPts: 14,
        lockSeg: 10, lockRad: 7, limbSeg: 10, limbRad: 9, shoeZ: 12, shoeK: 14,
        visA: 32, visV: 4 };
  const aniso = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  const PALETTES = {
    teal: { shirt: '#1ec9c8', shirtHi: '#48e3df', shirtLo: '#0a7a88', trim: '#f149a9', cup: '#1ec9c8', cupAccent: '#ffab33' },
    pink: { shirt: '#ef3d9f', shirtHi: '#ff74c2', shirtLo: '#8e1160', trim: '#31d6d8', cup: '#ef3d9f', cupAccent: '#31d6d8' }
  };
  let P = PALETTES[cfg.colorway] || PALETTES.teal;

  /* --------------------------------------------------------------------- */
  /* GEOMETRY HELPERS                                                       */
  /* --------------------------------------------------------------------- */

  // Resample an authored [x,y] profile by arc length and expose y→v lookups so
  // textures can be painted against real geometry instead of guessed numbers.
  function profile(raw, samples) {
    samples = samples || 72;
    const curve = new THREE.CatmullRomCurve3(raw.map(p => V3(p[0], p[1], 0)), false, 'centripetal');
    const pts = curve.getSpacedPoints(samples);
    const arc = [0];
    for (let i = 1; i < pts.length; i++) arc.push(arc[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const total = arc[arc.length - 1] || 1;
    const p2 = pts.map((p, i) => {
      const last = i === 0 || i === pts.length - 1;
      return new THREE.Vector2(last ? Math.max(0, p.x) : Math.max(0.0006, p.x), p.y);
    });
    function find(y) {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        if ((y >= a.y && y <= b.y) || (y <= a.y && y >= b.y)) {
          const f = Math.abs(b.y - a.y) < 1e-7 ? 0 : (y - a.y) / (b.y - a.y);
          return { i, f };
        }
      }
      return null;
    }
    return {
      points: p2,
      vAt(y) {
        const h = find(y); if (!h) return y < pts[0].y ? 0 : 1;
        return (arc[h.i - 1] + (arc[h.i] - arc[h.i - 1]) * h.f) / total;
      },
      rAt(y) {
        const h = find(y); if (!h) return 0;
        return pts[h.i - 1].x + (pts[h.i].x - pts[h.i - 1].x) * h.f;
      }
    };
  }

  // phiStart = PI puts u = 0.5 dead centre-front, u = 0 on the back seam,
  // and keeps canvas-left on screen-left. Textures can be painted unmirrored.
  function latheOf(prof, seg) {
    return new THREE.LatheGeometry(prof.points, seg || 76, Math.PI, Math.PI * 2);
  }

  // Curved shell with thickness + rim. Used for the visor frame and lens.
  function wrapShell(o) {
    const rx = o.rx, rz = o.rz, yc = o.yc, half = o.half, span = o.span, thick = o.thick;
    const centerA = o.centerA || 0;
    const segA = o.segA || 56, segV = o.segV || 8;
    const notch = o.notch || 0, notchW = o.notchW || 0.22;
    const taper = o.taper == null ? 0.26 : o.taper, domeY = o.domeY == null ? 0.20 : o.domeY;
    const A = segA + 1, B = segV + 1;

    function surf(a, t) {
      const k = Math.abs(a-centerA) / (span / 2);
      const hh = half * (1 - taper * Math.pow(k, 2.4));
      const yb = yc - hh + notch * Math.exp(-((a-centerA) * (a-centerA)) / (notchW * notchW));
      const yt = yc + hh;
      const y = yb + (yt - yb) * t;
      const dy = (y - yc) / Math.max(1e-4, half);
      const s = 1 - domeY * dy * dy;
      return V3(rx * s * Math.sin(a), y, rz * s * Math.cos(a));
    }
    function nrm(a, t) {
      const e = 0.005;
      const p0 = surf(a, t);
      const ta = surf(a + e, t).sub(p0);
      const tt = surf(a, Math.min(1, t + e)).sub(p0);
      const n = ta.cross(tt);
      return n.lengthSq() < 1e-12 ? V3(0, 0, 1) : n.normalize();
    }

    const pos = [], idx = [];
    const push = (v) => { pos.push(v.x, v.y, v.z); };
    for (let s = 0; s < 2; s++) {                     // 0 = outer shell, 1 = inner
      for (let i = 0; i < A; i++) {
        const a = centerA - span / 2 + (i / segA) * span;
        for (let j = 0; j < B; j++) {
          const t = j / segV;
          push(surf(a, t).addScaledVector(nrm(a, t), (s === 0 ? 0.5 : -0.5) * thick));
        }
      }
    }
    const SH = A * B;
    for (let i = 0; i < segA; i++) for (let j = 0; j < segV; j++) {
      const a = i * B + j, b = (i + 1) * B + j, c = (i + 1) * B + j + 1, d = i * B + j + 1;
      idx.push(a, b, d, b, c, d);                                   // outer, faces out
      idx.push(SH + a, SH + d, SH + b, SH + b, SH + d, SH + c);     // inner, reversed
    }
    // Border loop, counter-clockwise seen from outside, duplicated for a crisp rim.
    const loop = [];
    for (let i = 0; i < A; i++) loop.push([i, 0]);
    for (let j = 1; j < B; j++) loop.push([A - 1, j]);
    for (let i = A - 2; i >= 0; i--) loop.push([i, B - 1]);
    for (let j = B - 2; j >= 1; j--) loop.push([0, j]);
    const RB = pos.length / 3;
    for (const [i, j] of loop) {
      const a = centerA - span / 2 + (i / segA) * span, t = j / segV;
      const p = surf(a, t), n = nrm(a, t);
      push(p.clone().addScaledVector(n, thick * 0.5));
      push(p.clone().addScaledVector(n, -thick * 0.5));
    }
    for (let k = 0; k < loop.length; k++) {
      const k2 = (k + 1) % loop.length;
      const o1 = RB + k * 2, i1 = o1 + 1, o2 = RB + k2 * 2, i2 = o2 + 1;
      idx.push(o1, i1, i2, o1, i2, o2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  // Ribbon/tube sweep with a controllable flat cross-section. Hair, arms, band.
  function swept(o) {
    const curve = new THREE.CatmullRomCurve3(o.path, false, 'centripetal');
    const seg = o.seg || 20, radial = o.radial || 12;
    const width = o.width, thick = o.thick;
    const upRef = (o.up || V3(0, 0, 1)).clone().normalize();
    const pos = [], idx = [];
    const T = V3(), B = V3(), N = V3(), tmp = V3();
    for (let j = 0; j <= seg; j++) {
      const t = j / seg;
      const p = curve.getPointAt(t);
      curve.getTangentAt(t, T);
      B.copy(T).cross(upRef);
      if (B.lengthSq() < 1e-8) B.set(1, 0, 0); else B.normalize();
      N.copy(B).cross(T).normalize();
      const w = width(t) * 0.5, th = thick(t) * 0.5;
      for (let k = 0; k < radial; k++) {
        const ph = (k / radial) * Math.PI * 2;
        tmp.copy(p).addScaledVector(B, w * Math.cos(ph)).addScaledVector(N, th * Math.sin(ph));
        pos.push(tmp.x, tmp.y, tmp.z);
      }
    }
    for (let j = 0; j < seg; j++) for (let k = 0; k < radial; k++) {
      const k2 = (k + 1) % radial;
      const a = j * radial + k, b = (j + 1) * radial + k, c = (j + 1) * radial + k2, d = j * radial + k2;
      idx.push(a, b, d, b, c, d);
    }
    const s = curve.getPointAt(0), e = curve.getPointAt(1);
    const ci = pos.length / 3; pos.push(s.x, s.y, s.z);
    const ce = ci + 1; pos.push(e.x, e.y, e.z);
    for (let k = 0; k < radial; k++) {
      const k2 = (k + 1) % radial;
      idx.push(ci, k, k2);                                           // base cap, faces -T
      idx.push(ce, seg * radial + k2, seg * radial + k);             // tip cap, faces +T
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  // Superellipse cross-section swept along +Z. Flat-bottomed soles, sneaker uppers.
  function shoeSweep(o) {
    const slices = o.slices, segZ = o.segZ || 26, segK = o.segK || 30;
    const n = o.n || 3.0, ex = 2 / n;
    const cw = new THREE.CatmullRomCurve3(slices.map(s => V3(s[0], s[1], s[2])), false, 'centripetal');
    const cy = new THREE.CatmullRomCurve3(slices.map(s => V3(s[0], s[3], 0)), false, 'centripetal');
    const pos = [], idx = [];
    const sgn = (x) => (x < 0 ? -1 : 1);
    for (let j = 0; j <= segZ; j++) {
      const t = j / segZ;
      const a = cw.getPoint(t), b = cy.getPoint(t);
      const z = a.x, hw = Math.max(0.004, a.y), hh = Math.max(0.004, a.z), yc = b.y;
      for (let k = 0; k < segK; k++) {
        const ph = (k / segK) * Math.PI * 2;
        const c = Math.cos(ph), s = Math.sin(ph);
        pos.push(hw * sgn(c) * Math.pow(Math.abs(c), ex), yc + hh * sgn(s) * Math.pow(Math.abs(s), ex), z);
      }
    }
    for (let j = 0; j < segZ; j++) for (let k = 0; k < segK; k++) {
      const k2 = (k + 1) % segK;
      const a = j * segK + k, b = (j + 1) * segK + k, c = (j + 1) * segK + k2, d = j * segK + k2;
      idx.push(a, d, b, d, c, b);
    }
    const s0 = cw.getPoint(0), s1 = cw.getPoint(1), y0 = cy.getPoint(0), y1 = cy.getPoint(1);
    const c0 = pos.length / 3; pos.push(0, y0.y, s0.x);
    const c1 = c0 + 1; pos.push(0, y1.y, s1.x);
    for (let k = 0; k < segK; k++) {
      const k2 = (k + 1) % segK;
      idx.push(c0, k, k2);
      idx.push(c1, segZ * segK + k2, segZ * segK + k);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  /* --------------------------------------------------------------------- */
  /* PROFILES                                                               */
  /* --------------------------------------------------------------------- */

  const headProf = profile([
    [0.000, 1.200], [0.200, 1.215], [0.375, 1.265], [0.520, 1.360], [0.625, 1.495],
    [0.685, 1.650], [0.712, 1.820], [0.705, 1.985], [0.660, 2.150], [0.575, 2.300],
    [0.440, 2.420], [0.245, 2.495], [0.000, 2.520]
  ], Q.headPts);

  const shirtProf = profile([
    [0.000, 0.585], [0.310, 0.590], [0.500, 0.612], [0.605, 0.658], [0.628, 0.722],
    [0.622, 0.822], [0.605, 0.932], [0.585, 1.032], [0.548, 1.132], [0.495, 1.216],
    [0.425, 1.292], [0.330, 1.352], [0.205, 1.400], [0.090, 1.421], [0.000, 1.426]
  ], Q.bodyPts);

  const hipProf = profile([
    [0.000, 0.300], [0.250, 0.306], [0.400, 0.332], [0.470, 0.396], [0.500, 0.492],
    [0.505, 0.602], [0.480, 0.692], [0.400, 0.756], [0.220, 0.790], [0.000, 0.800]
  ], Q.hipPts);

  const hairCapProf = profile([
    [0.000, 1.905], [0.380, 1.915], [0.560, 1.936], [0.664, 1.968], [0.686, 2.062],
    [0.646, 2.204], [0.566, 2.352], [0.424, 2.472], [0.238, 2.542], [0.000, 2.566]
  ], Q.capPts);

  const cupProf = profile([
    [0.000, 0.000], [0.150, 0.005], [0.250, 0.032], [0.296, 0.082], [0.306, 0.150],
    [0.294, 0.206], [0.248, 0.236], [0.150, 0.249], [0.000, 0.252]
  ], Q.cupPts);

  const fistProf = profile([
    [0.000, -0.215], [0.105, -0.198], [0.168, -0.150], [0.204, -0.070],
    [0.212, 0.020], [0.192, 0.110], [0.138, 0.180], [0.070, 0.212], [0.000, 0.222]
  ], Q.fistPts);

  /* --------------------------------------------------------------------- */
  /* TEXTURES                                                               */
  /* --------------------------------------------------------------------- */

  function cvs(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(c, srgb) {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.needsUpdate = true;
    return t;
  }
  function speckle(g, w, h, count, alpha) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 0.6 + Math.random() * 1.8;
      g.fillStyle = 'rgba(255,255,255,' + (alpha * (0.3 + Math.random() * 0.7)).toFixed(3) + ')';
      g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    }
  }

  // --- face -------------------------------------------------------------
  function faceCanvas() {
    const W = 2048, H = 1024, c = cvs(W, H), g = c.getContext('2d');
    g.fillStyle = '#eda152'; g.fillRect(0, 0, W, H);

    // vertical form shading: dark under the jaw, dark again where hair sits
    let vg = g.createLinearGradient(0, H, 0, 0);
    vg.addColorStop(0.00, 'rgba(120,58,14,0.92)');
    vg.addColorStop(0.13, 'rgba(155,80,24,0.55)');
    vg.addColorStop(0.30, 'rgba(255,205,150,0.10)');
    vg.addColorStop(0.52, 'rgba(255,220,175,0.20)');
    vg.addColorStop(0.70, 'rgba(150,78,24,0.30)');
    vg.addColorStop(0.86, 'rgba(96,44,10,0.80)');
    vg.addColorStop(1.00, 'rgba(70,30,6,0.95)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);

    // side occlusion where the ear cups clamp on
    for (const u of [0.25, 0.75]) {
      const rg = g.createRadialGradient(u * W, 0.48 * H, 10, u * W, 0.48 * H, 0.19 * W);
      rg.addColorStop(0, 'rgba(96,44,10,0.52)'); rg.addColorStop(1, 'rgba(96,44,10,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    // back of the head sits in shadow
    for (const u of [0.0, 1.0]) {
      const rg = g.createRadialGradient(u * W, 0.5 * H, 10, u * W, 0.5 * H, 0.20 * W);
      rg.addColorStop(0, 'rgba(70,30,6,0.55)'); rg.addColorStop(1, 'rgba(70,30,6,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }

    const mv = headProf.vAt(1.605);          // mouth centre, from real geometry
    const mx = 0.5 * W, my = (1 - mv) * H;

    // cheeks
    for (const s of [-1, 1]) {
      const rg = g.createRadialGradient(mx + s * 0.088 * W, my - 0.035 * H, 6, mx + s * 0.088 * W, my - 0.035 * H, 0.072 * W);
      rg.addColorStop(0, 'rgba(255,150,96,0.55)'); rg.addColorStop(1, 'rgba(255,150,96,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }

    // soft shadow the visor throws onto the face
    const bv = headProf.vAt(1.775);
    const sg = g.createLinearGradient(0, (1 - bv) * H - 60, 0, (1 - bv) * H + 70);
    sg.addColorStop(0, 'rgba(60,24,4,0.55)'); sg.addColorStop(1, 'rgba(60,24,4,0)');
    g.fillStyle = sg; g.fillRect(0.30 * W, (1 - bv) * H - 60, 0.40 * W, 140);

    // --- open laughing mouth, painted with depth ---
    const MW = 152, MH = 92;
    g.save(); g.translate(mx, my);
    const halo = g.createRadialGradient(0, 0, MW * 0.5, 0, 0, MW * 1.5);
    halo.addColorStop(0, 'rgba(120,52,12,0.50)'); halo.addColorStop(1, 'rgba(120,52,12,0)');
    g.fillStyle = halo; g.fillRect(-MW * 1.6, -MH * 1.8, MW * 3.2, MH * 3.6);

    g.beginPath();
    g.moveTo(-MW, -MH * 0.34);
    g.quadraticCurveTo(0, -MH * 0.62, MW, -MH * 0.34);
    g.quadraticCurveTo(MW * 0.72, MH * 1.06, 0, MH * 1.06);
    g.quadraticCurveTo(-MW * 0.72, MH * 1.06, -MW, -MH * 0.34);
    g.closePath();
    const cav = g.createLinearGradient(0, -MH * 0.6, 0, MH * 1.1);
    cav.addColorStop(0, '#1b0708'); cav.addColorStop(0.55, '#3a1113'); cav.addColorStop(1, '#571a1c');
    g.fillStyle = cav; g.fill();
    g.save(); g.clip();

    // tongue
    const tg = g.createRadialGradient(0, MH * 0.62, 8, 0, MH * 0.62, MW * 0.78);
    tg.addColorStop(0, '#f2776a'); tg.addColorStop(0.7, '#d4514a'); tg.addColorStop(1, '#8e2b2c');
    g.fillStyle = tg;
    g.beginPath(); g.ellipse(0, MH * 0.72, MW * 0.66, MH * 0.55, 0, 0, 6.2832); g.fill();

    // upper teeth
    g.fillStyle = '#fff8e8';
    g.beginPath();
    g.moveTo(-MW * 0.94, -MH * 0.30);
    g.quadraticCurveTo(0, -MH * 0.58, MW * 0.94, -MH * 0.30);
    g.lineTo(MW * 0.86, MH * 0.02);
    g.quadraticCurveTo(0, MH * 0.24, -MW * 0.86, MH * 0.02);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(150,120,90,0.35)'; g.lineWidth = 2.5;
    for (const d of [-0.52, -0.18, 0.18, 0.52]) {
      g.beginPath(); g.moveTo(MW * d, -MH * 0.42); g.lineTo(MW * d * 0.94, MH * 0.12); g.stroke();
    }
    // occlusion just inside the lip line
    const inner = g.createLinearGradient(0, -MH * 0.6, 0, -MH * 0.05);
    inner.addColorStop(0, 'rgba(0,0,0,0.55)'); inner.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = inner; g.fillRect(-MW, -MH * 0.7, MW * 2, MH * 0.7);
    g.restore();

    // lower lip catch-light
    g.strokeStyle = 'rgba(255,196,140,0.55)'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(-MW * 0.8, MH * 1.14); g.quadraticCurveTo(0, MH * 1.46, MW * 0.8, MH * 1.14); g.stroke();
    g.restore();

    speckle(g, W, H, 2600, 0.035);
    return c;
  }

  // --- shirt ------------------------------------------------------------
  function logoOn(g, x, y, w, mono) {
    const h = w * 0.78;
    g.save(); g.translate(x, y); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 ' + (h * 0.66).toFixed(0) + 'px "Arial Black", Arial, sans-serif';
    if (mono) {
      g.fillStyle = '#ffffff';
      g.fillText('G', -w * 0.17, -h * 0.10);
      g.fillText('B', w * 0.19, -h * 0.10);
    } else {
      g.fillStyle = '#fdf7e4';
      g.fillText('G', -w * 0.17, -h * 0.10);
      const grad = g.createLinearGradient(w * 0.02, 0, w * 0.36, 0);
      grad.addColorStop(0.00, '#9df6ff'); grad.addColorStop(0.48, '#48d6e6');
      grad.addColorStop(0.50, '#ff5cc8'); grad.addColorStop(1.00, '#d24cff');
      g.fillStyle = grad;
      g.fillText('B', w * 0.19, -h * 0.10);
    }
    g.font = '900 ' + (h * 0.155).toFixed(0) + 'px "Arial Black", Arial, sans-serif';
    g.fillStyle = mono ? '#ffffff' : '#f6fbff';
    g.letterSpacing && (g.letterSpacing = '4px');
    g.fillText('GAMER BROS', 0, h * 0.36);
    g.restore();
  }

  function shirtCanvases() {
    const W = 2048, H = 1024;
    const alb = cvs(W, H), ga = alb.getContext('2d');
    const emi = cvs(W, H), ge = emi.getContext('2d');
    const rgh = cvs(1024, 512), gr = rgh.getContext('2d');

    ga.fillStyle = P.shirt; ga.fillRect(0, 0, W, H);
    let vg = ga.createLinearGradient(0, H, 0, 0);
    vg.addColorStop(0.00, 'rgba(0,0,0,0.50)');
    vg.addColorStop(0.16, 'rgba(0,0,0,0.24)');
    vg.addColorStop(0.55, 'rgba(255,255,255,0.06)');
    vg.addColorStop(0.86, 'rgba(255,255,255,0.16)');
    vg.addColorStop(1.00, 'rgba(0,0,0,0.42)');       // collar rolls into shadow
    ga.fillStyle = vg; ga.fillRect(0, 0, W, H);

    for (const u of [0.235, 0.765]) {                 // armpit occlusion
      const rg = ga.createRadialGradient(u * W, 0.72 * H, 12, u * W, 0.72 * H, 0.16 * W);
      rg.addColorStop(0, 'rgba(0,0,0,0.46)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ga.fillStyle = rg; ga.fillRect(0, 0, W, H);
    }
    for (const u of [0.0, 1.0]) {
      const rg = ga.createRadialGradient(u * W, 0.5 * H, 12, u * W, 0.5 * H, 0.22 * W);
      rg.addColorStop(0, 'rgba(0,0,0,0.34)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ga.fillStyle = rg; ga.fillRect(0, 0, W, H);
    }
    ga.fillStyle = P.shirtLo;
    ga.globalAlpha = 0.85; ga.fillRect(0, 0, W, 0.045 * H); ga.globalAlpha = 1;  // hem band

    const lv = shirtProf.vAt(1.020);
    const lx = 0.5 * W, ly = (1 - lv) * H, lw = 0.235 * W;
    logoOn(ga, lx, ly, lw, false);
    speckle(ga, W, H, 5200, 0.045);

    ge.fillStyle = '#000'; ge.fillRect(0, 0, W, H);
    logoOn(ge, lx, ly, lw, true);

    gr.fillStyle = '#9c9c9c'; gr.fillRect(0, 0, 1024, 512);
    speckle(gr, 1024, 512, 4200, 0.20);
    gr.fillStyle = '#4a4a4a';
    gr.globalAlpha = 0.9;
    gr.fillRect(0.5 * 1024 - lw * 0.28, (1 - lv) * 512 - lw * 0.22, lw * 0.56, lw * 0.44);
    gr.globalAlpha = 1;
    return { alb, emi, rgh };
  }

  function hipCanvas() {
    const W = 1024, H = 512, c = cvs(W, H), g = c.getContext('2d');
    g.fillStyle = '#14161f'; g.fillRect(0, 0, W, H);
    const vg = g.createLinearGradient(0, H, 0, 0);
    vg.addColorStop(0, 'rgba(0,0,0,0.65)');
    vg.addColorStop(0.45, 'rgba(120,130,160,0.16)');
    vg.addColorStop(1, 'rgba(0,0,0,0.70)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    for (const u of [0.0, 1.0, 0.25, 0.75]) {
      const rg = g.createRadialGradient(u * W, 0.5 * H, 8, u * W, 0.5 * H, 0.16 * W);
      rg.addColorStop(0, 'rgba(0,0,0,0.45)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    speckle(g, W, H, 2600, 0.05);
    return c;
  }

  function blobCanvas() {
    const S = 256, c = cvs(S, S), g = c.getContext('2d');
    const rg = g.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
    rg.addColorStop(0.00, 'rgba(0,0,0,1)');
    rg.addColorStop(0.34, 'rgba(0,0,0,0.82)');
    rg.addColorStop(0.66, 'rgba(0,0,0,0.32)');
    rg.addColorStop(1.00, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, S, S);
    return c;
  }

  const faceTex = tex(faceCanvas());
  const shirtC = shirtCanvases();
  const shirtTex = tex(shirtC.alb);
  const shirtEmi = tex(shirtC.emi);
  const shirtRgh = tex(shirtC.rgh, false);
  const hipTex = tex(hipCanvas());
  const blobTex = tex(blobCanvas());

  /* --------------------------------------------------------------------- */
  /* MATERIALS                                                              */
  /* --------------------------------------------------------------------- */

  const M = {};
  M.skin = new THREE.MeshPhysicalMaterial({
    map: faceTex, roughness: 0.46, metalness: 0,
    clearcoat: 0.28, clearcoatRoughness: 0.42,
    sheen: 0.45, sheenColor: new THREE.Color(0xffb37a), sheenRoughness: 0.7,
    envMapIntensity: 1.0
  });
  M.skinPlain = new THREE.MeshPhysicalMaterial({
    color: 0xeda152, roughness: 0.46, metalness: 0,
    clearcoat: 0.28, clearcoatRoughness: 0.42,
    sheen: 0.45, sheenColor: new THREE.Color(0xffb37a), sheenRoughness: 0.7,
    envMapIntensity: 1.0
  });
  M.shirt = new THREE.MeshPhysicalMaterial({
    map: shirtTex, roughnessMap: shirtRgh, emissiveMap: shirtEmi,
    emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.30,
    roughness: 0.72, metalness: 0.02,
    sheen: 0.55, sheenColor: new THREE.Color(0x8ff2ff), sheenRoughness: 0.55,
    envMapIntensity: 0.85
  });
  M.dark = new THREE.MeshPhysicalMaterial({
    map: hipTex, roughness: 0.68, metalness: 0.04, clearcoat: 0.12, envMapIntensity: 0.6
  });
  M.darkPlain = new THREE.MeshPhysicalMaterial({ color: 0x14161f, roughness: 0.68, metalness: 0.04, envMapIntensity: 0.6 });
  M.hair = new THREE.MeshPhysicalMaterial({
    color: 0xf7bf46, roughness: 0.30, metalness: 0.03,
    clearcoat: 0.55, clearcoatRoughness: 0.18, envMapIntensity: 1.25
  });
  M.hairDeep = new THREE.MeshPhysicalMaterial({
    color: 0xc07f1c, roughness: 0.42, metalness: 0.03, clearcoat: 0.35, envMapIntensity: 0.9
  });
  M.frame = new THREE.MeshPhysicalMaterial({
    color: 0x18345a, roughness: 0.20, metalness: 0.38, clearcoat: 0.82, clearcoatRoughness: 0.08, envMapIntensity: 1.45
  });
  M.lens = new THREE.MeshPhysicalMaterial({
    color: 0x55dcff, emissive: 0x145b93, emissiveIntensity: 0.58,
    roughness: 0.06, metalness: 0.18, clearcoat: 1, clearcoatRoughness: 0.03,
    iridescence: 0.35, iridescenceIOR: 1.4, envMapIntensity: 1.9
  });
  M.cup = new THREE.MeshPhysicalMaterial({ color: 0x25c6cf, roughness: 0.36, metalness: 0.06, clearcoat: 0.42, envMapIntensity: 1.0 });
  M.cupAccent = new THREE.MeshPhysicalMaterial({ color: 0xff9d35, roughness: 0.30, metalness: 0.07, clearcoat: 0.48, envMapIntensity: 1.15 });
  M.pad = new THREE.MeshPhysicalMaterial({ color: 0x26324a, roughness: 0.82, metalness: 0.0, sheen: 0.6, sheenColor: new THREE.Color(0x6a7288), envMapIntensity: 0.5 });
  M.trim = new THREE.MeshPhysicalMaterial({ color: 0xef4fa8, roughness: 0.30, metalness: 0.05, clearcoat: 0.48, envMapIntensity: 1.2 });
  M.sole = new THREE.MeshPhysicalMaterial({ color: 0xf6efe4, roughness: 0.48, metalness: 0.01, clearcoat: 0.18, envMapIntensity: 0.85 });
  M.shoe = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(P.shirt), roughness: 0.38, metalness: 0.04, clearcoat: 0.35, envMapIntensity: 1.0 });

  /* --------------------------------------------------------------------- */
  /* RIG                                                                    */
  /* --------------------------------------------------------------------- */

  const root = new THREE.Group();
  const bob = new THREE.Group(); root.add(bob);
  const body = new THREE.Group(); bob.add(body);
  const all = [];

  function mesh(parent, geo, mat, pos, scl, rot) {
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.copy(pos);
    if (scl) m.scale.copy(scl);
    if (rot) m.rotation.copy(rot);
    m.castShadow = true; m.receiveShadow = true;
    m.layers.set(1);                         // lit only by the character rig
    parent.add(m); all.push(m);
    return m;
  }

  // --- contact shadow ---------------------------------------------------
  const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.55, color: 0x000000 });
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.35), blobMat);
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.014; blob.renderOrder = -1;
  root.add(blob);

  // --- head, shirt, hips -------------------------------------------------
  const head = mesh(body, latheOf(headProf, Q.headSeg), M.skin, null, V3(1.04, 1, 0.965));
  head.userData.keep = true;
  const shirt = mesh(body, latheOf(shirtProf, Q.bodySeg), M.shirt, null, V3(1.02, 1, 0.90));
  shirt.userData.keep = true;
  const hips = mesh(body, latheOf(hipProf, Q.hipSeg), M.dark, null, V3(1.02, 1, 0.88));
  const hairCap = mesh(body, latheOf(hairCapProf, Q.capSeg), M.hair, null, V3(1.045, 1, 0.985));
  hairCap.userData.keep = true;
  const collar = mesh(body, new THREE.TorusGeometry(0.335, 0.052, 8, 30), M.trim,
    V3(0, 1.372, 0), V3(1.02, 1, 0.90), new THREE.Euler(Math.PI / 2, 0, 0));

  // --- glasses / visor ---------------------------------------------------
  // Two distinct glossy lenses with their own frames instead of one black visor slab.
  const glassesGroup = new THREE.Group(); body.add(glassesGroup);
  const leftFrame = mesh(glassesGroup, wrapShell({
    rx: 0.802, rz: 0.772, yc: 1.862, half: 0.165, span: 1.04, centerA: -0.54, thick: 0.058,
    notch: 0.030, notchW: 0.30, taper: 0.17, domeY: 0.17, segA: Math.max(20,Q.visA-10), segV: Q.visV+2
  }), M.frame);
  const rightFrame = mesh(glassesGroup, wrapShell({
    rx: 0.802, rz: 0.772, yc: 1.862, half: 0.165, span: 1.04, centerA: 0.54, thick: 0.058,
    notch: 0.030, notchW: 0.30, taper: 0.17, domeY: 0.17, segA: Math.max(20,Q.visA-10), segV: Q.visV+2
  }), M.frame);
  const lensL = mesh(glassesGroup, wrapShell({
    rx: 0.812, rz: 0.783, yc: 1.865, half: 0.132, span: 0.90, centerA: -0.54, thick: 0.030,
    notch: 0.018, notchW: 0.34, taper: 0.13, domeY: 0.16, segA: Math.max(18,Q.visA-12), segV: Q.visV+1
  }), M.lens);
  const lensR = mesh(glassesGroup, wrapShell({
    rx: 0.812, rz: 0.783, yc: 1.865, half: 0.132, span: 0.90, centerA: 0.54, thick: 0.030,
    notch: 0.018, notchW: 0.34, taper: 0.13, domeY: 0.16, segA: Math.max(18,Q.visA-12), segV: Q.visV+1
  }), M.lens);
  const bridge = mesh(glassesGroup,new THREE.BoxGeometry(.18,.075,.095),M.frame,V3(0,1.865,.782),null,new THREE.Euler(0,0,0));
  const bridgeCap = mesh(glassesGroup,new THREE.BoxGeometry(.085,.16,.065),M.frame,V3(0,1.825,.790),null,new THREE.Euler(0,0,0));
  const browL = mesh(glassesGroup, wrapShell({
    rx:.814,rz:.785,yc:2.010,half:.026,span:.93,centerA:-.54,thick:.040,taper:.12,domeY:.06,segA:Math.max(16,Q.visA-14),segV:2
  }),M.frame);
  const browR = mesh(glassesGroup, wrapShell({
    rx:.814,rz:.785,yc:2.010,half:.026,span:.93,centerA:.54,thick:.040,taper:.12,domeY:.06,segA:Math.max(16,Q.visA-14),segV:2
  }),M.frame);

  // --- headphones --------------------------------------------------------
  function earCup(side) {
    const g = new THREE.Group();
    g.position.set(side * 0.795, 1.862, -0.025);
    g.rotation.z = -side * Math.PI / 2;
    g.rotation.y = side * 0.05;
    body.add(g);
    mesh(g, latheOf(cupProf, Q.cupSeg), M.frame, V3(0, -0.02, 0), V3(1.0, 1.0, 1.0));
    mesh(g, latheOf(cupProf, Q.cupSeg), M.cup, V3(0, 0.02, 0), V3(0.86, 0.72, 0.86));
    mesh(g, latheOf(cupProf, Q.cupSeg), M.pad, V3(0, -0.10, 0), V3(0.72, 0.55, 0.72));
    mesh(g, new THREE.TorusGeometry(0.235, 0.028, 7, 24), M.cupAccent, V3(0, 0.168, 0), null, new THREE.Euler(Math.PI / 2, 0, 0));
    mesh(g, new THREE.CylinderGeometry(0.075, 0.075, 0.055, 14), M.trim, V3(0, 0.205, 0));
    return g;
  }
  const cupL = earCup(-1), cupR = earCup(1);

  const band = mesh(body, swept({
    path: [V3(-0.79, 1.98, -0.05), V3(-0.60, 2.36, -0.12), V3(0, 2.60, -0.17), V3(0.60, 2.36, -0.12), V3(0.79, 1.98, -0.05)],
    seg: 26, radial: 10, up: V3(0, 0, 1),
    width: t => 0.185 - 0.03 * Math.sin(t * Math.PI),
    thick: t => 0.115 + 0.02 * Math.sin(t * Math.PI)
  }), M.frame);
  const bandPad = mesh(body, swept({
    path: [V3(-0.48, 2.30, -0.13), V3(0, 2.545, -0.185), V3(0.48, 2.30, -0.13)],
    seg: 14, radial: 9, up: V3(0, 0, 1),
    width: () => 0.155, thick: () => 0.075
  }), M.cupAccent);

  // --- hair --------------------------------------------------------------
  const hairGroup = new THREE.Group(); body.add(hairGroup);
  const LOCKS = [
    // front cowlick / hero sweep
    [[-0.04,2.39,0.38],[-0.02,2.70,0.36],[-0.18,2.98,0.12],1.14],
    [[0.11,2.40,0.39],[0.32,2.72,0.34],[0.72,2.91,0.10],1.17],
    [[-0.21,2.36,0.34],[-0.38,2.62,0.31],[-0.67,2.78,0.07],1.08],
    [[0.28,2.36,0.32],[0.53,2.58,0.27],[0.83,2.69,0.02],1.05],
    // upper crown spikes
    [[-0.10,2.40,0.25],[-0.15,2.67,0.13],[-0.24,2.84,-0.08],1.00],
    [[0.13,2.40,0.26],[0.21,2.72,0.14],[0.35,2.87,-0.04],1.05],
    [[0.00,2.49,0.08],[0.03,2.80,-0.02],[0.00,2.98,-0.25],1.00],
    [[-0.34,2.33,0.13],[-0.50,2.60,0.00],[-0.63,2.73,-0.21],1.00],
    [[0.38,2.31,0.11],[0.56,2.57,-0.01],[0.72,2.67,-0.23],1.03],
    // side/back volume and smaller spikes
    [[-0.23,2.42,-0.16],[-0.31,2.65,-0.34],[-0.39,2.72,-0.59],0.90],
    [[0.25,2.40,-0.18],[0.35,2.62,-0.36],[0.46,2.68,-0.60],0.92],
    [[-0.53,2.15,0.03],[-0.66,2.33,-0.10],[-0.74,2.40,-0.34],0.86],
    [[0.55,2.13,0.01],[0.68,2.30,-0.13],[0.78,2.36,-0.36],0.88],
    [[-0.61,2.23,-0.16],[-0.72,2.38,-0.32],[-0.78,2.43,-0.52],0.72],
    [[0.62,2.21,-0.17],[0.73,2.36,-0.34],[0.82,2.40,-0.54],0.74],
    [[-0.34,2.30,-0.42],[-0.39,2.50,-0.56],[-0.40,2.55,-0.72],0.67],
    [[0.34,2.28,-0.44],[0.40,2.47,-0.58],[0.42,2.52,-0.74],0.69]
  ];
  const hairMeshes = [];
  for (const L of LOCKS) {
    const pts = [V3(...L[0]), V3(...L[1]), V3(...L[2])];
    const k = L[3];
    let up = V3(L[0][0], 0, L[0][2]);
    if (up.lengthSq() < 1e-4) up.set(0, 0, 1); else up.normalize();
    const m = mesh(hairGroup, swept({
      path: pts, seg: Q.lockSeg, radial: Q.lockRad, up,
      width: t => k * (0.32 - 0.105 * t - 0.215 * Math.pow(t, 3)),
      thick: t => k * (0.168 - 0.050 * t - 0.118 * Math.pow(t, 3))
    }), M.hair);
    hairMeshes.push(m);
  }

  // --- arms --------------------------------------------------------------
  function buildArm(side, pose) {
    const pivot = new THREE.Group();
    const px = side * 0.505, py = 1.145, pz = 0.02;
    pivot.position.set(px, py, pz);
    body.add(pivot);
    const off = V3(-px, -py, -pz);

    const sleeve = swept({
      path: [V3(side * 0.24, 1.235, 0.00), V3(side * 0.50, 1.150, 0.02), V3(side * 0.635, 1.020, 0.05)],
      seg: Q.limbSeg - 3, radial: Q.limbRad, up: V3(0, 1, 0),
      width: t => 0.455 - 0.10 * t, thick: t => 0.435 - 0.09 * t
    });
    sleeve.translate(off.x, off.y, off.z);
    mesh(pivot, sleeve, M.shirt);

    const arm = swept({
      path: pose.arm.map(p => V3(p[0] * side, p[1], p[2])),
      seg: Q.limbSeg, radial: Q.limbRad, up: V3(0, 1, 0),
      width: t => 0.335 - 0.045 * t, thick: t => 0.325 - 0.04 * t
    });
    arm.translate(off.x, off.y, off.z);
    mesh(pivot, arm, M.skinPlain);

    const fistGeo = latheOf(fistProf, Q.fistSeg);
    fistGeo.translate(pose.fist[0] * side + off.x, pose.fist[1] + off.y, pose.fist[2] + off.z);
    const fist = mesh(pivot, fistGeo, M.skinPlain);
    fist.scale.set(1.08, 1.0, 1.02);

    const thumb = swept({
      path: pose.thumb.map(p => V3(p[0] * side, p[1], p[2])),
      seg: 6, radial: 8, up: V3(0, 1, 0),
      width: t => 0.135 - 0.03 * t, thick: t => 0.125 - 0.03 * t
    });
    thumb.translate(off.x, off.y, off.z);
    mesh(pivot, thumb, M.skinPlain);
    // knuckle ridge
    const kn = swept({
      path: [V3((pose.fist[0] - 0.14) * side, pose.fist[1] + 0.09, pose.fist[2] + 0.08),
             V3((pose.fist[0] + 0.13) * side, pose.fist[1] + 0.09, pose.fist[2] + 0.10)],
      seg: 4, radial: 8, up: V3(0, 1, 0),
      width: () => 0.09, thick: () => 0.075
    });
    kn.translate(off.x, off.y, off.z);
    mesh(pivot, kn, M.skinPlain);
    return pivot;
  }

  const armL = buildArm(-1, {                     // relaxed, fist by the hip
    arm: [[0.62, 1.030, 0.05], [0.68, 0.900, 0.10], [0.665, 0.790, 0.17]],
    fist: [0.645, 0.700, 0.215],
    thumb: [[0.545, 0.740, 0.245], [0.505, 0.700, 0.315]]
  });
  const armR = buildArm(1, {                      // fist up and forward
    arm: [[0.62, 1.030, 0.06], [0.66, 0.985, 0.24], [0.60, 0.975, 0.40]],
    fist: [0.565, 0.965, 0.505],
    thumb: [[0.470, 1.010, 0.545], [0.405, 1.030, 0.605]]
  });
  armR.rotation.x = -0.10;

  // --- controller / action pose -----------------------------------------
  const controllerGroup=new THREE.Group();
  controllerGroup.position.set(0,1.00,.60);controllerGroup.rotation.x=-.10;controllerGroup.visible=false;body.add(controllerGroup);
  const controllerBody=mesh(controllerGroup,new THREE.CapsuleGeometry(.135,.34,5,14),M.frame,V3(0,0,0),V3(1.18,1.0,1.12),new THREE.Euler(0,0,Math.PI/2));
  const controllerPlate=mesh(controllerGroup,new THREE.BoxGeometry(.45,.075,.23),M.cup,V3(0,.045,.015),null,new THREE.Euler(0,0,0));
  const gripL=mesh(controllerGroup,new THREE.SphereGeometry(.13,14,10),M.frame,V3(-.25,-.035,.00),V3(.9,1.25,.95));
  const gripR=mesh(controllerGroup,new THREE.SphereGeometry(.13,14,10),M.frame,V3(.25,-.035,.00),V3(.9,1.25,.95));
  const stickGeo=new THREE.CylinderGeometry(.035,.045,.055,10);
  const stickL=mesh(controllerGroup,stickGeo,M.darkPlain,V3(-.10,.10,.085));
  const stickR=mesh(controllerGroup,stickGeo,M.darkPlain,V3(.10,.10,.085));
  const buttonGeo=new THREE.SphereGeometry(.025,8,6);
  mesh(controllerGroup,buttonGeo,M.trim,V3(.16,.10,.10));mesh(controllerGroup,buttonGeo,M.cupAccent,V3(.22,.075,.10));
  const controllerEmitter=new THREE.Object3D();controllerEmitter.position.set(0,.02,.20);controllerGroup.add(controllerEmitter);
  let actionActive=false,actionBlend=0;

  // --- legs and sneakers -------------------------------------------------
  function buildShoe(parent, side) {
    const g = new THREE.Group();
    g.position.set(0, -0.375, 0.02);
    g.rotation.y = side * 0.10;
    parent.add(g);

    mesh(g, shoeSweep({
      n: 4.2, segZ: Q.shoeZ, segK: Q.shoeK,
      slices: [
        [-0.245, 0.080, 0.042, 0.048], [-0.200, 0.140, 0.064, 0.066],
        [-0.100, 0.170, 0.072, 0.074], [0.050, 0.180, 0.074, 0.076],
        [0.200, 0.184, 0.072, 0.074], [0.320, 0.170, 0.064, 0.068],
        [0.400, 0.132, 0.050, 0.060], [0.445, 0.062, 0.028, 0.052]
      ]
    }), M.sole);

    mesh(g, shoeSweep({
      n: 2.5, segZ: Q.shoeZ, segK: Q.shoeK,
      slices: [
        [-0.225, 0.090, 0.108, 0.190], [-0.185, 0.152, 0.140, 0.200],
        [-0.080, 0.174, 0.145, 0.194], [0.045, 0.176, 0.128, 0.182],
        [0.165, 0.171, 0.102, 0.166], [0.285, 0.157, 0.079, 0.149],
        [0.375, 0.121, 0.058, 0.135], [0.430, 0.056, 0.032, 0.126]
      ]
    }), M.shoe);

    mesh(g, shoeSweep({                       // white toe cap
      n: 2.8, segZ: Q.shoeZ - 8, segK: Q.shoeK - 4,
      slices: [
        [0.175, 0.174, 0.098, 0.164], [0.265, 0.161, 0.081, 0.150],
        [0.360, 0.128, 0.061, 0.136], [0.432, 0.058, 0.034, 0.126]
      ]
    }), M.sole);

    mesh(g, new THREE.TorusGeometry(0.145, 0.036, 7, 22), M.trim,
      V3(0, 0.300, -0.150), V3(1.05, 1, 1.15), new THREE.Euler(Math.PI / 2, 0, 0));

    for (const s of [-1, 1]) {                 // side flash in the trim colour
      const st = swept({
        path: [V3(s * 0.168, 0.155, -0.145), V3(s * 0.182, 0.120, 0.020), V3(s * 0.150, 0.150, 0.230)],
        seg: 10, radial: 6, up: V3(0, 1, 0),
        width: () => 0.030, thick: t => 0.095 - 0.03 * t
      });
      mesh(g, st, M.trim);
    }
    return g;
  }

  function buildLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.245, 0.585, 0.00);
    body.add(pivot);
    const leg = swept({
      path: [V3(side * 0.235, 0.660, -0.01), V3(side * 0.243, 0.450, 0.00), V3(side * 0.248, 0.255, 0.02)],
      seg: Q.limbSeg - 4, radial: Q.limbRad, up: V3(0, 1, 0),
      width: t => 0.335 - 0.055 * t, thick: t => 0.325 - 0.05 * t
    });
    leg.translate(-pivot.position.x, -pivot.position.y, -pivot.position.z);
    mesh(pivot, leg, M.darkPlain);
    const shoe = buildShoe(pivot, side);
    return { pivot, shoe };
  }
  const legL = buildLeg(-1), legR = buildLeg(1);


  // Merge sibling meshes that share a material. Cuts draw calls (and shadow-pass
  // draw calls) roughly 4x without touching the rig hierarchy.
  function mergeByMaterial(group) {
    const buckets = new Map();
    for (const child of group.children.slice()) {
      if (!child.isMesh || child.userData.keep) continue;
      const arr = buckets.get(child.material) || [];
      arr.push(child); buckets.set(child.material, arr);
    }
    for (const [mat, list] of buckets) {
      if (list.length < 2) continue;
      const pos = [], nor = [], uv = [], idx = [];
      let base = 0;
      const nm = new THREE.Matrix3(), v = new THREE.Vector3();
      for (const m of list) {
        m.updateMatrix();
        nm.getNormalMatrix(m.matrix);
        const g = m.geometry, pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv;
        for (let i = 0; i < pa.count; i++) {
          v.fromBufferAttribute(pa, i).applyMatrix4(m.matrix); pos.push(v.x, v.y, v.z);
          if (na) { v.fromBufferAttribute(na, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z); }
          else nor.push(0, 1, 0);
          if (ua) uv.push(ua.getX(i), ua.getY(i)); else uv.push(0, 0);
        }
        const ix = g.getIndex();
        if (ix) for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + base);
        else for (let i = 0; i < pa.count; i++) idx.push(i + base);
        base += pa.count;
        group.remove(m);
        const k = all.indexOf(m); if (k >= 0) all.splice(k, 1);
        g.dispose();
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      const m = new THREE.Mesh(g, mat);
      m.castShadow = true; m.receiveShadow = true; m.layers.set(1);
      group.add(m); all.push(m);
    }
  }

  for (const g of [body, hairGroup, cupL, cupR, armL, armR, legL.pivot, legR.pivot, legL.shoe, legR.shoe]) mergeByMaterial(g);

  /* --------------------------------------------------------------------- */
  /* CHARACTER-ONLY LIGHT RIG (render layer 1)                              */
  /* --------------------------------------------------------------------- */

  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, 1.55, 0);
  root.add(lightTarget);

  function charLight(color, intensity, pos) {
    const l = new THREE.DirectionalLight(color, intensity);
    l.position.set(pos[0], pos[1], pos[2]);
    l.target = lightTarget;
    l.layers.set(1);                       // touches nothing but this character
    root.add(l);
    return l;
  }
  const charAmbient = new THREE.HemisphereLight(0x6d6193, 0x2c1c10, 0.62);
  charAmbient.layers.set(1);
  root.add(charAmbient);

  const rimMagenta = charLight(0xff3fb4, 1.45, [-3.4, 3.4, -3.0]);
  const rimCyan = charLight(0x38d8ff, 1.15, [3.6, 2.6, -2.6]);
  const fill = charLight(0x8f7fff, 0.42, [0.4, 1.2, 4.2]);

  const charKey = new THREE.DirectionalLight(0xfff0d8, 1.9);
  charKey.position.set(-2.4, 4.4, 3.2);
  charKey.target = lightTarget;
  charKey.layers.set(1);
  charKey.castShadow = true;
  charKey.shadow.mapSize.set(HI ? 1024 : 512, HI ? 1024 : 512);
  const sc = charKey.shadow.camera;
  sc.left = -1.7; sc.right = 1.7; sc.top = 3.4; sc.bottom = -0.6; sc.near = 0.5; sc.far = 14;
  sc.updateProjectionMatrix();
  charKey.shadow.bias = -0.0006;
  charKey.shadow.normalBias = 0.022;
  charKey.shadow.autoUpdate = true;        // one small object; cheap every frame
  root.add(charKey);

  /* --------------------------------------------------------------------- */
  /* ANIMATION                                                              */
  /* --------------------------------------------------------------------- */

  const BASE = { mag: 1.45, cyan: 1.15, fill: 0.42, key: 1.9, amb: 0.62 };
  let roomMult = 1;
  function setRoomLight(mult) {
    roomMult = mult;
    charAmbient.intensity = BASE.amb * mult;
    fill.intensity = BASE.fill * mult;
    charKey.intensity = BASE.key * (0.45 + 0.55 * mult);
  }

  const MODES = ['idle', 'walk', 'run'];
  let motion = 'idle';
  const home = { x: 0, z: 0, ry: 0 };

  function update(t, dt, fx) {
    fx = fx || 0;
    const walk = motion === 'walk', run = motion === 'run';
    const move = walk ? 0.62 : (run ? 1 : 0);
    const speed = walk ? 3.0 : (run ? 5.25 : 1.0);
    const cy = t * speed;
    const breath = Math.sin(t * 1.65), step = Math.sin(cy), step2 = Math.sin(cy + Math.PI);
    const b = move ? Math.abs(Math.sin(cy)) * (run ? 0.075 : 0.045) : 0.026 * breath;

    bob.position.y = b;
    bob.rotation.z = (move ? 0.045 : 0.022) * Math.sin(cy * 0.5);
    body.rotation.y = 0.035 * Math.sin(t * 0.43);
    body.rotation.x = 0.015 * Math.sin(t * 0.57);

    shirt.scale.y = 1 + 0.022 * breath + 0.016 * move * Math.sin(cy * 2);
    head.position.y = 0.008 * breath;
    hairCap.position.y = head.position.y;
    hairGroup.position.y = head.position.y;

    actionBlend += ((actionActive?1:0)-actionBlend)*Math.min(1,dt*9.5);
    controllerGroup.visible=actionBlend>.025;
    controllerGroup.scale.setScalar(.92+.08*actionBlend);
    const armLX=0.08 + step * move * (run ? 0.90 : 0.62);
    const armRX=-0.08 - step * move * (run ? 0.84 : 0.58);
    const armLZ=0.07 - 0.15 * move * Math.sin(cy * 0.5);
    const armRZ=-0.07 + 0.13 * move * Math.sin(cy * 0.5);
    armL.rotation.x=THREE.MathUtils.lerp(armLX,-1.04,actionBlend);
    armR.rotation.x=THREE.MathUtils.lerp(armRX,-1.04,actionBlend);
    armL.rotation.z=THREE.MathUtils.lerp(armLZ,.62,actionBlend);
    armR.rotation.z=THREE.MathUtils.lerp(armRZ,-.62,actionBlend);
    armL.position.x=THREE.MathUtils.lerp(-.505,-.425,actionBlend);
    armR.position.x=THREE.MathUtils.lerp(.505,.425,actionBlend);
    armL.position.z=THREE.MathUtils.lerp(.02,.09,actionBlend);
    armR.position.z=THREE.MathUtils.lerp(.02,.09,actionBlend);

    legL.pivot.rotation.x = -step * move * (run ? 0.82 : 0.58);
    legR.pivot.rotation.x = -step2 * move * (run ? 0.82 : 0.58);
    legL.pivot.rotation.z = .035 * move * Math.sin(cy);
    legR.pivot.rotation.z = -.035 * move * Math.sin(cy);
    legL.shoe.rotation.x = Math.max(0, step) * move * (run?.34:.25);
    legR.shoe.rotation.x = Math.max(0, step2) * move * (run?.34:.25);
    legL.shoe.position.y = -.375 + Math.max(0,-step) * move * (run?.16:.11);
    legR.shoe.position.y = -.375 + Math.max(0,-step2) * move * (run?.16:.11);
    legL.shoe.position.z = .02 + Math.max(0,step) * move * .055;
    legR.shoe.position.z = .02 + Math.max(0,step2) * move * .055;

    hairGroup.rotation.z = 0.018 * Math.sin(t * 1.2) + 0.032 * move * Math.sin(cy * 0.5 + 0.5);
    hairGroup.rotation.x = 0.022 * Math.sin(t * 0.9) + 0.045 * move * Math.sin(cy + 0.8);

    M.lens.emissiveIntensity = 0.38 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.9)) + fx * 0.20;
    M.shirt.emissiveIntensity = 0.26 + 0.10 * fx;
    rimMagenta.intensity = (BASE.mag + fx * 0.55) * (0.55 + 0.45 * roomMult);
    rimCyan.intensity = (BASE.cyan + fx * 0.40) * (0.55 + 0.45 * roomMult);

    root.position.x = home.x + 0.025 * Math.sin(t * 0.39);
    root.position.z = home.z + (move ? 0.035 : 0) * Math.sin(cy * 0.5);
    root.rotation.y = home.ry + 0.025 * Math.sin(t * 0.31);

    blobMat.opacity = 0.55 - 0.10 * move - b * 0.35 + 0.05 * fx;
    blob.scale.set(1 - b * 0.22, 1 - b * 0.14, 1);
  }

  function setColorway(name) {
    P = PALETTES[name] || PALETTES.teal;
    const c = shirtCanvases();
    shirtTex.image = c.alb; shirtTex.needsUpdate = true;
    shirtEmi.image = c.emi; shirtEmi.needsUpdate = true;
    shirtRgh.image = c.rgh; shirtRgh.needsUpdate = true;
    M.cup.color.set(0x25c6cf); M.cupAccent.color.set(0xff9d35);
    M.trim.color.set(0xef4fa8); M.shoe.color.set(P.shirt);
    return name;
  }

  if (cfg.height) {
    const bb = new THREE.Box3().setFromObject(body);
    root.scale.setScalar(cfg.height / Math.max(0.001, bb.max.y));
  }

  return {
    root, body, head, all,
    lights: [rimMagenta, rimCyan, fill, charKey],
    materials: M,
    get motion() { return motion; },
    setMotion(m) { motion = MODES.indexOf(m) >= 0 ? m : 'idle'; return motion; },
    cycleMotion() { motion = MODES[(MODES.indexOf(motion) + 1) % MODES.length]; return motion; },
    setColorway, setRoomLight,
    setHome(x, z, ry) { home.x = x; home.z = z; home.ry = ry || 0; root.position.set(x, root.position.y, z); },
    setVisible(v) { root.visible = v; },
    setAction(v){actionActive=!!v;return actionActive;},
    get action(){return actionActive;},
    controllerGroup, controllerEmitter,
    update
  };
}

    // ------------------------------------------------------------
    // GAMER BRO — INSTANCE + WIRING
    // ------------------------------------------------------------
    const gamerBase=new THREE.Vector3(arenaLayout.spawn.x,.02,arenaLayout.spawn.z);
    const bro=createGamerBro(THREE,renderer,{
      colorway:'teal',
      detail:resolvedQuality==='performance'?'low':'high',
      height:2.62
    });
    const gamerRoot=bro.root;
    gamerRoot.position.copy(gamerBase);
    bro.setHome(gamerBase.x,gamerBase.z,-0.16);
    gamerRoot.position.y=gamerBase.y;
    bro.setRoomLight(roomLightMult);
    scene.add(gamerRoot);
    window.__bro=bro;            // read by applyRoomLight(), see EDIT 4

    let gamerVisible=true,gamerMotion='idle';
    function updateCharacterUI(){
      characterStatus.textContent='TEAL · '+gamerMotion.toUpperCase();
      motionBtn.textContent='MOTION: '+gamerMotion.toUpperCase();
      characterBtn.textContent='HERO: '+(gamerVisible?'ON':'OFF');
      characterBtn.classList.toggle('active',gamerVisible);
    }
    motionBtn.addEventListener('click',()=>{gamerMotion=bro.cycleMotion();updateCharacterUI();hint.classList.add('fade');});
    characterBtn.addEventListener('click',()=>{gamerVisible=!gamerVisible;bro.setVisible(gamerVisible);updateCharacterUI();hint.classList.add('fade');if(typeof phase!=='undefined'&&phase==='idle'&&typeof setPhase==='function')setPhase('idle');});
    function updateGamerBro(t,dt,portalFx){ if(!gamerVisible)return; bro.update(t,dt,portalFx); }
    updateCharacterUI();

    // ------------------------------------------------------------
    // V0.7 INTEGRATION — real room light + dedicated character rim/shadow
    // ------------------------------------------------------------
    // Claude isolates the character on layer 1. For the game benchmark we let
    // each hero mesh live on BOTH layers so it receives the real room/portal
    // lights (layer 0) and the character-only key/rims (layer 1).
    bro.all.forEach(m=>{m.layers.enable(0);m.layers.enable(1);});

    // PBR-preserving bottom-up dissolve. We patch the existing Standard /
    // Physical materials rather than replacing them with a cheap FX shader.
    const heroDissolveState={active:0,y:-20,edge:.115};
    const heroShaderUniforms=[];
    let heroMatIndex=0;
    Object.values(bro.materials).forEach(mat=>{
      if(!mat||!mat.isMaterial)return;
      const tag='hero-dissolve-v07-'+(heroMatIndex++);
      const previous=mat.onBeforeCompile;
      mat.onBeforeCompile=(shader,rendererRef)=>{
        if(previous)previous(shader,rendererRef);
        shader.uniforms.uHeroDissolveActive={value:heroDissolveState.active};
        shader.uniforms.uHeroDissolveY={value:heroDissolveState.y};
        shader.uniforms.uHeroDissolveEdge={value:heroDissolveState.edge};
        heroShaderUniforms.push(shader.uniforms);
        shader.vertexShader=shader.vertexShader
          .replace('#include <common>','#include <common>\nvarying vec3 vHeroWorldPos;')
          .replace('#include <project_vertex>','#include <project_vertex>\nvHeroWorldPos=(modelMatrix*vec4(transformed,1.0)).xyz;');
        shader.fragmentShader=shader.fragmentShader
          .replace('#include <common>',`#include <common>
varying vec3 vHeroWorldPos;
uniform float uHeroDissolveActive;
uniform float uHeroDissolveY;
uniform float uHeroDissolveEdge;
float heroPortalNoise(vec3 p){
  float n=sin(p.x*8.7+sin(p.y*3.1))*sin(p.z*9.9-p.y*4.3);
  n+=.55*sin((p.x+p.z)*15.2+p.y*5.7);
  return .5+.25*n;
}`)
          .replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
float heroNoise=heroPortalNoise(vHeroWorldPos);
float heroDist=vHeroWorldPos.y-uHeroDissolveY+(heroNoise-.5)*.24;
float heroEdge=0.0;
if(uHeroDissolveActive>.5){
  if(heroDist<0.0)discard;
  heroEdge=(1.0-smoothstep(0.0,uHeroDissolveEdge,heroDist));
}`)
          .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(.52,.12,1.0)*heroEdge*4.2 + vec3(.08,.72,1.0)*heroEdge*1.9;');
      };
      mat.customProgramCacheKey=()=>tag;
      mat.needsUpdate=true;
    });
    function setHeroDissolve(active,y){
      heroDissolveState.active=active?1:0;heroDissolveState.y=y;
      for(const u of heroShaderUniforms){u.uHeroDissolveActive.value=heroDissolveState.active;u.uHeroDissolveY.value=y;u.uHeroDissolveEdge.value=heroDissolveState.edge;}
    }

    // One-draw-call character-derived particles. Points are sampled once at
    // conversion start, then captured by the same portal vortex choreography.
    const HERO_PARTICLE_MAX=360;
    const heroParticleGeo=new THREE.BufferGeometry();
    const heroParticlePos=new Float32Array(HERO_PARTICLE_MAX*3);
    const heroParticleCol=new Float32Array(HERO_PARTICLE_MAX*3);
    heroParticleGeo.setAttribute('position',new THREE.BufferAttribute(heroParticlePos,3));
    heroParticleGeo.setAttribute('color',new THREE.BufferAttribute(heroParticleCol,3));
    const heroParticleMat=new THREE.PointsMaterial({size:.040,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
    const heroParticlePoints=new THREE.Points(heroParticleGeo,heroParticleMat);heroParticlePoints.frustumCulled=false;heroParticlePoints.visible=false;heroParticlePoints.renderOrder=8;scene.add(heroParticlePoints);
    const heroGhostGeo=new THREE.BufferGeometry();const heroGhostPos=new Float32Array(HERO_PARTICLE_MAX*3);heroGhostGeo.setAttribute('position',new THREE.BufferAttribute(heroGhostPos,3));
    const heroGhostMat=new THREE.PointsMaterial({color:0xd394ff,size:.052,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
    const heroGhost=new THREE.Points(heroGhostGeo,heroGhostMat);heroGhost.frustumCulled=false;heroGhost.visible=false;heroGhost.renderOrder=7;scene.add(heroGhost);
    const heroParticleData=[];
    let heroParticleCount=0,heroBottom=1.40,heroTop=4.12;
    function heroParticleBudget(){return resolvedQuality==='performance'?180:(resolvedQuality==='high'?340:260);}
    function seedHeroParticles(){
      scene.updateMatrixWorld(true);gamerRoot.updateMatrixWorld(true);
      const meshes=bro.all.filter(m=>m.visible&&m.geometry?.attributes?.position);let total=0;const weighted=[];
      for(const m of meshes){const n=m.geometry.attributes.position.count;if(n>0){total+=n;weighted.push({m,end:total});}}
      heroParticleCount=Math.min(HERO_PARTICLE_MAX,heroParticleBudget());heroParticleGeo.setDrawRange(0,heroParticleCount);heroGhostGeo.setDrawRange(0,Math.min(heroParticleCount,220));heroParticleData.length=0;
      const tmp=new THREE.Vector3(),center=new THREE.Vector3(0,(heroBottom+heroTop)*.5,0);
      for(let i=0;i<heroParticleCount;i++){
        let pick=Math.floor(Math.random()*Math.max(1,total)),entry=weighted[weighted.length-1];for(const e of weighted){if(pick<e.end){entry=e;break;}}
        const attr=entry.m.geometry.attributes.position;const vi=Math.floor(Math.random()*attr.count);tmp.fromBufferAttribute(attr,vi).applyMatrix4(entry.m.matrixWorld);
        const h=clamp((tmp.y-heroBottom)/Math.max(.01,heroTop-heroBottom),0,1),ang=Math.atan2(tmp.z,tmp.x),r=Math.hypot(tmp.x,tmp.z);
        heroParticleData.push({origin:tmp.clone(),h,ang,r,seed:Math.random()*10,lift:.45+Math.random()*.85});
        const col=new THREE.Color().setHSL(.72+Math.random()*.08,.78,.65+Math.random()*.18);heroParticleCol[i*3]=col.r;heroParticleCol[i*3+1]=col.g;heroParticleCol[i*3+2]=col.b;
        heroParticlePos[i*3]=tmp.x;heroParticlePos[i*3+1]=-100;heroParticlePos[i*3+2]=tmp.z;
        if(i<220){const d=tmp.clone().sub(center).multiplyScalar(1.035).add(center);heroGhostPos[i*3]=d.x;heroGhostPos[i*3+1]=d.y;heroGhostPos[i*3+2]=d.z;}
      }
      heroParticleGeo.attributes.position.needsUpdate=true;heroParticleGeo.attributes.color.needsUpdate=true;heroGhostGeo.attributes.position.needsUpdate=true;
      heroParticlePoints.visible=true;heroGhost.visible=false;heroParticleMat.opacity=0;heroGhostMat.opacity=0;
    }
    function updateHeroDissolveParticles(progress,t,dissipating=false){
      if(!heroParticleData.length)return;const arr=heroParticleGeo.attributes.position.array,centerY=(heroBottom+heroTop)*.5;
      for(let i=0;i<heroParticleCount;i++){
        const d=heroParticleData[i];if(progress<d.h*.96){arr[i*3]=0;arr[i*3+1]=-100;arr[i*3+2]=0;continue;}
        const life=clamp((progress-d.h*.96)/Math.max(.12,1-d.h*.70),0,1),burst=smooth(clamp(life/.24,0,1)),capture=smooth(clamp((life-.12)/.68,0,1));
        let radius=(d.r+burst*(.10+.22*d.lift))*(1-capture*.78);if(dissipating)radius*=1+.30*life;
        const ang=d.ang+capture*(8.0+2.5*d.lift)+t*(.55+.30*d.lift);const targetY=5.18-d.seed*.035;
        const y=d.origin.y+(targetY-d.origin.y)*capture+Math.sin(d.seed+t*5.0)*.035*(1-capture);
        arr[i*3]=Math.cos(ang)*radius;arr[i*3+1]=y;arr[i*3+2]=Math.sin(ang)*radius;
      }
      heroParticleGeo.attributes.position.needsUpdate=true;
    }



    // ------------------------------------------------------------
    // PLAYABLE SLICE — movement, stairs, falling, respawn
    // ------------------------------------------------------------
    const moveKeys={up:false,down:false,left:false,right:false,run:false,jump:false,jumpQueued:false};const analogMove={x:0,y:0,active:false,pointerId:null};
    const player={x:gamerBase.x,y:gamerBase.y,z:gamerBase.z,yaw:Math.PI,vy:0,speed:0,grounded:true,jumpCount:0,holdJumpTimer:0};
    const PLAYER_RADIUS=.34,STEP_HEIGHT=.50,GRAVITY=8.25,JUMP_V=5.05,DOUBLE_JUMP_V=4.65,HOLD_BOOST_V=3.95,HOLD_BOOST_INTERVAL=.22;
    let cameraMode='follow',followLock=true;
    function surfaceHeight(px,pz){
      // Original v0.5 room pavement + raised central dais.
      const rr=Math.hypot(px,pz);let best=null;
      if(rr<ROOM_R-.50)best=(rr<3.35?.455:.02);
      for(const c of walkSurfaces){
        if(c.type==='disc'){
          if((px-c.x)*(px-c.x)+(pz-c.z)*(pz-c.z)<=c.r*c.r)best=best===null?c.y:Math.max(best,c.y);
        }else{
          const sn=Math.sin(-c.rot),cs=Math.cos(-c.rot),dx=px-c.x,dz=pz-c.z,lx=dx*cs-dz*sn,lz=dx*sn+dz*cs;
          if(Math.abs(lx)<=c.w*.5&&Math.abs(lz)<=c.d*.5){let y=c.y;if(c.type==='ramp')y=THREE.MathUtils.lerp(c.y0,c.y1,clamp(lz/c.d+.5,0,1));best=best===null?y:Math.max(best,y);}
        }
      }
      return best;
    }
    function resetPlayerToPavement(){player.x=gamerBase.x;player.y=.02;player.z=gamerBase.z;player.yaw=arenaLayout.spawn.yaw;player.vy=0;player.speed=0;player.grounded=true;player.jumpCount=0;player.holdJumpTimer=0;moveKeys.jump=false;moveKeys.jumpQueued=false;bro.setMotion('idle');}
    function canLeaveRoom(nx,nz){return true;}
    function updatePlayer(dt){
      if(heroPortalState!=='outside'||phase!=='idle'||!gamerVisible)return;
      const kx=(moveKeys.right?1:0)-(moveKeys.left?1:0),ky=(moveKeys.up?1:0)-(moveKeys.down?1:0);let sx=analogMove.active?analogMove.x:kx,sy=analogMove.active?-analogMove.y:ky;let len=Math.hypot(sx,sy);if(len<.075){sx=0;sy=0;len=0;}const inputMag=Math.min(1,len);if(len>1){sx/=len;sy/=len;len=1;}let dx=0,dz=0;if(len>0){const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);dx=fx*sy+rx*sx;dz=fz*sy+rz*sx;const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;const ty=Math.atan2(dx,dz),diff=Math.atan2(Math.sin(ty-player.yaw),Math.cos(ty-player.yaw));player.yaw+=diff*(1-Math.exp(-8.5*dt));}const speedScale=THREE.MathUtils.smoothstep(inputMag,.075,.88),targetSpeed=len>0?(moveKeys.run?6.35:3.75)*speedScale:0;player.speed=THREE.MathUtils.damp(player.speed,targetSpeed,targetSpeed>player.speed?7.5:11,dt);
      const ox=player.x,oz=player.z,nx=player.x+dx*player.speed*dt,nz=player.z+dz*player.speed*dt;
      const currentH=surfaceHeight(player.x,player.z),nextH=surfaceHeight(nx,nz);
      const wallOK=canLeaveRoom(nx,nz)||Math.hypot(player.x,player.z)>ROOM_R-.62;
      if(wallOK&&(nextH===null||currentH===null||nextH-currentH<=STEP_HEIGHT)){player.x=nx;player.z=nz;}
      const ground=surfaceHeight(player.x,player.z);
      // Tap = normal/double jump. Hold = repeated air boosts for an intentionally permissive prototype jump.
      if(moveKeys.jumpQueued){
        if(player.grounded){player.vy=JUMP_V;player.grounded=false;player.jumpCount=1;player.holdJumpTimer=HOLD_BOOST_INTERVAL;}
        else if(player.jumpCount<2){player.vy=Math.max(player.vy,DOUBLE_JUMP_V);player.jumpCount=2;player.holdJumpTimer=HOLD_BOOST_INTERVAL;}
        moveKeys.jumpQueued=false;
      }
      if(moveKeys.jump&&!player.grounded&&player.jumpCount<2){player.holdJumpTimer-=dt;if(player.holdJumpTimer<=0){player.vy=Math.max(player.vy,HOLD_BOOST_V);player.holdJumpTimer=HOLD_BOOST_INTERVAL;player.jumpCount++;}}
      if(!player.grounded||ground===null||player.y>ground+.04){player.vy-=GRAVITY*dt;player.y+=player.vy*dt;player.grounded=false;}
      if(ground!==null&&player.vy<=0&&player.y<=ground+.08){player.y=ground;player.vy=0;player.grounded=true;player.jumpCount=0;player.holdJumpTimer=0;}
      if(ground===null&&player.grounded){player.grounded=false;player.vy=-.05;}
      if(player.y<-6.25)resetPlayerToPavement();
      const portalEntryDistance=Math.hypot(player.x,player.z);
      if(!portalEntryArmed&&heroPortalState==='outside'&&phase==='idle'&&portalEntryDistance>2.55)portalEntryArmed=true;
      if(portalEntryArmed&&heroPortalState==='outside'&&phase==='idle'&&portalEntryDistance<1.75&&player.y<1.35){portalEntryArmed=false;player.speed=0;loadHero();return;}
      gamerMotion=player.speed<.14?'idle':(player.speed<3.7?'walk':'run');bro.setMotion(gamerMotion);
    }
    // Keyboard and genuinely working on-screen movement buttons.
    addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')moveKeys.up=true;if(k==='s'||k==='arrowdown')moveKeys.down=true;if(k==='a'||k==='arrowleft')moveKeys.left=true;if(k==='d'||k==='arrowright')moveKeys.right=true;if(k==='shift')moveKeys.run=true;if(k===' '){if(!moveKeys.jump)moveKeys.jumpQueued=true;moveKeys.jump=true;e.preventDefault();}if(k==='f'&&!e.repeat)setActionPressed(true);});
    addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')moveKeys.up=false;if(k==='s'||k==='arrowdown')moveKeys.down=false;if(k==='a'||k==='arrowleft')moveKeys.left=false;if(k==='d'||k==='arrowright')moveKeys.right=false;if(k==='shift')moveKeys.run=false;if(k===' ')moveKeys.jump=false;if(k==='f')setActionPressed(false);});
    const movePad=document.getElementById('movePad'),stickKnob=document.getElementById('stickKnob');function updateStick(e){const r=movePad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,lim=r.width*.34;let x=e.clientX-cx,y=e.clientY-cy,d=Math.hypot(x,y);if(d>lim){x=x/d*lim;y=y/d*lim;}analogMove.x=x/lim;analogMove.y=y/lim;analogMove.active=Math.hypot(analogMove.x,analogMove.y)>.035;stickKnob.style.transform=`translate3d(${x}px,${y}px,0)`;hint.classList.add('fade');}movePad.addEventListener('pointerdown',e=>{e.preventDefault();analogMove.pointerId=e.pointerId;movePad.setPointerCapture?.(e.pointerId);updateStick(e);});movePad.addEventListener('pointermove',e=>{if(e.pointerId!==analogMove.pointerId)return;e.preventDefault();updateStick(e);});function releaseStick(e){if(e&&analogMove.pointerId!==null&&e.pointerId!==analogMove.pointerId)return;analogMove.x=analogMove.y=0;analogMove.active=false;analogMove.pointerId=null;stickKnob.style.transform='translate3d(0,0,0)';}movePad.addEventListener('pointerup',releaseStick);movePad.addEventListener('pointercancel',releaseStick);movePad.addEventListener('lostpointercapture',releaseStick);
    runTouchBtn.addEventListener('pointerdown',e=>{e.preventDefault();moveKeys.run=true;runTouchBtn.classList.add('active');});for(const ev of ['pointerup','pointercancel','pointerleave'])runTouchBtn.addEventListener(ev,()=>{moveKeys.run=false;runTouchBtn.classList.remove('active');});
    jumpTouchBtn.addEventListener('pointerdown',e=>{e.preventDefault();if(!moveKeys.jump)moveKeys.jumpQueued=true;moveKeys.jump=true;jumpTouchBtn.classList.add('active');});for(const ev of ['pointerup','pointercancel','pointerleave'])jumpTouchBtn.addEventListener(ev,()=>{moveKeys.jump=false;jumpTouchBtn.classList.remove('active');});

    // ------------------------------------------------------------
    // ACTION — controller grip + forward power laser
    // ------------------------------------------------------------
    let actionActive=false;
    const laserRay=new THREE.Raycaster();laserRay.far=26;
    const laserCoreMat=new THREE.MeshBasicMaterial({color:0xe8fbff,transparent:true,opacity:.98,blending:THREE.AdditiveBlending,depthWrite:false});
    const laserGlowMat=new THREE.MeshBasicMaterial({color:0x8d5dff,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false});
    const laserCore=new THREE.Mesh(new THREE.CylinderGeometry(.035,.055,1,10,1,true),laserCoreMat);laserCore.visible=false;laserCore.renderOrder=20;scene.add(laserCore);
    const laserGlow=new THREE.Mesh(new THREE.CylinderGeometry(.11,.15,1,12,1,true),laserGlowMat);laserGlow.visible=false;laserGlow.renderOrder=19;scene.add(laserGlow);
    const laserImpact=new THREE.Mesh(new THREE.SphereGeometry(.14,14,10),new THREE.MeshBasicMaterial({color:0xc49cff,transparent:true,opacity:.86,blending:THREE.AdditiveBlending,depthWrite:false}));laserImpact.visible=false;laserImpact.renderOrder=21;scene.add(laserImpact);
    const laserOrigin=new THREE.Vector3(),laserDir=new THREE.Vector3(),laserEnd=new THREE.Vector3(),laserMid=new THREE.Vector3(),laserQuat=new THREE.Quaternion(),laserY=new THREE.Vector3(0,1,0),controllerWorldQ=new THREE.Quaternion();
    function setBeamMesh(mesh,a,b){laserMid.copy(a).add(b).multiplyScalar(.5);const len=Math.max(.001,a.distanceTo(b));mesh.position.copy(laserMid);mesh.scale.set(1,len,1);laserDir.copy(b).sub(a).normalize();laserQuat.setFromUnitVectors(laserY,laserDir);mesh.quaternion.copy(laserQuat);}
    function setActionPressed(v){if(heroPortalState!=='outside'||phase!=='idle')v=false;actionActive=!!v;bro.setAction(actionActive);actionTouchBtn.classList.toggle('active',actionActive);actionTouchBtn.textContent='ZAP';hint.classList.add('fade');}actionTouchBtn.addEventListener('pointerdown',e=>{e.preventDefault();actionTouchBtn.setPointerCapture?.(e.pointerId);setActionPressed(true);});for(const ev of ['pointerup','pointercancel','lostpointercapture','pointerleave'])actionTouchBtn.addEventListener(ev,()=>setActionPressed(false));
    function updateActionBeam(t){
      const active=actionActive&&heroPortalState==='outside'&&phase==='idle'&&gamerVisible;
      if(!active){laserCore.visible=laserGlow.visible=laserImpact.visible=false;return;}
      bro.controllerEmitter.getWorldPosition(laserOrigin);bro.controllerEmitter.getWorldQuaternion(controllerWorldQ);laserDir.set(0,0,1).applyQuaternion(controllerWorldQ).normalize();laserOrigin.addScaledVector(laserDir,.12);const hits=[];laserEnd.copy(laserOrigin).addScaledVector(laserDir,24);
      setBeamMesh(laserCore,laserOrigin,laserEnd);setBeamMesh(laserGlow,laserOrigin,laserEnd);laserCore.visible=laserGlow.visible=true;laserCoreMat.opacity=.82+.16*Math.sin(t*25);laserGlowMat.opacity=.22+.15*(.5+.5*Math.sin(t*17));laserImpact.position.copy(laserEnd);laserImpact.scale.setScalar(.82+.32*(.5+.5*Math.sin(t*22)));laserImpact.visible=hits.length>0;
    }

    // ------------------------------------------------------------
    // PORTAL STATE MACHINE — HERO LOAD + FOUR STAGES + AFTERGLOW
    // ------------------------------------------------------------
    let phase='idle',phaseT=0,heroPortalState='outside',heroLoadT=0;let portalEntryArmed=true;
    const phaseDur={charge:2.60,convert:2.65,sustain:.45,dissipate:1.55,afterglow:.90};
    let HERO_OUT={x:gamerBase.x,y:gamerBase.y,z:gamerBase.z,ry:Math.PI};
    const HERO_IN={x:0,y:1.47,z:0,ry:0};
    const heroBaseScale=gamerRoot.scale.x;
    function syncPortalCharacterUI(){
      if(heroPortalState==='outside')updateCharacterUI();
      else if(heroPortalState==='loading')characterStatus.textContent='TEAL · ENTERING PORTAL';
      else if(heroPortalState==='loaded')characterStatus.textContent='TEAL · PORTAL READY';
      else if(heroPortalState==='converting')characterStatus.textContent='TEAL · CONVERTING';
      else characterStatus.textContent='TEAL · TRANSMITTED';
      motionBtn.disabled=heroPortalState!=='outside'||phase!=='idle';characterBtn.disabled=heroPortalState!=='outside'||phase!=='idle';
    }
    function setPhase(name){
      phase=name;phaseT=0;
      if(name==='idle'){
        const ready=heroPortalState==='loaded';phaseLine.textContent=ready?'1 · IDLE · HERO READY':'1 · IDLE · HERO OUTSIDE';activateBtn.disabled=!ready;dropBtn.disabled=heroPortalState!=='outside'||!gamerVisible;dropBtn.textContent=ready?'HERO LOADED':'LOAD HERO';activateBtn.textContent='ACTIVATE PORTAL';
      }else if(name==='charge'){phaseLine.textContent='2 · CHARGE';activateBtn.disabled=true;dropBtn.disabled=true;activateBtn.textContent='CHARGING…';}
      else if(name==='convert'){phaseLine.textContent='3 · CONVERT';activateBtn.textContent='CONVERTING…';}
      else if(name==='dissipate'){phaseLine.textContent='4 · DISSIPATE';activateBtn.textContent='DISSIPATING…';}
      else if(name==='sustain'){phaseLine.textContent='4 · SUSTAIN';activateBtn.textContent='TRANSMITTING…';}
      else if(name==='afterglow'){phaseLine.textContent='6 · SETTLE';activateBtn.textContent='COOLING…';}
      else if(name==='complete'){phaseLine.textContent='7 · COMPLETE · PLAY AGAIN';activateBtn.textContent='TRANSMISSION COMPLETE';resetBtn.textContent='PLAY AGAIN';}
      syncPortalCharacterUI();
    }
    function resetVisualState(){
      energyMat.uniforms.uFill.value=.10;energyMat.uniforms.uIntensity.value=.20;energyMat.uniforms.uDissolve.value=0;discMat.uniforms.uIntensity.value=.28;topDisc.material.uniforms.uIntensity.value=.26;particleMat.opacity=.24;arcGeo.setDrawRange(0,0);glowSprites.forEach(s=>s.material.opacity=s.userData.baseOpacity);
      setHeroDissolve(false,-20);heroParticleData.length=0;heroParticlePoints.visible=false;heroGhost.visible=false;heroParticleMat.opacity=0;heroGhostMat.opacity=0;
    }
    function restoreHeroOutside(){
      heroPortalState='outside';heroLoadT=0;player.x=HERO_OUT.x;player.y=HERO_OUT.y;player.z=HERO_OUT.z;player.yaw=HERO_OUT.ry;player.vy=0;player.speed=0;player.grounded=surfaceHeight(player.x,player.z)!==null;gamerRoot.visible=gamerVisible;bro.setMotion(gamerMotion);bro.setHome(player.x,player.z,player.yaw);gamerRoot.position.y=player.y;gamerRoot.scale.setScalar(heroBaseScale);setHeroDissolve(false,-20);
    }
    function resetTest(){
      actionActive=false;bro.setAction(false);actionTouchBtn.classList.remove('active');actionTouchBtn.textContent='ZAP';phase='idle';phaseT=0;resetVisualState();gamerMotion='idle';bro.setMotion('idle');restoreHeroOutside();activateBtn.textContent='ACTIVATE PORTAL';activateBtn.disabled=true;dropBtn.disabled=!gamerVisible;dropBtn.textContent='LOAD HERO';phaseLine.textContent='1 · IDLE · PLAYABLE';requestShadowUpdate(2);syncPortalCharacterUI();
    }
    function playAgainFromPortal(){resetTest();const safeX=arenaLayout.spawn.x,safeZ=arenaLayout.spawn.z,safeSurface=surfaceHeight(safeX,safeZ);player.x=safeX;player.z=safeZ;player.y=safeSurface===null?1.29:safeSurface;player.yaw=Math.PI;player.vy=0;player.speed=0;player.grounded=true;bro.setHome(player.x,player.z,player.yaw);gamerRoot.position.y=player.y;gamerRoot.visible=gamerVisible;portalEntryArmed=false;cameraMode='follow';followLock=true;recenterClock=0;yaw=player.yaw+Math.PI;targetYaw=yaw;pitch=.34;targetPitch=.34;distance=followDistance;targetDistance=followDistance;targetLook.set(player.x,player.y+1.45,player.z);target.copy(targetLook);orbitBtn.textContent='CAM: FOLLOW';orbitBtn.classList.add('active');followLockBtn.textContent='FOLLOW LOCK: ON';followLockBtn.classList.add('active');resetBtn.textContent='RESET';actionTouchBtn.textContent='ZAP';requestShadowUpdate(2);}
    function loadHero(){
      if(heroPortalState!=='outside'||phase!=='idle'||!gamerVisible)return;actionActive=false;bro.setAction(false);actionTouchBtn.classList.remove('active');actionTouchBtn.textContent='ZAP';HERO_OUT={x:player.x,y:player.y,z:player.z,ry:player.yaw};hint.classList.add('fade');gamerMotion='idle';bro.setMotion('idle');heroPortalState='loading';heroLoadT=0;dropBtn.disabled=true;dropBtn.textContent='LOADING HERO…';phaseLine.textContent='1 · IDLE · HERO ENTERING';syncPortalCharacterUI();requestShadowUpdate(2);
      // Make the portal camera the immediate inspection view.
      if(typeof selectView==='function')setTimeout(()=>selectView('portal'),70);
    }
    function activatePortal(){if(heroPortalState!=='loaded'||phase!=='idle')return;hint.classList.add('fade');setPhase('charge');requestShadowUpdate(2);}
    dropBtn.addEventListener('click',loadHero);activateBtn.addEventListener('click',activatePortal);resetBtn.addEventListener('click',()=>{if(heroPortalState==='gone')playAgainFromPortal();else resetTest();});

    // ------------------------------------------------------------
    // CAMERA + INPUT
    // ------------------------------------------------------------
    const target=new THREE.Vector3(0,2.9,0),targetLook=target.clone();
    const views={
      hero:{yaw:.06,pitch:.03,distance:7.60,target:new THREE.Vector3(0,2.95,0)},
      gamer:{yaw:.58,pitch:.055,distance:4.75,target:new THREE.Vector3(HERO_OUT.x,1.48,HERO_OUT.z)},
      front:{yaw:0,pitch:.045,distance:4.35,target:new THREE.Vector3(HERO_OUT.x,1.50,HERO_OUT.z)},
      profile:{yaw:Math.PI/2,pitch:.055,distance:4.45,target:new THREE.Vector3(HERO_OUT.x,1.50,HERO_OUT.z)},
      back:{yaw:Math.PI,pitch:.075,distance:4.55,target:new THREE.Vector3(HERO_OUT.x,1.52,HERO_OUT.z)},
      face:{yaw:.10,pitch:.025,distance:2.25,target:new THREE.Vector3(HERO_OUT.x,2.02,HERO_OUT.z)},
      portal:{yaw:.06,pitch:.10,distance:12.20,target:new THREE.Vector3(0,2.48,0)},
      room:{yaw:.68,pitch:.14,distance:8.95,target:new THREE.Vector3(0,2.70,0)}
    };
    const viewOrder=['hero','gamer','front','profile','back','face','portal','room'];let viewIndex=0,yaw=views.hero.yaw,pitch=.34,distance=13.4,targetYaw=yaw,targetPitch=pitch,targetDistance=distance,autoOrbit=false,dragging=false,lastX=0,lastY=0,pinchDist=0,followDistance=13.4,recenterClock=0;
    function applyCamera(dt=.016){if(cameraMode==='orbit'||heroPortalState!=='outside'){yaw+=(targetYaw-yaw)*.085;pitch+=(targetPitch-pitch)*.085;distance+=(targetDistance-distance)*.09;target.lerp(targetLook,.085);}else{targetLook.set(player.x,player.y+1.45,player.z);target.lerp(targetLook,1-Math.exp(-8*dt));if(dragging||analogMove.active)recenterClock=0;else recenterClock+=dt;if(!dragging&&!analogMove.active&&recenterClock>.85&&followLock){const behind=player.yaw+Math.PI,dy=Math.atan2(Math.sin(behind-yaw),Math.cos(behind-yaw));yaw+=dy*(1-Math.exp(-1.75*dt));pitch=THREE.MathUtils.damp(pitch,cameraMode==='tight'?.24:.34,2.5,dt);}distance=THREE.MathUtils.damp(distance,cameraMode==='tight'?7.6:followDistance,3.8,dt);}const cp=Math.cos(pitch);camera.position.set(target.x+Math.sin(yaw)*cp*distance,target.y+Math.sin(pitch)*distance+(cameraMode==='tight'?.55:1.05),target.z+Math.cos(yaw)*cp*distance);camera.lookAt(target);}
    function selectView(name){cameraMode='orbit';const v=views[name];targetYaw=v.yaw;targetPitch=v.pitch;targetDistance=v.distance;targetLook.copy(v.target);autoOrbit=false;orbitBtn.textContent='CAM: ORBIT';orbitBtn.classList.remove('active');viewBtn.textContent='CAMERA: '+name.toUpperCase();}
    viewBtn.addEventListener('click',()=>{viewIndex=(viewIndex+1)%viewOrder.length;selectView(viewOrder[viewIndex]);});orbitBtn.addEventListener('click',()=>{cameraMode=cameraMode==='orbit'?'follow':cameraMode==='follow'?'tight':'orbit';orbitBtn.textContent='CAM: '+cameraMode.toUpperCase();orbitBtn.classList.toggle('active',cameraMode!=='orbit');if(cameraMode!=='orbit'){targetLook.set(player.x,player.y+1.35,player.z);}});followLockBtn.addEventListener('click',()=>{followLock=!followLock;followLockBtn.textContent='FOLLOW LOCK: '+(followLock?'ON':'OFF');followLockBtn.classList.toggle('active',followLock);});
    renderer.domElement.style.touchAction='none';renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;autoOrbit=false;renderer.domElement.setPointerCapture?.(e.pointerId);recenterClock=0;hint.classList.add('fade');});
    renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(cameraMode==='orbit'){targetYaw-=dx*.0052;targetPitch=clamp(targetPitch+dy*.0039,-.24,.58);}else{yaw-=dx*.0052;pitch=clamp(pitch+dy*.0036,.08,.62);targetYaw=yaw;targetPitch=pitch;recenterClock=0;}});
    function pointerUp(e){dragging=false;renderer.domElement.releasePointerCapture?.(e.pointerId)}renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerUp);
    renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();if(cameraMode!=='orbit')followDistance=clamp(followDistance+Math.sign(e.deltaY)*1.1,7.5,30);else targetDistance=clamp(targetDistance+Math.sign(e.deltaY)*.75,4.8,30);hint.classList.add('fade');},{passive:false});
    renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();dragging=false;const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.hypot(dx,dy);if(pinchDist){if(cameraMode!=='orbit')followDistance=clamp(followDistance+(pinchDist-d)*.040,7.5,30);else targetDistance=clamp(targetDistance+(pinchDist-d)*.025,4.8,30);}pinchDist=d;}},{passive:false});renderer.domElement.addEventListener('touchend',()=>pinchDist=0,{passive:true});

    // ------------------------------------------------------------
    // QUALITY / ADAPTIVE DPR
    // ------------------------------------------------------------
    function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
    function updateQualityLine(){const q=presets[resolvedQuality],actual=q.dpr*(qualityMode==='auto'?dprScale:1);qualityLine.textContent=(qualityMode==='auto'?'AUTO → ':'')+q.label+' · DPR '+actual.toFixed(2)+' · '+particleBudget+' FX';}
    function applyQuality(){
      const q=presets[resolvedQuality];if(qualityMode!=='auto')dprScale=1;renderer.setPixelRatio(q.dpr*(qualityMode==='auto'?dprScale:1));particleBudget=q.particles;arcBudget=q.arcs;glassMat.side=q.doubleGlass?THREE.DoubleSide:THREE.FrontSide;glassMat.needsUpdate=true;qualityBtn.textContent='QUALITY: '+(qualityMode==='auto'?'AUTO':q.label);updateQualityLine();resize();
    }
    qualityBtn.addEventListener('click',()=>{qualityMode=qualityMode==='auto'?'high':qualityMode==='high'?'performance':'auto';if(qualityMode==='auto')resolvedQuality=(mobile||memory<=3)?'performance':(memory>=8?'high':'balanced');else resolvedQuality=qualityMode;dprScale=1;applyQuality();});
    addEventListener('resize',resize,{passive:true});applyQuality();resize();

    // ------------------------------------------------------------
    // ANIMATION HELPERS
    // ------------------------------------------------------------
    const torchLocalPos=new THREE.Vector3(),torchScale=new THREE.Vector3(),zeroEuler=new THREE.Euler();
    function updateTorchVisuals(t){
      for(let i=0;i<torches.length;i++){
        const q=torches[i],f=.90+.14*Math.sin(t*8.5+q.seed)+.06*Math.sin(t*13.2+q.seed*2),pp=q.parent,ry=q.ry;
        torchLocalPos.set(.018*Math.sin(t*6+q.seed),.40,-.26);torchScale.set(.95,f,1);setNested(torchFlame,i,pp,ry,torchLocalPos,zeroEuler,torchScale);
        const cs=.88+.10*Math.sin(t*11+q.seed);torchLocalPos.set(0,.20,-.26);torchScale.set(cs,cs,cs);setNested(torchCore,i,pp,ry,torchLocalPos,zeroEuler,torchScale);
      }
      torchFlame.instanceMatrix.needsUpdate=true;torchCore.instanceMatrix.needsUpdate=true;lanternGlowMat.opacity=.29+.055*(.5+.5*Math.sin(t*4.7));
      // Two dynamic warm lights follow the two torches nearest the camera.
      let a=-1,b=-1,da=1e9,db=1e9;for(let i=0;i<torches.length;i++){const d=torches[i].worldPos.distanceToSquared(camera.position);if(d<da){db=da;b=a;da=d;a=i;}else if(d<db){db=d;b=i;}}
      if(a>=0){const q=torches[a];torchLightA.position.lerp(q.worldPos,.16);torchLightA.intensity=(34+8*Math.sin(t*8.5+q.seed))*roomTrim;}
      if(b>=0){const q=torches[b];torchLightB.position.lerp(q.worldPos,.16);torchLightB.intensity=(25+6*Math.sin(t*7.9+q.seed))*roomTrim;}
    }
    function updateParticles(t,intensity,phaseName,intake=0){
      const idleLike=phaseName==='idle'||phaseName==='afterglow'||phaseName==='complete',active=idleLike?Math.max(18,Math.floor(particleBudget*.30)):particleBudget;particleGeo.setDrawRange(0,active);const arr=particleGeo.attributes.position.array;
      const rise=idleLike?.055:(.12+.44*intensity),ceil=idleLike?1.55:4.02,outward=phaseName==='dissipate'?1+(1-intensity)*.55:1;
      for(let i=0;i<active;i++){const s=particleSeeds[i];let y=1.02+((s.y+t*s.s*rise)%1)*ceil;let rr=s.r*(.82+.18*Math.sin(t*1.3+s.w*8))*outward;if(intake>0){y=1.02+(y-1.02)*(1-intake*.72);rr*=1-intake*.18;}const ang=s.a+t*(.50+s.w*.72)+y*.56;arr[i*3]=Math.cos(ang)*rr;arr[i*3+1]=y;arr[i*3+2]=Math.sin(ang)*rr;}
      particleGeo.attributes.position.needsUpdate=true;particleMat.opacity=.12+.64*intensity;particleMat.size=.024+.021*intensity+(phaseName==='dissipate'?(1-intensity)*.018:0);
    }
    function shuffleArcs(t,intensity,fillTop){
      if(intensity<=.01){arcGeo.setDrawRange(0,0);return;}if(t<nextArcShuffle)return;nextArcShuffle=t+.065;const segs=Math.max(0,Math.min(maxArcSegments,Math.floor(arcBudget*intensity))),top=Math.max(1.20,fillTop);arcGeo.setDrawRange(0,segs*2);const a=arcGeo.attributes.position.array;
      for(let i=0;i<segs;i++){const y=1.0+Math.random()*(top-1.0),ang=Math.random()*Math.PI*2,r1=.35+Math.random()*.95,r2=.35+Math.random()*.95;a[i*6]=Math.cos(ang)*r1;a[i*6+1]=y;a[i*6+2]=Math.sin(ang)*r1;const ang2=ang+(.22+Math.random()*.70)*(Math.random()<.5?-1:1);a[i*6+3]=Math.cos(ang2)*r2;a[i*6+4]=clamp(y+(Math.random()-.5)*.65,1.0,top);a[i*6+5]=Math.sin(ang2)*r2;}arcGeo.attributes.position.needsUpdate=true;arcMat.opacity=.28+.62*intensity;
    }
    // ------------------------------------------------------------
    // MAIN LOOP
    // ------------------------------------------------------------
    const clock=new THREE.Clock();let frames=0,fpsTime=performance.now();
    function animate(){
      const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;phaseT+=dt;updatePlayer(dt);if(autoOrbit&&!dragging&&cameraMode==='orbit')targetYaw+=dt*.050;updateTorchVisuals(t);
      crystalMat.emissiveIntensity=.48+.28*(.5+.5*Math.sin(t*.86));rim.intensity=baseRoomLight.rim*roomTrim+.08*Math.sin(t*.34);

      // Move the actual hero from the inspection spot into the tube.
      if(heroPortalState==='loading'){
        heroLoadT+=dt;const p=clamp(heroLoadT/1.45,0,1),e=easeInOutCubic(p),arc=Math.sin(p*Math.PI)*.20;
        const hx=THREE.MathUtils.lerp(HERO_OUT.x,HERO_IN.x,e),hz=THREE.MathUtils.lerp(HERO_OUT.z,HERO_IN.z,e),hy=THREE.MathUtils.lerp(HERO_OUT.y,HERO_IN.y,e)+arc,hry=THREE.MathUtils.lerp(HERO_OUT.ry,HERO_IN.ry,e);
        bro.setHome(hx,hz,hry);gamerRoot.position.y=hy;
        if(p>=1){heroPortalState='loaded';bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y;setPhase('idle');requestShadowUpdate(2);setTimeout(()=>{if(heroPortalState==='loaded'&&phase==='idle')activatePortal();},150);}
      }else if(heroPortalState==='loaded'||heroPortalState==='converting'){
        bro.setHome(0,0,0);gamerRoot.position.y=HERO_IN.y+(phase==='idle'?.035*Math.sin(t*1.15):0);
      }else if(heroPortalState==='outside'){
        bro.setHome(player.x,player.z,player.yaw);gamerRoot.position.y=player.y;
      }

      let fx=.10,fill=.10,disc=.28,arcFx=0,dissolve=0,pl=9,ph=6,pw=0,envBoost=0,intake=0,heroConvert=0;
      if(phase==='idle'){
        const breathe=.5+.5*Math.sin(t*.56);fx=.08+.025*breathe;fill=.10;disc=.26+.045*breathe;pl=8.5+.9*breathe;ph=5.5+.5*breathe;
      }else if(phase==='charge'){
        const p=clamp(phaseT/phaseDur.charge,0,1);
        if(p<.135){const e=smooth(p/.135);intake=e;fx=.10-.05*e;fill=.10;disc=.28-.10*e;pl=8.5-3.2*e;ph=5.5-2.0*e;}
        else if(p<.615){const e=easeInOutCubic((p-.135)/.48);fx=.05+.55*e;fill=.10+.68*e;disc=.18+.85*e;arcFx=Math.max(0,(e-.45)*.55);pl=5.3+19*e;ph=3.5+10*e;}
        else if(p<.905){const e=smooth((p-.615)/.29);fx=.60+.40*e;fill=.78+.22*e;disc=1.03+.62*e;arcFx=.30+.42*e;pl=24.3+21*e;ph=13.5+14*e;}
        else{const e=smooth((p-.905)/.095);fx=1.0-.12*e;fill=1.0;disc=1.65-.30*e;arcFx=.72-.52*e;pl=45-6*e;ph=27.5-4*e;gamerRoot.scale.setScalar(heroBaseScale*(1-.018*e));}
        if(p>=1){
          heroPortalState='converting';gamerRoot.scale.setScalar(heroBaseScale);scene.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(gamerRoot);heroBottom=bb.min.y+.02;heroTop=bb.max.y-.02;seedHeroParticles();setHeroDissolve(true,heroBottom-.20);setPhase('convert');syncPortalCharacterUI();requestShadowUpdate(1);
        }
      }else if(phase==='convert'){
        const p=clamp(phaseT/phaseDur.convert,0,1);heroConvert=smooth(clamp((p-.03)/.88,0,1));
        const flash=Math.exp(-p*8.0),s1=Math.exp(-Math.abs(p-.38)*24),s2=Math.exp(-Math.abs(p-.65)*25);fx=1;fill=1;disc=1.55+2.35*flash+.75*(s1+s2);arcFx=.82;pl=36+86*flash+34*(s1+s2);ph=24+54*flash+20*(s1+s2);pw=20*Math.max(flash,.30*(1-p));envBoost=.27*flash+.10*(s1+s2);
        const front=THREE.MathUtils.lerp(heroBottom-.12,heroTop+.20,heroConvert);setHeroDissolve(true,front);updateHeroDissolveParticles(heroConvert,t,false);heroParticleMat.opacity=.22+.72*Math.sin(Math.min(1,heroConvert)*Math.PI*.74);heroParticleMat.size=.034+.020*heroConvert;
        const ghostPulse=Math.max(0,1-Math.abs(p-.34)/.11);heroGhost.visible=ghostPulse>.02;heroGhostMat.opacity=.16*ghostPulse;heroGhostMat.size=.052+.016*ghostPulse;
        if(p>=.975)gamerRoot.visible=false;
        if(p>=1){heroPortalState='gone';gamerRoot.visible=false;heroGhost.visible=false;setPhase('sustain');syncPortalCharacterUI();}
      }else if(phase==='sustain'){
        const p=clamp(phaseT/phaseDur.sustain,0,1);fx=1;fill=1;disc=1.48+.16*Math.sin(t*8.0);arcFx=.70;pl=34;ph=22;pw=7.5;heroParticlePoints.visible=true;updateHeroDissolveParticles(1,t,false);heroParticleMat.opacity=.68+.12*Math.sin(t*9.0);heroParticleMat.size=.050;if(p>=1)setPhase('dissipate');
      }else if(phase==='dissipate'){
        const p=clamp(phaseT/phaseDur.dissipate,0,1);updateHeroDissolveParticles(1.0+p*.42,t,true);heroParticleMat.opacity=.76*(1-smooth(clamp((p-.20)/.80,0,1)));heroParticleMat.size=.050+.020*p;
        if(p<.41){const e=smooth(p/.41);fx=1-.55*e;fill=1;dissolve=e*.85;disc=1.45-.85*e;arcFx=(1-e)*.55;pl=35-23*e;ph=24-16*e;}
        else if(p<.77){const e=smooth((p-.41)/.36);fx=.45-.30*e;fill=1-.55*e;dissolve=.85+.15*e;disc=.60-.28*e;arcFx=(1-e)*.18;pl=12-3.4*e;ph=8-2.4*e;}
        else{const e=(p-.77)/.23;fx=.15-.05*e;fill=.45-.35*e;dissolve=1-e;disc=.32-.10*Math.sin(e*Math.PI);pl=8.6;ph=5.6;}
        if(p>=1)setPhase('afterglow');
      }else if(phase==='afterglow'){
        const p=clamp(phaseT/phaseDur.afterglow,0,1),g=Math.exp(-p*3.4);fx=.10+.06*g;fill=.10;disc=.28+.12*g;pl=8.5+5.5*g;ph=5.5+3.2*g;heroParticleMat.opacity=.18*g;
        if(p>=1){heroParticleMat.opacity=0;heroParticlePoints.visible=false;setPhase('complete');resetBtn.textContent='PLAY AGAIN';activateBtn.textContent='TRANSMISSION COMPLETE';phaseLine.textContent='7 · COMPLETE · PLAY AGAIN';}
      }

      if(phase==='complete'){const breathe=.5+.5*Math.sin(t*.72);fx=.085+.025*breathe;fill=.10;disc=.27+.055*breathe;arcFx=0;pl=8.2+.7*breathe;ph=5.2+.45*breathe;pw=0;heroParticleMat.opacity=0;}

      // Update the character AFTER its home/portal placement has been set.
      const portalCharacterFx=Math.min(1,.08+fx*.40+envBoost*.9);if(gamerRoot.visible)updateGamerBro(t,dt,portalCharacterFx);updateActionBeam(t);
      if(heroPortalState==='loading'||heroPortalState==='loaded'||heroPortalState==='converting')gamerRoot.position.y=(heroPortalState==='loading'?gamerRoot.position.y:HERO_IN.y+(phase==='idle'?.035*Math.sin(t*1.15):0));

      portalLow.intensity=pl;portalHigh.intensity=ph;portalWash.intensity=pw;scene.environmentIntensity=baseEnvIntensity+envBoost;scene.fog.density=baseFogDensity*(1+envBoost*.8);
      energyMat.uniforms.uTime.value=t;energyMat.uniforms.uFill.value=fill;energyMat.uniforms.uIntensity.value=.18+fx*1.24;energyMat.uniforms.uDissolve.value=dissolve;
      discMat.uniforms.uTime.value=t;discMat.uniforms.uIntensity.value=disc;topDisc.material.uniforms.uTime.value=t+.7;topDisc.material.uniforms.uIntensity.value=disc*.88;
      glowPurple.emissiveIntensity=6.1+fx*4.8+Math.sin(t*4)*.35;glowCyan.emissiveIntensity=5.9+fx*3.9;
      updateParticles(t,fx,phase,intake);shuffleArcs(t,arcFx,1.0+fill*4.05);

      if(phase==='idle'||phase==='afterglow'||phase==='complete')risingRings.forEach(m=>m.material.opacity=0);
      else risingRings.forEach((m,i)=>{const speed=.30+fx*.75,local=(t*speed+i/7)%1;m.position.y=1.02+local*4.02;m.scale.setScalar(.82+.24*Math.sin(local*Math.PI));const within=local<=fill?1:0;m.material.opacity=within*Math.max(0,fx-.10)*(.10+.46*Math.sin(local*Math.PI));m.rotation.z=t*(i%2?-.42:.42);});
      ringMeshes.forEach((m,i)=>m.scale.setScalar(1+fx*.014*Math.sin(t*3.8+i)));
      glowSprites.forEach((sp,i)=>{const b=sp.userData.baseScale;sp.material.opacity=sp.userData.baseOpacity+(i===2?fx*.10:fx*.18)+envBoost*.24;sp.scale.setScalar(b*(1+fx*.25+envBoost*.35));});

      applyCamera(dt);
      // Room shadow is static; Claude's character-only key updates its own small shadow every frame.
      renderer.render(scene,camera);

      frames++;const now=performance.now();if(now-fpsTime>700){const fps=Math.round(frames*1000/(now-fpsTime));frames=0;fpsTime=now;fpsAvg=fpsAvg*.55+fps*.45;
        if(qualityMode==='auto'&&now>dprCooldown){const base=presets[resolvedQuality].dpr;if(fpsAvg<47&&dprScale>.62){dprScale=Math.max(.62,dprScale-.10);renderer.setPixelRatio(base*dprScale);resize();dprCooldown=now+1500;}else if(fpsAvg>57&&dprScale<1){dprScale=Math.min(1,dprScale+.05);renderer.setPixelRatio(base*dprScale);resize();dprCooldown=now+2200;}}
        const info=renderer.info.render;statsLine.textContent=`${fps} FPS · ${info.calls} CALLS · ${(info.triangles/1000).toFixed(0)}K TRIS`;updateQualityLine();
      }
    }
    renderer.setAnimationLoop(animate);

    setTimeout(()=>hint.classList.add('fade'),9000);resetTest();cameraMode='follow';followLock=true;followDistance=13.4;pitch=targetPitch=.34;distance=13.4;orbitBtn.textContent='CAM: FOLLOW';orbitBtn.classList.add('active');followLockBtn.textContent='FOLLOW LOCK: ON';followLockBtn.classList.add('active');targetLook.set(player.x,player.y+1.45,player.z);requestShadowUpdate(2);boot.classList.add('hidden');ui.classList.add('show');
  }catch(err){
    console.error(err);boot.style.display='none';fatal.style.display='grid';fatalText.textContent='Three.js could not load or WebGL is unavailable. This v0.8.2 quality-preserved world slice uses Three.js r180 from jsDelivr and keeps the v0.5 room/tube materials and portal system while adding improved character hair/glasses, stronger locomotion, repeated-jump controls, wider zoom and a controller-powered action laser.\n\n'+(err?.message||String(err));
  }
})();
