import argparse
import math
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'artifacts' / 'pass17c3-proof'
PROOF.mkdir(parents=True, exist_ok=True)
ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'


def browser(width, height, mobile=False):
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
    d.set_page_load_timeout(30)
    d.set_script_timeout(15)
    return d


def logs(d):
    try:
        return d.get_log('browser')
    except Exception:
        return []


def wait_js(d, js, timeout, label, interval=.18):
    end = time.time() + timeout
    while time.time() < end:
        try:
            if d.execute_script(js):
                return True
        except Exception:
            pass
        time.sleep(interval)
    raise RuntimeError(f'timeout waiting for {label}; logs={logs(d)!r}')


def no_fatal(d, label):
    if d.execute_script("return document.getElementById('fatal')?.classList.contains('show')===true"):
        err = d.execute_script("return document.getElementById('error')?.textContent||''")
        raise RuntimeError(f'{label} fatal screen: {err}; logs={logs(d)!r}')


def shot(d, name):
    p = PROOF / name
    if not d.save_screenshot(str(p)):
        raise RuntimeError(f'failed screenshot {p}')


def wait_streams(d, label):
    end = time.time() + 45
    last = None
    while time.time() < end:
        no_fatal(d, label)
        last = d.execute_script("""
          return {
            enemyErr:document.documentElement.dataset.enemyStreamError||'',
            decorErr:document.documentElement.dataset.decorStreamError||'',
            enemies:Number(document.documentElement.dataset.enemies||0),
            decor:document.documentElement.dataset.decor==='1',
            decorFlag:window.__pass17DecorReady===true,
            landmarks:window.__pass17ConceptLandmarksReady===true,
            meadow:window.__pass17PortalMeadowDressed===true,
            terrain:window.__pass17ContinuousTerrain===true,
            hero:document.documentElement.dataset.conceptHero==='1'
          }
        """)
        if last['enemyErr'] or last['decorErr']:
            raise RuntimeError(f'{label} stream failure: {last}; logs={logs(d)!r}')
        if last['enemies'] >= 5 and all(last[k] for k in ('decor','decorFlag','landmarks','meadow','terrain','hero')):
            return last
        time.sleep(.30)
    raise RuntimeError(f'{label} streaming checkpoint timed out: {last}; logs={logs(d)!r}')


def camera_gate(d, label):
    startup = d.execute_script('return window.__pass17CTest.startup()')
    if startup['zoom'] != [12.8, 16.2, 20.0]:
        raise RuntimeError(f'{label} zoom contract changed: {startup}')
    if startup['touch'] is not True:
        raise RuntimeError(f'{label} touch camera contract missing: {startup}')

    d.execute_script('window.__pass17CTest.moveTo(-48,52,0)')
    time.sleep(.35)
    d.find_element(By.ID, 'cameraCenter').click()
    time.sleep(.10)
    centered = d.execute_script('return window.__pass17CTest.cameraInfo()')
    yaw_error = abs(math.atan2(math.sin(centered['yaw']-math.pi), math.cos(centered['yaw']-math.pi)))
    if yaw_error > .20 or abs(centered['pitch']-.18) > .06:
        raise RuntimeError(f'{label} CENTER camera failed: {centered}, yaw_error={yaw_error}')

    seen = []
    for _ in range(3):
        info = d.execute_script('return window.__pass17CTest.cameraInfo()')
        seen.append((info['index'], round(info['distance'], 2)))
        d.find_element(By.ID, 'zoom').click()
        time.sleep(.12)
    if len(set(x[0] for x in seen)) != 3:
        raise RuntimeError(f'{label} did not expose all 3 zoom modes: {seen}')
    if sorted(round(x[1], 1) for x in seen) != [12.8, 16.2, 20.0]:
        raise RuntimeError(f'{label} zoom distances wrong: {seen}')
    print(label, 'CAMERA PASS', {'center':centered,'zoom_modes':seen}, flush=True)


def landmark_proofs(d, label):
    views = [
        ('meadow', -48, 52, math.pi),
        ('riverworks', 35, -8, 0),
        ('ruin-courtyard', 21, -41, .15),
        ('prism-ridge', 8, -64, 0),
    ]
    for name, x, z, yaw in views:
        pos = d.execute_script('return window.__pass17CTest.moveTo(arguments[0],arguments[1],arguments[2])', x, z, yaw)
        if not pos or not all(k in pos for k in ('x','y','z')):
            raise RuntimeError(f'{label} failed to stage {name}: {pos}')
        d.find_element(By.ID, 'cameraCenter').click()
        time.sleep(.55)
        shot(d, f'{label}-{name}.png')


def run(label, width, height, mobile):
    d = browser(width, height, mobile)
    try:
        started = time.time()
        d.get('http://127.0.0.1:8000/pass17-world1/?hero=gb2&ci=1')
        wait_js(d, "return document.documentElement.dataset.pass17Ready==='1' && window.__pass17CTestReady===true", 35, f'{label} runtime ready')
        no_fatal(d, label)

        route = d.execute_script('return window.__pass17RouteValidation')
        if not route or not route['main']['ok'] or not route['optional']['ok']:
            raise RuntimeError(f'{label} route validation failed: {route}')
        if route['main']['samples'] < 250 or route['optional']['samples'] < 300:
            raise RuntimeError(f'{label} route sample coverage unexpectedly low: {route}')

        streams = wait_streams(d, label)
        print(label, 'STREAM PASS', streams, flush=True)
        camera_gate(d, label)
        landmark_proofs(d, label)

        severe = [x for x in logs(d) if x.get('level') == 'SEVERE' and 'favicon' not in x.get('message','').lower()]
        if severe:
            raise RuntimeError(f'{label} severe browser logs: {severe}')

        print(label, 'WORLD/CAMERA PASS', {
            'seconds':round(time.time()-started,2),
            'main_samples':route['main']['samples'],
            'optional_samples':route['optional']['samples'],
            'enemies':streams['enemies'],
            'landmarks':streams['landmarks'],
            'meadow':streams['meadow'],
            'terrain':streams['terrain'],
            'decor':streams['decor']
        }, flush=True)
    finally:
        d.quit()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--target', choices=('desktop','android'), required=True)
    args = ap.parse_args()
    if args.target == 'desktop':
        run('desktop', 1280, 720, False)
    else:
        run('android', 915, 412, True)
    print(f'PASS 17C-3 {args.target.upper()} WORLD / CAMERA / STREAMING GREEN', flush=True)


if __name__ == '__main__':
    main()
