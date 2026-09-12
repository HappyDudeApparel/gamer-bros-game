from pathlib import Path
p=Path(__file__).resolve().parents[1]/'pass17-world1'/'world.js'
s=p.read_text()
old="""   await place('platform-fortified.glb',{x:0,z:19,topY:bridgeY,targetXZ:26,rotationY:Math.PI/2});"""
new="""   // The fortified kit piece supplies the bridge silhouette. The visible stone deck is the real walkable surface
   // and slopes continuously from each bank to the centre instead of creating a hidden collision step.
   await decor('platform-fortified.glb',{x:0,z:19,topY:bridgeY,targetXZ:26,rotationY:Math.PI/2});
   const bridgeMat=new THREE.MeshStandardMaterial({color:0x8b9290,roughness:.92,metalness:0,side:THREE.DoubleSide});
   function addBridgeHalf(a,b,width,name){
     const dx=b.x-a.x,dz=b.z-a.z,len=Math.max(.001,Math.hypot(dx,dz)),nx=-dz/len*width*.5,nz=dx/len*width*.5;
     const geo=new THREE.BufferGeometry();
     geo.setAttribute('position',new THREE.Float32BufferAttribute([
       a.x+nx,a.y,a.z+nz, a.x-nx,a.y,a.z-nz,
       b.x+nx,b.y,b.z+nz, b.x-nx,b.y,b.z-nz
     ],3));
     geo.setIndex([0,1,2,2,1,3]);geo.computeVertexNormals();
     const mesh=new THREE.Mesh(geo,bridgeMat);mesh.receiveShadow=!mobile;mesh.name=name;root.add(mesh);walkMeshes.push(mesh);return mesh;
   }
   const leftBridgeY=terrainHeight(-12,20)+.06,rightBridgeY=terrainHeight(11,18)+.06;
   addBridgeHalf({x:-12,z:20,y:leftBridgeY},{x:0,z:19,y:bridgeY},7.5,'creek-crossing-stone-deck-left');
   addBridgeHalf({x:0,z:19,y:bridgeY},{x:11,z:18,y:rightBridgeY},7.5,'creek-crossing-stone-deck-right');"""
if old not in s: raise SystemExit('bridge marker not found')
p.write_text(s.replace(old,new,1))
print('PASS17A_BRIDGE_DECK_OK')
