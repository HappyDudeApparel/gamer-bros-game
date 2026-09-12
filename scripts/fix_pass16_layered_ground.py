from pathlib import Path
root=Path(__file__).resolve().parents[1]
w=root/'pass16-world1'/'world.js'; a=root/'pass16-world1'/'app.js'
s=w.read_text()

s=s.replace("function groundAt(x,z){ray.set(new THREE.Vector3(x,120,z),down);const h=ray.intersectObjects(walkMeshes,false);return h.length?h[0].point.y:null}","function groundHits(x,z){ray.set(new THREE.Vector3(x,120,z),down);return ray.intersectObjects(walkMeshes,false).map(h=>h.point.y)}\n function groundAt(x,z,maxY=Infinity){const ys=groundHits(x,z);if(!ys.length)return null;if(!Number.isFinite(maxY))return ys[0];for(const y of ys)if(y<=maxY+.08)return y;return null}")
s=s.replace("function addRoute(a,b,opt=false){(opt?optionalSegments:routeSegments).push({a:{...a},b:{...b}})}","function addRoute(a,b,opt=false){const aa={...a},bb={...b};if(aa.y==null)aa.y=groundAt(aa.x,aa.z);if(bb.y==null)bb.y=groundAt(bb.x,bb.z);(opt?optionalSegments:routeSegments).push({a:aa,b:bb})}")

# Opening meadow stays broad even where the final ridge later overlaps in plan view.
s=s.replace("await patch('block-grass-long.glb',-20,48,meadow,24);await patch('block-grass-curve.glb',-41,36,meadow,20);","await patch('block-grass-long.glb',-20,48,meadow,24);await patch('block-grass-large.glb',-24,41,meadow,18);await patch('block-grass-curve.glb',-41,36,meadow,20);")

# Riverworks: broad real terrain terraces, fortified platform used as visible structure rather than a fragile mandatory collision seam.
old="await patch('block-grass-large.glb',24,4,works,22);await patch('platform-fortified.glb',33,-8,works+.15,18);await patch('block-grass-long.glb',29,-23,works,22);addRoute({x:12,z:14},{x:24,z:4});addRoute({x:24,z:4},{x:33,z:-8});addRoute({x:33,z:-8},{x:29,z:-23});\n  const c1=await ramp('block-grass-large-slope.glb',{x:29,z:-27},{x:18,z:-43},works,{span:21});await patch('block-grass-large.glb',15,-48,c1,22);"
new="const worksTop=1.6;await patch('block-grass-large.glb',15,11,.8,13);await patch('block-grass-large.glb',19,8,1.15,13);await patch('block-grass-large.glb',22,5,worksTop,14);await patch('block-grass-large.glb',24,4,worksTop,22);addRoute({x:12,z:14,y:.8},{x:15,z:11,y:.8});addRoute({x:15,z:11,y:.8},{x:19,z:8,y:1.15});addRoute({x:19,z:8,y:1.15},{x:24,z:4,y:worksTop});await patch('block-grass-large.glb',30,-6,worksTop,17);await patch('block-grass-large.glb',31,-14,worksTop,17);await decor('platform-fortified.glb',{x:33,z:-8,topY:worksTop+.15,targetXZ:19});await patch('block-grass-large.glb',29,-22,worksTop,18);addRoute({x:24,z:4,y:worksTop},{x:30,z:-6,y:worksTop});addRoute({x:30,z:-6,y:worksTop},{x:31,z:-14,y:worksTop});addRoute({x:31,z:-14,y:worksTop},{x:29,z:-23,y:worksTop});\n  const c1=await ramp('block-grass-large-slope.glb',{x:29,z:-27},{x:18,z:-43},worksTop,{span:21});await patch('block-grass-large.glb',15,-48,c1,22);"
s=s.replace(old,new)
prior="const worksTop=await ramp('block-grass-large-slope.glb',{x:12,z:14},{x:23,z:4},creek,{span:18});await patch('block-grass-large.glb',24,4,worksTop,22);await patch('block-grass-long.glb',31,-10,worksTop,22);await decor('platform-fortified.glb',{x:33,z:-8,topY:worksTop+.15,targetXZ:19});await patch('block-grass-long.glb',29,-23,worksTop,22);addRoute({x:23,z:4},{x:33,z:-8});addRoute({x:33,z:-8},{x:29,z:-23});\n  const c1=await ramp('block-grass-large-slope.glb',{x:29,z:-27},{x:18,z:-43},worksTop,{span:21});await patch('block-grass-large.glb',15,-48,c1,22);"
s=s.replace(prior,new)

