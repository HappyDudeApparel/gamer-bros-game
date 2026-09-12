import os,time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

OUT=os.environ.get('PASS17_HERO_SHOTS','/tmp/pass17-hero-shots')
os.makedirs(OUT,exist_ok=True)


def browser(mobile=False):
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--disable-gpu');o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
    if mobile:
        o.add_argument('--window-size=412,915')
        o.add_argument('--user-agent=Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36')
    else:o.add_argument('--window-size=1440,900')
    return webdriver.Chrome(options=o)


def concept_version_ok(meta):
    return bool(meta and str(meta.get('version','')).startswith('17-hero-'))


def wait_for(d,script,seconds=45):
    end=time.time()+seconds
    while time.time()<end:
        if d.execute_script(script):return True
        time.sleep(.2)
    return False


def title_case(label,mobile=False):
    d=browser(mobile)
    try:
        d.get('http://127.0.0.1:8000/')
        if not wait_for(d,"return window.__pass17TitleReady===true && (window.__pass17ConceptHeroInstances||0)>=2",45):
            raise RuntimeError('title concept heroes not ready '+repr(d.get_log('browser')))
        state=d.execute_script("""return {
          count:window.__pass17ConceptHeroInstances||0,
          meta:window.__pass17ConceptHeroLast||null,
          selected:window.__titleSelectedHero,
          dataset:document.documentElement.dataset.conceptHero,
          cards:[...document.querySelectorAll('.heroWindow')].map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,top:r.top,bottom:r.bottom,left:r.left,right:r.right}}),
          play:(()=>{const r=document.getElementById('playBtn').getBoundingClientRect();return {w:r.width,h:r.height,top:r.top,bottom:r.bottom}})(),
          vw:innerWidth,vh:innerHeight,scrollH:document.documentElement.scrollHeight
        }""")
        if state['dataset']!='1' or state['count']<2 or not concept_version_ok(state['meta']):raise RuntimeError('bad title concept state '+repr(state))
        if len(state['cards'])!=2 or min(c['w'] for c in state['cards'])<120 or min(c['h'] for c in state['cards'])<100:raise RuntimeError('title cards collapsed '+repr(state))
        if mobile and state['play']['bottom']>state['vh']+2:raise RuntimeError('mobile PLAY below viewport '+repr(state))
        path=os.path.join(OUT,f'{label}-title.png');d.save_screenshot(path)
        print(label,'TITLE HERO PASS',state)
    finally:d.quit()


def game_case(label,hero,mobile=False):
    d=browser(mobile)
    try:
        started=time.time();d.get(f'http://127.0.0.1:8000/pass17-world1/?hero={hero}&ci=1')
        end=time.time()+60
        while time.time()<end and not d.execute_script("return document.documentElement.dataset.pass17Ready==='1'"):
            if d.execute_script("return document.getElementById('fatal')?.classList.contains('show')"):
                raise RuntimeError('fatal '+str(d.execute_script("return document.getElementById('error')?.textContent"))+' '+repr(d.get_log('browser')))
            time.sleep(.2)
        if not d.execute_script("return document.documentElement.dataset.pass17Ready==='1'"):raise RuntimeError('game not playable '+repr(d.get_log('browser')))
        state=d.execute_script("return {meta:window.__pass17ConceptHeroLast||null,count:window.__pass17ConceptHeroInstances||0,dataset:document.documentElement.dataset.conceptHero,hero:window.__characterReady,routes:window.__pass17RouteValidation}")
        if state['dataset']!='1' or state['count']<1 or not concept_version_ok(state['meta']):raise RuntimeError('concept hero missing '+repr(state))
        if state['hero']!=hero or state['meta']['heroId']!=hero:raise RuntimeError('wrong hero '+repr(state))
        if not state['routes'] or not state['routes']['main']['ok'] or not state['routes']['optional']['ok']:raise RuntimeError('route regression '+repr(state['routes']))
        # Let deferred environment/enemies settle so the proof shot is representative.
        end=time.time()+100
        while time.time()<end:
            if d.execute_script("return document.documentElement.dataset.enemyStreamError||document.documentElement.dataset.decorStreamError||''"):
                raise RuntimeError('stream failure '+repr(d.get_log('browser')))
            ready=d.execute_script("return window.__pass17ConceptLandmarksReady===true && window.__pass17DecorReady===true")
            if ready:break
            time.sleep(.35)
        path=os.path.join(OUT,f'{label}-{hero}-game.png');d.save_screenshot(path)
        print(label,hero,'GAME HERO PASS',round(time.time()-started,2),state['meta'])
    finally:d.quit()


title_case('desktop',False)
title_case('android-portrait',True)
game_case('desktop','gb1',False)
game_case('android','gb2',True)
