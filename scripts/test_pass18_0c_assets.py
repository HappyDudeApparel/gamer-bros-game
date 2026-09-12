import argparse, json, time
from pathlib import Path
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options

ROOT=Path(__file__).resolve().parents[1]
PROOF=ROOT/'artifacts'/'pass18-0c-asset-runtime';PROOF.mkdir(parents=True,exist_ok=True)
ANDROID_UA='Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'

def browser(target):
    mobile=target=='android'; w,h=((915,412) if mobile else (1280,720))
    o=Options();o.page_load_strategy='eager';o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--enable-unsafe-swiftshader');o.add_argument('--hide-scrollbars');o.add_argument(f'--window-size={w},{h}');o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
    if mobile:o.add_experimental_option('mobileEmulation',{'deviceMetrics':{'width':w,'height':h,'pixelRatio':2.75},'userAgent':ANDROID_UA})
    d=webdriver.Chrome(options=o)
    if not mobile:d.set_window_size(w,h)
    d.set_page_load_timeout(22);d.set_script_timeout(15);return d

def wait(d,seconds=55):
    end=time.time()+seconds
    while time.time()<end:
        try:
            if d.execute_script("return window.__pass18AssetRuntimeReady===true && document.documentElement.dataset.pass18AssetRuntimeReady==='1'"):return
            if d.execute_script("return document.documentElement.dataset.pass18AssetRuntimeFailed==='1'"):
                raise RuntimeError('runtime failed '+str(d.execute_script('return window.__pass18AssetRuntimeError')))
        except RuntimeError:raise
        except Exception:pass
        time.sleep(.15)
    raise RuntimeError('timeout; error='+repr(d.execute_script('return window.__pass18AssetRuntimeError||null'))+' logs='+repr(d.get_log('browser')))

def run(target):
    d=browser(target)
    try:
        try:d.get('http://127.0.0.1:8000/pass18-assets/?debug=1')
        except TimeoutException:pass
        wait(d);time.sleep(1.2)
        m=d.execute_script('return window.__pass18AssetRuntime.getMetrics()')
        a=m['registry'];s=m['spatial'];r=m['render']
        if m['catalogCount']<30:raise RuntimeError(f'catalog too small {m}')
        if not m['hudVisible'] or not d.find_elements('id','pass18BudgetHud'):raise RuntimeError('debug HUD missing')
        if a['failures']:raise RuntimeError(f'asset failures {a["failures"]}')
        if a['sourceLoads']<10 or a['uniqueSources']!=a['sourceLoads']:raise RuntimeError(f'cache/load contract {a}')
        if a['cacheHits']<2:raise RuntimeError(f'cache-hit proof missing {a}')
        if a['instancedInstances']<20:raise RuntimeError(f'instancing proof missing {a}')
        if a['staticBatches']<1 or a['staticBatchInstances']<8:raise RuntimeError(f'batch proof missing {a}')
        if s['visibleGroups']>=s['totalVisualGroups']:raise RuntimeError(f'visibility culling not demonstrated {s}')
        if s['collisionCandidates']>=s['totalColliders'] or s['collisionCandidates']<=0:raise RuntimeError(f'collision subset not demonstrated {s}')
        if r['calls']<=0 or r['calls']>220:raise RuntimeError(f'render call smoke {r}')
        if r['triangles']<=0 or r['triangles']>400000:raise RuntimeError(f'triangle smoke {r}')
        severe=[x for x in d.get_log('browser') if x.get('level')=='SEVERE' and 'favicon' not in x.get('message','').lower()]
        if severe:raise RuntimeError(f'severe logs {severe}')
        d.save_screenshot(str(PROOF/f'{target}-asset-gallery.png'))
        (PROOF/f'{target}-metrics.json').write_text(json.dumps(m,indent=2),encoding='utf-8')
        print(target,'PASS18-0C GREEN',json.dumps({'catalog':m['catalogCount'],'loads':a['sourceLoads'],'hits':a['cacheHits'],'placements':a['placements'],'instanced':a['instancedInstances'],'batched':a['staticBatchInstances'],'visible':f"{s['visibleGroups']}/{s['totalVisualGroups']}",'collision':f"{s['collisionCandidates']}/{s['totalColliders']}",'calls':r['calls'],'tris':r['triangles']}),flush=True)
    finally:d.quit()

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--target',choices=('desktop','android'),required=True);run(p.parse_args().target)
