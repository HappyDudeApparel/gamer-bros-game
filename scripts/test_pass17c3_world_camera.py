import argparse, math, time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

ROOT=Path(__file__).resolve().parents[1]
PROOF=ROOT/'artifacts'/'pass17c3-proof';PROOF.mkdir(parents=True,exist_ok=True)
ANDROID_UA='Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'

def browser(w,h,mobile=False):
 o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--disable-gpu');o.add_argument(f'--window-size={w},{h}');o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
 if mobile:o.add_argument(f'--user-agent={ANDROID_UA}')
 d=webdriver.Chrome(options=o);d.set_window_size(w,h);d.set_page_load_timeout(30);d.set_script_timeout(120);return d

def logs(d):
 try:return d.get_log('browser')
 except Exception:return []

def wait_js(d,js,timeout,label,interval=.2):
 end=time.time()+timeout
 while time.time()<end:
  try:
   if d.execute_script(js):return
  except Exception:pass
  time.sleep(interval)
 raise RuntimeError(f'timeout {label}; logs={logs(d)!r}')

def no_fatal(d,label):
 if d.execute_script("return document.getElementById('fatal')?.classList.contains('show')===true"):
  raise RuntimeError(f"{label} fatal: "+d.execute_script("return document.getElementById('error')?.textContent||''"))

def route_gate(d,label):
 r=d.execute_script('return window.__pass17RouteValidation')
 if not r or not r['main']['ok'] or not r['optional']['ok'] or r['main']['samples']<250 or r['optional']['samples']<300:raise RuntimeError(f'{label} route failed: {r}')
 return r

def stream_state(d):
 return d.execute_script("""return {enemyErr:document.documentElement.dataset.enemyStreamError||'',decorErr:document.documentElement.dataset.decorStreamError||'',enemies:Number(document.documentElement.dataset.enemies||0),decor:document.documentElement.dataset.decor==='1',decorFlag:window.__pass17DecorReady===true,landmarks:window.__pass17ConceptLandmarksReady===true,meadow:window.__pass17PortalMeadowDressed===true,terrain:window.__pass17ContinuousTerrain===true,hero:document.documentElement.dataset.conceptHero==='1'}""")

def stream_run(label,w,h,mobile):
 d=browser(w,h,mobile)
 try:
  t=time.time();d.get('http://127.0.0.1:8000/pass17-world1/?hero=gb2&ci=1');wait_js(d,"return document.documentElement.dataset.pass17Ready==='1'&&window.__pass17CTestReady===true",35,label+' ready');no_fatal(d,label);r=route_gate(d,label)
  # Kick if the delayed production call has not started yet. If it already owns the idempotent decorator, just observe it.
  d.execute_script("window.__pass17CTest.ensureDecor().catch(e=>console.error('[C3 decor kick]',e));return true")
  end=time.time()+120;state=None
  while time.time()<end:
   no_fatal(d,label);state=stream_state(d)
   if state['enemyErr'] or state['decorErr']:raise RuntimeError(f'{label} stream error: {state}')
   if state['enemies']>=5 and all(state[k] for k in ('decor','decorFlag','landmarks','meadow','terrain','hero')):break
   time.sleep(.4)
  else:raise RuntimeError(f'{label} stream timeout: {state}; logs={logs(d)!r}')
  print(label,'STREAM GREEN',{'seconds':round(time.time()-t,2),'main':r['main']['samples'],'optional':r['optional']['samples'],**state},flush=True)
 finally:d.quit()

def camera_visual_run(label,w,h,mobile):
 d=browser(w,h,mobile)
 try:
  t=time.time();d.get('http://127.0.0.1:8000/pass17-world1/?hero=gb2&ci=1&c3visual=1');wait_js(d,"return document.documentElement.dataset.pass17Ready==='1'&&window.__pass17CTestReady===true",35,label+' ready');no_fatal(d,label);r=route_gate(d,label)
  result=d.execute_async_script("const done=arguments[0];window.__pass17CTest.checkpointDecor().then(v=>done(v)).catch(e=>done({error:String(e)}));")
  if result.get('error') or not result.get('landmarks') or not result.get('meadow'):raise RuntimeError(f'{label} landmark decor failed: {result}')
  info=d.execute_script('return window.__pass17CTest.startup()')
  if info['zoom']!=[12.8,16.2,20.0] or info['touch'] is not True:raise RuntimeError(f'{label} camera contract: {info}')
  d.execute_script('window.__pass17CTest.moveTo(-48,52,0)');d.find_element(By.ID,'cameraCenter').click();time.sleep(.12);c=d.execute_script('return window.__pass17CTest.cameraInfo()')
  err=abs(math.atan2(math.sin(c['yaw']-math.pi),math.cos(c['yaw']-math.pi)))
  if err>.2 or abs(c['pitch']-.18)>.06:raise RuntimeError(f'{label} center failed: {c}')
  modes=[]
  for _ in range(3):
   q=d.execute_script('return window.__pass17CTest.cameraInfo()');modes.append((q['index'],round(q['distance'],2)));d.find_element(By.ID,'zoom').click();time.sleep(.1)
  if len(set(x[0] for x in modes))!=3 or sorted(round(x[1],1) for x in modes)!=[12.8,16.2,20.0]:raise RuntimeError(f'{label} zoom failed: {modes}')
  for name,x,z,yaw in [('meadow',-48,52,math.pi),('riverworks',35,-8,0),('ruin-courtyard',21,-41,.15),('prism-ridge',8,-64,0)]:
   d.execute_script('window.__pass17CTest.moveTo(arguments[0],arguments[1],arguments[2])',x,z,yaw);d.find_element(By.ID,'cameraCenter').click();time.sleep(.35);d.save_screenshot(str(PROOF/f'{label}-{name}.png'))
  severe=[x for x in logs(d) if x.get('level')=='SEVERE' and 'favicon' not in x.get('message','').lower()]
  if severe:raise RuntimeError(f'{label} severe logs: {severe}')
  print(label,'CAMERA/VISUAL GREEN',{'seconds':round(time.time()-t,2),'main':r['main']['samples'],'optional':r['optional']['samples'],'center':c,'modes':modes},flush=True)
 finally:d.quit()

def main():
 p=argparse.ArgumentParser();p.add_argument('--target',choices=('desktop','android'),required=True);p.add_argument('--mode',choices=('stream','visual'),required=True);a=p.parse_args();mobile=a.target=='android';w,h=((915,412) if mobile else (1280,720));label=f'{a.target}-{a.mode}'
 (stream_run if a.mode=='stream' else camera_visual_run)(label,w,h,mobile);print('PASS 17C-3',label.upper(),'GREEN',flush=True)
if __name__=='__main__':main()
