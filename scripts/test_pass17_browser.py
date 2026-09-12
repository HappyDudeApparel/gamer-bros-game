import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

URL='http://127.0.0.1:8000/pass17-world1/?ci=1&hero=gb2&v=17'

def run(label,mobile=False):
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--disable-gpu');o.add_argument('--window-size=1280,720')
    if mobile:o.add_argument('--user-agent=Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36')
    o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
    d=webdriver.Chrome(options=o)
    try:
        start=time.time();d.get(URL)
        end=time.time()+25
        while time.time()<end and not d.execute_script('return window.__pass17Ready===true'):
            time.sleep(.12)
        logs=d.get_log('browser')
        if not d.execute_script('return window.__pass17Ready===true'):
            raise RuntimeError('Pass17 did not become ready: '+repr(logs[-10:]))
        validation=d.execute_script('return window.__pass17RouteValidation')
        if not validation or not validation['main']['ok'] or not validation['optional']['ok']:
            raise RuntimeError('Route validation failed '+repr(validation))
        if d.execute_script('return window.__pass17ConceptMatch') is not True:raise RuntimeError('Concept-match marker absent')
        if d.execute_script('return window.__pass17Terrain')!='continuous-visible':raise RuntimeError('Continuous terrain marker absent')
        if d.execute_script('return window.__characterReady')!='gb2':raise RuntimeError('GB2 concept hero not ready')
        zoom=d.execute_script('return window.__pass17CameraZoomLevels')
        if not zoom or len(zoom)!=3:raise RuntimeError('Three camera zoom levels missing')
        if d.execute_script('return window.__tubeComponent')!='crystal-library-v2-tube':raise RuntimeError('Canonical tube missing')
        end=time.time()+10
        while time.time()<end and int(d.execute_script("return +(document.documentElement.dataset.enemies||0)"))<5:time.sleep(.1)
        kinds=d.execute_script('return window.__pass17EnemyKinds||[]')
        if sorted(kinds)!=['flyer','patrol','spiker']:raise RuntimeError('Enemy families missing '+repr(kinds))
        print(label,'READY',round(time.time()-start,2),'sec','main',validation['main']['samples'],'optional',validation['optional']['samples'],'enemyKinds',kinds,'zoom',zoom)
    finally:d.quit()

run('desktop')
run('android',True)
