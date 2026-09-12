from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'pass17-world1' / 'app.js'


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


app = APP.read_text()

# Keep the real canonical portal but suppress unrelated enemy streaming in the dedicated
# CI portal proof. This query flag is never used by production play.
old_enemy = "  later(()=>{\n    window.__pass17EnemyStreamStarted=true;\n    enemies.spawnAll(sites.enemySpawns).then(()=>{window.__pass17FirstEnemyReady=true}).catch(e=>{console.error('[Pass17 enemy stream]',e);document.documentElement.dataset.enemyStreamError='1'});\n  },mobile?900:450);"
new_enemy = "  if(!qp.has('c5portal'))later(()=>{\n    window.__pass17EnemyStreamStarted=true;\n    enemies.spawnAll(sites.enemySpawns).then(()=>{window.__pass17FirstEnemyReady=true}).catch(e=>{console.error('[Pass17 enemy stream]',e);document.documentElement.dataset.enemyStreamError='1'});\n  },mobile?900:450);"
if new_enemy not in app:
    app = replace_once(app, old_enemy, new_enemy, 'Pass 17C-5 portal-only stream guard')

old_info = "      portalInfo:()=>({state:tube.state,prewarmed:tube.prewarmed,complete:tube.complete,watchdog:window.__pass17PortalWatchdog,frames:window.__pass17FrameCount}),"
new_info = """      portalInfo:()=>({state:tube.state,prewarmed:tube.prewarmed,complete:tube.complete,watchdog:window.__pass17PortalWatchdog,frames:window.__pass17FrameCount,component:window.__tubeComponent,entryRadius:tube.entryRadius,transfer:window.__tubeTransferComplete===true,worldComplete:complete,objective:objectiveEl.textContent,retryVisible:retryBtn.classList.contains('show'),heroVisible:heroRoot.visible}),
      portalColdTrigger:()=>tube.trigger(),
      portalEnter:async()=>{await beginTubeWarm();testMoveTo(sites.tube.x,sites.tube.z,0);updatePlayer(.016,elapsed);return {state:tube.state,prewarmed:tube.prewarmed,x:player.x,y:player.y,z:player.z,objective:objectiveEl.textContent,entryRadius:tube.entryRadius}},
      portalStep:(dt=.05)=>{elapsed+=dt;tube.update(elapsed,dt);const s=tube.state;if(s!=='idle'&&s!=='complete'){portalActiveFor+=dt;window.__pass17PortalWatchdog=portalActiveFor>16?'timeout':'active'}else if(s==='complete'){window.__pass17PortalWatchdog='complete'}else{portalActiveFor=0;window.__pass17PortalWatchdog='idle'}return {state:s,prewarmed:tube.prewarmed,complete:tube.complete,watchdog:window.__pass17PortalWatchdog,transfer:window.__tubeTransferComplete===true,worldComplete:complete,objective:objectiveEl.textContent,retryVisible:retryBtn.classList.contains('show'),heroVisible:heroRoot.visible}},"""
app = replace_once(app, old_info, new_info, 'Pass 17C-5 portal hooks')

APP.write_text(app)
print('PASS17C5_PORTAL_HOOKS_OK')
