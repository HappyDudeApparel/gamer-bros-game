from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'pass17-world1'/'app.js'
s=p.read_text()
repls=[
    ('let camYaw=.06,camPitch=.33,camDistance=CAMERA_ZOOMS[camZoomIndex]',
     'let camYaw=.06,camPitch=.18,camDistance=CAMERA_ZOOMS[camZoomIndex]'),
    ('camPitch=.33;recenter=-1.25;toast(\'CAMERA CENTERED\',480)',
     'camPitch=.18;recenter=-1.25;toast(\'CAMERA CENTERED\',480)'),
    ('THREE.MathUtils.damp(camPitch,.33,2.2,dt)',
     'THREE.MathUtils.damp(camPitch,.18,2.2,dt)')
]
changed=0
for old,new in repls:
    if new in s:
        continue
    if old not in s:
        raise SystemExit(f'Pass 17 camera marker missing: {old[:56]}')
    s=s.replace(old,new,1);changed+=1
p.write_text(s)
print('PASS17_SCENIC_CAMERA_OK',changed)
