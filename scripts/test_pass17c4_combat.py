import argparse
import time
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'artifacts' / 'pass17c4-combat-proof'
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
    d.set_script_timeout(20)
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
        print(target, 'NAVIGATE', flush=True)
        try:
            d.get('http://127.0.0.1:8000/pass17-world1/?hero=gb2&ci=1&c3visual=1')
        except TimeoutException:
            print(target, 'EAGER NAVIGATION TIMEOUT - CONTINUING', flush=True)

        wait_js(d, "return document.documentElement.dataset.pass17Ready==='1' && window.__pass17CTestReady===true", 38, target + ' runtime ready')
        if d.execute_script("return document.getElementById('fatal')?.classList.contains('show')===true"):
            err = d.execute_script("return document.getElementById('error')?.textContent||''")
            raise RuntimeError(f'{target} fatal screen: {err}')
        wait_js(d, "return Number(document.documentElement.dataset.enemies||0)>=5 || document.documentElement.dataset.enemyStreamError==='1'", 30, target + ' enemies')
        if d.execute_script("return document.documentElement.dataset.enemyStreamError==='1'"):
            raise RuntimeError(f'{target} enemy stream error; logs={logs(d)!r}')

        route = d.execute_script('return window.__pass17RouteValidation')
        before = d.execute_script('return window.__pass17CTest.combatInfo()')
        if not route or not route['main']['ok'] or not route['optional']['ok'] or before['living'] < 5 or before['hearts'] != 5:
            raise RuntimeError(f'{target} bad combat startup: route={route} combat={before}')
        print(target, 'COMBAT READY', {'main': route['main']['samples'], 'optional': route['optional']['samples'], 'state': before}, flush=True)

        # Deterministically advance the same production enemy update() function. This avoids
        # software-WebGL render stalls changing wall-clock timing while still exercising the
        # real patrol -> alert -> windup/telegraph -> lunge -> contact-damage state machine.
        attack = d.execute_script("""
          const t=window.__pass17CTest, staged=t.stageEnemyAttack();
          if(!staged)return {error:'no enemy to stage'};
          const id=staged.enemy.id, seen=[staged.enemy.state];let telegraph=false;
          for(let i=0;i<48 && t.combatInfo().hearts===5;i++){
            t.combatStep(.04);
            const e=t.enemyInfo(id);if(!e)return {error:'enemy disappeared',id,seen};
            if(!seen.includes(e.state))seen.push(e.state);
            telegraph=telegraph||e.telegraph===true;
          }
          return {id,seen,telegraph,combat:t.combatInfo(),enemy:t.enemyInfo(id)};
        """)
        if attack.get('error') or 'windup' not in attack['seen'] or 'lunge' not in attack['seen'] or not attack['telegraph'] or attack['combat']['hearts'] != 4:
            raise RuntimeError(f'{target} hostile attack contract failed: {attack}')
        print(target, 'ENEMY ATTACK PASS', attack, flush=True)

        reset = d.execute_script('return window.__pass17CTest.combatReset()')
        if reset['hearts'] != 5:
            raise RuntimeError(f'{target} combat reset failed: {reset}')

        # Charge and fire twice using the production Prism Breaker update/projectile/collision
        # functions. One full-charge hit must take HP 2 -> 1; a second shot must kill, reduce
        # the living count, and award +2 coins / +1 gem through the production callback.
        power = d.execute_script("""
          const t=window.__pass17CTest, base=t.combatInfo(), stage=t.stageCombat(4);
          if(!stage)return {error:'no enemy for power test',base};
          const id=stage.enemy.id, hp0=stage.enemy.hp;
          if(!t.powerStart())return {error:'first powerStart rejected',base,stage,power:t.powerInfo()};
          for(let i=0;i<30;i++)t.combatStep(.04);
          const peak=t.powerInfo();
          if(!t.powerRelease())return {error:'first release rejected',peak};
          let afterFirst=null;
          for(let i=0;i<14;i++){t.combatStep(.04);const e=t.enemyInfo(id);if(e&&e.hp===hp0-1){afterFirst=e;break;}}
          if(!afterFirst)return {error:'first hit missing',id,hp0,peak,enemy:t.enemyInfo(id),combat:t.combatInfo()};
          for(let i=0;i<20;i++)t.combatStep(.04);
          const restaged=t.stageCombat(4);
          if(!restaged||restaged.enemy.id!==id)return {error:'restage failed',id,afterFirst,restaged};
          if(!t.powerStart())return {error:'second powerStart rejected',power:t.powerInfo(),enemy:t.enemyInfo(id)};
          for(let i=0;i<8;i++)t.combatStep(.04);
          const secondPeak=t.powerInfo();
          if(!t.powerRelease())return {error:'second release rejected',secondPeak};
          for(let i=0;i<18;i++){t.combatStep(.04);const e=t.enemyInfo(id);if(e&&e.alive===false)break;}
          return {id,hp0,peak,afterFirst,secondPeak,final:t.enemyInfo(id),base,combat:t.combatInfo()};
        """)
        if power.get('error'):
            raise RuntimeError(f'{target} Prism Breaker sequence failed: {power}')
        if power['hp0'] != 2 or power['afterFirst']['hp'] != 1 or power['final']['hp'] != 0 or power['final']['alive'] is not False:
            raise RuntimeError(f'{target} HP/death contract failed: {power}')
        if power['peak']['charge'] < .90:
            raise RuntimeError(f'{target} max charge was not reached: {power}')
        if power['combat']['living'] != power['base']['living'] - 1:
            raise RuntimeError(f'{target} living-count contract failed: {power}')
        if power['combat']['coins'] != power['base']['coins'] + 2 or power['combat']['gems'] != power['base']['gems'] + 1:
            raise RuntimeError(f'{target} kill reward contract failed: {power}')
        if power['combat']['coinsText'] != str(power['combat']['coins']) or power['combat']['gemsText'] != str(power['combat']['gems']):
            raise RuntimeError(f'{target} reward HUD contract failed: {power}')
        print(target, 'PRISM BREAKER PASS', power, flush=True)

        shot = PROOF / f'{target}-combat.png'
        if not d.save_screenshot(str(shot)):
            raise RuntimeError(f'{target} combat screenshot failed')
        severe = [x for x in logs(d) if x.get('level') == 'SEVERE' and 'favicon' not in x.get('message', '').lower()]
        if severe:
            raise RuntimeError(f'{target} severe browser logs: {severe}')
        print(target, 'PASS 17C-4 COMBAT GREEN', {'attack': attack, 'power': power, 'proof': str(shot)}, flush=True)
    finally:
        d.quit()


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--target', choices=('desktop', 'android'), required=True)
    run(p.parse_args().target)


if __name__ == '__main__':
    main()
