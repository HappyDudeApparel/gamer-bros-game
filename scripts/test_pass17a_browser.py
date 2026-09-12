import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def browser(mobile=False):
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--disable-gpu');o.add_argument('--window-size=1280,720');o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
    if mobile:o.add_argument('--user-agent=Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36')
    return webdriver.Chrome(options=o)

def run_title(label,mobile=False):
    d=browser(mobile)
    try:
        d.get('http://127.0.0.1:8000/')
        end=time.time()+15
        while time.time()<end and not d.execute_script('return window.__pass17TitleReady===true'):time.sleep(.1)
        if not d.execute_script('return window.__pass17TitleReady===true'):raise RuntimeError(label+' title not ready '+repr(d.get_log('browser')))
        if d.execute_script('return window.__playableRoster')!=['gb1','gb2']:raise RuntimeError('roster mismatch')
        cards=d.find_elements(By.CSS_SELECTOR,'.heroWindow');
        if len(cards)!=2:raise RuntimeError('need exactly 2 hero windows')
        vis=d.execute_script("return [...document.querySelectorAll('.heroWindow canvas')].map(c=>({w:c.width,h:c.height,rect:c.getBoundingClientRect().toJSON()}))")
        if any(v['w']<30 or v['h']<30 for v in vis):raise RuntimeError('hero previews not rendered '+repr(vis))
        d.find_element(By.CSS_SELECTOR,'.heroWindow[data-id="gb1"]').click();time.sleep(.1)
        href=d.execute_script("return document.getElementById('playBtn').dataset.href")
        if 'pass17-world1' not in href or 'hero=gb1' not in href:raise RuntimeError('GB1 target '+str(href))
        d.find_element(By.CSS_SELECTOR,'.heroWindow[data-id="gb2"]').click();time.sleep(.1)
        href=d.execute_script("return document.getElementById('playBtn').dataset.href")
        if 'hero=gb2' not in href:raise RuntimeError('GB2 target '+str(href))
        print(label,'TITLE READY',vis)
    finally:d.quit()

def run_world(label,mobile=False):
    d=browser(mobile)
    try:
        started=time.time();d.get('http://127.0.0.1:8000/pass17-world1/?hero=gb2&ci=1')
        ready=False;end=time.time()+35
        while time.time()<end:
            ready=d.execute_script("return document.documentElement.dataset.pass17Ready==='1'")
            fatal=d.execute_script("return document.getElementById('fatal')?.classList.contains('show')")
            if fatal:raise RuntimeError((d.execute_script("return document.getElementById('error')?.textContent") or 'fatal')+'\n'+repr(d.get_log('browser')))
            if ready:break
            time.sleep(.2)
        if not ready:raise RuntimeError(label+' world not playable '+repr(d.get_log('browser')))
        if d.execute_script("return document.documentElement.dataset.continuousTerrain")!='1':raise RuntimeError('continuous terrain marker missing')
        val=d.execute_script('return window.__pass17RouteValidation')
        if not val or not val['main']['ok'] or not val['optional']['ok']:raise RuntimeError('route validation '+repr(val))
        enemies=0;decor=False;end=time.time()+90
        while time.time()<end:
            enemies=int(d.execute_script("return document.documentElement.dataset.enemies||'0'"));decor=bool(d.execute_script("return window.__pass17DecorReady===true || document.documentElement.dataset.decor==='1'"))
            err=d.execute_script("return document.documentElement.dataset.enemyStreamError||document.documentElement.dataset.decorStreamError||''")
            if err:raise RuntimeError('stream '+str(err))
            if enemies>=5 and decor:break
            time.sleep(.35)
        if enemies<5 or not decor:raise RuntimeError(f'background stream incomplete enemies={enemies} decor={decor}')
        print(label,'WORLD PLAYABLE',round(time.time()-started,2),'main',val['main']['samples'],'optional',val['optional']['samples'],'enemies',enemies)
    finally:d.quit()

run_title('desktop',False);run_title('android',True);run_world('desktop',False);run_world('android',True)
