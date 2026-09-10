// Gamer Bros v0.8.9 player-facing layer.
// Keeps the proven v0.8.7 gameplay/portal lineage, removes the old developer-facing
// presentation, previews the map before hero selection, and matches the Crystal
// Library control language.
(async()=>{
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>r()));
  const body=document.body;
  body.classList.add('playerMode','introTour');

  let bro=null,menu=null,canvas=null,renderer=null,camera=null,scene=null;
  for(let i=0;i<520;i++){
    bro=window.__bro;
    menu=document.getElementById('gameMenu');
    canvas=document.querySelector('#stage canvas');
    renderer=window.__gamerRenderer;
    camera=window.__gamerCamera;
    scene=window.__gamerScene||bro?.root?.parent;
    if(bro&&menu&&canvas&&menu.querySelector('[data-hero="gb1"]')&&menu.querySelector('[data-hero="gb2"]'))break;
    await sleep(25);
  }
  if(!bro||!menu||!canvas){
    body.classList.remove('introTour');
    window.__introTourActive=false;
    window.__showGameMenu?.();
    return;
  }

  menu.classList.remove('show');
  body.classList.remove('menuOpen');
  menu.querySelector('.menuSettings')?.remove();
  const note=menu.querySelector('.menuNote');
  if(note)note.textContent='Move · drag the world to look · pinch to zoom · RUN · JUMP · ZAP';

  // Exact Crystal Library thumb-pad response instead of the v0.8.7 experimental stick.
  const movePad=document.getElementById('movePad');
  if(movePad){
    movePad.innerHTML='<div class="stickRing"></div><div id="stickKnob" class="stickKnob"></div>';
    const knob=movePad.querySelector('#stickKnob');
    const analog=window.__gamerInput||(window.__gamerInput={x:0,y:0,active:false});
    analog.pointerId=null;
    const updateStick=e=>{
      const r=movePad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,lim=r.width*.34;
      let x=e.clientX-cx,y=e.clientY-cy,d=Math.hypot(x,y);
      if(d>lim){x=x/d*lim;y=y/d*lim;}
      analog.x=x/lim;analog.y=y/lim;analog.active=Math.hypot(analog.x,analog.y)>.035;
      if(knob)knob.style.transform=`translate3d(${x}px,${y}px,0)`;
    };
    const release=e=>{
      if(e&&analog.pointerId!==null&&e.pointerId!==analog.pointerId)return;
      analog.x=0;analog.y=0;analog.active=false;analog.pointerId=null;
      if(knob)knob.style.transform='translate3d(0,0,0)';
    };
    movePad.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();analog.pointerId=e.pointerId;movePad.setPointerCapture?.(e.pointerId);updateStick(e);});
    movePad.addEventListener('pointermove',e=>{if(e.pointerId!==analog.pointerId)return;e.preventDefault();e.stopPropagation();updateStick(e);});
    movePad.addEventListener('pointerup',release);
    movePad.addEventListener('pointercancel',release);
    movePad.addEventListener('lostpointercapture',release);
  }

  // Move expensive portal setup to the non-interactive opening cinematic. The visual
  // portal design is untouched; this only changes WHEN shaders/bounds/particle samples
  // are prepared so conversion does not have to do them on its critical frame.
  if(renderer&&scene&&camera){
    try{await renderer.compileAsync?.(scene,camera);}catch{}
  }
  try{window.__prewarmPortalHero?.();}catch(err){console.warn('[v0.8.9 portal prewarm]',err);}

  const label=document.createElement('div');
  label.id='worldIntroLabel';
  label.textContent='GAMER BROS · PORTAL WORLD';
  body.appendChild(label);

  const lerp=(a,b,t)=>a+(b-a)*t;
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
  window.__introTourActive=true;
  window.__introPose={pos:[0,22,-30],look:[0,3,31]};

  // Arrive over the hub -> orbit the route network -> settle toward playable spawn.
  const total=3900,start=performance.now();
  await new Promise(resolve=>{
    const tick=now=>{
      const t=Math.min(1,(now-start)/total);
      let pos,look;
      if(t<.30){
        const q=ease(t/.30);
        pos=mix3([0,24,-34],[21,15,4],q);
        look=mix3([0,3,28],[0,3,34],q);
      }else if(t<.78){
        const q=(t-.30)/.48,ang=lerp(-.70,2.25,q),rad=31-5*Math.sin(q*Math.PI);
        pos=[Math.sin(ang)*rad,12.5+2.5*Math.sin(q*Math.PI),34+Math.cos(ang)*rad];
        look=[0,3.5,38];
      }else{
        const q=ease((t-.78)/.22),p=bro.root?.position||{x:0,y:0,z:0};
        pos=mix3([20,13,18],[p.x+5.5,p.y+3.4,p.z+8.5],q);
        look=mix3([0,3.5,38],[p.x,p.y+1.45,p.z],q);
      }
      window.__introPose={pos,look};
      if(t<1)requestAnimationFrame(tick);else resolve();
    };
    requestAnimationFrame(tick);
  });

  async function applyVariant(which){
    if(which==='gb1'){
      bro.setColorway('pink');
      bro.materials.cup?.color?.set(0x1ec9c8);bro.materials.cupAccent?.color?.set(0xffa13a);
      bro.materials.trim?.color?.set(0x31d6d8);bro.materials.shoe?.color?.set(0xef3d9f);
    }else{
      bro.setColorway('teal');
      bro.materials.cup?.color?.set(0x1ec9c8);bro.materials.cupAccent?.color?.set(0xffa13a);
      bro.materials.trim?.color?.set(0xf149a9);bro.materials.shoe?.color?.set(0x1ec9c8);
    }
    await nextFrame();
  }

  // Snapshot the actual live 3D Gamer Bro in both real shirt colorways for selection.
  async function capturePortrait(which){
    if(!renderer||!scene||!camera)return null;
    try{
      await applyVariant(which);
      const p=bro.root?.position||{x:0,y:0,z:0};
      window.__introPose={pos:[p.x+3.8,p.y+2.75,p.z+5.8],look:[p.x,p.y+1.38,p.z]};
      await nextFrame();
      const oldRot=bro.root.rotation.y;
      bro.root.rotation.y=0;
      renderer.render(scene,camera);
      const data=renderer.domElement.toDataURL('image/jpeg',.78);
      bro.root.rotation.y=oldRot;
      return data;
    }catch(err){console.warn('[v0.8.9 portrait capture]',err);return null;}
  }

  const pink=await capturePortrait('gb1');
  const teal=await capturePortrait('gb2');
  const pinkArt=menu.querySelector('.choicePink'),tealArt=menu.querySelector('.choiceTeal');
  if(pink&&pinkArt){pinkArt.style.backgroundImage=`url(${pink})`;pinkArt.classList.add('livePortrait');}
  if(teal&&tealArt){tealArt.style.backgroundImage=`url(${teal})`;tealArt.classList.add('livePortrait');}

  await applyVariant(localStorage.getItem('gamerBroHero')==='gb1'?'gb1':'gb2');
  label.classList.add('fade');
  await sleep(220);
  label.remove();

  body.classList.remove('introTour');
  window.__showGameMenu?.();
  body.classList.add('menuOpen');
  menu.classList.add('show');

  menu.querySelectorAll('[data-hero]').forEach(btn=>btn.addEventListener('click',()=>{
    window.__introTourActive=false;
    window.__introPose=null;
    body.classList.remove('introTour');
  },{capture:true}));
})();
