from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'pass17-world1' / 'app.js'
POWER = ROOT / 'pass17-world1' / 'power.js'


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


app = APP.read_text()
app = replace_once(
    app,
    "window.__pass17ModuleStarted=true;window.__bootPhase='module-started';",
    "window.__pass17ModuleStarted=true;window.__bootPhase='module-started';window.__pass17CVersion='17C1';window.__pass17ModuleStartMs=performance.now();window.__pass17FrameCount=0;window.__pass17PortalWatchdog='idle';",
    'app module marker',
)
app = replace_once(
    app,
    "let coins=0,gems=0,checkpoint=0,hitPause=0,complete=false;const checkpoints=[];",
    "let coins=0,gems=0,checkpoint=0,hitPause=0,complete=false;const checkpoints=[];let portalActiveFor=0,portalLastState='idle';",
    'app state marker',
)
app = replace_once(
    app,
    "let last=performance.now(),elapsed=0;function frame(now=performance.now()){requestAnimationFrame(frame);let dt=Math.min(.033,Math.max(.001,(now-last)/1000));last=now;",
    "let last=performance.now(),elapsed=0;function frame(now=performance.now()){requestAnimationFrame(frame);window.__pass17FrameCount=(window.__pass17FrameCount||0)+1;let dt=Math.min(.033,Math.max(.001,(now-last)/1000));last=now;if(tube){const s=tube.state;window.__pass17PortalState=s;if(s!==portalLastState){portalLastState=s;window.__pass17PortalLastChangeMs=performance.now()}if(s!=='idle'&&s!=='complete'){portalActiveFor+=dt;window.__pass17PortalWatchdog=portalActiveFor>16?'timeout':'active'}else if(s==='complete'){window.__pass17PortalWatchdog='complete'}else{portalActiveFor=0;window.__pass17PortalWatchdog='idle'}}",
    'frame diagnostics',
)

power_create = "  power=createPrismBreaker({scene,bro,getHeroState:()=>player,getEnemies:()=>enemies.living(),damageEnemy:(e,serial,opts)=>enemies.damage(e,serial,opts),toast,mobile});\n  bindControls();"
hook = """  power=createPrismBreaker({scene,bro,getHeroState:()=>player,getEnemies:()=>enemies.living(),damageEnemy:(e,serial,opts)=>enemies.damage(e,serial,opts),toast,mobile});
  if(ci){
    const testMoveTo=(x,z,yaw=0)=>{const gy=world.groundAt(x,z,1e3);player.x=x;player.z=z;player.y=(gy??0)+.04;player.yaw=yaw;player.vy=0;player.speed=0;player.boostX=player.boostZ=0;player.grounded=true;player.jumpCount=0;player.springCooldown=.4;bro.setMotion('idle');bro.setHome(player.x,player.z,player.yaw);heroRoot.position.y=player.y;bro.update(elapsed,0,0);return {x:player.x,y:player.y,z:player.z,yaw:player.yaw}};
    window.__pass17CTest={
      moveTo:testMoveTo,
      firstEnemy:()=>{const e=enemies.living()[0];return e?{id:e.id,hp:e.hp,alive:e.alive,role:e.role,x:e.root.position.x,y:e.root.position.y,z:e.root.position.z}:null},
      stageCombat:(distance=4)=>{const e=enemies.living()[0];if(!e)return null;e.alertRadius=0;e.attackRange=0;const p=testMoveTo(e.root.position.x,e.root.position.z-distance,0);return {player:p,enemy:{id:e.id,hp:e.hp,x:e.root.position.x,y:e.root.position.y,z:e.root.position.z}}},
      powerStart:()=>power.start(),powerRelease:()=>power.release(),
      cameraInfo:()=>({index:camZoomIndex,distance:camDistance,yaw:camYaw,pitch:camPitch,levels:[...CAMERA_ZOOMS]}),
      portalWarm:async()=>{await beginTubeWarm();return {prewarmed:tube.prewarmed,state:tube.state}},
      portalPrime:async()=>{await beginTubeWarm();testMoveTo(sites.tube.x,sites.tube.z,0);return {prewarmed:tube.prewarmed,state:tube.state,x:player.x,y:player.y,z:player.z}},
      portalInfo:()=>({state:tube.state,prewarmed:tube.prewarmed,complete:tube.complete,watchdog:window.__pass17PortalWatchdog,frames:window.__pass17FrameCount}),
      startup:()=>({ms:window.__pass17StartupMs||0,mobile,zoom:[...CAMERA_ZOOMS],touch:window.__pass17TouchCamera===true})
    };
    window.__pass17CTestReady=true;
  }
  bindControls();"""
