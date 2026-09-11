from pathlib import Path

p=Path('pass12-v1/index.html')
s=p.read_text()
s=s.replace('A MEADOW → B VILLAGE → C BRIDGE → D HILLSIDE → E RUINS → F PORTAL','A LAUNCH → B HEIGHTS → C RIVERWORKS → D WINDRIDGE → E RUIN CIRCUIT → F PORTAL ASCENT')
s=s.replace('./app.js?v=12','./app.js?v=12.1')
p.write_text(s)

p=Path('pass12-v1/app.js')
s=p.read_text()
marker="updateHUD();\nfunction updatePlayer"
addon="""updateHUD();
const rewardChests=[
 {x:-20,z:-2,kind:'coins',amount:5,label:'MEADOW LOOKOUT CACHE',claimed:false},
 {x:-22,z:-22,kind:'gems',amount:2,label:'VILLAGE HEIGHTS CHEST',claimed:false},
 {x:-9,z:-120,kind:'gems',amount:3,label:'RUIN CIRCUIT RELIC',claimed:false}
];
function rewardBurst(x,z){for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.08+Math.random()*.08),energyMat(i%2?0xffd45f:0x65efff,.9));m.position.set(x,elev(z)+1.0,z);scene.add(m);debris.push({m,v:new THREE.Vector3((Math.random()-.5)*4,2+Math.random()*3,(Math.random()-.5)*4),age:0})}}
function updateRewards(){for(const c of rewardChests){if(c.claimed)continue;if(Math.hypot(player.x-c.x,player.z-c.z)<1.45){c.claimed=true;if(c.kind==='coins')coins+=c.amount;else gems+=c.amount;updateHUD();rewardBurst(c.x,c.z);toast(`${c.label} · +${c.amount} ${c.kind.toUpperCase()}`,1500)}}}
window.__rewardChests=rewardChests.length;
function updatePlayer"""
if marker not in s:
    raise SystemExit('reward insertion marker missing')
s=s.replace(marker,addon,1)
loop='updatePlayer(dt);updateAction(dt);updateGameplay(dt,elapsed);'
if loop not in s:
    raise SystemExit('loop marker missing')
s=s.replace(loop,'updatePlayer(dt);updateAction(dt);updateGameplay(dt,elapsed);updateRewards();',1)
p.write_text(s)
print('Pass 12 rewards enhanced')
