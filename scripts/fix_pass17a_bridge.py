from pathlib import Path
p=Path(__file__).resolve().parents[1]/'pass17-world1'/'world.js'
s=p.read_text()
old="""   await place('platform-fortified.glb',{x:0,z:19,topY:bridgeY,targetXZ:26,rotationY:Math.PI/2});"""
new="""   // The fortified kit piece is visual structure; the stone deck itself is also the real walkable mesh.
   await decor('platform-fortified.glb',{x:0,z:19,topY:bridgeY,targetXZ:26,rotationY:Math.PI/2});
   const bridgeDeck=new THREE.Mesh(
     new THREE.BoxGeometry(25.5,.72,7.5),
     new THREE.MeshStandardMaterial({color:0x8b9290,roughness:.92,metalness:0})
   );
   bridgeDeck.position.set(0,bridgeY-.36,19);bridgeDeck.receiveShadow=!mobile;bridgeDeck.name='creek-crossing-stone-deck';root.add(bridgeDeck);walkMeshes.push(bridgeDeck);"""
if old not in s: raise SystemExit('bridge marker not found')
p.write_text(s.replace(old,new,1))
print('PASS17A_BRIDGE_DECK_OK')
