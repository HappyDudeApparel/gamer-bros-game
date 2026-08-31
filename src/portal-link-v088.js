// v0.8.8 recovery bridge: when the preserved portal completes its transfer,
// offer the authored Hybrid Crystal Library as the destination.
(()=>{
  const init=()=>{
    const phase=document.getElementById('phaseLine');
    const controls=document.querySelector('.portalControls');
    const hint=document.getElementById('hint');
    if(!phase||!controls)return false;
    if(document.getElementById('enterCrystalLibraryBtn'))return true;

    const style=document.createElement('style');
    style.textContent=`#enterCrystalLibraryBtn{display:none;width:100%;margin-top:8px;padding:13px 14px;border:1px solid rgba(202,154,255,.72);border-radius:12px;background:linear-gradient(135deg,#7140a8,#34205f);color:#fff;font-weight:900;letter-spacing:.045em;box-shadow:0 8px 28px #0008,0 0 24px rgba(164,92,255,.22);cursor:pointer}#enterCrystalLibraryBtn.ready{display:block;animation:portalReadyPulse 1.5s ease-in-out infinite alternate}@keyframes portalReadyPulse{from{box-shadow:0 8px 28px #0008,0 0 18px rgba(164,92,255,.18)}to{box-shadow:0 8px 28px #0008,0 0 34px rgba(101,222,255,.40)}}@media(prefers-reduced-motion:reduce){#enterCrystalLibraryBtn.ready{animation:none}}`;
    document.head.appendChild(style);

    const btn=document.createElement('button');
    btn.id='enterCrystalLibraryBtn';btn.type='button';btn.textContent='ENTER CRYSTAL LIBRARY';
    controls.appendChild(btn);
    btn.addEventListener('click',()=>{btn.disabled=true;btn.textContent='TRANSFERRING…';location.href='./hybrid-v09/?from=open-world&v=088';});

    let unlocked=false;
    const sync=()=>{
      const text=(phase.textContent||'').toUpperCase();
      if(/AFTERGLOW|TRANSMITTED|TRANSFER COMPLETE/.test(text)){
        unlocked=true;btn.classList.add('ready');btn.disabled=false;
        if(hint){hint.textContent='Portal transfer complete · enter the Crystal Library';hint.classList.remove('fade');}
      }else if(!unlocked){btn.classList.remove('ready');}
    };
    new MutationObserver(sync).observe(phase,{childList:true,subtree:true,characterData:true});
    sync();
    window.__portalDestination='hybrid-v09';
    return true;
  };
  if(init())return;
  let tries=0;const timer=setInterval(()=>{if(init()||++tries>400)clearInterval(timer);},25);
})();
