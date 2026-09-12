from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'pass17-world1' / 'app.js'


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


app = APP.read_text()

old_first = "      firstEnemy:()=>{const e=enemies.living()[0];return e?{id:e.id,hp:e.hp,alive:e.alive,role:e.role,x:e.root.position.x,y:e.root.position.y,z:e.root.position.z}:null},"
new_first = "      firstEnemy:()=>{const e=enemies.living()[0];return e?{id:e.id,hp:e.hp,alive:e.alive,role:e.role,state:e.state,x:e.root.position.x,y:e.root.position.y,z:e.root.position.z}:null},"
app = replace_once(app, old_first, new_first, 'Pass 17C-4 firstEnemy state')

old_stage = "      stageCombat:(distance=4)=>{const e=enemies.living()[0];if(!e)return null;e.alertRadius=0;e.attackRange=0;const p=testMoveTo(e.root.position.x,e.root.position.z-distance,0);return {player:p,enemy:{id:e.id,hp:e.hp,x:e.root.position.x,y:e.root.position.y,z:e.root.position.z}}},"
new_stage = """      stageCombat:(distance=4)=>{const e=enemies.living()[0];if(!e)return null;e.alertRadius=0;e.attackRange=0;e.state='patrol';e.timer=.1;e.telegraph.visible=false;e.didContact=false;e.knock.set(0,0,0);const p=testMoveTo(e.root.position.x,e.root.position.z-distance,0);return {player:p,enemy:{id:e.id,hp:e.hp,alive:e.alive,state:e.state,x:e.root.position.x,y:e.root.position.y,z:e.root.position.z}}},
      stageEnemyAttack:()=>{const e=enemies.living()[0];if(!e)return null;e.alertRadius=12;e.attackRange=2.15;e.walkSpeed=2.25;e.lungeSpeed=Math.max(6.2,e.lungeSpeed||0);e.state='patrol';e.timer=0;e.telegraph.visible=false;e.didContact=false;e.knock.set(0,0,0);player.hearts=5;player.damageCooldown=0;updateHUD();const p=testMoveTo(e.root.position.x,e.root.position.z-1.45,0);player.damageCooldown=0;return {player:p,enemy:{id:e.id,hp:e.hp,alive:e.alive,state:e.state,x:e.root.position.x,y:e.root.position.y,z:e.root.position.z}}},
      enemyInfo:(id)=>{const e=enemies.enemies.find(q=>q.id===id);return e?{id:e.id,hp:e.hp,alive:e.alive,role:e.role,state:e.state,telegraph:e.telegraph.visible,x:e.root.position.x,y:e.root.position.y,z:e.root.position.z}:null},
      combatInfo:()=>({hearts:player.hearts,coins,gems,living:enemies.living().length,healthText:healthEl.textContent,coinsText:coinsEl.textContent,gemsText:gemsEl.textContent}),
      combatReset:()=>{player.hearts=5;player.damageCooldown=0;updateHUD();return {hearts:player.hearts,coins,gems,living:enemies.living().length}},
      powerInfo:()=>({charging:power.charging,charge:power.charge,cooldown:power.cooldown,cameraKick:power.cameraKick,recoil:power.recoil}),"""
app = replace_once(app, old_stage, new_stage, 'Pass 17C-4 combat hooks')

APP.write_text(app)
print('PASS17C4_COMBAT_HOOKS_OK')
