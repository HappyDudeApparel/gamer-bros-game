from pathlib import Path

p = Path('pass12-v1/app.js')
s = p.read_text()

old_renderer = "const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});"
new_renderer = "const renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,alpha:false,powerPreference:'high-performance'});"
if old_renderer in s:
    s = s.replace(old_renderer, new_renderer, 1)
elif new_renderer not in s:
    raise SystemExit('renderer marker missing')

old_init = "(async()=>{try{sites=buildWorld();worldBounds=new THREE.Box3().setFromObject(world);await decorateWorld();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);await buildSignatureTraversal();world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);spawnEnemies();spawnCollectibles();await createPlayer();createTube();progress('Prewarming tube and shaders…',82);await tube.prewarm();progress('World 1 Pass 12 signature level ready',100);window.__pass='pass12-v1';window.__world1Ready=true;window.__actionReady=true;window.__rigAnimationLive=true;setTimeout(()=>boot.classList.add('hide'),180);loop()}catch(err){console.error(err);errorEl.textContent=err?.stack||err?.message||String(err);fatal.classList.add('show')}})();"

new_init = """(async()=>{try{
 sites=buildWorld();
 worldBounds=new THREE.Box3().setFromObject(world);
 // Start imported visual dressing immediately, but do not make mobile wait for every GLB.
 const decorationPromise=decorateWorld().catch(err=>console.warn('[Pass12 decoration background load]',err));
 const signaturePromise=buildSignatureTraversal().catch(err=>console.warn('[Pass12 signature visuals background load]',err));
 if(!mobile){
  await decorationPromise;
  await signaturePromise;
 }
 // Signature traversal colliders are authored synchronously before its first await, so mobile can play now.
 world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);heightCache?.clear?.();
 spawnEnemies();spawnCollectibles();await createPlayer();createTube();
 window.__pass='pass12-v1';window.__world1Ready=true;window.__actionReady=true;window.__rigAnimationLive=true;
 if(mobile){
  progress('Ready — finishing world details in the background…',100);
  window.__mobileFastStart=true;
  boot.classList.add('hide');
  loop();
  // Portal is far from spawn, so shader prewarm can safely finish after gameplay begins.
  tube.prewarm().then(()=>{window.__tubePrewarmBackgroundComplete=true}).catch(err=>console.warn('[Pass12 tube prewarm]',err));
  Promise.allSettled([decorationPromise,signaturePromise]).then(()=>{
   world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);heightCache?.clear?.();
   window.__worldVisualsBackgroundComplete=true;
  });
 }else{
  progress('Prewarming tube and shaders…',82);await tube.prewarm();
  progress('World 1 Pass 12 signature level ready',100);setTimeout(()=>boot.classList.add('hide'),180);loop();
 }
}catch(err){console.error(err);errorEl.textContent=err?.stack||err?.message||String(err);fatal.classList.add('show')}})();"""

if old_init in s:
    s = s.replace(old_init, new_init, 1)
elif 'window.__mobileFastStart=true' not in s:
    raise SystemExit('init marker missing')

p.write_text(s)

html = Path('pass12-v1/index.html')
h = html.read_text()
h = h.replace('./app.js?v=12.1', './app.js?v=12.2')
h = h.replace('./app.js?v=12', './app.js?v=12.2')
html.write_text(h)
