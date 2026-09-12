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

wp=dst/'world.js';ws=wp.read_text(encoding='utf-8')
ws=ws.replace('top.rotation.x=-Math.PI/2;top.position.y=y;','top.rotation.x=Math.PI/2;top.material.side=THREE.DoubleSide;top.position.y=y;')

def rep(old,new,label):
    global ws
    if old not in ws: raise SystemExit(label+' anchor not found')
    ws=ws.replace(old,new,1)

rep("    addRoute({x:18,z:18,y:1.05},{x:22,z:10,y:1.7});addRoute({x:22,z:10,y:1.7},{x:30,z:-3,y:2.08});addRoute({x:30,z:-3,y:2.08},{x:38,z:-15,y:4.1});addRoute({x:38,z:-15,y:4.1},{x:33,z:-27,y:4.1});",
"    terrain('riverworks-rise-a',[[25,-1],[38,-2],[42,-10],[35,-16],[25,-12]],2.7,7);terrain('riverworks-rise-b',[[31,-9],[44,-11],[45,-21],[36,-25],[27,-18]],3.4,8);\n    addRoute({x:18,z:18,y:1.05},{x:22,z:10,y:1.7});addRoute({x:22,z:10,y:1.7},{x:30,z:-3,y:2.08});addRoute({x:30,z:-3,y:2.08},{x:32,z:-8,y:2.7});addRoute({x:32,z:-8,y:2.7},{x:36,z:-15,y:3.4});addRoute({x:36,z:-15,y:3.4},{x:38,z:-21,y:4.1});addRoute({x:38,z:-21,y:4.1},{x:33,z:-27,y:4.1});",'Riverworks rise')

rep("    addRoute({x:33,z:-27,y:4.1},{x:22,z:-29,y:3.3});addRoute({x:22,z:-29,y:3.3},{x:10,z:-44,y:5.55});",
"    terrain('works-clover-handoff',[[25,-23],[36,-24],[37,-32],[28,-38],[18,-35],[17,-28]],3.7,8);\n    terrain('clover-rise-a',[[17,-31],[28,-32],[27,-41],[18,-46],[10,-41],[10,-34]],4.0,8);\n    terrain('clover-rise-b',[[11,-37],[22,-40],[20,-49],[12,-54],[3,-49],[3,-42]],4.75,9);\n    addRoute({x:33,z:-27,y:4.1},{x:28,z:-30,y:3.7});addRoute({x:28,z:-30,y:3.7},{x:22,z:-32,y:3.3});addRoute({x:22,z:-32,y:3.3},{x:19,z:-36,y:4.0});addRoute({x:19,z:-36,y:4.0},{x:15,z:-41,y:4.75});addRoute({x:15,z:-41,y:4.75},{x:10,z:-44,y:5.55});",'Riverworks/Clover')

# This begins mid-line in the authored source, so deliberately no indentation in the anchor.
rep("addRoute({x:10,z:-44,y:5.55},{x:-5,z:-58,y:5.55});addRoute({x:-5,z:-58,y:5.55},{x:-21,z:-73,y:7.8});",
"terrain('clover-upper-rise-a',[[-10,-55],[2,-57],[1,-66],[-9,-70],[-18,-64],[-18,-58]],6.3,10);terrain('clover-upper-rise-b',[[-17,-61],[-5,-63],[-6,-73],[-17,-78],[-26,-72],[-26,-65]],7.05,11);addRoute({x:10,z:-44,y:5.55},{x:-5,z:-58,y:5.55});addRoute({x:-5,z:-58,y:5.55},{x:-10,z:-62,y:6.3});addRoute({x:-10,z:-62,y:6.3},{x:-15,z:-67,y:7.05});addRoute({x:-15,z:-67,y:7.05},{x:-21,z:-73,y:7.8});",'Clover upper rise')

rep("    addRoute({x:-21,z:-73,y:7.8},{x:3,z:-67,y:8.2});addRoute({x:3,z:-67,y:8.2},{x:20,z:-57,y:8.55});",
"    terrain('clover-ruin-link',[[-25,-79],[5,-74],[10,-66],[3,-59],[-22,-66],[-29,-73]],8.0,11);\n    addRoute({x:-21,z:-73,y:7.8},{x:3,z:-67,y:8.0});addRoute({x:3,z:-67,y:8.0},{x:8,z:-64,y:8.2});addRoute({x:8,z:-64,y:8.2},{x:20,z:-57,y:8.55});",'Clover/Ruin link')

wp.write_text(ws,encoding='utf-8')
for name in ('concept-bro.js','enemies.js'):
    p=dst/name;s=p.read_text(encoding='utf-8')
    s=s.replace('move=walk?.62:run?1:0','move=(walk ? 0.62 : (run ? 1 : 0))').replace("e.kind==='spiker'?.62:.46","e.kind==='spiker' ? .62 : .46").replace("e.kind==='spiker'?.22:.3","e.kind==='spiker' ? .22 : .3").replace("e.kind==='spiker'?.8:.58","e.kind==='spiker' ? .8 : .58")
    p.write_text(s,encoding='utf-8')
print('PASS17_CONCEPT_MATCH_BUILD_OK')
