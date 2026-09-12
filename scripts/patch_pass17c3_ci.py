from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'pass17-world1' / 'app.js'
WORLD = ROOT / 'pass17-world1' / 'world.js'


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


app = APP.read_text()
old_hook = "      cameraInfo:()=>({index:camZoomIndex,distance:camDistance,yaw:camYaw,pitch:camPitch,levels:[...CAMERA_ZOOMS]}),\n      portalWarm:"
new_hook = "      cameraInfo:()=>({index:camZoomIndex,distance:camDistance,yaw:camYaw,pitch:camPitch,levels:[...CAMERA_ZOOMS]}),\n      cameraCenter:()=>{centerCamera();return {index:camZoomIndex,distance:camDistance,yaw:camYaw,pitch:camPitch,levels:[...CAMERA_ZOOMS]}},\n      cameraCycle:()=>{cycleCameraZoom();return {index:camZoomIndex,distance:camDistance,yaw:camYaw,pitch:camPitch,levels:[...CAMERA_ZOOMS]}},\n      ensureDecor:()=>world.decorate({}),\n      checkpointDecor:()=>world.checkpointDecor(),\n      portalWarm:"
if new_hook not in app:
    app = replace_once(app, old_hook, new_hook, 'Pass 17C-3 test hook')

old_stream = "  later(()=>{\n    window.__pass17DecorStreamStarted=true;\n    world.decorate({}).then(()=>{window.__pass17DecorReady=true}).catch(e=>{console.warn('[Pass17 decor stream]',e);document.documentElement.dataset.decorStreamError='1'});\n  },mobile?5200:3200);"
new_stream = "  if(!new URLSearchParams(location.search).has('c3visual'))later(()=>{\n    window.__pass17DecorStreamStarted=true;\n    world.decorate({}).then(()=>{window.__pass17DecorReady=true}).catch(e=>{console.warn('[Pass17 decor stream]',e);document.documentElement.dataset.decorStreamError='1'});\n  },mobile?5200:3200);"
if new_stream not in app:
    app = replace_once(app, old_stream, new_stream, 'Pass 17C-3 visual stream guard')
APP.write_text(app)

world = WORLD.read_text()
old_return = " return {root,walkMeshes,springs,hazards,collectibles,build,decorate,groundAt,refreshBounds,validateRoutes,update,getBounds:()=>bounds};"
new_return = " return {root,walkMeshes,springs,hazards,collectibles,build,decorate,checkpointDecor:async()=>{await decorateConceptLandmarks();await decoratePortalMeadow();return {landmarks:window.__pass17ConceptLandmarksReady===true,meadow:window.__pass17PortalMeadowDressed===true}},groundAt,refreshBounds,validateRoutes,update,getBounds:()=>bounds};"
if new_return not in world:
    world = replace_once(world, old_return, new_return, 'Pass 17C-3 world checkpoint decorator')
WORLD.write_text(world)

print('PASS17C3_SPLIT_STREAM_VISUAL_OK')
