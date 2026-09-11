from pathlib import Path

app = Path('pass12-v1/app.js')
s = app.read_text()

# Remove the static external GLTFLoader dependency from startup.
s = s.replace("import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';\n", "")

# Mark that the module body actually began executing.
needle = "import {createCrystalLibraryTubeV2} from '../src/crystal-library-tube-v2.js?v=1';\n"
if "window.__pass12ModuleStarted=true;" not in s:
    s = s.replace(needle, needle + "window.__pass12ModuleStarted=true;\n", 1)

old_loader = "const assetLoader=new GLTFLoader();\n"
new_loader = "let assetLoader=null,assetLoaderPromise=null;\nasync function ensureAssetLoader(){if(assetLoader)return assetLoader;if(!assetLoaderPromise)assetLoaderPromise=import('three/addons/loaders/GLTFLoader.js').then(m=>assetLoader=new m.GLTFLoader());return assetLoaderPromise}\n"
if old_loader in s:
    s = s.replace(old_loader, new_loader, 1)
elif "async function ensureAssetLoader()" not in s:
    raise SystemExit('assetLoader marker missing')

old_template = "async function loadTemplate(url){if(assetCache.has(url))return assetCache.get(url);const pr=assetLoader.loadAsync(url).then(g=>g.scene);assetCache.set(url,pr);return pr}"
new_template = "async function loadTemplate(url){if(assetCache.has(url))return assetCache.get(url);const pr=ensureAssetLoader().then(loader=>loader.loadAsync(url)).then(g=>g.scene);assetCache.set(url,pr);return pr}"
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
 if(st)st.textContent='Starting game engine…'; if(bar)bar.style.width='8%';
 function fail(msg){if(window.__world1Ready)return;if(err)err.textContent=msg;if(fatal)fatal.classList.add('show');}
 window.addEventListener('error',e=>{const m=e?.message||e?.target?.src||'Unknown startup error';fail('Startup error: '+m);},true);
 window.addEventListener('unhandledrejection',e=>fail('Startup promise failed: '+String(e.reason?.message||e.reason||'unknown error')));
 setTimeout(()=>{if(!window.__pass12ModuleStarted)fail('Game engine module did not start. Reload once; if this repeats, use the diagnostic shown here.');},6000);
})();
</script>"""
if 'window.__pass12HtmlStarted=true;' not in h:
    h = h.replace('<script type="module" src="./app.js', watchdog + '<script type="module" onerror="document.getElementById(\'error\').textContent=\'Pass 12 app module failed to load\';document.getElementById(\'fatal\').classList.add(\'show\')" src="./app.js', 1)

import re
h = re.sub(r'\./app\.js\?v=[^\"]+', './app.js?v=12.4', h)
html.write_text(h)
