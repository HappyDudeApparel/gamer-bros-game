import sys,time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def run(label,mobile=False):
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--disable-gpu');o.add_argument('--window-size=1280,720');o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
    if mobile:o.add_argument('--user-agent=Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36')
    d=webdriver.Chrome(options=o)
    try:
        d.get('http://127.0.0.1:8000/pass16-world1/?hero=gb2&ci=1')
        end=time.time()+45;ready=False
        while time.time()<end:
            ready=d.execute_script("return document.documentElement.dataset.pass16Ready==='1'")
            fatal=d.execute_script("return document.getElementById('fatal')?.classList.contains('show')")
            if fatal:
                msg=d.execute_script("return document.getElementById('error')?.textContent")
                logs='\n'.join(str(x) for x in d.get_log('browser'))
                raise RuntimeError((msg or 'fatal')+'\nBROWSER LOGS:\n'+logs)
            if ready: break
            time.sleep(.25)
        if not ready:
            logs='\n'.join(str(x) for x in d.get_log('browser'))
            raise RuntimeError('Pass16 did not become ready\n'+logs)
        val=d.execute_script('return window.__pass16RouteValidation')
        if not val or not val['main']['ok'] or not val['optional']['ok']: raise RuntimeError('Route validation failed: '+repr(val))
        enemies=int(d.execute_script("return document.documentElement.dataset.enemies||'0'"))
        if enemies<5: raise RuntimeError(f'Expected 5 real enemies, got {enemies}')
        print(label,'READY','main',val['main']['samples'],'optional',val['optional']['samples'],'enemies',enemies)
    finally:d.quit()
run('desktop',False);run('android',True)
