from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
w=root/'pass16-world1'/'world.js'
a=root/'pass16-world1'/'app.js'
s=w.read_text()

# Layer-aware ground system: underpasses and upper routes can share X/Z space.
s=s.replace(
"function groundAt(x,z){ray.set(new THREE.Vector3(x,120,z),down);const h=ray.intersectObjects(walkMeshes,false);return h.length?h[0].point.y:null}",
"function groundHits(x,z){ray.set(new THREE.Vector3(x,120,z),down);return ray.intersectObjects(walkMeshes,false).map(h=>h.point.y)}\n function groundAt(x,z,maxY=Infinity){const ys=groundHits(x,z);if(!ys.length)return null;if(!Number.isFinite(maxY))return ys[0];for(const y of ys)if(y<=maxY+.08)return y;return null}"
)
s=s.replace(
"function addRoute(a,b,opt=false){(opt?optionalSegments:routeSegments).push({a:{...a},b:{...b}})}",
"function addRoute(a,b,opt=false){const aa={...a},bb={...b};if(aa.y==null)aa.y=groundAt(aa.x,aa.z);if(bb.y==null)bb.y=groundAt(bb.x,bb.z);(opt?optionalSegments:routeSegments).push({a:aa,b:bb})}"
)

# Strengthen the opening meadow without turning it into a strip.
s=s.replace(
"await patch('block-grass-long.glb',-20,48,meadow,24);await patch('block-grass-curve.glb',-41,36,meadow,20);",
"await patch('block-grass-long.glb',-20,48,meadow,24);await patch('block-grass-large.glb',-24,41,meadow,18);await patch('block-grass-curve.glb',-41,36,meadow,20);"
)

riverworks="""  // C: Riverworks on east side, looking back across meadow.
  const worksTop=1.6;
  await patch('block-grass-large.glb',15,11,.8,13);
  await patch('block-grass-large.glb',19,8,1.15,13);
  await patch('block-grass-large.glb',22,5,worksTop,14);
  await patch('block-grass-large.glb',24,4,worksTop,22);
  addRoute({x:12,z:14,y:.8},{x:15,z:11,y:.8});
  addRoute({x:15,z:11,y:.8},{x:19,z:8,y:1.15});
  addRoute({x:19,z:8,y:1.15},{x:24,z:4,y:worksTop});
  await patch('block-grass-large.glb',30,-6,worksTop,17);
  await patch('block-grass-large.glb',31,-14,worksTop,17);
  await decor('platform-fortified.glb',{x:33,z:-8,topY:worksTop+.15,targetXZ:19});
  await patch('block-grass-large.glb',29,-22,worksTop,18);
  addRoute({x:24,z:4,y:worksTop},{x:30,z:-6,y:worksTop});
  addRoute({x:30,z:-6,y:worksTop},{x:31,z:-14,y:worksTop});
  addRoute({x:31,z:-14,y:worksTop},{x:29,z:-23,y:worksTop});
  // Riverworks rises into the cliff approach through broad real grass terraces.
  const c1=3.2;
  await patch('block-grass-large.glb',27,-28,worksTop,14);
  await patch('block-grass-large.glb',25,-32,2.0,14);
  await patch('block-grass-large.glb',22,-36,2.4,14);
  await patch('block-grass-large.glb',19,-40,2.8,14);
  await patch('block-grass-large.glb',16,-44,c1,15);
  await patch('block-grass-large.glb',15,-48,c1,20);
  addRoute({x:29,z:-23,y:worksTop},{x:27,z:-28,y:worksTop});
  addRoute({x:27,z:-28,y:worksTop},{x:25,z:-32,y:2.0});
  addRoute({x:25,z:-32,y:2.0},{x:22,z:-36,y:2.4});
  addRoute({x:22,z:-36,y:2.4},{x:19,z:-40,y:2.8});
  addRoute({x:19,z:-40,y:2.8},{x:15,z:-48,y:c1});
"""
s=re.sub(r"  // C: Riverworks.*?(?=  // D: Clover Cliffs)",riverworks,s,flags=re.S)

