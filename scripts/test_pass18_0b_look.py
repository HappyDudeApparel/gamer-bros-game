import argparse
import json
import time
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'artifacts' / 'pass18-0b-look-proof'
PROOF.mkdir(parents=True, exist_ok=True)
ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'
REQUIRED_ASSETS = {
    'ground_pathBend.glb',
    'ground_riverStraight.glb',
    'ground_grass.glb',
    'ground_riverBend.glb',
    'bridge_stone.glb',
    'platform_grass.glb',
    'cliff_large_rock.glb',
    'cliff_cornerLarge_rock.glb',
    'cliff_steps_rock.glb',
    'cliff_waterfallTop_rock.glb',
    'tree_default.glb',
    'tree_oak.glb',
    'tree_tall.glb',
    'rock_largeA.glb',
    'plant_bushDetailed.glb',
    'flower_purpleA.glb',
    'grass.glb',
}


def make_browser(target):
    mobile = target == 'android'
    width, height = ((915, 412) if mobile else (1280, 720))
    options = Options()
    options.page_load_strategy = 'eager'
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--enable-unsafe-swiftshader')
    options.add_argument('--hide-scrollbars')
    options.add_argument(f'--window-size={width},{height}')
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    if mobile:
        options.add_experimental_option('mobileEmulation', {
            'deviceMetrics': {'width': width, 'height': height, 'pixelRatio': 2.75},
            'userAgent': ANDROID_UA,
        })
    driver = webdriver.Chrome(options=options)
    if not mobile:
        driver.set_window_size(width, height)
    driver.set_page_load_timeout(20)
    driver.set_script_timeout(15)
    return driver


def wait(driver, js, seconds, label):
    end = time.time() + seconds
    while time.time() < end:
        try:
            value = driver.execute_script(js)
            if value:
                return value
        except Exception:
            pass
        time.sleep(0.15)
    logs = driver.get_log('browser')
    error = driver.execute_script('return window.__pass18CalibrationError || null')
    raise RuntimeError(f'timeout {label}; calibrationError={error!r}; logs={logs!r}')


def run(target):
    mobile = target == 'android'
    driver = make_browser(target)
    try:
        print(target, 'NAVIGATE', flush=True)
        try:
            driver.get('http://127.0.0.1:8000/pass18-calibration/')
        except TimeoutException:
            print(target, 'NAVIGATION EAGER TIMEOUT - CONTINUING', flush=True)

        wait(driver, "return window.__pass18CalibrationReady===true && document.documentElement.dataset.pass18Ready==='1'", 40, target + ' ready')
        if driver.execute_script("return document.documentElement.dataset.pass18Failed==='1'"):
            raise RuntimeError(target + ' calibration marked failed')

        time.sleep(2.2)
        metrics = driver.execute_script('return window.__pass18Calibration.getMetrics()')
        loaded = set(metrics['loadedAssets'])
        missing = sorted(REQUIRED_ASSETS - loaded)
        if missing:
            raise RuntimeError(f'{target} missing required real assets: {missing}')
        if metrics['failures']:
            raise RuntimeError(f"{target} asset failures: {metrics['failures']}")
        if metrics['version'] != '18-0B.2':
            raise RuntimeError(f"{target} wrong world-language version: {metrics['version']}")
        if metrics['loadedAssets'] is None or len(metrics['loadedAssets']) < 24:
            raise RuntimeError(f"{target} too few real placements: {len(metrics['loadedAssets'] or [])}")
        if metrics['toneMapping'] != 'ACESFilmicToneMapping' or abs(metrics['exposure'] - 1.14) > 0.001:
            raise RuntimeError(f'{target} tone mapping drift: {metrics}')
        if metrics['fogNear'] != 38 or metrics['fogFar'] != 105:
            raise RuntimeError(f'{target} fog drift: {metrics}')
        expected_fov = 50 if mobile else 46
        expected_shadow = 1024 if mobile else 2048
        max_dpr = 1.25 if mobile else 1.5
        if metrics['fov'] != expected_fov:
            raise RuntimeError(f'{target} FOV drift: {metrics}')
        if metrics['shadowMapSize'] != expected_shadow:
            raise RuntimeError(f'{target} shadow profile drift: {metrics}')
        if metrics['pixelRatio'] <= 0 or metrics['pixelRatio'] > max_dpr + 0.001:
            raise RuntimeError(f'{target} DPR cap failed: {metrics}')
        if metrics['renderCalls'] <= 0 or metrics['renderCalls'] > 220:
            raise RuntimeError(f'{target} render-call budget failed: {metrics}')
        if metrics['triangles'] <= 0 or metrics['triangles'] > 350000:
            raise RuntimeError(f'{target} triangle budget failed: {metrics}')
        # SwiftShader CI is not a device benchmark. This is a gross regression tripwire only.
        if metrics['avgFrameMs'] <= 0 or metrics['avgFrameMs'] > 125:
            raise RuntimeError(f'{target} frame-time smoke failed: {metrics}')

        screenshot = PROOF / f'{target}-matched-look.png'
        driver.save_screenshot(str(screenshot))
        (PROOF / f'{target}-metrics.json').write_text(json.dumps(metrics, indent=2), encoding='utf-8')

        severe = [entry for entry in driver.get_log('browser') if entry.get('level') == 'SEVERE' and 'favicon' not in entry.get('message', '').lower()]
        if severe:
            raise RuntimeError(f'{target} severe browser logs: {severe}')

        print(target, 'LOOK PROOF GREEN', json.dumps({
            'placements': len(metrics['loadedAssets']),
            'uniqueAssets': len(metrics['uniqueAssets']),
            'renderCalls': metrics['renderCalls'],
            'triangles': metrics['triangles'],
            'avgFrameMs': metrics['avgFrameMs'],
            'fps': metrics['fps'],
            'dpr': metrics['pixelRatio'],
            'fov': metrics['fov'],
            'shadow': metrics['shadowMapSize'],
        }), flush=True)
    finally:
        driver.quit()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--target', required=True, choices=('desktop', 'android'))
    run(parser.parse_args().target)
