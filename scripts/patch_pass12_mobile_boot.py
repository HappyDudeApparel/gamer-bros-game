from pathlib import Path

p = Path('pass12-v1/app.js')
s = p.read_text()

s = s.replace(
    "const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});",
    "const renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,alpha:false,powerPreference:'high-performance'});",
    1,
)

old_loader = "async function loadTemplate(url){if(assetCache.has(url))return assetCache.get(url);const pr=assetLoader.loadAsync(url).then(g=>g.scene);assetCache.set(url,pr);return pr}"
new_loader = """let mobileAssetActive=0;const mobileAssetQueue=[];
function pumpMobileAssets(){while(mobileAssetActive<2&&mobileAssetQueue.length){const job=mobileAssetQueue.shift();mobileAssetActive++;assetLoader.loadAsync(job.url).then(g=>job.resolve(g.scene),job.reject).finally(()=>{mobileAssetActive--;setTimeout(pumpMobileAssets,0)})}}
function queuedMobileAsset(url){return new Promise((resolve,reject)=>{mobileAssetQueue.push({url,resolve,reject});pumpMobileAssets()})}
async function loadTemplate(url){if(assetCache.has(url))return assetCache.get(url);const pr=(mobile?queuedMobileAsset(url):assetLoader.loadAsync(url).then(g=>g.scene));assetCache.set(url,pr);return pr}"""
if old_loader in s:
    s = s.replace(old_loader, new_loader, 1)
elif 'mobileAssetQueue' not in s:
    raise SystemExit('asset loader marker missing')

old_boot = """(async()=>{try{
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

new_boot = """(async()=>{try{
 sites=buildWorld();worldBounds=new THREE.Box3().setFromObject(world);
 let decorationPromise=null,signaturePromise=null;
 if(!mobile){
  decorationPromise=decorateWorld().catch(err=>console.warn('[Pass12 decoration load]',err));
  signaturePromise=buildSignatureTraversal().catch(err=>console.warn('[Pass12 signature load]',err));
  await decorationPromise;await signaturePromise;
  world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);heightCache?.clear?.();
 }
 spawnEnemies();spawnCollectibles();await createPlayer();createTube();
 window.__pass='pass12-v1';window.__world1Ready=true;window.__actionReady=true;window.__rigAnimationLive=true;
 if(mobile){
  progress('READY',100);window.__mobileFastStartV2=true;boot.classList.add('hide');loop();
  const later=(fn,delay)=>setTimeout(()=>{const ric=window.requestIdleCallback||((cb)=>setTimeout(cb,250));ric(fn,{timeout:1800})},delay);
  later(()=>{
   signaturePromise=buildSignatureTraversal().catch(err=>console.warn('[Pass12 signature background load]',err));
   signaturePromise.finally(()=>{world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);heightCache?.clear?.();window.__signatureBackgroundComplete=true});
  },1800);
  later(()=>{
   decorationPromise=decorateWorld().catch(err=>console.warn('[Pass12 decoration background load]',err));
   decorationPromise.finally(()=>{world.updateMatrixWorld(true);worldBounds=new THREE.Box3().setFromObject(world);heightCache?.clear?.();window.__decorationBackgroundComplete=true});
  },4200);
  later(()=>tube.prewarm().then(()=>{window.__tubePrewarmBackgroundComplete=true}).catch(err=>console.warn('[Pass12 tube prewarm]',err)),6500);
 }else{
  progress('Prewarming tube and shaders…',82);await tube.prewarm();progress('World 1 Pass 12 signature level ready',100);setTimeout(()=>boot.classList.add('hide'),180);loop();
 }
}catch(err){console.error(err);boot.classList.add('hide');errorEl.textContent=err?.stack||err?.message||String(err);fatal.classList.add('show')}})();"""

if old_boot in s:
    s = s.replace(old_boot, new_boot, 1)
elif 'window.__mobileFastStartV2=true' not in s:
    raise SystemExit('mobile boot v1 marker missing')

p.write_text(s)

html = Path('pass12-v1/index.html')
h = html.read_text()
for old in ['./app.js?v=12.2','./app.js?v=12.1','./app.js?v=12']:
    h = h.replace(old, './app.js?v=12.3')
html.write_text(h)