cliffs="""  // D: Clover Cliffs swing west around the ravine with real elevation.
  const c2=4.8,c3=6.0;
  await patch('block-grass-large.glb',10,-51,c1,15);
  await patch('block-grass-large.glb',6,-54,3.6,14);
  await patch('block-grass-large.glb',2,-57,4.0,14);
  await patch('block-grass-large.glb',-2,-60,4.4,14);
  await patch('block-grass-large.glb',-8,-63,c2,20);
  addRoute({x:15,z:-48,y:c1},{x:10,z:-51,y:c1});
  addRoute({x:10,z:-51,y:c1},{x:6,z:-54,y:3.6});
  addRoute({x:6,z:-54,y:3.6},{x:2,z:-57,y:4.0});
  addRoute({x:2,z:-57,y:4.0},{x:-2,z:-60,y:4.4});
  addRoute({x:-2,z:-60,y:4.4},{x:-8,z:-63,y:c2});
  await patch('block-grass-large.glb',-14,-62,c2,15);
  await patch('block-grass-large.glb',-18,-59,5.2,14);
  await patch('block-grass-large.glb',-23,-55,5.6,14);
  await patch('block-grass-large.glb',-28,-51,c3,15);
  await patch('block-grass-large.glb',-32,-47,c3,22);
  addRoute({x:-8,z:-63,y:c2},{x:-14,z:-62,y:c2});
  addRoute({x:-14,z:-62,y:c2},{x:-18,z:-59,y:5.2});
  addRoute({x:-18,z:-59,y:5.2},{x:-23,z:-55,y:5.6});
  addRoute({x:-23,z:-55,y:5.6},{x:-32,z:-47,y:c3});
"""
s=re.sub(r"  // D: Clover Cliffs.*?(?=  // Optional mastery shelves)",cliffs,s,flags=re.S)

ruins="""  // E: Ruin Courtyard occupies west/northwest, with broad fight space and two bypasses.
  await patch('block-grass-large.glb',-35,-43,6.3,15);
  await patch('block-grass-large.glb',-38,-38,6.7,15);
  await patch('block-grass-large.glb',-40,-33,ruin,16);
  await patch('block-grass-large.glb',-42,-30,ruin,25);
  await patch('block-grass-large.glb',-42,-10,ruin,25);
  await patch('block-grass-large.glb',-31,2,ruin,20);
  await decor('platform-fortified.glb',{x:-31,z:2,topY:ruin+.1,targetXZ:20});
  addRoute({x:-32,z:-47,y:c3},{x:-35,z:-43,y:6.3});
  addRoute({x:-35,z:-43,y:6.3},{x:-38,z:-38,y:6.7});
  addRoute({x:-38,z:-38,y:6.7},{x:-42,z:-30,y:ruin});
  addRoute({x:-42,z:-30,y:ruin},{x:-42,z:-10,y:ruin});
  addRoute({x:-42,z:-10,y:ruin},{x:-31,z:2,y:ruin});
"""
s=re.sub(r"  // E: Ruin Courtyard.*?(?=  // Lower bypass)",ruins,s,flags=re.S)

bypass="""  // Lower bypass returns near the bridge; upper mastery route drops into courtyard.
  await patch('block-grass-large.glb',-49,-29,7.2,13);
  await patch('block-grass-large.glb',-53,-25,6.9,13);
  await patch('block-grass-large.glb',-55,-20,6.6,14);
  await patch('block-grass-large.glb',-53,-14,6.9,13);
  await patch('block-grass-large.glb',-49,-8,ruin,14);
  addRoute({x:-46,z:-30,y:ruin},{x:-49,z:-29,y:7.2},true);
  addRoute({x:-49,z:-29,y:7.2},{x:-53,z:-25,y:6.9},true);
  addRoute({x:-53,z:-25,y:6.9},{x:-55,z:-20,y:6.6},true);
  addRoute({x:-55,z:-20,y:6.6},{x:-53,z:-14,y:6.9},true);
  addRoute({x:-53,z:-14,y:6.9},{x:-49,z:-8,y:ruin},true);
"""
s=re.sub(r"  // Lower bypass.*?(?=  // F: final ridge)",bypass,s,flags=re.S)

