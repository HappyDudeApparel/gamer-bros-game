const sleep84 = (ms) => new Promise(r => setTimeout(r, ms));

async function waitFor84() {
  for (let i = 0; i < 500; i++) {
    const bro = window.__bro;
    const menu = document.getElementById('gameMenu');
    const canvas = document.querySelector('#stage canvas');
    if (bro && menu && canvas && document.getElementById('ui')?.classList.contains('show')) return { bro, menu, canvas };
    await sleep84(25);
  }
  throw new Error('v0.8.5 could not find the initialized game.');
}

(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    const { bro, menu, canvas } = await waitFor84();
    const scene = bro.root.parent;
    document.body.classList.add('v085');

    const resetBtn = document.getElementById('resetBtn');
    const actionBtn = document.getElementById('actionTouchBtn');
    const followBtn = document.getElementById('followLockBtn');
    const lightSlider = document.getElementById('lightingSlider');
    const lightValue = document.getElementById('lightingValue');

    const shell = menu.querySelector('.menuShell');
    if (shell) {
      shell.innerHTML = `
        <div class="brandHero" role="img" aria-label="Gamer Bros GB1 and GB2"></div>
        <div class="menuEyebrow">GAMER BROS · PORTAL WORLD</div>
        <h1>Select your Gamer Bro</h1>
        <p class="menuSub">Choose GB1 or GB2. Both use the same evolving in-game model, with their official colourway.</p>
        <div class="heroChoices heroChoices84">
          <button class="heroChoice gb1" data-hero="gb1" aria-label="Play as GB1, pink shirt"><div class="choicePortrait choicePink"></div><strong>GB1</strong><span>Pink Shirt</span></button>
          <button class="heroChoice gb2" data-hero="gb2" aria-label="Play as GB2, teal shirt"><div class="choicePortrait choiceTeal"></div><strong>GB2</strong><span>Teal Shirt</span></button>
        </div>
        <div class="menuSettings">
          <label><input id="menuDevMode" type="checkbox"> <span>Developer mode</span></label>
          <label><input id="menuFollowLock" type="checkbox" checked> <span>Lock camera behind hero</span></label>
        </div>
        <div class="menuNote">Left thumb: movement stick · drag world: look around · pinch: zoom · ZAP: tap or hold</div>`;
    }

    const devMode = menu.querySelector('#menuDevMode');
    const followSetting = menu.querySelector('#menuFollowLock');
    devMode.checked = false;
    followSetting.checked = true;
    localStorage.setItem('gamerBroDev', 'off');
    localStorage.setItem('gamerBroFollow', 'on');
    document.body.classList.add('cleanMode');
    if (followBtn && !/ON/i.test(followBtn.textContent || '')) followBtn.click();

    const selectHero = (which) => {
      if (which === 'gb1') {
        bro.setColorway('pink');
        bro.materials.cup?.color?.set(0x1ec9c8); bro.materials.cupAccent?.color?.set(0xffa13a);
        bro.materials.trim?.color?.set(0x31d6d8); bro.materials.shoe?.color?.set(0xef3d9f);
      } else {
        bro.setColorway('teal');
        bro.materials.cup?.color?.set(0x1ec9c8); bro.materials.cupAccent?.color?.set(0xffa13a);
        bro.materials.trim?.color?.set(0xf149a9); bro.materials.shoe?.color?.set(0x1ec9c8);
      }
      localStorage.setItem('gamerBroHero', which);
      document.body.classList.remove('menuOpen'); menu.classList.remove('show');
    };
    menu.querySelectorAll('[data-hero]').forEach(btn => btn.addEventListener('click', () => selectHero(btn.dataset.hero)));
    devMode.addEventListener('change', () => { document.body.classList.toggle('cleanMode', !devMode.checked); localStorage.setItem('gamerBroDev', devMode.checked ? 'on' : 'off'); });
    followSetting.addEventListener('change', () => { const want=followSetting.checked; localStorage.setItem('gamerBroFollow',want?'on':'off'); const current=/ON/i.test(followBtn?.textContent||''); if(followBtn&&current!==want)followBtn.click(); });

    if (!bro.body.getObjectByName('v085CharacterPolish')) {
      const polish = new THREE.Group(); polish.name = 'v085CharacterPolish'; bro.body.add(polish);
      const hairMat = new THREE.MeshPhysicalMaterial({ color:0xf6c45a, roughness:.28, metalness:.02, clearcoat:.62, clearcoatRoughness:.18, envMapIntensity:1.25 });
      const hairDeep = new THREE.MeshPhysicalMaterial({ color:0xc98525, roughness:.42, clearcoat:.28, envMapIntensity:.85 });
      const frameMat = new THREE.MeshPhysicalMaterial({ color:0x101119, roughness:.22, metalness:.42, clearcoat:.85, clearcoatRoughness:.07, envMapIntensity:1.45 });
      const lensMat = new THREE.MeshPhysicalMaterial({ color:0xff2bb8, emissive:0x7a075d, emissiveIntensity:.36, roughness:.055, metalness:.12, clearcoat:1, clearcoatRoughness:.025, envMapIntensity:1.9 });
      function makeLock(points, radius, mat = hairMat) { const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal'); const m=new THREE.Mesh(new THREE.TubeGeometry(curve,14,radius,8,false),mat);m.castShadow=m.receiveShadow=true;m.layers.set(1);polish.add(m); }
      makeLock([[-.48,2.36,.30],[-.28,2.66,.48],[-.02,2.89,.40],[.22,2.97,.20]],.105);
      makeLock([[-.28,2.39,.36],[-.02,2.72,.54],[.28,2.91,.42],[.58,2.84,.18]],.115);
      makeLock([[.02,2.40,.38],[.28,2.67,.52],[.57,2.79,.35],[.79,2.68,.10]],.10);
      makeLock([[-.58,2.30,.18],[-.63,2.52,.28],[-.50,2.72,.18],[-.32,2.82,-.02]],.085);
      makeLock([[.50,2.27,.16],[.68,2.47,.24],[.78,2.61,.08],[.70,2.71,-.13]],.082);
      makeLock([[-.10,2.48,.03],[-.10,2.79,.06],[.03,3.00,-.12]],.082,hairDeep);
      function shieldShape(scale=1){const s=new THREE.Shape();s.moveTo(-.72*scale,.17*scale);s.quadraticCurveTo(-.50*scale,.24*scale,0,.22*scale);s.quadraticCurveTo(.50*scale,.24*scale,.72*scale,.17*scale);s.lineTo(.69*scale,-.11*scale);s.quadraticCurveTo(.65*scale,-.19*scale,.48*scale,-.20*scale);s.lineTo(.17*scale,-.20*scale);s.quadraticCurveTo(.09*scale,-.06*scale,0,-.03*scale);s.quadraticCurveTo(-.09*scale,-.06*scale,-.17*scale,-.20*scale);s.lineTo(-.48*scale,-.20*scale);s.quadraticCurveTo(-.65*scale,-.19*scale,-.69*scale,-.11*scale);s.closePath();return s;}
      const frame=new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape(1),{depth:.075,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025}),frameMat);frame.position.set(0,1.875,.715);frame.castShadow=true;frame.layers.set(1);polish.add(frame);
      const lens=new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape(.90),{depth:.028,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.012}),lensMat);lens.position.set(0,1.875,.805);lens.layers.set(1);polish.add(lens);
      for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.28,.075,.075),frameMat);arm.position.set(side*.79,1.91,.73);arm.rotation.y=side*.28;arm.castShadow=true;arm.layers.set(1);polish.add(arm);}
    }

    const pad = document.getElementById('movePad'); if (pad) pad.innerHTML='<div class="joyRing"><div class="joyKnob"></div></div>';
    const joyRing=pad?.querySelector('.joyRing'), joyKnob=pad?.querySelector('.joyKnob');
    const analog=window.__gamerInput||(window.__gamerInput={x:0,y:0,active:false});let joyId=null,joyCenter={x:0,y:0};
    function setJoy(clientX,clientY){const dx=clientX-joyCenter.x,dy=clientY-joyCenter.y,max=47,mag=Math.hypot(dx,dy),k=mag>max?max/mag:1,x=dx*k,y=dy*k;joyKnob.style.transform=`translate(${x}px,${y}px)`;let nx=x/max,ny=y/max;const dead=.12;if(Math.hypot(nx,ny)<dead){nx=0;ny=0;}else{const m=(Math.hypot(nx,ny)-dead)/(1-dead),a=Math.atan2(ny,nx);nx=Math.cos(a)*m;ny=Math.sin(a)*m;}nx=Math.sign(nx)*Math.pow(Math.abs(nx),2.15);analog.x=nx;analog.y=ny;analog.active=true;}
    function endJoy(e){if(joyId===null||e.pointerId!==joyId)return;joyId=null;analog.x=0;analog.y=0;analog.active=false;joyKnob.style.transform='translate(0px,0px)';}
    joyRing?.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();joyId=e.pointerId;joyRing.setPointerCapture?.(e.pointerId);const r=joyRing.getBoundingClientRect();joyCenter={x:r.left+r.width/2,y:r.top+r.height/2};setJoy(e.clientX,e.clientY);});
    joyRing?.addEventListener('pointermove',e=>{if(e.pointerId===joyId){e.preventDefault();setJoy(e.clientX,e.clientY);}});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>joyRing?.addEventListener(ev,endJoy));

    const originalSetHome=bro.setHome.bind(bro);let visualYaw=bro.root.rotation.y;
    bro.setHome=(x,z,ry=0)=>{const portalText=document.getElementById('characterStatus')?.textContent||'';const portalMode=/ENTERING|PORTAL READY|CONVERTING|TRANSMITTED/.test(portalText);if(!portalMode&&!document.body.classList.contains('menuOpen')){const d=Math.atan2(Math.sin(ry-visualYaw),Math.cos(ry-visualYaw));visualYaw+=d*.020;originalSetHome(x,z,visualYaw);}else{visualYaw=ry;originalSetHome(x,z,ry);}};

    if(!scene.getObjectByName('v085FillRig')){const rig=new THREE.Group();rig.name='v085FillRig';scene.add(rig);[[-4.7,2.4,3.7],[4.7,2.4,3.7],[-4.7,2.4,-3.7],[4.7,2.4,-3.7]].forEach(p=>{const l=new THREE.PointLight(0xffb46b,8.5,9.5,2);l.position.set(...p);rig.add(l);});[[-3.2,1.25,0],[3.2,1.25,0],[0,1.2,4.2]].forEach(p=>{const l=new THREE.PointLight(0x845dff,4.2,8,2);l.position.set(...p);rig.add(l);});}
    if(lightSlider){lightSlider.value='185';lightSlider.dispatchEvent(new Event('input',{bubbles:true}));if(lightValue)lightValue.textContent='185%';}

    const hud=document.createElement('div');hud.id='scoreHud';hud.innerHTML='<span>LEAF SCORE</span><strong id="scoreValue">0</strong><small id="leafCount">0 / 6</small>';document.body.appendChild(hud);let score=0,caught=0;const scoreValue=hud.querySelector('#scoreValue'),leafCount=hud.querySelector('#leafCount');const updateHud=()=>{scoreValue.textContent=String(score);leafCount.textContent=`${caught} / 6`;};
    function mapleShape(){const pts=[[0,.86],[-.15,.58],[-.34,.70],[-.31,.43],[-.60,.46],[-.43,.22],[-.68,.05],[-.37,-.01],[-.43,-.31],[-.15,-.20],[0,-.58],[.15,-.20],[.43,-.31],[.37,-.01],[.68,.05],[.43,.22],[.60,.46],[.31,.43],[.34,.70],[.15,.58]];const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();return s;}
    const leafVariants=[{name:'BASE',score:1,color:0xf13a2c,metal:.02,rough:.34,em:0x2a0200},{name:'GOLD',score:2,color:0xf4c226,metal:.75,rough:.18,em:0x4a2a00},{name:'GALAXY',score:3,color:0x5536c8,metal:.10,rough:.24,em:0x3519a0},{name:'GUMMY',score:2,color:0xff6b9a,metal:.01,rough:.22,em:0x173b1b},{name:'HOLOFOIL',score:4,color:0xd9e8ff,metal:.32,rough:.08,em:0x526a8c,iri:1},{name:'GEM',score:5,color:0xe6f6ff,metal:.05,rough:.06,em:0x537ea0,trans:.28}];
    const leafStarts=[[-4.7,1.10,1.8],[4.7,1.10,1.7],[-3.6,1.10,-3.8],[3.6,1.10,-3.8],[-1.8,1.48,3.0],[1.8,1.48,3.0]];const leafs=[];const faceWhite=new THREE.MeshBasicMaterial({color:0xffffff}),faceBlack=new THREE.MeshBasicMaterial({color:0x0b0b10});
    leafVariants.forEach((v,i)=>{const g=new THREE.Group();g.position.set(...leafStarts[i]);g.userData={...v,index:i,dead:false,deadAt:0,start:new THREE.Vector3(...leafStarts[i]),seed:i*1.37};const mat=new THREE.MeshPhysicalMaterial({color:v.color,metalness:v.metal,roughness:v.rough,emissive:v.em,emissiveIntensity:.35,clearcoat:.5,clearcoatRoughness:.12,iridescence:v.iri||0,transmission:v.trans||0,transparent:true,opacity:1});const bodyGeo=new THREE.ExtrudeGeometry(mapleShape(),{depth:.30,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.08,bevelThickness:.05});bodyGeo.center();const m=new THREE.Mesh(bodyGeo,mat);m.scale.set(.72,.72,.72);m.castShadow=true;m.receiveShadow=true;g.add(m);for(const sx of [-.17,.17]){const e=new THREE.Mesh(new THREE.SphereGeometry(.075,10,8),faceWhite);e.position.set(sx,.08,.20);g.add(e);const p=new THREE.Mesh(new THREE.SphereGeometry(.032,8,6),faceBlack);p.position.set(sx,.08,.265);g.add(p);}const mouth=new THREE.Mesh(new THREE.TorusGeometry(.12,.024,6,18,Math.PI),faceBlack);mouth.position.set(0,-.13,.255);mouth.rotation.z=Math.PI;g.add(mouth);scene.add(g);leafs.push(g);});
    function resetLeafs(){score=0;caught=0;leafs.forEach(g=>{g.visible=true;g.scale.setScalar(1);g.position.copy(g.userData.start);g.rotation.set(0,0,0);g.userData.dead=false;g.userData.deadAt=0;g.traverse(o=>{if(o.material?.transparent)o.material.opacity=1;});});updateHud();}resetBtn?.addEventListener('click',()=>setTimeout(resetLeafs,0));
    let firing84=false;actionBtn?.addEventListener('pointerdown',()=>{firing84=true;});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>actionBtn?.addEventListener(ev,()=>{firing84=false;}));window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f')firing84=true;},true);window.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='f')firing84=false;},true);const fireOrigin=new THREE.Vector3(),fireDir=new THREE.Vector3(),toLeaf=new THREE.Vector3();
    function hitLeaf(g){if(g.userData.dead)return;g.userData.dead=true;g.userData.deadAt=performance.now();score+=g.userData.score;caught++;updateHud();}
    function animate84(now){const t=now*.001;leafs.forEach((g,i)=>{const u=g.userData;if(u.dead){const p=Math.min(1,(now-u.deadAt)/260);g.scale.setScalar(1-p*.92);g.rotation.y+=.18;g.position.y+=.008;g.traverse(o=>{if(o.material?.transparent)o.material.opacity=1-p;});if(p>=1)g.visible=false;return;}const r=.55+.12*(i%2);g.position.x=u.start.x+Math.cos(t*(.42+.03*i)+u.seed)*r;g.position.z=u.start.z+Math.sin(t*(.42+.03*i)+u.seed)*r;g.position.y=u.start.y+.06*Math.sin(t*2.1+u.seed);g.rotation.y=t*.55+u.seed;});if(firing84&&!document.body.classList.contains('menuOpen')){bro.root.updateMatrixWorld(true);fireOrigin.set(0,1.88,.78);bro.root.localToWorld(fireOrigin);fireDir.set(0,0,1).applyQuaternion(bro.root.quaternion).normalize();let best=null,bestT=1e9;for(const g of leafs){if(g.userData.dead||!g.visible)continue;toLeaf.copy(g.position).sub(fireOrigin);const along=toLeaf.dot(fireDir);if(along<0||along>26)continue;const perpSq=toLeaf.lengthSq()-along*along;if(perpSq<.46*.46&&along<bestT){best=g;bestT=along;}}if(best)hitLeaf(best);}requestAnimationFrame(animate84);}resetLeafs();requestAnimationFrame(animate84);

    followSetting.checked=true;document.body.classList.add('cleanMode');document.body.classList.add('menuOpen');menu.classList.add('show');
  } catch (err) { console.error('v0.8.5 enhancement failed:',err); }
})();