app = replace_once(app, power_create, hook, 'CI test hook')
app = replace_once(
    app,
    "window.__pass17Ready=true;window.__pass='pass17-world1';document.documentElement.dataset.pass17Ready='1';last=performance.now();frame();",
    "window.__pass17Ready=true;window.__pass='pass17-world1';window.__pass17StartupMs=Math.round(performance.now()-window.__pass17ModuleStartMs);window.__pass17CReady=true;document.documentElement.dataset.pass17Ready='1';document.documentElement.dataset.pass17c='1';last=performance.now();frame();",
    'ready marker',
)
APP.write_text(app)

power = POWER.read_text()
power = replace_once(
    power,
    "const projectiles=[];const debris=[];let charging=false,charge=0,cooldown=0,serial=0,chargeFx=null,cameraKick=0,hitStop=0,recoil=0,audio=null;",
    "const projectiles=[];const debris=[];const impactRings=[];let charging=false,charge=0,cooldown=0,serial=0,chargeFx=null,cameraKick=0,hitStop=0,recoil=0,audio=null,fullChargePulse=false;",
    'power state',
)
power = replace_once(
    power,
    "function start(){if(charging||cooldown>0)return false;charging=true;charge=.02;bro.setAction(true);chargeFx=chargeFx||makeChargeFx();chargeFx.visible=true;tone(220,.08,'triangle',.018,80);return true}",
    "function start(){if(charging||cooldown>0)return false;charging=true;charge=.02;fullChargePulse=false;bro.setAction(true);chargeFx=chargeFx||makeChargeFx();chargeFx.visible=true;toast('PRISM BREAKER · CHARGING',430);tone(220,.08,'triangle',.018,80);return true}",
    'power start',
)
power = replace_once(
    power,
    "function release(){if(!charging)return false;const p=THREE.MathUtils.clamp(charge/1.05,.16,1);charging=false;bro.setAction(true);if(chargeFx)chargeFx.visible=false;spawnProjectile(p);charge=0;cooldown=.34+.18*p;setTimeout(()=>{if(!charging)bro.setAction(false)},190);return true}",
    "function release(){if(!charging)return false;const p=THREE.MathUtils.clamp(charge/1.05,.16,1);charging=false;bro.setAction(true);if(chargeFx)chargeFx.visible=false;spawnProjectile(p);cameraKick=Math.max(cameraKick,.58+.46*p);toast(p>.86?'PRISM BREAKER · MAX CHARGE':'PRISM BREAKER · RELEASE',p>.86?620:420);charge=0;cooldown=.34+.18*p;setTimeout(()=>{if(!charging)bro.setAction(false)},190);return true}",
    'power release',
)
old_burst = """function burst(pos,power=.5){
    for(let i=0;i<10+Math.floor(power*8);i++){
      const m=new THREE.Mesh(new THREE.TetrahedronGeometry(.055+Math.random()*.06),new THREE.MeshBasicMaterial({color:i%3===0?0xff69c8:(i%3===1?0x75ecff:0xffffff),transparent:true,opacity:.9,depthWrite:false}));m.position.copy(pos);scene.add(m);debris.push({mesh:m,vel:new THREE.Vector3((Math.random()-.5)*5,1.2+Math.random()*3,(Math.random()-.5)*5),life:.42+Math.random()*.28});
    }
  }"""
