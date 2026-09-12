import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def browser(mobile=False):
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--disable-gpu');o.add_argument('--window-size=1280,720');o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
    if mobile:o.add_argument('--user-agent=Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36')
    return webdriver.Chrome(options=o)

def run(label,mobile=False):
    d=browser(mobile)
    try:
        started=time.time();d.get('http://127.0.0.1:8000/pass17-world1/?hero=gb2&ci=1')
        end=time.time()+45
        while time.time()<end and not d.execute_script("return document.documentElement.dataset.pass17Ready==='1'"):
            if d.execute_script("return document.getElementById('fatal')?.classList.contains('show')"):
                raise RuntimeError('fatal '+str(d.execute_script("return document.getElementById('error')?.textContent"))+' '+repr(d.get_log('browser')))
            time.sleep(.2)
        if not d.execute_script("return document.documentElement.dataset.pass17Ready==='1'"):raise RuntimeError('not playable '+repr(d.get_log('browser')))
        val=d.execute_script('return window.__pass17RouteValidation')
        if not val or not val['main']['ok'] or not val['optional']['ok']:raise RuntimeError('route regression '+repr(val))
        end=time.time()+120
        while time.time()<end:
            if d.execute_script("return document.documentElement.dataset.enemyStreamError||document.documentElement.dataset.decorStreamError||''"):
                raise RuntimeError('stream failure '+repr(d.get_log('browser')))
            landmarks=d.execute_script("return window.__pass17ConceptLandmarksReady===true")
            meadow=d.execute_script("return window.__pass17PortalMeadowDressed===true")
            enemies=int(d.execute_script("return document.documentElement.dataset.enemies||'0'"))
            decor=d.execute_script("return document.documentElement.dataset.decor==='1'")
            if landmarks and meadow and enemies>=5 and decor:break
            time.sleep(.35)
        if not landmarks:raise RuntimeError('concept landmarks did not load '+repr(d.get_log('browser')))
        if not meadow:raise RuntimeError('Portal Meadow concept dressing did not load '+repr(d.get_log('browser')))
        scene_checks=d.execute_script("return {landmarks:window.__pass17ConceptLandmarksReady,meadow:window.__pass17PortalMeadowDressed,terrain:window.__pass17ContinuousTerrain,decor:window.__pass17DecorReady,conceptHero:document.documentElement.dataset.conceptHero==='1'}")
        if not all(scene_checks.values()):raise RuntimeError('missing scene flags '+repr(scene_checks))
        print(label,'PASS17B READY',round(time.time()-started,2),'main',val['main']['samples'],'optional',val['optional']['samples'],'enemies',enemies,'flags',scene_checks)
    finally:d.quit()

run('desktop');run('android',True)
