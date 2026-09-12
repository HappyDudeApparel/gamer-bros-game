import argparse
import time
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'artifacts' / 'pass17c5-portal-proof'
PROOF.mkdir(parents=True, exist_ok=True)
ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'


def browser(width, height, mobile=False):
    o = Options()
    o.page_load_strategy = 'eager'
    o.add_argument('--headless=new')
    o.add_argument('--no-sandbox')
    o.add_argument('--disable-dev-shm-usage')
    o.add_argument('--enable-unsafe-swiftshader')
    o.add_argument(f'--window-size={width},{height}')
    o.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    if mobile:
        o.add_argument(f'--user-agent={ANDROID_UA}')
    d = webdriver.Chrome(options=o)
    d.set_window_size(width, height)
    d.set_page_load_timeout(20)
    d.set_script_timeout(65)
    return d


def logs(d):
    try:
        return d.get_log('browser')
    except Exception:
        return []


def wait_js(d, js, seconds, label):
    end = time.time() + seconds
    while time.time() < end:
        try:
            if d.execute_script(js):
                return
        except Exception:
            pass
        time.sleep(.18)
    raise RuntimeError(f'timeout waiting for {label}; logs={logs(d)!r}')


def run(target):
    mobile = target == 'android'
    width, height = ((915, 412) if mobile else (1280, 720))
    d = browser(width, height, mobile)
    try:
        print(target, 'PORTAL NAVIGATE', flush=True)
        try:
            d.get('http://127.0.0.1:8000/pass17-world1/?hero=gb2&ci=1&c3visual=1&c5portal=1')
        except TimeoutException:
            print(target, 'EAGER NAVIGATION TIMEOUT - CONTINUING', flush=True)

        wait_js(d, "return document.documentElement.dataset.pass17Ready==='1' && window.__pass17CTestReady===true", 40, target + ' portal runtime ready')
        if d.execute_script("return document.getElementById('fatal')?.classList.contains('show')===true"):
            err = d.execute_script("return document.getElementById('error')?.textContent||''")
            raise RuntimeError(f'{target} fatal screen: {err}')

        route = d.execute_script('return window.__pass17RouteValidation')
        initial = d.execute_script('return window.__pass17CTest.portalInfo()')
        if not route or not route['main']['ok'] or not route['optional']['ok']:
            raise RuntimeError(f'{target} route regression: {route}')
        if initial['component'] != 'crystal-library-v2-tube' or initial['state'] != 'idle' or initial['complete'] is not False:
            raise RuntimeError(f'{target} wrong canonical portal startup: {initial}')
        print(target, 'CANONICAL PORTAL READY', {'main': route['main']['samples'], 'optional': route['optional']['samples'], 'portal': initial}, flush=True)

        # A cold tube must reject entry. CI suppresses the normal background warmup so this is
        # a genuine prewarm guard check on the canonical component.
        cold = d.execute_script('return window.__pass17CTest.portalColdTrigger()')
        after_cold = d.execute_script('return window.__pass17CTest.portalInfo()')
        if cold is not False or after_cold['state'] != 'idle' or after_cold['prewarmed'] is not False:
            raise RuntimeError(f'{target} cold portal guard failed: cold={cold} info={after_cold}')
        print(target, 'COLD GUARD PASS', after_cold, flush=True)

        warm = d.execute_async_script("""
          const done=arguments[0];
          window.__pass17CTest.portalWarm().then(v=>done({ok:true,value:v})).catch(e=>done({ok:false,error:String(e)}));
        """)
        if not warm.get('ok') or not warm['value']['prewarmed'] or warm['value']['state'] != 'idle':
            raise RuntimeError(f'{target} portal prewarm failed: {warm}')
        print(target, 'PREWARM PASS', warm, flush=True)

        entered = d.execute_async_script("""
          const done=arguments[0];
          window.__pass17CTest.portalEnter().then(v=>done({ok:true,value:v})).catch(e=>done({ok:false,error:String(e)}));
        """)
        if not entered.get('ok') or entered['value']['state'] != 'loading' or 'TRANSMISSION' not in entered['value']['objective']:
            raise RuntimeError(f'{target} production entry condition failed: {entered}')
        print(target, 'ENTRY PASS', entered, flush=True)

        # Advance the production tube update() to an active charge frame, then allow the real
        # renderer one frame for visual proof.
        active = d.execute_script("""
          const t=window.__pass17CTest, seen=[];
          for(let i=0;i<90;i++){
            const q=t.portalStep(.05);if(!seen.includes(q.state))seen.push(q.state);
            if(q.state==='charge' && i>34){for(let j=0;j<16;j++)t.portalStep(.05);break;}
          }
          return {seen,info:t.portalInfo()};
        """)
        if 'charge' not in active['seen'] or active['info']['watchdog'] == 'timeout':
            raise RuntimeError(f'{target} portal did not reach active charge: {active}')
        print(target, 'ACTIVE PORTAL PASS', active, flush=True)
        time.sleep(.20)
        shot = PROOF / f'{target}-portal-charge.png'
        if not d.save_screenshot(str(shot)):
            raise RuntimeError(f'{target} portal screenshot failed')

        finish = d.execute_script("""
          const t=window.__pass17CTest, seen=[];
          for(let i=0;i<260;i++){
            const q=t.portalStep(.05);if(!seen.includes(q.state))seen.push(q.state);
            if(q.state==='complete')return {seen,steps:i+1,info:t.portalInfo()};
          }
          return {seen,error:'did not complete',info:t.portalInfo()};
        """)
        required = {'convert', 'sustain', 'dissipate', 'afterglow', 'complete'}
        if finish.get('error') or not required.issubset(set(finish['seen'])):
            raise RuntimeError(f'{target} portal phase sequence failed: {finish}')
        info = finish['info']
        if info['state'] != 'complete' or not info['complete'] or not info['transfer'] or not info['worldComplete']:
            raise RuntimeError(f'{target} portal completion flags failed: {finish}')
        if info['watchdog'] != 'complete' or not info['retryVisible'] or info['heroVisible'] is not False:
            raise RuntimeError(f'{target} portal completion UI/watchdog failed: {finish}')
        if 'WORLD 1-1 COMPLETE' not in info['objective']:
            raise RuntimeError(f'{target} portal completion objective failed: {finish}')

        severe = [x for x in logs(d) if x.get('level') == 'SEVERE' and 'favicon' not in x.get('message', '').lower()]
        if severe:
            raise RuntimeError(f'{target} severe browser logs: {severe}')
        print(target, 'PASS 17C-5 PORTAL GREEN', {'active': active, 'finish': finish, 'proof': str(shot)}, flush=True)
    finally:
        d.quit()


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--target', choices=('desktop', 'android'), required=True)
    run(p.parse_args().target)


if __name__ == '__main__':
    main()