# Riverworks descent into Clover Cliffs: readable broad terraces rather than an arbitrarily rotated slope.
c1old="const c1=await ramp('block-grass-large-slope.glb',{x:29,z:-27},{x:18,z:-43},worksTop,{span:21});await patch('block-grass-large.glb',15,-48,c1,22);addRoute({x:29,z:-23},{x:29,z:-27});addRoute({x:18,z:-43},{x:15,z:-48});"
c1new="const c1=3.2;await patch('block-grass-large.glb',27,-28,1.6,14);await patch('block-grass-large.glb',25,-32,2.0,14);await patch('block-grass-large.glb',22,-36,2.4,14);await patch('block-grass-large.glb',19,-40,2.8,14);await patch('block-grass-large.glb',16,-44,c1,15);await patch('block-grass-large.glb',15,-48,c1,20);addRoute({x:29,z:-23,y:1.6},{x:27,z:-28,y:1.6});addRoute({x:27,z:-28,y:1.6},{x:25,z:-32,y:2.0});addRoute({x:25,z:-32,y:2.0},{x:22,z:-36,y:2.4});addRoute({x:22,z:-36,y:2.4},{x:19,z:-40,y:2.8});addRoute({x:19,z:-40,y:2.8},{x:15,z:-48,y:c1});"
s=s.replace(c1old,c1new)

# Clover Cliffs deliberately gains height while curling west around the ravine.
dold="const c2=await ramp('block-grass-large-slope.glb',{x:10,z:-51},{x:-4,z:-61},c1,{span:20});await patch('block-grass-large.glb',-8,-63,c2,20);const c3=await ramp('block-grass-large-slope.glb',{x:-14,z:-62},{x:-28,z:-51},c2,{span:20});await patch('block-grass-large.glb',-32,-47,c3,22);addRoute({x:15,z:-48},{x:10,z:-51});addRoute({x:-4,z:-61},{x:-14,z:-62});addRoute({x:-28,z:-51},{x:-32,z:-47});"
dnew="const c2=4.8,c3=6.0;await patch('block-grass-large.glb',10,-51,c1,15);await patch('block-grass-large.glb',6,-54,3.6,14);await patch('block-grass-large.glb',2,-57,4.0,14);await patch('block-grass-large.glb',-2,-60,4.4,14);await patch('block-grass-large.glb',-8,-63,c2,20);addRoute({x:15,z:-48,y:c1},{x:10,z:-51,y:c1});addRoute({x:10,z:-51,y:c1},{x:6,z:-54,y:3.6});addRoute({x:6,z:-54,y:3.6},{x:2,z:-57,y:4.0});addRoute({x:2,z:-57,y:4.0},{x:-2,z:-60,y:4.4});addRoute({x:-2,z:-60,y:4.4},{x:-8,z:-63,y:c2});await patch('block-grass-large.glb',-14,-62,c2,15);await patch('block-grass-large.glb',-18,-59,5.2,14);await patch('block-grass-large.glb',-23,-55,5.6,14);await patch('block-grass-large.glb',-28,-51,c3,15);await patch('block-grass-large.glb',-32,-47,c3,22);addRoute({x:-8,z:-63,y:c2},{x:-14,z:-62,y:c2});addRoute({x:-14,z:-62,y:c2},{x:-18,z:-59,y:5.2});addRoute({x:-18,z:-59,y:5.2},{x:-23,z:-55,y:5.6});addRoute({x:-23,z:-55,y:5.6},{x:-32,z:-47,y:c3});"
s=s.replace(dold,dnew)

# Ruin Courtyard handoff and floor: keep the encounter broad and continuous, with the fortified piece as architecture.
eold="await patch('block-grass-large.glb',-42,-30,ruin,25);await patch('block-grass-large.glb',-42,-10,ruin,25);await patch('platform-fortified.glb',-31,2,ruin+.1,20);addRoute({x:-32,z:-47},{x:-42,z:-30});addRoute({x:-42,z:-30},{x:-42,z:-10});addRoute({x:-42,z:-10},{x:-31,z:2});"\ enew="await patch('block-grass-large.glb',-35,-43,6.3,15);await patch('block-grass-large.glb',-38,-38,6.7,15);await patch('block-grass-large.glb',-40,-33,ruin,16);await patch('block-grass-large.glb',-42,-30,ruin,25);await patch('block-grass-large.glb',-42,-10,ruin,25);await patch('block-grass-large.glb',-31,2,ruin,20);await decor('platform-fortified.glb',{x:-31,z:2,topY:ruin+.1,targetXZ:20});addRoute({x:-32,z:-47,y:c3},{x:-35,z:-43,y:6.3});addRoute({x:-35,z:-43,y:6.3},{x:-38,z:-38,y:6.7});addRoute({x:-38,z:-38,y:6.7},{x:-42,z:-30,y:ruin});addRoute({x:-42,z:-30,y:ruin},{x:-42,z:-10,y:ruin});addRoute({x:-42,z:-10,y:ruin},{x:-31,z:2,y:ruin});"
s=s.replace(eold,enew)

