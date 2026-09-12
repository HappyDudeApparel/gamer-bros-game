import * as THREE from 'three';

const PIPE=0x526a7b,COLLAR=0x263a49,SUPPORT=0x5f4936,RAIL=0xd69a43;

function mat(color,metalness=.55,roughness=.34){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
const pipeMat=mat(PIPE,.66,.28),collarMat=mat(COLLAR,.74,.22),supportMat=mat(SUPPORT,.15,.72),railMat=mat(RAIL,.35,.48);
const Y=new THREE.Vector3(0,1,0);

function cylinderBetween(a,b,radius,material=pipeMat,segments=20){
 const dir=new THREE.Vector3().subVectors(b,a),len=dir.length(),mid=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,len,segments,1,false),material);
 mesh.position.copy(mid);mesh.quaternion.setFromUnitVectors(Y,dir.normalize());mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
function collarAt(point,axis,radius=.95,width=.28){
 const a=point.clone().addScaledVector(axis,-width*.5),b=point.clone().addScaledVector(axis,width*.5);
 return cylinderBetween(a,b,radius,collarMat,20);
}
export function createStraightPipe({start,end,radius=.72,collars=true}={}){
 const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),axis=new THREE.Vector3().subVectors(b,a).normalize(),g=new THREE.Group();g.name='riverworks-pipe-straight';g.add(cylinderBetween(a,b,radius));
 if(collars){g.add(collarAt(a,axis,radius*1.18),collarAt(b,axis,radius*1.18));}return g;
}
export function createElbowPipe({start,corner,end,radius=.72}={}){
 const a=new THREE.Vector3(...start),c=new THREE.Vector3(...corner),b=new THREE.Vector3(...end),curve=new THREE.QuadraticBezierCurve3(a,c,b),tube=new THREE.Mesh(new THREE.TubeGeometry(curve,18,radius,16,false),pipeMat);tube.castShadow=true;tube.receiveShadow=true;
 const g=new THREE.Group();g.name='riverworks-pipe-elbow';g.add(tube);
 const ta=curve.getTangent(0).normalize(),tb=curve.getTangent(1).normalize();g.add(collarAt(a,ta,radius*1.18),collarAt(b,tb,radius*1.18));return g;
}
export function createTJunction({center=[0,0,0],mainLength=6,branchLength=4,radius=.72,yaw=0}={}){
 const g=new THREE.Group();g.name='riverworks-pipe-t';
 g.add(createStraightPipe({start:[-mainLength/2,0,0],end:[mainLength/2,0,0],radius}));
 g.add(createStraightPipe({start:[0,0,0],end:[0,branchLength,0],radius}));
 g.position.set(...center);g.rotation.y=yaw;return g;
}
export function createPipeSupport({position=[0,0,0],height=3,width=2.5}={}){
 const g=new THREE.Group();g.name='riverworks-pipe-support';g.position.set(...position);
 const postGeo=new THREE.BoxGeometry(.28,height,.28),beamGeo=new THREE.BoxGeometry(width,.28,.32);
 for(const x of [-width*.38,width*.38]){const m=new THREE.Mesh(postGeo,supportMat);m.position.set(x,height*.5,0);m.castShadow=true;m.receiveShadow=true;g.add(m)}
 const beam=new THREE.Mesh(beamGeo,supportMat);beam.position.y=height;beam.castShadow=true;beam.receiveShadow=true;g.add(beam);return g;
}
export function createWalkway({length=8,width=3,railHeight=1.1}={}){
 const g=new THREE.Group();g.name='riverworks-walkway';const deck=new THREE.Mesh(new THREE.BoxGeometry(length,.28,width),supportMat);deck.receiveShadow=true;deck.castShadow=true;g.add(deck);
 const railGeo=new THREE.CylinderGeometry(.08,.08,length,8);railGeo.rotateZ(Math.PI/2);
 for(const z of [-width*.48,width*.48]){const rail=new THREE.Mesh(railGeo,railMat);rail.position.set(0,railHeight,z);g.add(rail);for(const x of [-length*.45,-length*.15,length*.15,length*.45]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,railHeight,8),railMat);p.position.set(x,railHeight*.5,z);g.add(p)}}
 return g;
}
export function markWalkable(group,walkMeshes){group.traverse(o=>{if(o.isMesh)walkMeshes.push(o)});return group;}
