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
old_shelves="""   await place('block-grass-overhang-large.glb',{x:-31,z:-49,topY:dShelf+.45,targetXZ:14});"""
new_shelves="""   await place('block-grass-overhang-large.glb',{x:-31,z:-49,topY:dShelf+.45,targetXZ:14});
   // Two real grass terraces descend from the high mastery shelf back to the continuous hillside.
   // Their top faces are visible, walkable, and overlap enough to avoid a gap or blind drop.
   await place('block-grass-large.glb',{x:-25,z:-47,topY:dShelf-.25,targetXZ:10});
   await place('block-grass-large.glb',{x:-20,z:-45,topY:dShelf-1.15,targetXZ:10});"""
old_rejoin="""   route([{x:-31,z:-49,y:dShelf+.45},{x:-20,z:-45},{x:-8,z:-42},{x:5,z:-40},{x:18,z:-39}],true);"""
new_rejoin="""   route([
    {x:-31,z:-49,y:dShelf+.45},{x:-25,z:-47,y:dShelf-.25},{x:-20,z:-45,y:dShelf-1.15},
    {x:-14,z:-44},{x:-8,z:-42},{x:-5,z:-41.7},{x:-2,z:-41.3},{x:1,z:-41},{x:4,z:-40.5},
    {x:7,z:-40},{x:10,z:-39.7},{x:13,z:-39.4},{x:16,z:-39.1},{x:18,z:-39}
   ],true);"""
for marker,label in [(old_spring,'spring'),(old_route,'approach'),(old_shelves,'shelves'),(old_rejoin,'rejoin')]:
    if marker not in s: raise SystemExit('Clover '+label+' marker not found')
s=s.replace(old_spring,new_spring,1).replace(old_route,new_route,1).replace(old_shelves,new_shelves,1).replace(old_rejoin,new_rejoin,1)
p.write_text(s)
print('PASS17A_CLOVER_SEPARATION_OK')
