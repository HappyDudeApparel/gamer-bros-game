from pathlib import Path
import re
p=Path(__file__).resolve().parents[1]/'pass16-world1'/'world.js'
s=p.read_text()
ruins="""  // E: Ruin Courtyard occupies west/northwest, with broad fight space and two bypasses.
  await patch('block-grass-large.glb',-35,-43,6.2,19);
  await patch('block-grass-large.glb',-38,-40,6.4,19);
  await patch('block-grass-large.glb',-40,-36,6.8,19);
  await patch('block-grass-large.glb',-41,-33,7.1,19);
  await patch('block-grass-large.glb',-42,-30,ruin,25);
  await patch('block-grass-large.glb',-42,-10,ruin,25);
  await patch('block-grass-large.glb',-31,2,ruin,20);
  await decor('platform-fortified.glb',{x:-31,z:2,topY:ruin+.1,targetXZ:20});
  addRoute({x:-32,z:-47,y:c3},{x:-35,z:-43,y:6.2});
  addRoute({x:-35,z:-43,y:6.2},{x:-38,z:-40,y:6.4});
  addRoute({x:-38,z:-40,y:6.4},{x:-40,z:-36,y:6.8});
  addRoute({x:-40,z:-36,y:6.8},{x:-41,z:-33,y:7.1});
  addRoute({x:-41,z:-33,y:7.1},{x:-42,z:-30,y:ruin});
  addRoute({x:-42,z:-30,y:ruin},{x:-42,z:-10,y:ruin});
  addRoute({x:-42,z:-10,y:ruin},{x:-31,z:2,y:ruin});
"""
new_s,n=re.subn(r"  // E: Ruin Courtyard.*?(?=  // Lower bypass)",ruins,s,flags=re.S)
if n!=1: raise SystemExit(f'Expected one Ruin section, replaced {n}')
p.write_text(new_s)
print('PASS16_RUIN_HANDOFF_V2_OK')
