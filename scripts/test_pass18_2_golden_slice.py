import argparse, json, time
from pathlib import Path
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'artifacts' / 'pass18-2-golden-slice'
PROOF.mkdir(parents=True, exist_ok=True)
ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'


def browser(target):
    mobile = target == 'android'
    w, h = ((915, 412) if mobile else (1280, 720))
    o = Options(); o.page_load_strategy = 'eager'
    for arg in ('--headless=new','--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--hide-scrollbars'):
        o.add_argument(arg)
    o.add_argument(f'--window-size={w},{h}')
    o.set_capability('goog:loggingPrefs', {'browser':'ALL'})
    if mobile:
        o.add_experimental_option('mobileEmulation', {'deviceMetrics':{'width':w,'height':h,'pixelRatio':2.75},'userAgent':ANDROID_UA})
    d = webdriver.Chrome(options=o)
    if not mobile: d.set_window_size(w,h)
    d.set_page_load_timeout(25); d.set_script_timeout(20)
    return d


def wait_ready(d, seconds=90):
    end = time.time() + seconds
    while time.time() < end:
        try:
            if d.execute_script("return window.__pass18GoldenSliceReady===true && document.documentElement.dataset.pass18GoldenSliceReady==='1'"):
                return
            if d.execute_script("return document.documentElement.dataset.pass18GoldenSliceFailed==='1'"):
                raise RuntimeError('runtime failed: ' + str(d.execute_script('return window.__pass18GoldenSliceError')))
        except RuntimeError: raise
        except Exception: pass
        time.sleep(.16)
    raise RuntimeError('timeout; error=' + repr(d.execute_script('return window.__pass18GoldenSliceError||null')) + ' logs=' + repr(d.get_log('browser')))


def assert_metrics(m):
    if m['version'] != '18-2.0' or m['worldLanguage'] != '18-0B.2' or m['reviewStatus'] != 'PENDING_USER':
        raise RuntimeError(f'golden slice status contract failed: {m}')
    a=m['acceptance']; roles=m['roles']
    if m['realPlacements'] < a['minRealPlacements']: raise RuntimeError(f'placement density failed {m["realPlacements"]}')
    if roles.get('cliff',0) < a['minCliffs']: raise RuntimeError(f'cliff density failed {roles}')
    if roles.get('vegetation',0) < a['minVegetation']: raise RuntimeError(f'vegetation density failed {roles}')
    if roles.get('fence',0) < a['minFences'] or roles.get('path',0) < a['minPathPieces']: raise RuntimeError(f'path/fence density failed {roles}')
    if m['bridgeAsset'] != a['bridgeAsset']: raise RuntimeError(f'real bridge contract failed {m["bridgeAsset"]}')
    if m['waterfallHousingCount'] < 2 or not m['waterReady'] or not m['waterfallsReady']: raise RuntimeError(f'water contract failed {m}')
    if m['prismAccents'] < 3: raise RuntimeError('Prism Ridge accent contract failed')
    if m['registry']['uniqueSources'] < a['minUniqueSources'] or m['registry']['failures']: raise RuntimeError(f'asset registry contract failed {m["registry"]}')
    if not m['ridge']['inCurrentFrustum'] or not m['ridge']['withinFogBudget']: raise RuntimeError(f'concept-view Prism Ridge read failed {m["ridge"]}')
    if m['render']['calls'] <= 0 or m['render']['calls'] > 300: raise RuntimeError(f'render calls failed {m["render"]}')
    if m['render']['triangles'] <= 0 or m['render']['triangles'] > 550000: raise RuntimeError(f'triangle budget failed {m["render"]}')


def run(target):
    d=browser(target)
    try:
        try: d.get('http://127.0.0.1:8000/pass18-golden-slice/')
        except TimeoutException: pass
        wait_ready(d); time.sleep(1.25)
        m=d.execute_script('return window.__pass18GoldenSlice.getMetrics()'); assert_metrics(m)
        d.save_screenshot(str(PROOF / f'{target}-golden-slice.png'))
        d.execute_script("window.__pass18GoldenSlice.setView('bridge')"); time.sleep(.45)
        bridge=d.execute_script('return window.__pass18GoldenSlice.getMetrics()')
        d.save_screenshot(str(PROOF / f'{target}-bridge-detail.png'))
        d.execute_script("window.__pass18GoldenSlice.setView('ridgeRead')"); time.sleep(.35)
        ridge=d.execute_script('return window.__pass18GoldenSlice.getMetrics()')
        if not ridge['ridge']['inCurrentFrustum'] or not ridge['ridge']['withinFogBudget']: raise RuntimeError(f'ridge-read camera failed {ridge["ridge"]}')
        severe=[x for x in d.get_log('browser') if x.get('level')=='SEVERE' and 'favicon' not in x.get('message','').lower()]
        if severe: raise RuntimeError(f'severe browser logs: {severe}')
        payload={'concept':m,'bridge':bridge,'ridgeRead':ridge}
        (PROOF / f'{target}-metrics.json').write_text(json.dumps(payload,indent=2),encoding='utf-8')
        print(target,'PASS18-2 GOLDEN SLICE TECH GREEN',json.dumps({'placements':m['realPlacements'],'roles':m['roles'],'sources':m['registry']['uniqueSources'],'calls':m['render']['calls'],'tris':m['render']['triangles'],'ridgeNdc':m['ridge']['projected']}),flush=True)
    finally:
        d.quit()


if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--target',choices=('desktop','android'),required=True); run(p.parse_args().target)
