import argparse, json, time
from pathlib import Path
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'artifacts' / 'pass18-1b-editor'
PROOF.mkdir(parents=True, exist_ok=True)
ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'


def browser(target):
    mobile = target == 'android'
    w, h = ((915, 412) if mobile else (1365, 768))
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
    d.set_script_timeout(35)
    return d


def wait_ready(d, seconds=100):
    end = time.time() + seconds
    while time.time() < end:
        try:
            if d.execute_script("return window.__pass18EditorReady===true && document.documentElement.dataset.pass18EditorReady==='1'"):
                return
            if d.execute_script("return document.documentElement.dataset.pass18EditorFailed==='1'"):
                raise RuntimeError('editor failed: ' + str(d.execute_script('return window.__pass18EditorError')))
        except RuntimeError:
            raise
        except Exception:
            pass
        time.sleep(.18)
    raise RuntimeError('editor timeout; error=' + repr(d.execute_script('return window.__pass18EditorError||null')) + ' logs=' + repr(d.get_log('browser')))


def async_call(d, expression):
    result = d.execute_async_script(f"""
      const done = arguments[arguments.length - 1];
      Promise.resolve().then(async () => ({expression})).then(value => done({{ok:true,value}})).catch(error => done({{ok:false,error:String(error?.stack||error)}}));
    """)
    if not result.get('ok'):
        raise RuntimeError(result.get('error'))
    return result.get('value')


def assert_ui(metrics):
    ui = metrics['ui']
    vw, vh = ui['viewport']['width'], ui['viewport']['height']
    for name in ('palette', 'tools'):
        r = ui[name]
        if not r or r['left'] < -1 or r['top'] < -1 or r['right'] > vw + 1 or r['bottom'] > vh + 1:
            raise RuntimeError(f'{name} panel outside viewport: {r} viewport={vw}x{vh}')
    if ui['palette']['right'] + 80 > ui['tools']['left']:
        raise RuntimeError(f'authoring panels leave too little working viewport: {ui}')


def assert_initial(metrics):
    if metrics['schema'] != '18-1B.0' or metrics['manifestVersion'] != '18-1.0' or metrics['worldLanguage'] != '18-0B.2':
        raise RuntimeError(f'version contract failed: {metrics}')
    if metrics['paletteCount'] != 35:
        raise RuntimeError(f'approved palette count changed: {metrics["paletteCount"]}')
    if metrics['structuralRaycastMeshes'] < 35:
        raise RuntimeError(f'structural authoring surfaces missing: {metrics["structuralRaycastMeshes"]}')
    if metrics['registry']['failures']:
        raise RuntimeError(f'asset registry failures: {metrics["registry"]["failures"]}')
    if metrics['render']['calls'] <= 0 or metrics['render']['calls'] > 320:
        raise RuntimeError(f'editor render-call smoke failed: {metrics["render"]}')
    if metrics['render']['triangles'] <= 0 or metrics['render']['triangles'] > 650000:
        raise RuntimeError(f'editor triangle smoke failed: {metrics["render"]}')
    assert_ui(metrics)


