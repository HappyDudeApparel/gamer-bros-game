from pathlib import Path

APP = Path('pass14-level-lab/app.js')
HTML = Path('pass14-level-lab/index.html')

app = APP.read_text()
html = HTML.read_text()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        print(f'{label}: already patched')
        return text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    print(f'{label}: patched')
    return text.replace(old, new, 1)


app = replace_once(
    app,
    "actionBtn=$('#action'),menuBtn=$('#menu'),retryBtn=$('#retry'),toastEl=$('#toast');",
    "actionBtn=$('#action'),zoomBtn=$('#zoom'),cameraCenterBtn=$('#cameraCenter'),menuBtn=$('#menu'),retryBtn=$('#retry'),toastEl=$('#toast');",
    'camera DOM controls',
)

app = replace_once(
    app,
    "const camTarget=new THREE.Vector3(),camLook=new THREE.Vector3();let camYaw=.06,camPitch=.33,camDistance=12.8,recenter=0,dragging=false,lastX=0,lastY=0;",
    "const camTarget=new THREE.Vector3(),camLook=new THREE.Vector3();const CAMERA_ZOOMS=[12.8,16.2,20.0],CAMERA_ZOOM_NAMES=['STANDARD','WIDE','FAR'];const savedCameraZoom=Number(localStorage.getItem('gbCameraZoomIndex'));let camZoomIndex=Number.isInteger(savedCameraZoom)?Math.max(0,Math.min(2,savedCameraZoom)):0;let camYaw=.06,camPitch=.33,camDistance=CAMERA_ZOOMS[camZoomIndex],recenter=0,dragging=false,lastX=0,lastY=0,cameraPointerId=null;function syncCameraButtons(){if(zoomBtn)zoomBtn.textContent=`ZOOM ${camZoomIndex+1}/3`;if(cameraCenterBtn)cameraCenterBtn.textContent='CENTER'}function setCameraZoom(index,announce=true){camZoomIndex=(index+CAMERA_ZOOMS.length)%CAMERA_ZOOMS.length;camDistance=CAMERA_ZOOMS[camZoomIndex];localStorage.setItem('gbCameraZoomIndex',String(camZoomIndex));syncCameraButtons();recenter=-1.25;if(announce)toast(`CAMERA · ${CAMERA_ZOOM_NAMES[camZoomIndex]}`,560)}function cycleCameraZoom(){setCameraZoom(camZoomIndex+1)}function centerCamera(){camYaw=player.yaw+Math.PI;camPitch=.33;recenter=-1.25;toast('CAMERA CENTERED',480)}",
    'three-level camera zoom state',
)

app = replace_once(
    app,
    "recenter>.65",
    "recenter>1.35",
    'camera recenter grace period',
)

app = replace_once(
    app,
    "if(['KeyE','KeyX','KeyJ','KeyK'].includes(e.code)&&!e.repeat){power?.start();actionBtn.classList.add('charging')}});",
    "if(['KeyE','KeyX','KeyJ','KeyK'].includes(e.code)&&!e.repeat){power?.start();actionBtn.classList.add('charging')}if(e.code==='KeyZ'&&!e.repeat)cycleCameraZoom();if(e.code==='KeyV'&&!e.repeat)centerCamera()});",
    'desktop camera shortcuts',
)

