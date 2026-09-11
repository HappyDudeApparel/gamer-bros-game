from pathlib import Path
import re

app = Path('pass12-v1/app.js')
s = app.read_text()

# Nothing external except same-origin Three.js should be required before Pass 12 starts.
s = s.replace("import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';\n", "")

needle = "import {createCrystalLibraryTubeV2} from '../src/crystal-library-tube-v2.js?v=1';\n"
if "window.__pass12ModuleStarted=true;" not in s:
    if needle not in s:
        raise SystemExit('tube import marker missing')
    s = s.replace(needle, needle + "window.__pass12ModuleStarted=true;\n", 1)

old_loader = "const assetLoader=new GLTFLoader();\n"
new_loader = "let assetLoader=null,assetLoaderPromise=null;\nasync function ensureAssetLoader(){if(assetLoader)return assetLoader;if(!assetLoaderPromise)assetLoaderPromise=import('three/addons/loaders/GLTFLoader.js').then(m=>assetLoader=new m.GLTFLoader());return assetLoaderPromise}\n"
if old_loader in s:
    s = s.replace(old_loader, new_loader, 1)
elif "async function ensureAssetLoader()" not in s:
    raise SystemExit('asset loader declaration marker missing')

old_pump = "function pumpMobileAssets(){while(mobileAssetActive<2&&mobileAssetQueue.length){const job=mobileAssetQueue.shift();mobileAssetActive++;assetLoader.loadAsync(job.url).then(g=>job.resolve(g.scene),job.reject).finally(()=>{mobileAssetActive--;setTimeout(pumpMobileAssets,0)})}}"
new_pump = "function pumpMobileAssets(){while(mobileAssetActive<2&&mobileAssetQueue.length){const job=mobileAssetQueue.shift();mobileAssetActive++;ensureAssetLoader().then(loader=>loader.loadAsync(job.url)).then(g=>job.resolve(g.scene),job.reject).finally(()=>{mobileAssetActive--;setTimeout(pumpMobileAssets,0)})}}"
if old_pump in s:
    s = s.replace(old_pump, new_pump, 1)
elif new_pump not in s:
    raise SystemExit('mobile asset queue marker missing')

old_template = "async function loadTemplate(url){if(assetCache.has(url))return assetCache.get(url);const pr=(mobile?queuedMobileAsset(url):assetLoader.loadAsync(url).then(g=>g.scene));assetCache.set(url,pr);return pr}"
new_template = "async function loadTemplate(url){if(assetCache.has(url))return assetCache.get(url);const pr=(mobile?queuedMobileAsset(url):ensureAssetLoader().then(loader=>loader.loadAsync(url)).then(g=>g.scene));assetCache.set(url,pr);return pr}"
if old_template in s:
    s = s.replace(old_template, new_template, 1)
elif new_template not in s:
    raise SystemExit('loadTemplate marker missing')

app.write_text(s)

html = Path('pass12-v1/index.html')
h = html.read_text()
h = h.replace('"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"', '"three":"../vendor/three/three.module.min.js","three/addons/":"../vendor/three/addons/"')

watchdog = """<script>
window.__pass12HtmlStarted=true;
(function(){
 const st=document.getElementById('status'),bar=document.getElementById('bar'),fatal=document.getElementById('fatal'),err=document.getElementById('error');
 if(st)st.textContent='Starting local game engine…'; if(bar)bar.style.width='8%';
 function fail(msg){if(window.__world1Ready)return;if(err)err.textContent=msg;if(fatal)fatal.classList.add('show');}
 window.addEventListener('error',e=>{const m=e?.message||e?.target?.src||'Unknown startup error';fail('Startup error: '+m);},true);
 window.addEventListener('unhandledrejection',e=>fail('Startup promise failed: '+String(e.reason?.message||e.reason||'unknown error')));
 setTimeout(()=>{if(!window.__pass12ModuleStarted)fail('Game engine module did not start within 6 seconds.');},6000);
})();
</script>"""
if 'window.__pass12HtmlStarted=true;' not in h:
    marker='<script type="module" src="./app.js'
    if marker not in h:
        raise SystemExit('module script marker missing')
    h = h.replace(marker, watchdog + '<script type="module" onerror="document.getElementById(\'error\').textContent=\'Pass 12 app module failed to load\';document.getElementById(\'fatal\').classList.add(\'show\')" src="./app.js', 1)

h = re.sub(r'\./app\.js\?v=[^\"]+', './app.js?v=12.4', h)
html.write_text(h)
