import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'artifacts' / 'pass17c-proof'
PROOF.mkdir(parents=True, exist_ok=True)

ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'


def browser(width=1280, height=720, mobile=False):
    o = Options()
    o.add_argument('--headless=new')
    o.add_argument('--no-sandbox')
    o.add_argument('--disable-dev-shm-usage')
    o.add_argument('--disable-gpu')
    o.add_argument(f'--window-size={width},{height}')
    o.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    if mobile:
        o.add_argument(f'--user-agent={ANDROID_UA}')
    d = webdriver.Chrome(options=o)
    d.set_window_size(width, height)
    d.set_script_timeout(40)
    d.set_page_load_timeout(35)
    return d


def logs(d):
    try:
        return d.get_log('browser')
    except Exception:
        return []


def wait_js(d, script, timeout, label, interval=.20):
    end = time.time() + timeout
    while time.time() < end:
        try:
            if d.execute_script(script):
                return True
        except Exception:
            pass
        time.sleep(interval)
    raise RuntimeError(f'timeout waiting for {label}: {logs(d)!r}')


def assert_no_fatal(d, label):
    fatal = d.execute_script("return document.getElementById('fatal')?.classList.contains('show')===true")
    if fatal:
        err = d.execute_script("return document.getElementById('error')?.textContent||''")
        raise RuntimeError(f'{label} fatal: {err} {logs(d)!r}')


def shot(d, name):
    path = PROOF / name
    if not d.save_screenshot(str(path)):
        raise RuntimeError(f'failed screenshot {path}')
    return path


def rects_overlap(a, b, pad=2):
    return not (
        a['right'] <= b['left'] + pad or b['right'] <= a['left'] + pad or
        a['bottom'] <= b['top'] + pad or b['bottom'] <= a['top'] + pad
    )


def title_layout(label, width, height, mobile):
    d = browser(width, height, mobile)
    try:
        d.get('http://127.0.0.1:8000/')
        wait_js(d, "return document.querySelectorAll('.heroWindow').length===2 && !!document.getElementById('playBtn')", 25, f'{label} title DOM')
        time.sleep(1.2)
        layout = d.execute_script("""
          const r=e=>{const x=e.getBoundingClientRect();return {left:x.left,top:x.top,right:x.right,bottom:x.bottom,width:x.width,height:x.height}};
          return {w:innerWidth,h:innerHeight,logo:r(document.querySelector('.logo17')),panel:r(document.querySelector('.selectPanel')),play:r(document.getElementById('playBtn')),cards:[...document.querySelectorAll('.heroWindow')].map(r),selected:document.querySelectorAll('.heroWindow.selected').length};
        """)
        for key in ('logo', 'panel', 'play'):
            if layout[key]['width'] < 40 or layout[key]['height'] < 20:
                raise RuntimeError(f'{label} collapsed {key}: {layout}')
        if len(layout['cards']) != 2 or any(r['width'] < 80 or r['height'] < 70 for r in layout['cards']):
            raise RuntimeError(f'{label} hero cards invalid: {layout}')
        if rects_overlap(layout['cards'][0], layout['cards'][1]):
            raise RuntimeError(f'{label} hero cards overlap: {layout}')
        if rects_overlap(layout['logo'], layout['panel']):
            raise RuntimeError(f'{label} logo/panel overlap: {layout}')
        if layout['play']['bottom'] > layout['h'] + 2 or layout['play']['top'] < -2:
            raise RuntimeError(f'{label} play button outside viewport: {layout}')
        if layout['selected'] != 1:
            raise RuntimeError(f'{label} expected one selected hero: {layout}')
        shot(d, f'{label}-title.png')
        print(label, 'TITLE PASS', layout)
    finally:
        d.quit()


