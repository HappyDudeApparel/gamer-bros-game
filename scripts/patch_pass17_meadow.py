from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'pass17-world1'/'world.js'
s=p.read_text()

helper=r''' function addMeadowPath(){
   if(root.getObjectByName('portal-meadow-dirt-path'))return;
   const pts=[[-55,61],[-49,57],[-44,50],[-38,43],[-32,36],[-25,29],[-18,23],[-12,20]].map(([x,z])=>new THREE.Vector3(x,terrainHeight(x,z)+.045,z));
   const curve=new THREE.CatmullRomCurve3(pts,false,'centripetal'),positions=[],indices=[],steps=48,width=3.1;
   for(let i=0;i<=steps;i++){
     const t=i/steps,p=curve.getPoint(t),ta=curve.getTangent(t);ta.y=0;ta.normalize();
     const nx=-ta.z,nz=ta.x,gy=terrainHeight(p.x,p.z)+.055;
     positions.push(p.x+nx*width*.5,gy,p.z+nz*width*.5,p.x-nx*width*.5,gy,p.z-nz*width*.5);
   }
   for(let i=0;i<steps;i++){const a=i*2,b=a+1,c=a+2,d=a+3;indices.push(a,b,c,c,b,d)}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
   const mat=new THREE.MeshStandardMaterial({color:0xc79c5c,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
   const mesh=new THREE.Mesh(geo,mat);mesh.name='portal-meadow-dirt-path';mesh.receiveShadow=!mobile;root.add(mesh);scenery.push(mesh);
 }
 async function decoratePortalMeadow(){
   addMeadowPath();
   const flowers=[[-55,57],[-52,53],[-49,50],[-46,46],[-42,43],[-39,39],[-35,36],[-31,33],[-28,29],[-23,27],[-19,25],[-15,22]];
   for(let i=0;i<flowers.length;i++){
     const [x,z]=flowers[i],side=i%2?-1:1,fx=x+side*(2.0+(i%3)*.55),fz=z-side*.8,gy=groundAt(fx,fz);
     if(gy!==null)await decor('flowers.glb',{x:fx,z:fz,topY:gy+.025,targetXZ:1.15+(i%3)*.18,rotationY:(i*.73)%6.28});
   }
   for(const [x,z,size] of [[-57,51,2.2],[-47,39,1.7],[-34,30,1.8],[-22,22,1.6]]){
     const gy=groundAt(x,z);if(gy!==null)await decor('rocks.glb',{x,z,topY:gy+.02,targetXZ:size});
   }
   const sy=groundAt(-53,52);if(sy!==null)await decor('sign.glb',{x:-53,z:52,topY:sy+.03,targetXZ:2.35,rotationY:.55});
   window.__pass17PortalMeadowDressed=true;document.documentElement.dataset.meadowDressed='1';
 }
'''
marker=''' async function build(){\n'''
if 'function addMeadowPath()' not in s:
    if marker not in s: raise SystemExit('Pass 17 build marker missing')
    s=s.replace(marker,helper+marker,1)

old='''   await decorateConceptLandmarks();\n'''
new='''   await decorateConceptLandmarks();\n   await decoratePortalMeadow();\n'''
if new not in s:
    if old not in s: raise SystemExit('Pass 17 decorate landmarks marker missing')
    s=s.replace(old,new,1)

p.write_text(s)
print('PASS17_PORTAL_MEADOW_DRESSING_OK')
