import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def run(label,mobile=False):
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--disable-gpu');o.add_argument('--window-size=1280,720');o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
    if mobile:o.add_argument('--user-agent=Mozilla/5.0 (Linux; Android 15; SM-G998W) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36')
    d=webdriver.Chrome(options=o)
    try:
        d.get('http://127.0.0.1:8000/pass16-title-preview/')
        end=time.time()+15
        while time.time()<end and not d.execute_script('return window.__pass16TitleReady===true'):time.sleep(.1)
        if not d.execute_script('return window.__pass16TitleReady===true'):
            raise RuntimeError('Title did not become ready: '+repr(d.get_log('browser')))
        roster=d.execute_script('return window.__playableRoster')
        if roster!=['gb1','gb2']:raise RuntimeError('Unexpected roster '+repr(roster))
        cards=d.find_elements(By.CSS_SELECTOR,'.heroWindow')
        if len(cards)!=2:raise RuntimeError(f'Expected 2 character windows, got {len(cards)}')
        d.find_element(By.CSS_SELECTOR,'.heroWindow[data-id="gb1"]').click();time.sleep(.1)
        if d.execute_script('return window.__titleSelectedHero')!='gb1':raise RuntimeError('GB1 selection failed')
        href=d.execute_script("return document.getElementById('playBtn').dataset.href")
        if 'pass16-world1' not in href or 'hero=gb1' not in href:raise RuntimeError('GB1 play target wrong: '+str(href))
        d.find_element(By.CSS_SELECTOR,'.heroWindow[data-id="gb2"]').click();time.sleep(.1)
        if d.execute_script('return window.__titleSelectedHero')!='gb2':raise RuntimeError('GB2 selection failed')
        href=d.execute_script("return document.getElementById('playBtn').dataset.href")
        if 'pass16-world1' not in href or 'hero=gb2' not in href:raise RuntimeError('GB2 play target wrong: '+str(href))
        selected=d.find_elements(By.CSS_SELECTOR,'.heroWindow.selected')
        if len(selected)!=1:raise RuntimeError(f'Expected one selected window, got {len(selected)}')
        sizes=d.execute_script("return [...document.querySelectorAll('.heroWindow canvas')].map(c=>[c.width,c.height])")
        if any(w<20 or h<20 for w,h in sizes):raise RuntimeError('Hero canvases did not render '+repr(sizes))
        print(label,'TITLE READY','roster',roster,'target',href,'canvas',sizes)
    finally:d.quit()
run('desktop');run('android',True)