new_burst = """function burst(pos,power=.5){
    for(let i=0;i<10+Math.floor(power*8);i++){
      const m=new THREE.Mesh(new THREE.TetrahedronGeometry(.055+Math.random()*.06),new THREE.MeshBasicMaterial({color:i%3===0?0xff69c8:(i%3===1?0x75ecff:0xffffff),transparent:true,opacity:.9,depthWrite:false}));m.position.copy(pos);scene.add(m);debris.push({mesh:m,vel:new THREE.Vector3((Math.random()-.5)*5,1.2+Math.random()*3,(Math.random()-.5)*5),life:.42+Math.random()*.28});
    }
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.22,.045,8,34),new THREE.MeshBasicMaterial({color:power>.72?0xffffff:0x7cecff,transparent:true,opacity:.92,depthWrite:false,blending:THREE.AdditiveBlending}));ring.position.copy(pos);ring.rotation.x=Math.PI/2;scene.add(ring);impactRings.push({mesh:ring,life:.30,power});
  }"""
power = replace_once(power, old_burst, new_burst, 'impact ring')
power = replace_once(
    power,
    "if(charging){charge=Math.min(1.05,charge+dt);bro.setAction(true);bro.controllerEmitter.getWorldPosition(emitterPos);chargeFx.position.copy(emitterPos);const q=charge/1.05,s=.65+q*1.45+Math.sin(t*22)*.08;chargeFx.scale.setScalar(s);chargeFx.rotation.x=t*1.7;chargeFx.rotation.y=t*2.3;if(charge>=1.02&&Math.random()>.92)tone(720,.025,'triangle',.008,30);}",
    "if(charging){charge=Math.min(1.05,charge+dt);bro.setAction(true);bro.controllerEmitter.getWorldPosition(emitterPos);chargeFx.position.copy(emitterPos);const q=charge/1.05,s=.65+q*1.45+Math.sin(t*22)*.08;chargeFx.scale.setScalar(s);chargeFx.rotation.x=t*1.7;chargeFx.rotation.y=t*2.3;if(q>=.92&&!fullChargePulse){fullChargePulse=true;cameraKick=Math.max(cameraKick,.22);tone(880,.075,'triangle',.018,120);toast('MAX CHARGE',430)}if(charge>=1.02&&Math.random()>.92)tone(720,.025,'triangle',.008,30);}",
    'full charge feedback',
)
power = replace_once(
    power,
    "for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.life-=dt;d.vel.y-=6*dt;d.mesh.position.addScaledVector(d.vel,dt);d.mesh.rotation.x+=dt*5;d.mesh.rotation.y+=dt*7;if(d.mesh.material)d.mesh.material.opacity=Math.max(0,d.life*2.3);if(d.life<=0){scene.remove(d.mesh);debris.splice(i,1);}}",
    "for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.life-=dt;d.vel.y-=6*dt;d.mesh.position.addScaledVector(d.vel,dt);d.mesh.rotation.x+=dt*5;d.mesh.rotation.y+=dt*7;if(d.mesh.material)d.mesh.material.opacity=Math.max(0,d.life*2.3);if(d.life<=0){scene.remove(d.mesh);debris.splice(i,1);}}for(let i=impactRings.length-1;i>=0;i--){const r=impactRings[i];r.life-=dt;const q=Math.max(0,r.life/.30);r.mesh.scale.setScalar(1+(1-q)*(3.2+r.power*1.5));r.mesh.material.opacity=q*.88;if(r.life<=0){scene.remove(r.mesh);r.mesh.geometry.dispose();r.mesh.material.dispose();impactRings.splice(i,1);}}",
    'impact ring update',
)
POWER.write_text(power)

print('Pass 17C patch applied: portal diagnostics/test hooks + Prism Breaker feedback polish')