def wait_streams(d, label):
    end = time.time() + 70
    state = None
    while time.time() < end:
        assert_no_fatal(d, label)
        state = d.execute_script("""
          return {
            enemyErr:document.documentElement.dataset.enemyStreamError||'',
            decorErr:document.documentElement.dataset.decorStreamError||'',
            enemies:Number(document.documentElement.dataset.enemies||0),
            decor:document.documentElement.dataset.decor==='1',
            landmarks:window.__pass17ConceptLandmarksReady===true,
            meadow:window.__pass17PortalMeadowDressed===true,
            terrain:window.__pass17ContinuousTerrain===true,
            hero:document.documentElement.dataset.conceptHero==='1'
          }
        """)
        if state['enemyErr'] or state['decorErr']:
            raise RuntimeError(f'{label} stream failure {state} {logs(d)!r}')
        if state['enemies'] >= 5 and state['decor'] and state['landmarks'] and state['meadow'] and state['terrain'] and state['hero']:
            return state
        time.sleep(.35)
    raise RuntimeError(f'{label} streams incomplete: {state} {logs(d)!r}')


def warm_portal(d, label):
    warm = d.execute_async_script("""
      const done=arguments[0];
      window.__pass17CTest.portalWarm().then(v=>done(v)).catch(e=>done({error:String(e)}));
    """)
    if warm.get('error') or not warm.get('prewarmed') or warm.get('state') != 'idle':
        raise RuntimeError(f'{label} production-order portal prewarm failed: {warm} {logs(d)!r}')
    print(label, 'PORTAL PREWARM PASS')


def power_gate(d, label):
    initial = d.execute_script('return window.__pass17CTest.stageCombat(3.8)')
    if not initial or not initial.get('enemy'):
        raise RuntimeError(f'{label} no enemy available for Prism Breaker test')
    target_id = initial['enemy']['id']
    target_hp = initial['enemy']['hp']
    if target_hp != 2:
        raise RuntimeError(f'{label} unexpected starting HP {initial}')

    for n in (1, 2):
        if n == 2:
            time.sleep(.70)
            staged = d.execute_script('return window.__pass17CTest.stageCombat(3.8)')
            if not staged or staged['enemy']['id'] != target_id:
                raise RuntimeError(f'{label} target disappeared before second power shot: {staged}')
        if not d.execute_script('return window.__pass17CTest.powerStart()'):
            raise RuntimeError(f'{label} Prism Breaker refused shot {n}')
        time.sleep(1.10)
        if not d.execute_script('return window.__pass17CTest.powerRelease()'):
            raise RuntimeError(f'{label} Prism Breaker release failed shot {n}')

        end = time.time() + 3.0
        observed = None
        while time.time() < end:
            observed = d.execute_script('return window.__pass17CTest.firstEnemy()')
            if n == 1 and observed and observed['id'] == target_id and observed['hp'] <= 1:
                break
            if n == 2 and (not observed or observed['id'] != target_id):
                break
            time.sleep(.08)
        else:
            raise RuntimeError(f'{label} Prism Breaker shot {n} did not damage target; enemy={observed} logs={logs(d)!r}')

    reward = d.execute_script("return {coins:Number(document.getElementById('coins').textContent||0),gems:Number(document.getElementById('gems').textContent||0)}")
    if reward['coins'] < 2 or reward['gems'] < 1:
        raise RuntimeError(f'{label} enemy defeat reward missing: {reward}')
    print(label, 'POWER PASS target', target_id, 'reward', reward)


def camera_gate(d, label):
    startup = d.execute_script('return window.__pass17CTest.startup()')
    if startup['zoom'] != [12.8, 16.2, 20.0] or not startup['touch']:
        raise RuntimeError(f'{label} camera contract missing: {startup}')
    if startup['ms'] <= 0 or startup['ms'] > 30000:
        raise RuntimeError(f'{label} startup timing outside gate: {startup}')
    before = d.execute_script('return window.__pass17CTest.cameraInfo()')
    d.find_element(By.ID, 'zoom').click()
    time.sleep(.15)
    after = d.execute_script('return window.__pass17CTest.cameraInfo()')
    if after['index'] != (before['index'] + 1) % 3:
        raise RuntimeError(f'{label} zoom control did not advance: before={before} after={after}')
    d.find_element(By.ID, 'cameraCenter').click()
    if not d.find_element(By.ID, 'cameraCenter').is_displayed():
        raise RuntimeError(f'{label} CENTER control not visible')
    print(label, 'CAMERA PASS startup', startup['ms'], 'ms', 'zoom', before['index'], '->', after['index'])