ridge="""  // F: final ridge rises behind the starting meadow, closing the spatial loop.
  const r1=8.8,r2=10.2;
  await patch('block-grass-large.glb',-28,7,ruin,15);
  await patch('block-grass-large.glb',-25,12,7.8,14);
  await patch('block-grass-large.glb',-22,17,8.2,14);
  await patch('block-grass-large.glb',-18,22,r1,15);
  await patch('block-grass-large.glb',-15,27,r1,20);
  addRoute({x:-31,z:2,y:ruin},{x:-28,z:7,y:ruin});
  addRoute({x:-28,z:7,y:ruin},{x:-25,z:12,y:7.8});
  addRoute({x:-25,z:12,y:7.8},{x:-22,z:17,y:8.2});
  addRoute({x:-22,z:17,y:8.2},{x:-15,z:27,y:r1});
  await patch('block-grass-large.glb',-10,31,r1,15);
  await patch('block-grass-large.glb',-6,36,9.2,14);
  await patch('block-grass-large.glb',-3,41,9.6,14);
  await patch('block-grass-large.glb',0,45,r2,15);
  await patch('block-grass-large.glb',4,50,r2,22);
  await patch('block-grass-large.glb',4,58,r2,24);
  await decor('platform-fortified.glb',{x:4,z:58,topY:r2+.08,targetXZ:24});
  addRoute({x:-15,z:27,y:r1},{x:-10,z:31,y:r1});
  addRoute({x:-10,z:31,y:r1},{x:-6,z:36,y:9.2});
  addRoute({x:-6,z:36,y:9.2},{x:-3,z:41,y:9.6});
  addRoute({x:-3,z:41,y:9.6},{x:0,z:45,y:r2});
  addRoute({x:0,z:45,y:r2},{x:4,z:58,y:r2});
"""
s=re.sub(r"  // F: final ridge.*?(?=  refreshBounds\(\);)",ridge,s,flags=re.S)

# Route probe follows the authored layer rather than the highest stacked mesh.
probe=""" function probe(segs){const failures=[];let samples=0;for(const seg of segs){const len=Math.hypot(seg.b.x-seg.a.x,seg.b.z-seg.a.z),n=Math.max(2,Math.ceil(len/.6));let prev=seg.a.y;for(let i=0;i<=n;i++){const t=i/n,x=THREE.MathUtils.lerp(seg.a.x,seg.b.x,t),z=THREE.MathUtils.lerp(seg.a.z,seg.b.z,t),target=THREE.MathUtils.lerp(seg.a.y??prev??0,seg.b.y??prev??0,t),ys=groundHits(x,z);samples++;if(!ys.length){failures.push({reason:'hole',x,z});continue}let yy=ys[0],best=Math.abs(yy-target);for(const y of ys){const d=Math.abs(y-target);if(d<best){best=d;yy=y}}if(best>1.1){failures.push({reason:'wrong-layer',x,z,target,to:yy});prev=yy;continue}if(prev!==null&&Math.abs(yy-prev)>.95)failures.push({reason:'step',x,z,from:prev,to:yy});prev=yy}}return {ok:failures.length===0,samples,failures:failures.slice(0,18)}}\n"""
s=re.sub(r" function probe\(segs\)\{.*?(?= function validateRoutes\(\))",probe,s,flags=re.S)
w.write_text(s)

# Player collision also follows the surface at or just below the player's current height.
s=a.read_text()
s=s.replace("player.y=(world.groundAt(p.x,p.z)??p.y)+.04","player.y=(world.groundAt(p.x,p.z,p.y+1.5)??p.y)+.04")
s=s.replace("ch=world.groundAt(player.x,player.z),nh=world.groundAt(nx,nz)","ch=world.groundAt(player.x,player.z,player.y+STEP+.35),nh=world.groundAt(nx,nz,player.y+STEP+.35)")
s=s.replace("const g=world.groundAt(player.x,player.z);if(g!==null", "const g=world.groundAt(player.x,player.z,player.y+.18);if(g!==null")
a.write_text(s)
print('PASS16_WORLD_V2_OK')
