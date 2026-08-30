const sleep87 = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    let bro, menu, canvas, scene;
    for (let i=0;i<500;i++) {
      bro=window.__bro; menu=document.getElementById('gameMenu'); canvas=document.querySelector('#stage canvas'); scene=bro?.root?.parent;
      if (bro&&menu&&canvas&&document.getElementById('ui')?.classList.contains('show')) break;
      await sleep87(25);
    }
    if(!bro||!menu||!canvas||!scene) throw new Error('v0.8.7 could not find initialized game.');
    document.body.classList.add('v087','cleanMode','menuOpen');

    const resetBtn=document.getElementById('resetBtn');
    const actionBtn=document.getElementById('actionTouchBtn');
    const followBtn=document.getElementById('followLockBtn');
    const lightSlider=document.getElementById('lightingSlider');
    const lightValue=document.getElementById('lightingValue');

    // Polished menu, no redundant shirt labels.
    const shell=menu.querySelector('.menuShell');
    if(shell){
      shell.innerHTML=`
        <div class="brandHero" role="img" aria-label="Gamer Bros GB1 and GB2"></div>
        <div class="menuEyebrow">GAMER BROS · PORTAL WORLD</div>
        <h1>Select your Gamer Bro</h1>
        <p class="menuSub">Choose GB1 or GB2.</p>
        <div class="heroChoices heroChoices84">
          <button class="heroChoice gb1 noColourLabel" data-hero="gb1" aria-label="Play as GB1"><div class="choicePortrait choicePink"></div><strong>GB1</strong></button>
          <button class="heroChoice gb2 noColourLabel" data-hero="gb2" aria-label="Play as GB2"><div class="choicePortrait choiceTeal"></div><strong>GB2</strong></button>
        </div>
        <div class="menuSettings">
          <label><input id="menuDevMode" type="checkbox"> <span>Developer mode</span></label>
          <label><input id="menuFollowLock" type="checkbox" checked> <span>Lock camera behind hero</span></label>
        </div>
        <div class="menuNote">Left thumb: move · drag world: look · pinch: zoom · ZAP: tap or hold</div>`;
    }
    const devMode=menu.querySelector('#menuDevMode'),followSetting=menu.querySelector('#menuFollowLock');
    devMode.checked=false;followSetting.checked=true;localStorage.setItem('gamerBroDev','off');localStorage.setItem('gamerBroFollow','on');
    if(followBtn&&!/ON/i.test(followBtn.textContent||'')) followBtn.click();

    function selectHero(which){
      if(which==='gb1'){
        bro.setColorway('pink');
        bro.materials.cup?.color?.set(0x1ec9c8);bro.materials.cupAccent?.color?.set(0xffa13a);bro.materials.trim?.color?.set(0x31d6d8);bro.materials.shoe?.color?.set(0xef3d9f);
      }else{
        bro.setColorway('teal');
        bro.materials.cup?.color?.set(0x1ec9c8);bro.materials.cupAccent?.color?.set(0xffa13a);bro.materials.trim?.color?.set(0xf149a9);bro.materials.shoe?.color?.set(0x1ec9c8);
      }
      localStorage.setItem('gamerBroHero',which);
      document.body.classList.remove('menuOpen');menu.classList.remove('show');window.__hideGameMenu?.();
    }
    menu.querySelectorAll('[data-hero]').forEach(btn=>btn.addEventListener('click',()=>selectHero(btn.dataset.hero)));
    devMode.addEventListener('change',()=>{document.body.classList.toggle('cleanMode',!devMode.checked);localStorage.setItem('gamerBroDev',devMode.checked?'on':'off');});
    followSetting.addEventListener('change',()=>{const want=followSetting.checked,current=/ON/i.test(followBtn?.textContent||'');if(followBtn&&current!==want)followBtn.click();localStorage.setItem('gamerBroFollow',want?'on':'off');});

    // Current character polish retained: stronger cowlick and a clean shield-shaped glasses overlay.
    if(!bro.body.getObjectByName('v087CharacterPolish')){
      const polish=new THREE.Group();polish.name='v087CharacterPolish';bro.body.add(polish);
      const hairMat=new THREE.MeshPhysicalMaterial({color:0xf7c65b,roughness:.27,metalness:.02,clearcoat:.64,clearcoatRoughness:.16,envMapIntensity:1.3});
      const hairDeep=new THREE.MeshPhysicalMaterial({color:0xc88423,roughness:.41,clearcoat:.30,envMapIntensity:.9});
      const frameMat=new THREE.MeshPhysicalMaterial({color:0x0d0e15,roughness:.20,metalness:.45,clearcoat:.88,clearcoatRoughness:.06,envMapIntensity:1.5});
      const lensMat=new THREE.MeshPhysicalMaterial({color:0xff2bb8,emissive:0x78065d,emissiveIntensity:.36,roughness:.05,metalness:.12,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.95});
      function lock(points,r,mat=hairMat){const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');const m=new THREE.Mesh(new THREE.TubeGeometry(c,16,r,9,false),mat);m.castShadow=m.receiveShadow=true;m.layers.set(1);polish.add(m);}
      lock([[-.51,2.35,.30],[-.31,2.68,.50],[-.02,2.94,.42],[.25,3.02,.17]],.11);
      lock([[-.28,2.39,.38],[.00,2.75,.57],[.34,2.95,.43],[.65,2.86,.15]],.12);
      lock([[.03,2.40,.39],[.31,2.70,.54],[.63,2.82,.34],[.84,2.66,.06]],.105);
      lock([[-.58,2.30,.18],[-.65,2.54,.29],[-.51,2.74,.17],[-.31,2.84,-.04]],.087);
      lock([[.52,2.27,.16],[.70,2.49,.24],[.80,2.63,.07],[.71,2.74,-.15]],.084);
      lock([[-.08,2.48,.02],[-.10,2.81,.05],[.04,3.03,-.13]],.082,hairDeep);
      function shieldShape(scale=1){const s=new THREE.Shape();s.moveTo(-.72*scale,.17*scale);s.quadraticCurveTo(-.50*scale,.24*scale,0,.22*scale);s.quadraticCurveTo(.50*scale,.24*scale,.72*scale,.17*scale);s.lineTo(.69*scale,-.11*scale);s.quadraticCurveTo(.65*scale,-.19*scale,.48*scale,-.20*scale);s.lineTo(.17*scale,-.20*scale);s.quadraticCurveTo(.09*scale,-.06*scale,0,-.03*scale);s.quadraticCurveTo(-.09*scale,-.06*scale,-.17*scale,-.20*scale);s.lineTo(-.48*scale,-.20*scale);s.quadraticCurveTo(-.65*scale,-.19*scale,-.69*scale,-.11*scale);s.closePath();return s;}
      const frame=new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape(1),{depth:.075,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025}),frameMat);frame.position.set(0,1.875,.715);frame.castShadow=true;frame.layers.set(1);polish.add(frame);
      const lens=new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape(.90),{depth:.028,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.012}),lensMat);lens.position.set(0,1.875,.805);lens.layers.set(1);polish.add(lens);
    }

    // Replace every older pointer-pad handler with a conventional analog thumb stick.
    const pad=document.getElementById('movePad');
    if(pad){pad.innerHTML='<div class="joyRing"><div class="joyKnob"></div></div>';}
    let ring=pad?.querySelector('.joyRing');
    if(ring){const fresh=ring.cloneNode(true);ring.replaceWith(fresh);ring=fresh;}
    const knob=ring?.querySelector('.joyKnob');
    const analog=window.__gamerInput||(window.__gamerInput={x:0,y:0,active:false});
    let joyId=null,cx=0,cy=0;
    function setStick(x,y){
      const dx=x-cx,dy=y-cy,max=52,mag=Math.hypot(dx,dy),k=mag>max?max/mag:1,px=dx*k,py=dy*k;
      if(knob)knob.style.transform=`translate(${px}px,${py}px)`;
      let nx=px/max,ny=py/max,m=Math.hypot(nx,ny);const dead=.11;
      if(m<=dead){analog.x=0;analog.y=0;analog.active=false;return;}
      const scaled=(m-dead)/(1-dead),a=Math.atan2(ny,nx);nx=Math.cos(a)*scaled;ny=Math.sin(a)*scaled;
      // Gentle response near centre, full range at the edge; no artificial camera turning.
      analog.x=Math.sign(nx)*Math.pow(Math.abs(nx),1.18)*.92;
      analog.y=Math.sign(ny)*Math.pow(Math.abs(ny),1.08);
      analog.active=true;
    }
    function endStick(e){if(joyId===null||e.pointerId!==joyId)return;joyId=null;analog.x=analog.y=0;analog.active=false;if(knob)knob.style.transform='translate(0px,0px)';}
    ring?.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();joyId=e.pointerId;ring.setPointerCapture?.(e.pointerId);const r=ring.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;setStick(e.clientX,e.clientY);});
    ring?.addEventListener('pointermove',e=>{if(e.pointerId===joyId){e.preventDefault();setStick(e.clientX,e.clientY);}});
    ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>ring?.addEventListener(ev,endStick));

    // Stronger open-world lighting without new shadow maps.
    if(!scene.getObjectByName('v087FillRig')){
      const rig=new THREE.Group();rig.name='v087FillRig';scene.add(rig);
      [[-6,2.8,2],[6,2.8,2],[0,2.8,-6],[0,2.8,7],[-5,3.2,38],[5,3.2,38],[-6,4.5,55],[6,4.5,55],[0,5,72]].forEach((p,i)=>{const l=new THREE.PointLight(i<4?0xffb76e:0x835fff,i<4?7.8:5.2,i<4?11:13,2);l.position.set(...p);rig.add(l);});
    }
    if(lightSlider){lightSlider.value='190';lightSlider.dispatchEvent(new Event('input',{bubbles:true}));if(lightValue)lightValue.textContent='190%';}

    // Score HUD remains session-only.
    let hud=document.getElementById('scoreHud');if(!hud){hud=document.createElement('div');hud.id='scoreHud';hud.innerHTML='<span>LEAF SCORE</span><strong id="scoreValue">0</strong><small id="leafCount">0 / 6</small>';document.body.appendChild(hud);}
    const scoreValue=document.getElementById('scoreValue'),leafCount=document.getElementById('leafCount');

    // Reference-accurate Happy Dude Leaf silhouette: tall central spike, two pairs of
    // side spikes, rounded lower body, short side arms and tiny same-colour feet.
    function mapleReferenceShape(){
      const s=new THREE.Shape();
      s.moveTo(0,1.08);
      s.quadraticCurveTo(.08,.88,.16,.68);s.lineTo(.42,.84);s.quadraticCurveTo(.45,.67,.37,.52);
      s.lineTo(.68,.59);s.quadraticCurveTo(.65,.45,.53,.31);s.lineTo(.80,.17);s.quadraticCurveTo(.72,.05,.54,.01);
      s.lineTo(.62,-.22);s.quadraticCurveTo(.48,-.20,.39,-.31);s.quadraticCurveTo(.28,-.50,0,-.56);
      s.quadraticCurveTo(-.28,-.50,-.39,-.31);s.quadraticCurveTo(-.48,-.20,-.62,-.22);s.lineTo(-.54,.01);
      s.quadraticCurveTo(-.72,.05,-.80,.17);s.lineTo(-.53,.31);s.quadraticCurveTo(-.65,.45,-.68,.59);
      s.lineTo(-.37,.52);s.quadraticCurveTo(-.45,.67,-.42,.84);s.lineTo(-.16,.68);s.quadraticCurveTo(-.08,.88,0,1.08);s.closePath();return s;
    }
    const variants=[
      {name:'BASE',score:1,color:0xf22f25,em:0x300200,metal:.02,rough:.25},
      {name:'GOLD',score:2,color:0xf5c51f,em:0x563000,metal:.88,rough:.11},
      {name:'GALAXY',score:3,color:0x37258f,em:0x29178a,metal:.08,rough:.18,galaxy:true},
      {name:'GUMMY',score:2,color:0xff5f8e,em:0x183a22,metal:.01,rough:.16,gummy:true},
      {name:'HOLOFOIL',score:4,color:0xeaf4ff,em:0x4c678f,metal:.32,rough:.05,iri:1},
      {name:'GEM',score:5,color:0xe5f7ff,em:0x527ca2,metal:.02,rough:.04,trans:.30,gem:true}
    ];
    const starts={
      BASE:new THREE.Vector3(-4.2,.02,2.4),GOLD:new THREE.Vector3(4.2,.02,2.2),GALAXY:new THREE.Vector3(-9.0,2.13,38.45),
      GUMMY:new THREE.Vector3(9.0,2.13,38.45),HOLOFOIL:new THREE.Vector3(-10.0,3.62,55.0),GEM:new THREE.Vector3(0,3.96,72.0)
    };
    const white=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.20,clearcoat:.55,transparent:true,opacity:1});
    const black=new THREE.MeshPhysicalMaterial({color:0x08090d,roughness:.30,clearcoat:.28,transparent:true,opacity:1});
    const tongueMat=new THREE.MeshPhysicalMaterial({color:0xff7772,roughness:.32,transparent:true,opacity:1});
    const bodyGeo=new THREE.ExtrudeGeometry(mapleReferenceShape(),{depth:.66,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.10,bevelThickness:.085});bodyGeo.center();
    const armGeo=new THREE.CapsuleGeometry(.18,.24,7,14),footGeo=new THREE.SphereGeometry(.25,20,14),eyeGeo=new THREE.SphereGeometry(.15,20,14),pupilGeo=new THREE.SphereGeometry(.060,14,10);
    const leafs=[];
    variants.forEach((v,i)=>{
      const g=new THREE.Group();g.name='HappyDudeLeaf_'+v.name;g.userData={...v,dead:false,deadAt:0,start:starts[v.name].clone(),seed:i*1.731,hitRadius:1.25};g.position.copy(g.userData.start);scene.add(g);
      const mat=new THREE.MeshPhysicalMaterial({color:v.color,emissive:v.em,emissiveIntensity:v.galaxy?.58:.25,metalness:v.metal,roughness:v.rough,clearcoat:.82,clearcoatRoughness:.07,iridescence:v.iri||0,iridescenceIOR:1.35,transmission:v.trans||0,thickness:v.gem?.85:0,ior:1.32,envMapIntensity:1.45,transparent:true,opacity:1});
      const body=new THREE.Mesh(bodyGeo,mat);body.position.set(0,1.34,0);body.scale.set(1.24,1.26,1.12);body.castShadow=true;body.receiveShadow=true;g.add(body);
      for(const side of [-1,1]){
        const arm=new THREE.Mesh(armGeo,mat);arm.name=side<0?'armL':'armR';arm.position.set(side*1.02,1.25,.02);arm.rotation.z=side*Math.PI/2;arm.scale.set(1.0,1.0,1.05);arm.castShadow=true;g.add(arm);
        const foot=new THREE.Mesh(footGeo,mat);foot.name=side<0?'footL':'footR';foot.position.set(side*.42,.22,.10);foot.scale.set(1.16,.62,1.30);foot.castShadow=true;foot.receiveShadow=true;g.add(foot);
        const eye=new THREE.Mesh(eyeGeo,white);eye.position.set(side*.25,1.57,.48);eye.scale.set(.82,1.28,.58);g.add(eye);
        const pupil=new THREE.Mesh(pupilGeo,black);pupil.position.set(side*.25,1.57,.59);pupil.scale.set(.75,1.22,.55);g.add(pupil);
        const brow=new THREE.Mesh(new THREE.TorusGeometry(.13,.024,6,18,Math.PI*.70),black);brow.position.set(side*.25,1.82,.51);brow.rotation.z=side<0?-.12:.12;g.add(brow);
      }
      const mouth=new THREE.Mesh(new THREE.TorusGeometry(.22,.040,8,28,Math.PI),black);mouth.position.set(0,1.20,.54);mouth.rotation.z=Math.PI;mouth.scale.set(1.15,.78,1);g.add(mouth);
      const teeth=new THREE.Mesh(new THREE.BoxGeometry(.28,.055,.035),white);teeth.position.set(0,1.16,.59);g.add(teeth);
      const tongue=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),tongueMat);tongue.position.set(0,1.07,.57);tongue.scale.set(1.18,.48,.28);g.add(tongue);
      if(v.galaxy){const pts=new Float32Array(96);for(let k=0;k<32;k++){pts[k*3]=(Math.random()-.5)*1.45;pts[k*3+1]=.55+Math.random()*1.45;pts[k*3+2]=.46+Math.random()*.18;}const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pts,3));g.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0xffffff,size:.036,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})));}
      if(v.gummy){const green=new THREE.Mesh(new THREE.SphereGeometry(.78,24,16),new THREE.MeshPhysicalMaterial({color:0x54d760,roughness:.16,clearcoat:.9,transparent:true,opacity:.30}));green.position.set(0,.78,-.03);green.scale.set(1.0,.55,.72);g.add(green);}
      leafs.push(g);
    });

    let score=0,caught=0;function syncHud(){if(scoreValue)scoreValue.textContent=String(score);if(leafCount)leafCount.textContent=`${caught} / ${leafs.length}`;}
    function burstAt(pos,color){const n=28,arr=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){arr[i*3]=pos.x;arr[i*3+1]=pos.y+1.25;arr[i*3+2]=pos.z;vel.push(new THREE.Vector3((Math.random()-.5)*3,Math.random()*2.5,(Math.random()-.5)*3));}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(arr,3));const mat=new THREE.PointsMaterial({color,size:.065,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending});const p=new THREE.Points(geo,mat);scene.add(p);const born=performance.now();function step(now){const dt=.016,a=geo.attributes.position.array;for(let i=0;i<n;i++){a[i*3]+=vel[i].x*dt;a[i*3+1]+=vel[i].y*dt;a[i*3+2]+=vel[i].z*dt;vel[i].y-=4*dt;}geo.attributes.position.needsUpdate=true;const q=(now-born)/420;mat.opacity=1-q;if(q<1)requestAnimationFrame(step);else{scene.remove(p);geo.dispose();mat.dispose();}}requestAnimationFrame(step);}
    function hitLeaf(g){if(g.userData.dead)return;g.userData.dead=true;g.userData.deadAt=performance.now();score+=g.userData.score;caught++;syncHud();burstAt(g.position,g.userData.color);}
    function resetLeafs(){score=0;caught=0;leafs.forEach(g=>{g.visible=true;g.scale.setScalar(1);g.position.copy(g.userData.start);g.rotation.set(0,0,0);g.userData.dead=false;g.userData.deadAt=0;g.traverse(o=>{if(o.material?.transparent)o.material.opacity=1;});});syncHud();}
    resetBtn?.addEventListener('click',()=>setTimeout(resetLeafs,20));

    let firing=false;actionBtn?.addEventListener('pointerdown',()=>firing=true);['pointerup','pointercancel','lostpointercapture'].forEach(ev=>actionBtn?.addEventListener(ev,()=>firing=false));
    addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f')firing=true;},true);addEventListener('keyup',e=>{if(e.key.toLowerCase()==='f')firing=false;},true);
    const origin=new THREE.Vector3(),dir=new THREE.Vector3(),to=new THREE.Vector3();
    let last=performance.now();
    function tick(now){
      const dt=Math.min(.05,(now-last)/1000);last=now,t=now*.001;
      for(const g of leafs){
        const u=g.userData;if(u.dead){const p=Math.min(1,(now-u.deadAt)/300);g.scale.setScalar(1-p*.94);g.rotation.y+=dt*10;g.position.y+=dt*.55;g.traverse(o=>{if(o.material?.transparent)o.material.opacity=1-p;});if(p>=1)g.visible=false;continue;}
        const r=.55+(u.score%3)*.10;g.position.x=u.start.x+Math.cos(t*(.36+.025*u.score)+u.seed)*r;g.position.z=u.start.z+Math.sin(t*(.36+.025*u.score)+u.seed)*r;g.position.y=u.start.y+.045*Math.abs(Math.sin(t*4.6+u.seed));g.rotation.y=Math.sin(t*.55+u.seed)*.32;
        const st=Math.sin(t*5.0+u.seed),st2=-st;const fL=g.getObjectByName('footL'),fR=g.getObjectByName('footR'),aL=g.getObjectByName('armL'),aR=g.getObjectByName('armR');if(fL)fL.position.y=.22+.07*Math.max(0,-st);if(fR)fR.position.y=.22+.07*Math.max(0,-st2);if(aL)aL.rotation.x=.14*st;if(aR)aR.rotation.x=.14*st2;
      }
      if(firing&&!document.body.classList.contains('menuOpen')){
        bro.root.updateMatrixWorld(true);origin.set(0,1.88,.80);bro.root.localToWorld(origin);dir.set(0,0,1).applyQuaternion(bro.root.quaternion).normalize();let best=null,bestAlong=1e9;
        for(const g of leafs){if(!g.visible||g.userData.dead)continue;to.copy(g.position).add(new THREE.Vector3(0,1.25,0)).sub(origin);const along=to.dot(dir);if(along<0||along>36)continue;const perp=Math.max(0,to.lengthSq()-along*along),r=g.userData.hitRadius;if(perp<=r*r&&along<bestAlong){best=g;bestAlong=along;}}
        if(best)hitLeaf(best);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);syncHud();

    selectHero(localStorage.getItem('gamerBroHero')==='gb1'?'gb1':'gb2');
    // Always start at selection screen despite restoring colour internally.
    document.body.classList.add('menuOpen');menu.classList.add('show');
  } catch(err){console.error('v0.8.7 enhancement failed:',err);}
})();