def portal_gate(d, label):
    health_before = d.execute_script("return (document.getElementById('health').textContent.match(/♥/g)||[]).length")
    frames_before = d.execute_script('return window.__pass17FrameCount||0')
    prime = d.execute_async_script("""
      const done=arguments[0];
      window.__pass17CTest.portalPrime().then(v=>done(v)).catch(e=>done({error:String(e)}));
    """)
    if prime.get('error') or not prime.get('prewarmed'):
        raise RuntimeError(f'{label} portal prime failed: {prime} {logs(d)!r}')
    wait_js(d, "return window.__pass17PortalState && window.__pass17PortalState!=='idle'", 5, f'{label} portal trigger')
    time.sleep(2.2)
    shot(d, f'{label}-portal-active.png')

    end = time.time() + 20
    last_frames = frames_before
    last_progress = time.time()
    info = None
    while time.time() < end:
        assert_no_fatal(d, label)
        info = d.execute_script('return window.__pass17CTest.portalInfo()')
        if info['frames'] > last_frames:
            last_frames = info['frames']
            last_progress = time.time()
        elif time.time() - last_progress > 2.0:
            raise RuntimeError(f'{label} render loop stalled during portal: {info}')
        if info['watchdog'] == 'timeout':
            raise RuntimeError(f'{label} portal watchdog timed out: {info}')
        if info['complete'] and info['state'] == 'complete':
            break
        time.sleep(.20)
    else:
        raise RuntimeError(f'{label} portal never completed: {info} {logs(d)!r}')

    if not d.execute_script('return window.__tubeTransferComplete===true'):
        raise RuntimeError(f'{label} canonical transfer-complete marker missing')
    health_after = d.execute_script("return (document.getElementById('health').textContent.match(/♥/g)||[]).length")
    if health_after != health_before:
        raise RuntimeError(f'{label} player took damage in portal activation zone: {health_before}->{health_after}')
    if not d.find_element(By.ID, 'retry').is_displayed():
        raise RuntimeError(f'{label} portal completion UI missing')
    shot(d, f'{label}-portal-complete.png')
    print(label, 'PORTAL PASS', info, 'health', health_before)


def game_gate(label, width, height, mobile, hero):
    d = browser(width, height, mobile)
    try:
        started = time.time()
        d.get(f'http://127.0.0.1:8000/pass17-world1/?hero={hero}&ci=1')
        wait_js(d, "return document.documentElement.dataset.pass17Ready==='1' && window.__pass17CTestReady===true && window.__pass17CReady===true", 45, f'{label} playable')
        assert_no_fatal(d, label)
        validation = d.execute_script('return window.__pass17RouteValidation')
        if not validation or not validation['main']['ok'] or not validation['optional']['ok']:
            raise RuntimeError(f'{label} route regression: {validation}')
        if d.execute_script('return window.__characterReady') != hero:
            raise RuntimeError(f'{label} wrong hero ready')

        # Production prewarms the canonical tube before heavy decor streams. Mirror that order
        # so the test measures the same path instead of compiling the fully decorated scene.
        warm_portal(d, label)
        streams = wait_streams(d, label)
        camera_gate(d, label)
        shot(d, f'{label}-{hero}-spawn.png')
        power_gate(d, label)
        portal_gate(d, label)
        print(label, 'PASS17C READY', round(time.time()-started, 2), 'sec', 'main', validation['main']['samples'], 'optional', validation['optional']['samples'], 'streams', streams)
    finally:
        d.quit()


def main():
    title_layout('android-portrait', 412, 915, True)
    title_layout('android-landscape', 915, 412, True)
    game_gate('desktop', 1280, 720, False, 'gb1')
    game_gate('android', 915, 412, True, 'gb2')
    print('PASS 17C END-TO-END GATE GREEN')
    print('proof:', PROOF)


if __name__ == '__main__':
    main()
