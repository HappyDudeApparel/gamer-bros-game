import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'artifacts' / 'pass17c2-proof'
PROOF.mkdir(parents=True, exist_ok=True)
ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'


def browser(width, height, mobile=True):
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
    d.set_page_load_timeout(35)
    d.set_script_timeout(20)
    return d


def logs(d):
    try:
        return d.get_log('browser')
    except Exception:
        return []


def wait_js(d, js, timeout, label):
    end = time.time() + timeout
    while time.time() < end:
        try:
            if d.execute_script(js):
                return
        except Exception:
            pass
        time.sleep(.15)
    raise RuntimeError(f'timeout waiting for {label}; logs={logs(d)!r}')


def rect(d, selector):
    return d.execute_script("""
      const e=document.querySelector(arguments[0]);
      if(!e)return null;
      const r=e.getBoundingClientRect();
      return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
    """, selector)


def visible_in_view(r, w, h, min_w=20, min_h=20):
    return bool(r and r['width'] >= min_w and r['height'] >= min_h and r['left'] >= -2 and r['top'] >= -2 and r['right'] <= w + 2 and r['bottom'] <= h + 2)


def overlap(a, b, pad=2):
    return not (a['right'] <= b['left'] + pad or b['right'] <= a['left'] + pad or a['bottom'] <= b['top'] + pad or b['bottom'] <= a['top'] + pad)


def no_fatal(d, label):
    if d.execute_script("return document.getElementById('fatal')?.classList.contains('show')===true"):
        err = d.execute_script("return document.getElementById('error')?.textContent||''")
        raise RuntimeError(f'{label} fatal screen: {err}; logs={logs(d)!r}')


def title_layout(label, width, height):
    d = browser(width, height, True)
    try:
        d.get('http://127.0.0.1:8000/')
        wait_js(d, "return window.__pass17TitleReady===true && document.querySelectorAll('.heroWindow').length===2", 25, f'{label} title ready')
        time.sleep(.8)
        w, h = d.execute_script('return [innerWidth,innerHeight]')
        logo = rect(d, '.logo17')
        panel = rect(d, '.selectPanel')
        play = rect(d, '#playBtn')
        cards = d.execute_script("""
          return [...document.querySelectorAll('.heroWindow')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,id:e.dataset.id,selected:e.classList.contains('selected')}})
        """)
        if not visible_in_view(logo, w, h, 120, 30):
            raise RuntimeError(f'{label} logo not fully usable in viewport: {logo} @ {w}x{h}')
        if not visible_in_view(panel, w, h, 220, 120):
            raise RuntimeError(f'{label} selector panel not fully usable: {panel} @ {w}x{h}')
        if not visible_in_view(play, w, h, 140, 42):
            raise RuntimeError(f'{label} PLAY not fully visible: {play} @ {w}x{h}')
        if len(cards) != 2 or any(not visible_in_view(c, w, h, 80, 70) for c in cards):
            raise RuntimeError(f'{label} hero cards invalid: {cards}')
        if overlap(cards[0], cards[1]):
            raise RuntimeError(f'{label} hero cards overlap: {cards}')
        if overlap(logo, panel):
            raise RuntimeError(f'{label} logo overlaps selector: logo={logo} panel={panel}')
        if sum(1 for c in cards if c['selected']) != 1:
            raise RuntimeError(f'{label} expected exactly one selected card: {cards}')
        roster = d.execute_script('return window.__playableRoster')
        if roster != ['gb1', 'gb2']:
            raise RuntimeError(f'{label} bad playable roster {roster}')
        d.save_screenshot(str(PROOF / f'{label}-title.png'))
        print(label, 'TITLE LAYOUT PASS', {'viewport':[w,h],'play':play,'cards':cards})
    finally:
        d.quit()


def launch_from_title(hero, label, width=412, height=915):
    d = browser(width, height, True)
    try:
        d.get('http://127.0.0.1:8000/')
        wait_js(d, "return window.__pass17TitleReady===true", 25, f'{label} title ready')
        card = d.find_element(By.CSS_SELECTOR, f'.heroWindow[data-id="{hero}"]')
        card.click()
        wait_js(d, f"return window.__titleSelectedHero==='{hero}' && document.querySelector('.heroWindow[data-id=\"{hero}\"]').classList.contains('selected')", 5, f'{label} selection')
        href = d.find_element(By.ID, 'playBtn').get_attribute('data-href') or ''
        if f'hero={hero}' not in href:
            raise RuntimeError(f'{label} PLAY target wrong after selecting {hero}: {href}')
        started = time.time()
        d.find_element(By.ID, 'playBtn').click()
        wait_js(d, "return location.pathname.includes('/pass17-world1/')", 10, f'{label} navigation')
        wait_js(d, "return document.documentElement.dataset.pass17Ready==='1' && window.__pass17Ready===true", 45, f'{label} gameplay ready')
        elapsed = time.time() - started
        no_fatal(d, label)
        ready_hero = d.execute_script('return window.__characterReady')
        if ready_hero != hero:
            raise RuntimeError(f'{label} launched wrong hero: selected={hero} ready={ready_hero}')
        startup_ms = d.execute_script('return window.__pass17StartupMs||0')
        if startup_ms <= 0 or startup_ms > 30000:
            raise RuntimeError(f'{label} startup marker outside checkpoint gate: {startup_ms}ms')
        if elapsed > 45:
            raise RuntimeError(f'{label} title->game startup exceeded 45s: {elapsed:.2f}s')
        if d.execute_script("return document.getElementById('hud')?.classList.contains('ready')!==true"):
            raise RuntimeError(f'{label} HUD did not become ready')
        d.save_screenshot(str(PROOF / f'{label}-{hero}-gameplay.png'))
        severe = [x for x in logs(d) if x.get('level') == 'SEVERE' and 'favicon' not in x.get('message','').lower()]
        if severe:
            raise RuntimeError(f'{label} severe browser logs: {severe}')
        print(label, 'STARTUP PASS', {'hero':hero,'wall_seconds':round(elapsed,2),'startup_ms':startup_ms})
    finally:
        d.quit()


def main():
    title_layout('android-portrait', 412, 915)
    title_layout('android-landscape', 915, 412)
    launch_from_title('gb1', 'android-gb1')
    launch_from_title('gb2', 'android-gb2')
    print('PASS 17C-2 TITLE / STARTUP CHECKPOINT GREEN')
    print('proof:', PROOF)


if __name__ == '__main__':
    main()