old_camera_bind = "  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;dragging=true;lastX=e.clientX;lastY=e.clientY});addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;camYaw-=dx*.0031;camPitch=THREE.MathUtils.clamp(camPitch+dy*.0023,.05,.72)});addEventListener('pointerup',()=>dragging=false);addEventListener('wheel',e=>{camDistance=THREE.MathUtils.clamp(camDistance+Math.sign(e.deltaY)*.75,8.2,17)},{passive:true})\n"
new_camera_bind = "  syncCameraButtons();zoomBtn?.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();cycleCameraZoom()});cameraCenterBtn?.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();centerCamera()});\n  function endCameraDrag(e){if(cameraPointerId===null||e.pointerId!==cameraPointerId)return;dragging=false;cameraPointerId=null;recenter=-1.25}canvas.addEventListener('pointerdown',e=>{if(tube?.state!=='idle'||complete)return;if(e.pointerType!=='touch'&&e.button!==0)return;if(cameraPointerId!==null)return;e.preventDefault();cameraPointerId=e.pointerId;dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId);recenter=0});canvas.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==cameraPointerId)return;e.preventDefault();const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;const yawScale=e.pointerType==='touch'?.00415:.0031,pitchScale=e.pointerType==='touch'?.00325:.0023;camYaw-=dx*yawScale;camPitch=THREE.MathUtils.clamp(camPitch+dy*pitchScale,.025,.82);recenter=0});canvas.addEventListener('pointerup',endCameraDrag);canvas.addEventListener('pointercancel',endCameraDrag);canvas.addEventListener('lostpointercapture',e=>{if(e.pointerId===cameraPointerId){dragging=false;cameraPointerId=null;recenter=-1.25}});addEventListener('wheel',e=>{camDistance=THREE.MathUtils.clamp(camDistance+Math.sign(e.deltaY)*.75,8.2,20);zoomBtn&&(zoomBtn.textContent='ZOOM · CUSTOM')},{passive:true})\n"
app = replace_once(app, old_camera_bind, new_camera_bind, 'touch orbit + camera buttons')

app = replace_once(
    app,
    "tube?.update(dt);updateCamera(dt);renderer.render(scene,camera)",
    "tube?.update(elapsed,dt);updateCamera(dt);renderer.render(scene,camera)",
    'portal state-machine timing',
)

app = replace_once(
    app,
    "power=createPrismBreaker({scene,bro,getHeroState:()=>player,getEnemies:()=>enemies.living(),damageEnemy:(e,serial,opts)=>enemies.damage(e,serial,opts),toast,mobile});bindControls();updateHUD();",
    "power=createPrismBreaker({scene,bro,getHeroState:()=>player,getEnemies:()=>enemies.living(),damageEnemy:(e,serial,opts)=>enemies.damage(e,serial,opts),toast,mobile});bindControls();window.__pass14TouchCamera=true;window.__pass14PortalTimingFix=true;window.__pass14CameraZoomLevels=[...CAMERA_ZOOMS];updateHUD();",
    'runtime validation markers',
)

html = replace_once(
    html,
    ".powerReadout strong{display:block;font-size:8px;letter-spacing:.08em}.chargeTrack",
    ".powerReadout strong{display:block;font-size:8px;letter-spacing:.08em}.cameraTools{pointer-events:auto;position:absolute;right:max(14px,env(safe-area-inset-right));bottom:max(156px,calc(env(safe-area-inset-bottom) + 146px));display:flex;gap:7px}.cameraTools button{min-height:38px;padding:0 10px;border-radius:13px;border:1px solid #ffffff4c;background:linear-gradient(#294e62e8,#091923f0);font-size:8px;font-weight:950;letter-spacing:.05em;touch-action:none}.cameraTools button:first-child{min-width:76px}.cameraTools button:last-child{min-width:62px}.chargeTrack",
    'camera tray CSS',
)

html = replace_once(
    html,
    "</div></div><div class=\"pad\" id=\"pad\">",
    "</div></div><div class=\"cameraTools\"><button id=\"zoom\">ZOOM 1/3</button><button id=\"cameraCenter\">CENTER</button></div><div class=\"pad\" id=\"pad\">",
    'camera tray markup',
)

html = replace_once(
    html,
    ".action{height:42px}.objective{top:8px}",
    ".action{height:42px}.cameraTools{bottom:max(116px,calc(env(safe-area-inset-bottom) + 108px))}.cameraTools button{min-height:32px;padding:0 8px}.objective{top:8px}",
    'landscape camera tray layout',
)

html = replace_once(
    html,
    '<script type="module" src="./app.js?v=14.0.0"></script>',
    '<script type="module" src="./app.js?v=14.1.0"></script>',
    'Pass 14 app cache-bust',
)

APP.write_text(app)
HTML.write_text(html)
print('Pass 14 camera + portal patch complete')
