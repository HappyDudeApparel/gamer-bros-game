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
    d.set_script_timeout(28)
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

        wait_js(
            d,
            "return document.documentElement.dataset.pass17Ready==='1' && window.__pass17CTestReady===true",
            38,
            target + ' runtime ready',
        )
        if d.execute_script("return document.getElementById('fatal')?.classList.contains('show')===true"):
            err = d.execute_script("return document.getElementById('error')?.textContent||''")
            raise RuntimeError(f'{target} fatal screen: {err}')

        wait_js(
            d,
            "return Number(document.documentElement.dataset.enemies||0)>=5 || document.documentElement.dataset.enemyStreamError==='1'",
            30,
            target + ' enemies',
        )
        if d.execute_script("return document.documentElement.dataset.enemyStreamError==='1'"):
            raise RuntimeError(f'{target} enemy stream error; logs={logs(d)!r}')

        route = d.execute_script('return window.__pass17RouteValidation')
        if not route or not route['main']['ok'] or not route['optional']['ok']:
            raise RuntimeError(f'{target} route regression: {route}')
        before = d.execute_script('return window.__pass17CTest.combatInfo()')
        if before['living'] < 5 or before['hearts'] != 5:
            raise RuntimeError(f'{target} bad initial combat state: {before}')
        print(target, 'COMBAT READY', {'main': route['main']['samples'], 'optional': route['optional']['samples'], 'state': before}, flush=True)

        # Exercise the real hostile state machine inside the page so software-WebGL Selenium
        # round trips cannot hide the alert -> telegraph/windup -> lunge -> player-hit sequence.
        attack = d.execute_async_script("""
          const done=arguments[0], t=window.__pass17CTest;
          const staged=t.stageEnemyAttack();
          if(!staged){done({error:'no enemy to stage'});return;}
          const id=staged.enemy.id, seen=[], started=performance.now();let telegraph=false;
          const tick=()=>{
            const e=t.enemyInfo(id), c=t.combatInfo();
            if(!e){done({error:'enemy disappeared',seen,combat:c});return;}
            if(!seen.includes(e.state))seen.push(e.state);
            telegraph=telegraph||e.telegraph===true;
            if(c.hearts<5){done({id,seen,telegraph,combat:c,enemy:e,ms:Math.round(performance.now()-started)});return;}
            if(performance.now()-started>6500){done({error:'attack timeout',id,seen,telegraph,combat:c,enemy:e});return;}
            setTimeout(tick,35);
          };
          tick();
        """)
        if attack.get('error'):
            raise RuntimeError(f'{target} hostile attack failed: {attack}')
        if 'windup' not in attack['seen'] or 'lunge' not in attack['seen'] or not attack['telegraph']:
            raise RuntimeError(f'{target} missing telegraph/lunge sequence: {attack}')
        if attack['combat']['hearts'] != 4:
            raise RuntimeError(f'{target} enemy contact did not remove exactly one heart: {attack}')
        print(target, 'ENEMY ATTACK PASS', attack, flush=True)

        reset = d.execute_script('return window.__pass17CTest.combatReset()')
        if reset['hearts'] != 5:
            raise RuntimeError(f'{target} combat reset failed: {reset}')

        # Drive a max-charge hit followed by a second finishing shot. This validates charge,
        # projectile collision, HP, death, living-count reduction, and the existing kill reward.
        power = d.execute_async_script("""
          const done=arguments[0], t=window.__pass17CTest;
          const base=t.combatInfo(), stage=t.stageCombat(4);
          if(!stage){done({error:'no enemy for power test',base});return;}
          const id=stage.enemy.id, hp0=stage.enemy.hp, started=performance.now();
          if(!t.powerStart()){done({error:'first powerStart rejected',base,stage,power:t.powerInfo()});return;}
          setTimeout(()=>{
            const peak=t.powerInfo();
            const released=t.powerRelease();
            if(!released){done({error:'first release rejected',peak});return;}
            const waitFirst=()=>{
              const e=t.enemyInfo(id);
              if(e && e.hp===hp0-1){
                setTimeout(()=>{
                  const restaged=t.stageCombat(4);
                  if(!restaged || restaged.enemy.id!==id){done({error:'could not restage damaged target',id,e,restaged});return;}
                  if(!t.powerStart()){done({error:'second powerStart rejected',power:t.powerInfo(),enemy:t.enemyInfo(id)});return;}
                  setTimeout(()=>{
                    const secondPeak=t.powerInfo(), secondReleased=t.powerRelease();
                    if(!secondReleased){done({error:'second release rejected',secondPeak});return;}
                    const waitDead=()=>{
                      const q=t.enemyInfo(id), combat=t.combatInfo();
                      if(q && q.alive===false){done({id,hp0,peak,afterFirst:e,secondPeak,final:q,base,combat,ms:Math.round(performance.now()-started)});return;}
                      if(performance.now()-started>8500){done({error:'kill timeout',id,hp0,peak,afterFirst:e,secondPeak,final:q,base,combat});return;}
                      setTimeout(waitDead,35);
                    };
                    waitDead();
                  },320);
                },720);
                return;
              }
              if(performance.now()-started>4500){done({error:'first hit timeout',id,hp0,peak,enemy:e,combat:t.combatInfo()});return;}
              setTimeout(waitFirst,35);
            };
            waitFirst();
          },1120);
        """)
        if power.get('error'):
            raise RuntimeError(f'{target} Prism Breaker sequence failed: {power}')
        if power['hp0'] != 2 or power['afterFirst']['hp'] != 1 or power['final']['hp'] != 0 or power['final']['alive'] is not False:
            raise RuntimeError(f'{target} HP/death contract failed: {power}')
        if power['peak']['charge'] < .90:
            raise RuntimeError(f'{target} max charge was not reached: {power}')
        if power['combat']['living'] != power['base']['living'] - 1:
            raise RuntimeError(f'{target} living-count did not decrease by one: {power}')
        if power['combat']['coins'] != power['base']['coins'] + 2 or power['combat']['gems'] != power['base']['gems'] + 1:
            raise RuntimeError(f'{target} kill reward wrong: {power}')
        if power['combat']['coinsText'] != str(power['combat']['coins']) or power['combat']['gemsText'] != str(power['combat']['gems']):
            raise RuntimeError(f'{target} reward HUD did not update: {power}')
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
