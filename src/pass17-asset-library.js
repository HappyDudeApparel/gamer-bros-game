import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ROOTS={
 kenney:'../assets/world-kit/kenney/platformer-kit/Models/GLB%20format/',
 dungeon:'../assets/world-kit/kaykit/dungeon-remastered/addons/kaykit_dungeon_remastered/Assets/gltf/',
 platformerBlue:'../assets/world-kit/kaykit/platformer-pack/KayKit_Platformer_Pack_1.0_FREE/Assets/gltf/blue/',
 platformerGreen:'../assets/world-kit/kaykit/platformer-pack/KayKit_Platformer_Pack_1.0_FREE/Assets/gltf/green/',
 platformerNeutral:'../assets/world-kit/kaykit/platformer-pack/KayKit_Platformer_Pack_1.0_FREE/Assets/gltf/neutral/'
};

export function createAssetLibrary({mobile=false}={}){
 const loader=new GLTFLoader(),cache=new Map();
 function resolve(spec,name=null){
   if(name!==null)return{pack:spec,name};
   if(typeof spec==='object')return{pack:spec.pack||'kenney',name:spec.name};
   const i=String(spec).indexOf(':');if(i>0&&ROOTS[String(spec).slice(0,i)])return{pack:String(spec).slice(0,i),name:String(spec).slice(i+1)};
   return{pack:'kenney',name:String(spec)};
 }
 function url(spec,name=null){const r=resolve(spec,name),root=ROOTS[r.pack];if(!root)throw new Error('Unknown asset pack '+r.pack);return root+r.name.split('/').map(encodeURIComponent).join('/');}
 function load(spec,name=null){const r=resolve(spec,name),key=r.pack+':'+r.name;if(!cache.has(key))cache.set(key,loader.loadAsync(url(r.pack,r.name)));return cache.get(key)}
 function tune(root,{animated=false}={}){root.traverse(o=>{if(!o.isMesh)return;o.castShadow=!mobile;o.receiveShadow=!animated;o.frustumCulled=true});return root}
 async function instantiateStatic(spec,arg2={},arg3=null){
   let r,opts;if(typeof arg2==='string'){r=resolve(spec,arg2);opts=arg3||{}}else{r=resolve(spec);opts=arg2||{}};
   const {x=0,z=0,topY=null,bottomY=null,targetXZ=6,rotationY=0,rotationX=0,rotationZ=0,walkMeshes=null,parent=null}=opts;
   const gltf=await load(r),root=gltf.scene.clone(true);root.rotation.set(rotationX,rotationY,rotationZ);root.updateMatrixWorld(true);
   let box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),horizontal=Math.max(size.x,size.z,.001),s=targetXZ/horizontal;root.scale.setScalar(s);root.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(root);const ctr=box.getCenter(new THREE.Vector3());root.position.x+=x-ctr.x;root.position.z+=z-ctr.z;if(topY!==null)root.position.y+=topY-box.max.y;else if(bottomY!==null)root.position.y+=bottomY-box.min.y;root.updateMatrixWorld(true);tune(root);parent?.add(root);box=new THREE.Box3().setFromObject(root);size=box.getSize(new THREE.Vector3());if(walkMeshes)root.traverse(o=>{if(o.isMesh)walkMeshes.push(o)});root.userData.assetPack=r.pack;root.userData.assetName=r.name;return{root,box,size,name:r.name,pack:r.pack};
 }
 async function instantiateAnimated(spec,opts={}){
   const r=resolve(spec),{x=0,y=0,z=0,height=2.25,rotationY=0,parent=null}=opts,gltf=await load(r),root=gltf.scene;root.rotation.y=rotationY;root.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());root.scale.multiplyScalar(height/Math.max(size.y,.001));root.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(root);const ctr=box.getCenter(new THREE.Vector3());root.position.x+=x-ctr.x;root.position.z+=z-ctr.z;root.position.y+=y-box.min.y;root.updateMatrixWorld(true);tune(root,{animated:true});parent?.add(root);root.userData.assetPack=r.pack;root.userData.assetName=r.name;return{root,animations:gltf.animations||[],name:r.name,pack:r.pack};
 }
 async function prewarm(items){
   const unique=[...new Map(items.map(v=>{const r=resolve(v);return[r.pack+':'+r.name,r]})).values()];
   await Promise.all(unique.map(r=>load(r)));
 }
 return{ROOTS,url,load,prewarm,instantiateStatic,instantiateAnimated};
}
