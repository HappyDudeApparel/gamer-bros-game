from pathlib import Path
root=Path(__file__).resolve().parents[1]
w=root/'pass16-world1'/'world.js'; a=root/'pass16-world1'/'app.js'
s=w.read_text()
s=s.replace("function groundAt(x,z){ray.set(new THREE.Vector3(x,120,z),down);const h=ray.intersectObjects(walkMeshes,false);return h.length?h[0].point.y:null}","function groundHits(x,z){ray.set(new THREE.Vector3(x,120,z),down);return ray.intersectObjects(walkMeshes,false).map(h=>h.point.y)}\n function groundAt(x,z,maxY=Infinity){const ys=groundHits(x,z);if(!ys.length)return null;if(!Number.isFinite(maxY))return ys[0];for(const y of ys)if(y<=maxY+.08)return y;return null}")
s=s.replace("function addRoute(a,b,opt=false){(opt?optionalSegments:routeSegments).push({a:{...a},b:{...b}})}","function addRoute(a,b,opt=false){const aa={...a},bb={...b};if(aa.y==null)aa.y=groundAt(aa.x,aa.z);if(bb.y==null)bb.y=groundAt(bb.x,bb.z);(opt?optionalSegments:routeSegments).push({a:aa,b:bb})}")
s=s.replace("await patch('block-grass-long.glb',-20,48,meadow,24);await patch('block-grass-curve.glb',-41,36,meadow,20);","await patch('block-grass-long.glb',-20,48,meadow,24);await patch('block-grass-large.glb',-24,41,meadow,18);await patch('block-grass-curve.glb',-41,36,meadow,20);")
start=s.index(' function probe(segs){')
end=s.index(' function validateRoutes()',start)
probe=""" function probe(segs){const failures=[];let samples=0;for(const seg of segs){const len=Math.hypot(seg.b.x-seg.a.x,seg.b.z-seg.a.z),n=Math.max(2,Math.ceil(len/.6));let prev=seg.a.y;for(let i=0;i<=n;i++){const t=i/n,x=THREE.MathUtils.lerp(seg.a.x,seg.b.x,t),z=THREE.MathUtils.lerp(seg.a.z,seg.b.z,t),target=THREE.MathUtils.lerp(seg.a.y??prev??0,seg.b.y??prev??0,t),ys=groundHits(x,z);samples++;if(!ys.length){failures.push({reason:'hole',x,z});continue}let yy=ys[0],best=Math.abs(yy-target);for(const y of ys){const d=Math.abs(y-target);if(d<best){best=d;yy=y}}if(best>1.1){failures.push({reason:'wrong-layer',x,z,target,to:yy});prev=yy;continue}if(prev!==null&&Math.abs(yy-prev)>.95)failures.push({reason:'step',x,z,from:prev,to:yy});prev=yy}}return {ok:failures.length===0,samples,failures:failures.slice(0,18)}}\n"""
s=s[:start]+probe+s[end:]
w.write_text(s)

s=a.read_text()
s=s.replace("player.y=(world.groundAt(p.x,p.z)??p.y)+.04","player.y=(world.groundAt(p.x,p.z,p.y+1.5)??p.y)+.04")
s=s.replace("ch=world.groundAt(player.x,player.z),nh=world.groundAt(nx,nz)","ch=world.groundAt(player.x,player.z,player.y+STEP+.35),nh=world.groundAt(nx,nz,player.y+STEP+.35)")
s=s.replace("const g=world.groundAt(player.x,player.z);if(g!==null", "const g=world.groundAt(player.x,player.z,player.y+.18);if(g!==null")
a.write_text(s)
print('PASS16_LAYERED_GROUND_OK')
