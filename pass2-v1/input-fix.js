(()=>{
  const pad=document.getElementById('pad');
  if(!pad)return;
  const held=new Set();
  const codeMap={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD'};
  function setKey(code,on){
    if(on&&held.has(code))return;
    if(!on&&!held.has(code))return;
    if(on)held.add(code);else held.delete(code);
    window.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code,key:code,bubbles:true}));
  }
  function releaseAll(){for(const code of [...held])setKey(code,false);}
  function applyPoint(x,y){
    const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=(x-cx)/(r.width*.34),dy=(y-cy)/(r.height*.34),dead=.18;
    setKey(codeMap.left,dx<-dead);setKey(codeMap.right,dx>dead);setKey(codeMap.up,dy<-dead);setKey(codeMap.down,dy>dead);
    window.__touchFallback={dx,dy,held:[...held]};
  }
  pad.addEventListener('touchstart',e=>{if(!e.touches.length)return;e.preventDefault();applyPoint(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
  pad.addEventListener('touchmove',e=>{if(!e.touches.length)return;e.preventDefault();applyPoint(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
  pad.addEventListener('touchend',e=>{e.preventDefault();if(e.touches.length)applyPoint(e.touches[0].clientX,e.touches[0].clientY);else releaseAll();},{passive:false});
  pad.addEventListener('touchcancel',()=>releaseAll(),{passive:false});
  window.addEventListener('blur',releaseAll);
  window.__mobileJoystickFallback=true;
})();
