import argparse, json, time
from pathlib import Path
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'artifacts' / 'pass18-1-skeleton'
PROOF.mkdir(parents=True, exist_ok=True)
ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'


def browser(target):
    mobile = target == 'android'
    w, h = ((915, 412) if mobile else (1280, 720))
    o = Options()
    o.page_load_strategy = 'eager'
    o.add_argument('--headless=new')
    o.add_argument('--no-sandbox')
    o.add_argument('--disable-dev-shm-usage')
    o.add_argument('--enable-unsafe-swiftshader')
    o.add_argument('--hide-scrollbars')
    o.add_argument(f'--window-size={w},{h}')
    o.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    if mobile:
        o.add_experimental_option('mobileEmulation', {
            'deviceMetrics': {'width': w, 'height': h, 'pixelRatio': 2.75},
            'userAgent': ANDROID_UA,
        })
    d = webdriver.Chrome(options=o)
    if not mobile:
        d.set_window_size(w, h)
    d.set_page_load_timeout(25)
    d.set_script_timeout(20)
    return d


def wait_ready(d, seconds=70):
    end = time.time() + seconds
    while time.time() < end:
        try:
            if d.execute_script("return window.__pass18SkeletonReady===true && document.documentElement.dataset.pass18SkeletonReady==='1'"):
                return
            if d.execute_script("return document.documentElement.dataset.pass18SkeletonFailed==='1'"):
                raise RuntimeError('runtime failed: ' + str(d.execute_script('return window.__pass18SkeletonError')))
        except RuntimeError:
            raise
        except Exception:
            pass
        time.sleep(.16)
    raise RuntimeError('timeout; error=' + repr(d.execute_script('return window.__pass18SkeletonError||null')) + ' logs=' + repr(d.get_log('browser')))


def assert_structure(m):
    ids = ''.join(x['id'] for x in m['sections'])
    if ids != 'ABCDEF':
        raise RuntimeError(f'A→F section order wrong: {ids}')
    if m['version'] != '18-1.0' or m['worldLanguage'] != '18-0B.2':
        raise RuntimeError(f'version contract failed: {m}')
    if m['terrainPlacements'] < 30 or m['structurePlacements'] < 10:
        raise RuntimeError(f'structural placement floor failed: {m}')
    if m['riverSegments'] < 10 or m['routeCount'] != 6:
        raise RuntimeError(f'river/route structure failed: {m}')
    if m['visibleAssetColliderCount'] != m['terrainPlacements'] + m['structurePlacements']:
        raise RuntimeError(f'visible collider contract failed: {m}')
    if m['registry']['failures']:
        raise RuntimeError(f'asset failures: {m["registry"]["failures"]}')
    if m['registry']['uniqueSources'] < 12:
        raise RuntimeError(f'asset vocabulary unexpectedly small: {m["registry"]}')
    main = m['routes']['main']
    if not (75 <= main['length'] <= 120) or main['maxSegment'] > 8.5 or not main['gradePass']:
        raise RuntimeError(f'main route structural contract failed: {main}')
    for route_id, route in m['routes'].items():
        if not route['gradePass']:
            raise RuntimeError(f'{route_id} grade failed: {route}')
        if route_id != 'main':
            if route['startReconnect'] > route['reconnectTolerance'] or route['endReconnect'] > route['reconnectTolerance']:
                raise RuntimeError(f'{route_id} reconnect failed: {route}')
    if m['localCollisionCandidates'] <= 0 or m['localCollisionCandidates'] >= m['spatial']['totalColliders']:
        raise RuntimeError(f'local collider subset failed: {m["localCollisionCandidates"]}/{m["spatial"]["totalColliders"]}')
    if m['render']['calls'] <= 0 or m['render']['calls'] > 260:
        raise RuntimeError(f'render-call smoke failed: {m["render"]}')
    if m['render']['triangles'] <= 0 or m['render']['triangles'] > 450000:
        raise RuntimeError(f'triangle smoke failed: {m["render"]}')


def run(target):
    d = browser(target)
    try:
        try:
            d.get('http://127.0.0.1:8000/pass18-skeleton/?debug=1&view=overview')
        except TimeoutException:
            pass
        wait_ready(d)
        time.sleep(1.0)
        overview = d.execute_script('return window.__pass18Skeleton.getMetrics()')
        assert_structure(overview)
        d.save_screenshot(str(PROOF / f'{target}-overview.png'))

        d.execute_script("window.__pass18Skeleton.setView('spawn')")
        time.sleep(.45)
        spawn = d.execute_script('return window.__pass18Skeleton.getMetrics()')
        ridge = spawn['sightlines']['spawnToRidge']
        if not ridge['withinFogBudget'] or not ridge['inCurrentFrustum']:
            raise RuntimeError(f'Portal Meadow → Prism Ridge sightline failed: {ridge}')
        d.save_screenshot(str(PROOF / f'{target}-spawn-to-ridge.png'))

        d.execute_script("window.__pass18Skeleton.setView('ridge')")
        time.sleep(.35)
        ridge_view = d.execute_script('return window.__pass18Skeleton.getMetrics()')
        lookback = ridge_view['sightlines']['ridgeLookback']
        if not lookback['withinFogBudget'] or not lookback['inCurrentFrustum']:
            raise RuntimeError(f'Prism Ridge lookback sightline failed: {lookback}')

        severe = [x for x in d.get_log('browser') if x.get('level') == 'SEVERE' and 'favicon' not in x.get('message', '').lower()]
        if severe:
            raise RuntimeError(f'severe browser logs: {severe}')

        payload = {'overview': overview, 'spawn': spawn, 'ridge': ridge_view}
        (PROOF / f'{target}-metrics.json').write_text(json.dumps(payload, indent=2), encoding='utf-8')
        print(target, 'PASS18-1 STRUCTURE GREEN', json.dumps({
            'sections': ''.join(x['id'] for x in overview['sections']),
            'terrain': overview['terrainPlacements'],
            'landmarks': overview['structurePlacements'],
            'riverSegments': overview['riverSegments'],
            'mainLength': round(overview['routes']['main']['length'], 1),
            'mainGrade': round(overview['routes']['main']['maxGrade'], 3),
            'sources': overview['registry']['uniqueSources'],
            'calls': overview['render']['calls'],
            'tris': overview['render']['triangles'],
            'spawnRidgeNdc': ridge['projected'],
        }), flush=True)
    finally:
        d.quit()


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--target', choices=('desktop', 'android'), required=True)
    run(p.parse_args().target)
