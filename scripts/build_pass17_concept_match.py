from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
src=ROOT/'pass16-world1'
dst=ROOT/'pass17-world1'
dst.mkdir(exist_ok=True)

for name in ('assets.js','power.js'):
    (dst/name).write_text((src/name).read_text(encoding='utf-8'),encoding='utf-8')

app=(src/'app.js').read_text(encoding='utf-8')
app=app.replace("import { createGamerBro } from '../playground-v2/gamer-bro.js?v=pass16';","import { createConceptBro } from './concept-bro.js?v=17.0.0';")
app=app.replace('createGamerBro(THREE,renderer,','createConceptBro(THREE,renderer,')
app=app.replace("./assets.js?v=16.0.0","./assets.js?v=17.0.0").replace("./world.js?v=16.0.0","./world.js?v=17.0.0").replace("./enemies.js?v=16.0.0","./enemies.js?v=17.0.0").replace("./power.js?v=16.0.0","./power.js?v=17.0.0")
app=app.replace('__pass16','__pass17').replace('pass16-world1','pass17-world1').replace('[Pass16','[Pass17')
app=app.replace("window.__pass='pass17-world1'","window.__pass='pass17-world1';window.__pass17ConceptMatch=true")
(dst/'app.js').write_text(app,encoding='utf-8')

html=(src/'index.html').read_text(encoding='utf-8')
html=html.replace('Prism Valley</title>','Prism Valley V2</title>').replace('Entering Prism Valley</strong>','Entering Prism Valley V2</strong>').replace('Building the first real World 1 map…','Shaping the approved Prism Valley V2 world…').replace('__pass16','__pass17').replace('./app.js?v=16.0.0','./app.js?v=17.0.0')
(dst/'index.html').write_text(html,encoding='utf-8')

wp=dst/'world.js'
ws=wp.read_text(encoding='utf-8')
ws=ws.replace('top.rotation.x=-Math.PI/2;top.position.y=y;','top.rotation.x=Math.PI/2;top.material.side=THREE.DoubleSide;top.position.y=y;')

# Authored visible terraces smooth Riverworks' vertical rise. These are not
# invisible collision patches: they use the same terrain() geometry/material
# as the rest of the visible world.
needle="""    addRoute({x:18,z:18,y:1.05},{x:22,z:10,y:1.7});addRoute({x:22,z:10,y:1.7},{x:30,z:-3,y:2.08});addRoute({x:30,z:-3,y:2.08},{x:38,z:-15,y:4.1});addRoute({x:38,z:-15,y:4.1},{x:33,z:-27,y:4.1});"""
replacement="""    terrain('riverworks-rise-a',[[25,-1],[38,-2],[42,-10],[35,-16],[25,-12]],2.7,7);terrain('riverworks-rise-b',[[31,-9],[44,-11],[45,-21],[36,-25],[27,-18]],3.4,8);\n    addRoute({x:18,z:18,y:1.05},{x:22,z:10,y:1.7});addRoute({x:22,z:10,y:1.7},{x:30,z:-3,y:2.08});addRoute({x:30,z:-3,y:2.08},{x:32,z:-8,y:2.7});addRoute({x:32,z:-8,y:2.7},{x:36,z:-15,y:3.4});addRoute({x:36,z:-15,y:3.4},{x:38,z:-21,y:4.1});addRoute({x:38,z:-21,y:4.1},{x:33,z:-27,y:4.1});"""
if needle not in ws: raise SystemExit('Riverworks rise anchor not found')
ws=ws.replace(needle,replacement)

needle2="""    addRoute({x:33,z:-27,y:4.1},{x:22,z:-29,y:3.3});addRoute({x:22,z:-29,y:3.3},{x:10,z:-44,y:5.55});"""
replacement2="""    terrain('works-clover-handoff',[[25,-23],[36,-24],[37,-32],[28,-38],[18,-35],[17,-28]],3.7,8);\n    addRoute({x:33,z:-27,y:4.1},{x:28,z:-30,y:3.7});addRoute({x:28,z:-30,y:3.7},{x:22,z:-32,y:3.3});addRoute({x:22,z:-32,y:3.3},{x:10,z:-44,y:5.55});"""
if needle2 not in ws: raise SystemExit('Riverworks/Clover anchor not found')
ws=ws.replace(needle2,replacement2)
wp.write_text(ws,encoding='utf-8')

for name in ('concept-bro.js','enemies.js'):
    p=dst/name;s=p.read_text(encoding='utf-8')
    s=s.replace('move=walk?.62:run?1:0','move=(walk ? 0.62 : (run ? 1 : 0))').replace("e.kind==='spiker'?.62:.46","e.kind==='spiker' ? .62 : .46").replace("e.kind==='spiker'?.22:.3","e.kind==='spiker' ? .22 : .3").replace("e.kind==='spiker'?.8:.58","e.kind==='spiker' ? .8 : .58")
    p.write_text(s,encoding='utf-8')

print('PASS17_CONCEPT_MATCH_BUILD_OK')
