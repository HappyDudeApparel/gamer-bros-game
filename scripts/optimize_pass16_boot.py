from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
app=root/'pass16-world1'/'app.js'
world=root/'pass16-world1'/'world.js'

# Do not start decorative GLB traffic from inside world.build(). The app schedules it after gameplay is live.
w=world.read_text()
w,n=re.subn(r"\s*setTimeout\(\(\)=>decorate\(\{meadow,creek,works,c2,ruin,ridge:r2,high\}\)\.catch\(e=>console\.warn\('\[Pass16 decor\]',e\)\),700\);","\n  window.__pass16DecorDeferred=true;",w,count=1)
if n!=1:
    raise SystemExit(f'Expected one eager decoration scheduler, replaced {n}')
world.write_text(w)

s=app.read_text()
old=re.compile(r"  await createPlayer\(\);createTube\(\);setPhase\('Spawning animated enemies…',72\);enemies=createEnemySystem\(\{assets,parent:world\.root,groundAt:world\.groundAt,getPlayerPosition:v=>v\.set\(player\.x,player\.y,player\.z\),damagePlayer,onEnemyKilled:enemyKilled,toast\}\);await enemies\.spawnAll\(sites\.enemySpawns\);document\.documentElement\.dataset\.enemies=String\(enemies\.enemies\.length\);\n  power=createPrismBreaker\(\{scene,bro,getHeroState:\(\)=>player,getEnemies:\(\)=>enemies\.living\(\),damageEnemy:\(e,serial,opts\)=>enemies\.damage\(e,serial,opts\),toast,mobile\}\);bindControls\(\);window\.__pass16TouchCamera=true;window\.__pass16PortalTimingFix=true;window\.__pass16CameraZoomLevels=\[\.\.\.CAMERA_ZOOMS\];updateHUD\(\);setPhase\('Prism Valley ready',100\);boot\.classList\.add\('hide'\);window\.__pass16Ready=true;window\.__pass='pass16-world1';document\.documentElement\.dataset\.pass16Ready='1';last=performance\.now\(\);frame\(\);\n  if\(!ci\)setTimeout\(\(\)=>beginTubeWarm\(\),mobile\?1800:650\);")
new="""  await createPlayer();
  createTube();
  enemies=createEnemySystem({assets,parent:world.root,groundAt:world.groundAt,getPlayerPosition:v=>v.set(player.x,player.y,player.z),damagePlayer,onEnemyKilled:enemyKilled,toast});
  power=createPrismBreaker({scene,bro,getHeroState:()=>player,getEnemies:()=>enemies.living(),damageEnemy:(e,serial,opts)=>enemies.damage(e,serial,opts),toast,mobile});
  bindControls();
  window.__pass16TouchCamera=true;window.__pass16PortalTimingFix=true;window.__pass16CameraZoomLevels=[...CAMERA_ZOOMS];
  updateHUD();setPhase('Prism Valley ready',100);boot.classList.add('hide');window.__pass16Ready=true;window.__pass='pass16-world1';document.documentElement.dataset.pass16Ready='1';last=performance.now();frame();

  // Gameplay owns startup priority. Real animated enemies and decorative dressing stream only after the first rendered frames.
  const later=(fn,delay)=>setTimeout(()=>{const ric=window.requestIdleCallback||((cb)=>setTimeout(cb,180));ric(fn,{timeout:1800})},delay);
  later(()=>{
    window.__pass16EnemyStreamStarted=true;
    enemies.spawnAll(sites.enemySpawns).then(()=>{window.__pass16FirstEnemyReady=true}).catch(e=>{console.error('[Pass16 enemy stream]',e);document.documentElement.dataset.enemyStreamError='1'});
  },mobile?900:450);
  later(()=>{
    window.__pass16DecorStreamStarted=true;
    world.decorate({}).then(()=>{window.__pass16DecorReady=true}).catch(e=>{console.warn('[Pass16 decor stream]',e);document.documentElement.dataset.decorStreamError='1'});
  },mobile?5200:3200);
  if(!ci)later(()=>beginTubeWarm(),mobile?2200:900);
"""
s,n=old.subn(new,s,count=1)
if n!=1:
    raise SystemExit(f'Expected one blocking boot block, replaced {n}')
app.write_text(s)
print('PASS16_NONBLOCKING_BOOT_OK')
