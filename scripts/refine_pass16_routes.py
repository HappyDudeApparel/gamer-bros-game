from pathlib import Path
p=Path(__file__).resolve().parents[1]/'pass16-world1'/'world.js'
s=p.read_text()
old="""  await patch('block-grass-large.glb',-35,-43,6.3,15);
  await patch('block-grass-large.glb',-38,-38,6.7,15);
  await patch('block-grass-large.glb',-40,-33,ruin,16);
  await patch('block-grass-large.glb',-42,-30,ruin,25);
"""
new="""  await patch('block-grass-large.glb',-35,-43,6.2,18);
  await patch('block-grass-large.glb',-38,-39,6.6,20);
  await patch('block-grass-large.glb',-40,-35,7.0,18);
  await patch('block-grass-large.glb',-42,-30,ruin,25);
"""
s=s.replace(old,new)
old_routes="""  addRoute({x:-32,z:-47,y:c3},{x:-35,z:-43,y:6.3});
  addRoute({x:-35,z:-43,y:6.3},{x:-38,z:-38,y:6.7});
  addRoute({x:-38,z:-38,y:6.7},{x:-42,z:-30,y:ruin});
"""
new_routes="""  addRoute({x:-32,z:-47,y:c3},{x:-35,z:-43,y:6.2});
  addRoute({x:-35,z:-43,y:6.2},{x:-38,z:-39,y:6.6});
  addRoute({x:-38,z:-39,y:6.6},{x:-40,z:-35,y:7.0});
  addRoute({x:-40,z:-35,y:7.0},{x:-42,z:-30,y:ruin});
"""
s=s.replace(old_routes,new_routes)
p.write_text(s)
print('PASS16_ROUTE_REFINEMENT_OK')