def run(target):
    d = browser(target)
    try:
        try:
            d.get('http://127.0.0.1:8000/pass18-editor/?ci=1')
        except TimeoutException:
            pass
        wait_ready(d)
        time.sleep(.6)
        initial = d.execute_script('return window.__pass18Editor.getMetrics()')
        assert_initial(initial)

        mode_count = d.execute_script("return document.querySelectorAll('#modeButtons [data-mode]').length")
        if mode_count != 8:
            raise RuntimeError(f'author mode control count wrong: {mode_count}')

        d.execute_script("const q=document.getElementById('assetSearch'); q.value='tree'; q.dispatchEvent(new Event('input',{bubbles:true}));")
        tree_count = int(d.execute_script("return Number(document.getElementById('assetList').dataset.visibleCount||0)"))
        if tree_count < 3:
            raise RuntimeError(f'asset search/filter failed: tree_count={tree_count}')
        d.execute_script("const q=document.getElementById('assetSearch'); q.value=''; q.dispatchEvent(new Event('input',{bubbles:true}));")

        d.execute_script("window.__pass18Editor.configureSnap({snapGrid:true,snapVertical:true,gridStep:0.5,verticalStep:0.25})")
        tree = async_call(d, "window.__pass18Editor.place('nature.tree.default',[1.24,2.13,3.26],{select:true})")
        if tree['position'] != [1, 2.25, 3.5] or tree['chunk'] is None or tree['section'] is None:
            raise RuntimeError(f'place/snap/chunk contract failed: {tree}')

        moved = d.execute_script("return window.__pass18Editor.update(arguments[0],{position:[2.26,2.37,3.74],rotationY:0.6,scale:[1.2,1.2,1.2]})", tree['id'])
        if moved['position'] != [2.5, 2.25, 3.5] or abs(moved['rotationY'] - 0.6) > 0.001 or moved['scale'] != [1.2, 1.2, 1.2]:
            raise RuntimeError(f'move/rotate/scale state failed: {moved}')

        flowers = async_call(d, "window.__pass18Editor.scatter('nature.flower.purpleA',[6,1,4],{count:4,radius:2,seed:44})")
        if len(flowers) != 4 or any(item['mode'] != 'scatter' for item in flowers):
            raise RuntimeError(f'scatter brush failed: {flowers}')

        path = d.execute_script("return window.__pass18Editor.addPolyline('path',[[0,1,12],[3,1.2,9],[5,1.5,6]],{width:1.8})")
        fence = d.execute_script("return window.__pass18Editor.addPolyline('fence',[[8,2,4],[11,2.5,1],[12,3,-2]],{spacing:1.5})")
        if path['assetHint'] != 'nature.path.bend' or fence['assetHint'] != 'kaykit.barrier.green':
            raise RuntimeError(f'polyline real-asset hints failed: {path} {fence}')

        d.execute_script("window.__pass18Editor.setCameraPose([20,18,30],[0,5,-8],48)")
        camera = d.execute_script("return window.__pass18Editor.captureCamera('CI authoring pose')")
        if camera['label'] != 'CI authoring pose' or camera['fov'] != 48:
            raise RuntimeError(f'camera capture failed: {camera}')

        # Exercise actual selection+nudge UI wiring before deletion.
        selected_scatter = flowers[0]['id']
        d.execute_script("window.__pass18Editor.select(arguments[0]); document.querySelector('[data-nudge=\"xp\"]').click();", selected_scatter)
        nudged = d.execute_script("return window.__pass18Editor.document.placements.get(arguments[0])", selected_scatter)
        if nudged is None:
            raise RuntimeError('nudge selection vanished')
        before_delete = d.execute_script('return window.__pass18Editor.document.snapshot().placements')
        d.execute_script("document.getElementById('deleteSelected').click()")
        after_delete = d.execute_script('return window.__pass18Editor.document.snapshot().placements')
        if after_delete != before_delete - 1:
            raise RuntimeError(f'delete control failed: {before_delete}->{after_delete}')

        # Exercise transform-mode switching contract.
        for mode in ('move', 'rotate', 'scale', 'select'):
            active = d.execute_script('return window.__pass18Editor.setMode(arguments[0])', mode)
            if active != mode:
                raise RuntimeError(f'mode switch failed: {mode}->{active}')

        exported = d.execute_script('return window.__pass18Editor.exportObject()')
        if exported['version'] != '18-1B.0' or exported['type'] != 'pass18-world-authoring' or exported['cellSize'] != 24:
            raise RuntimeError(f'export schema failed: {exported}')
        placement_total = sum(len(chunk['placements']) for chunk in exported['chunks'])
        polyline_total = sum(len(chunk['polylines']) for chunk in exported['chunks'])
        camera_total = sum(len(chunk['cameras']) for chunk in exported['chunks'])
        if placement_total != after_delete or polyline_total != 2 or camera_total != 1:
            raise RuntimeError(f'chunk export counts failed: p={placement_total} l={polyline_total} c={camera_total} state={exported["summary"]}')
        for chunk in exported['chunks']:
            for placement in chunk['placements']:
                if not placement.get('chunk') or not placement.get('section') or placement.get('targetMax', 0) <= 0:
                    raise RuntimeError(f'placement export incomplete: {placement}')

        final = d.execute_script('return window.__pass18Editor.getMetrics()')
        assert_ui(final)
        if final['registry']['failures']:
            raise RuntimeError(f'late asset failures: {final["registry"]["failures"]}')

        d.save_screenshot(str(PROOF / f'{target}-editor.png'))
        severe = [x for x in d.get_log('browser') if x.get('level') == 'SEVERE' and 'favicon' not in x.get('message', '').lower()]
        if severe:
            raise RuntimeError(f'severe browser logs: {severe}')

        payload = {'initial': initial, 'final': final, 'export': exported, 'treeSearchCount': tree_count}
        (PROOF / f'{target}-metrics.json').write_text(json.dumps(payload, indent=2), encoding='utf-8')
        print(target, 'PASS18-1B EDITOR GREEN', json.dumps({
            'palette': final['paletteCount'],
            'treeSearch': tree_count,
            'placements': exported['summary']['placements'],
            'polylines': exported['summary']['polylines'],
            'cameras': exported['summary']['cameras'],
            'chunks': exported['summary']['chunks'],
            'sources': final['registry']['uniqueSources'],
            'calls': final['render']['calls'],
            'tris': final['render']['triangles'],
        }), flush=True)
    finally:
        d.quit()


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--target', choices=('desktop', 'android'), required=True)
    run(p.parse_args().target)
