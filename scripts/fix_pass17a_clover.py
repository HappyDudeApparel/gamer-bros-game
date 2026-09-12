from pathlib import Path
p=Path(__file__).resolve().parents[1]/'pass17-world1'/'world.js'
s=p.read_text()
old_spring="""   const s2=await decor('spring.glb',{x:-29,z:-24,topY:terrainHeight(-29,-24)+.10,targetXZ:2.5});springs.push({root:s2.root,x:-29,z:-24,target:{x:-31,z:-31},strengthY:8.5,strengthForward:7.7,mandatory:false});"""
new_spring="""   // Keep the spring physically clear of the upper overhang. The player approaches on hillside terrain,
   // launches through open air, then lands on the mastery shelf; no stacked layer exists under the spring.
   const s2=await decor('spring.glb',{x:-27,z:-22,topY:terrainHeight(-27,-22)+.10,targetXZ:2.5});springs.push({root:s2.root,x:-27,z:-22,target:{x:-31,z:-31},strengthY:8.8,strengthForward:10.2,mandatory:false});"""
old_route="""   route([
    {x:-16,z:20},{x:-20,z:12},{x:-23,z:4},{x:-27,z:-5},{x:-30,z:-14},
    {x:-29.8,z:-16},{x:-29.6,z:-18},{x:-29.4,z:-20},{x:-29.2,z:-22},{x:-29,z:-24}
   ],true);"""
new_route="""   route([
    {x:-16,z:20},{x:-20,z:12},{x:-23,z:4},{x:-27,z:-5},{x:-30,z:-14},
    {x:-29.2,z:-16},{x:-28.5,z:-18},{x:-27.8,z:-20},{x:-27,z:-22}
   ],true);"""
if old_spring not in s: raise SystemExit('Clover spring marker not found')
if old_route not in s: raise SystemExit('Clover approach marker not found')
s=s.replace(old_spring,new_spring,1).replace(old_route,new_route,1)
p.write_text(s)
print('PASS17A_CLOVER_SEPARATION_OK')
