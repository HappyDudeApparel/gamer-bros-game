import argparse, math, time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

ROOT=Path(__file__).resolve().parents[1]
PROOF=ROOT/'artifacts'/'pass17c3-camera-proof';PROOF.mkdir(parents=True,exist_ok=True)
ANDROID_UA='Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'

def browser(w,h,mobile):
 o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--disable-gpu');o.add_argument(f'--window-size={w},{h}');o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
 if mobile:o.add_argument(f'--user-agent={ANDROID_UA}')
 d=webdriver.Chrome(options=o);d.set_window_size(w,h);d.set_page_load_timeout(30);d.set_script_timeout(15);return d

def wait(d,js,seconds,label):
 end=time.time()+seconds
 while time.time()<end:
  try:
   if d.execute_script(js):return
  except Exception:pass
  time.sleep(.15)
 raise RuntimeError('timeout '+label)

def run(target):
 mobile=target=='android';w,h=((915,412) if mobile else (1280,720));d=browser(w,h,mobile)
 try:
  d.get('http://127.0.0.1:8000/pass17-world1/?hero=gb2&ci=1&c3visual=1')
  wait(d,"return document.documentElement.dataset.pass17Ready==='1'&&window.__pass17CTestReady===true",35,target+' ready')
  if d.execute_script("return document.getElementById('fatal')?.classList.contains('show')===true"):raise RuntimeError(target+' fatal')
  route=d.execute_script('return window.__pass17RouteValidation')
  if not route or not route['main']['ok'] or not route['optional']['ok']:raise RuntimeError(f'{target} routes {route}')
  startup=d.execute_script('return window.__pass17CTest.startup()')
  if startup['zoom']!=[12.8,16.2,20.0] or startup['touch'] is not True:raise RuntimeError(f'{target} camera contract {startup}')
  d.execute_script('window.__pass17CTest.moveTo(-48,52,0)');d.find_element(By.ID,'cameraCenter').click();time.sleep(.15)
  center=d.execute_script('return window.__pass17CTest.cameraInfo()');err=abs(math.atan2(math.sin(center['yaw']-math.pi),math.cos(center['yaw']-math.pi)))
  if err>.2 or abs(center['pitch']-.18)>.06:raise RuntimeError(f'{target} center failed {center}')
  modes=[]
  for _ in range(3):
   q=d.execute_script('return window.__pass17CTest.cameraInfo()');modes.append((q['index'],round(q['distance'],2)));d.find_element(By.ID,'zoom').click();time.sleep(.1)
  if len(set(x[0] for x in modes))!=3 or sorted(round(x[1],1) for x in modes)!=[12.8,16.2,20.0]:raise RuntimeError(f'{target} zoom failed {modes}')
  # Keep proof light: production landmark/decor readiness is separately certified by the streaming subcheck.
  d.execute_script('window.__pass17CTest.moveTo(-48,52,3.141592653589793)');d.find_element(By.ID,'cameraCenter').click();time.sleep(.35);d.save_screenshot(str(PROOF/f'{target}-meadow-camera.png'))
  d.execute_script('window.__pass17CTest.moveTo(8,-64,0)');d.find_element(By.ID,'cameraCenter').click();time.sleep(.35);d.save_screenshot(str(PROOF/f'{target}-ridge-camera.png'))
  severe=[x for x in d.get_log('browser') if x.get('level')=='SEVERE' and 'favicon' not in x.get('message','').lower()]
  if severe:raise RuntimeError(f'{target} severe logs {severe}')
  print(target,'CAMERA PROOF GREEN',{'main':route['main']['samples'],'optional':route['optional']['samples'],'center':center,'modes':modes},flush=True)
 finally:d.quit()

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--target',choices=('desktop','android'),required=True);run(p.parse_args().target)
