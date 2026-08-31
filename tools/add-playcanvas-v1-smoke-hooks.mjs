import fs from 'node:fs';
const p='playcanvas-v1/main.js';
let s=fs.readFileSync(p,'utf8');
const needle='hud();\nsetTimeout(()=>{boot.style.opacity=';
if(!s.includes(needle))throw new Error('Smoke hook insertion point not found');
const hook=`window.__spriteGame={\n  state,\n  collectAllCrests(){state.crests=3;unlockPortal();hud();},\n  teleportToPortal(){hero.setPosition(0,1.35,-4);state.vy=0;state.grounded=false;},\n  completeGame,\n  hero,\n  enemies\n};\n\nhud();\nsetTimeout(()=>{boot.style.opacity=`;
s=s.replace(needle,hook);
fs.writeFileSync(p,s);
console.log('Added PlayCanvas smoke hooks');
