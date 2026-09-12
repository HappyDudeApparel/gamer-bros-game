from pathlib import Path
import re
p=Path(__file__).resolve().parents[1]/'pass16-world1'/'app.js'
s=p.read_text()
s=s.replace("chargeBar=$('#chargeBar'),pad=$('#pad')","chargeBar=$('#chargeBar'),chargeWrap=$('#chargeWrap'),pad=$('#pad')")
s=s.replace("import { createGamerBro } from '../playground-v2/gamer-bro.js?v=pass14';","import { createGamerBro } from '../playground-v2/gamer-bro.js?v=pass16';")
block="""let currentZone='';
function objective(){if(complete)return;let best=null,bd=1e9;for(const q of sites.zones||[]){const d=Math.hypot(player.x-q.x,player.z-q.z);if(d<q.r&&d<bd){best=q;bd=d}}if(best&&best.id!==currentZone){currentZone=best.id;objectiveEl.textContent=best.name;objectiveEl.classList.add('show');clearTimeout(objective._t);objective._t=setTimeout(()=>objectiveEl.classList.remove('show'),2600)}}
function updateCheckpoint(){let best=checkpoint,bd=1e9;for(let i=0;i<checkpoints.length;i++){const q=checkpoints[i],d=Math.hypot(player.x-q.x,player.z-q.z);if(d<12&&d<bd){best=i;bd=d}}if(best>checkpoint){checkpoint=best;toast('CHECKPOINT',650)}}
"""
s=re.sub(r"let currentZone='';function objective\(\).*?(?=function activateSpring)",block,s,flags=re.S)
p.write_text(s)
print('PASS16_RUNTIME_NORMALIZED')
