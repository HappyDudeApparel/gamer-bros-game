from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
p = ROOT / 'pass17-world1' / 'app.js'
s = p.read_text()
old = "      cameraInfo:()=>({index:camZoomIndex,distance:camDistance,yaw:camYaw,pitch:camPitch,levels:[...CAMERA_ZOOMS]}),\n      portalWarm:"
new = "      cameraInfo:()=>({index:camZoomIndex,distance:camDistance,yaw:camYaw,pitch:camPitch,levels:[...CAMERA_ZOOMS]}),\n      ensureDecor:async()=>{await world.decorate({});return {decor:window.__pass17DecorReady===true,landmarks:window.__pass17ConceptLandmarksReady===true,meadow:window.__pass17PortalMeadowDressed===true}},\n      portalWarm:"
if new in s:
    print('PASS17C3_CI_DECOR_TRIGGER_ALREADY_PRESENT')
elif old in s:
    p.write_text(s.replace(old,new,1))
    print('PASS17C3_CI_DECOR_TRIGGER_OK')
else:
    raise SystemExit('Pass 17C-3 cameraInfo hook marker missing')