# Prism Ridge closes the loop above the opening meadow with stepped, broad terrain and a grass floor under the portal court.
fold="const r1=await ramp('block-grass-large-slope.glb',{x:-28,z:7},{x:-18,z:22},ruin,{span:20});await patch('block-grass-large.glb',-15,27,r1,20);const r2=await ramp('block-grass-large-slope.glb',{x:-10,z:31},{x:0,z:45},r1,{span:19});await patch('block-grass-large.glb',4,50,r2,22);await patch('platform-fortified.glb',4,58,r2+.08,24);addRoute({x:-31,z:2},{x:-28,z:7});addRoute({x:-18,z:22},{x:-15,z:27});addRoute({x:-10,z:31},{x:0,z:45});addRoute({x:0,z:45},{x:4,z:58});"
fnew="const r1=8.8,r2=10.2;await patch('block-grass-large.glb',-28,7,ruin,15);await patch('block-grass-large.glb',-25,12,7.8,14);await patch('block-grass-large.glb',-22,17,8.2,14);await patch('block-grass-large.glb',-18,22,r1,15);await patch('block-grass-large.glb',-15,27,r1,20);addRoute({x:-31,z:2,y:ruin},{x:-28,z:7,y:ruin});addRoute({x:-28,z:7,y:ruin},{x:-25,z:12,y:7.8});addRoute({x:-25,z:12,y:7.8},{x:-22,z:17,y:8.2});addRoute({x:-22,z:17,y:8.2},{x:-15,z:27,y:r1});await patch('block-grass-large.glb',-10,31,r1,15);await patch('block-grass-large.glb',-6,36,9.2,14);await patch('block-grass-large.glb',-3,41,9.6,14);await patch('block-grass-large.glb',0,45,r2,15);await patch('block-grass-large.glb',4,50,r2,22);await patch('block-grass-large.glb',4,58,r2,24);await decor('platform-fortified.glb',{x:4,z:58,topY:r2+.08,targetXZ:24});addRoute({x:-15,z:27,y:r1},{x:-10,z:31,y:r1});addRoute({x:-10,z:31,y:r1},{x:-6,z:36,y:9.2});addRoute({x:-6,z:36,y:9.2},{x:-3,z:41,y:9.6});addRoute({x:-3,z:41,y:9.6},{x:0,z:45,y:r2});addRoute({x:0,z:45,y:r2},{x:4,z:58,y:r2});"
s=s.replace(fold,fnew)

# Validate the intended layer, not whichever stacked surface happens to be highest.
start=s.index(' function probe(segs){')
end=s.index(' function validateRoutes()',start)
probe=""" function probe(segs){const failures=[];let samples=0;for(const seg of segs){const len=Math.hypot(seg.b.x-seg.a.x,seg.b.z-seg.a.z),n=Math.max(2,Math.ceil(len/.6));let prev=seg.a.y;for(let i=0;i<=n;i++){const t=i/n,x=THREE.MathUtils.lerp(seg.a.x,seg.b.x,t),z=THREE.MathUtils.lerp(seg.a.z,seg.b.z,t),target=THREE.MathUtils.lerp(seg.a.y??prev??0,seg.b.y??prev??0,t),ys=groundHits(x,z);samples++;if(!ys.length){failures.push({reason:'hole',x,z});continue}let yy=ys[0],best=Math.abs(yy-target);for(const y of ys){const d=Math.abs(y-target);if(d<best){best=d;yy=y}}if(best>1.1){failures.push({reason:'wrong-layer',x,z,target,to:yy});prev=yy;continue}if(prev!==null&&Math.abs(yy-prev)>.95)failures.push({reason:'step',x,z,from:prev,to:yy});prev=yy}}return {ok:failures.length===0,samples,failures:failures.slice(0,18)}}\n"""
s=s[:start]+probe+s[end:]
w.write_text(s)

# Player ground selection follows the layer at/under the player's feet.
s=a.read_text()
s=s.replace("player.y=(world.groundAt(p.x,p.z)??p.y)+.04","player.y=(world.groundAt(p.x,p.z,p.y+1.5)??p.y)+.04")
s=s.replace("ch=world.groundAt(player.x,player.z),nh=world.groundAt(nx,nz)","ch=world.groundAt(player.x,player.z,player.y+STEP+.35),nh=world.groundAt(nx,nz,player.y+STEP+.35)")
s=s.replace("const g=world.groundAt(player.x,player.z);if(g!==null", "const g=world.groundAt(player.x,player.z,player.y+.18);if(g!==null")
a.write_text(s)
print('PASS16_LAYERED_GROUND_OK')
