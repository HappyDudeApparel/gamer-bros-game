from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
src=ROOT/'pass16-world1'
dst=ROOT/'pass17-world1'
dst.mkdir(exist_ok=True)

# Keep Pass 16's proven controller, renderer, portal and power runtime while
# substituting the Pass 17 world, character and enemy implementations.
for name in ('assets.js','power.js'):
    (dst/name).write_text((src/name).read_text(encoding='utf-8'),encoding='utf-8')

app=(src/'app.js').read_text(encoding='utf-8')
app=app.replace("import { createGamerBro } from '../playground-v2/gamer-bro.js?v=pass16';","import { createConceptBro } from './concept-bro.js?v=17.0.0';")
app=app.replace('createGamerBro(THREE,renderer,','createConceptBro(THREE,renderer,')
app=app.replace("./assets.js?v=16.0.0","./assets.js?v=17.0.0")
app=app.replace("./world.js?v=16.0.0","./world.js?v=17.0.0")
app=app.replace("./enemies.js?v=16.0.0","./enemies.js?v=17.0.0")
app=app.replace("./power.js?v=16.0.0","./power.js?v=17.0.0")
app=app.replace('__pass16','__pass17').replace('pass16-world1','pass17-world1').replace('[Pass16','[Pass17')
app=app.replace("window.__pass='pass17-world1'","window.__pass='pass17-world1';window.__pass17ConceptMatch=true")
(dst/'app.js').write_text(app,encoding='utf-8')

html=(src/'index.html').read_text(encoding='utf-8')
html=html.replace('Prism Valley</title>','Prism Valley V2</title>')
html=html.replace('Entering Prism Valley</strong>','Entering Prism Valley V2</strong>')
html=html.replace('Building the first real World 1 map…','Shaping the approved Prism Valley V2 world…')
html=html.replace('__pass16','__pass17')
html=html.replace('./app.js?v=16.0.0','./app.js?v=17.0.0')
(dst/'index.html').write_text(html,encoding='utf-8')

# ShapeGeometry is authored in XY. +90 degrees maps its second coordinate to
# world +Z; DoubleSide keeps the upward raycast face available regardless of
# shape winding. This keeps visible tops and cliff skirts in the same X/Z map.
wp=dst/'world.js'
ws=wp.read_text(encoding='utf-8')
ws=ws.replace('top.rotation.x=-Math.PI/2;top.position.y=y;','top.rotation.x=Math.PI/2;top.material.side=THREE.DoubleSide;top.position.y=y;')
wp.write_text(ws,encoding='utf-8')

# Normalize compact ternary spelling in authored concept modules.
for name in ('concept-bro.js','enemies.js'):
    p=dst/name
    s=p.read_text(encoding='utf-8')
    s=s.replace('move=walk?.62:run?1:0','move=(walk ? 0.62 : (run ? 1 : 0))')
    s=s.replace("e.kind==='spiker'?.62:.46","e.kind==='spiker' ? .62 : .46")
    s=s.replace("e.kind==='spiker'?.22:.3","e.kind==='spiker' ? .22 : .3")
    s=s.replace("e.kind==='spiker'?.8:.58","e.kind==='spiker' ? .8 : .58")
    p.write_text(s,encoding='utf-8')

print('PASS17_CONCEPT_MATCH_BUILD_OK')
