import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

const BASE='../assets/world-kit/kenney/platformer-kit/Models/GLB%20format/';

export function createAssetLibrary({mobile=false}={}){
  const loader=new GLTFLoader();
  const cache=new Map();

  function url(name){return BASE+encodeURIComponent(name).replace(/%2F/g,'/');}
  function load(name){
    if(!cache.has(name)) cache.set(name,loader.loadAsync(url(name)));
    return cache.get(name);
  }
  function tune(root,{animated=false}={}){
    root.traverse(o=>{
      if(!o.isMesh)return;
      o.castShadow=!mobile;
      o.receiveShadow=!animated;
      o.frustumCulled=true;
    });
    return root;
  }
  async function instantiateStatic(name,{x=0,z=0,topY=null,bottomY=null,targetXZ=6,rotationY=0,walkMeshes=null,parent=null}={}){
    const gltf=await load(name);
    const root=gltf.scene.clone(true);
    root.rotation.y=rotationY;
    root.updateMatrixWorld(true);
    let box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
    const horizontal=Math.max(size.x,size.z,.001);
    const s=targetXZ/horizontal;
    root.scale.setScalar(s);
    root.updateMatrixWorld(true);
    box=new THREE.Box3().setFromObject(root);
    const ctr=box.getCenter(new THREE.Vector3());
    root.position.x+=x-ctr.x;
    root.position.z+=z-ctr.z;
    if(topY!==null) root.position.y+=topY-box.max.y;
    else if(bottomY!==null) root.position.y+=bottomY-box.min.y;
    root.updateMatrixWorld(true);
    tune(root);
    (parent||null)?.add(root);
    box=new THREE.Box3().setFromObject(root);
    size=box.getSize(new THREE.Vector3());
    if(walkMeshes){root.traverse(o=>{if(o.isMesh)walkMeshes.push(o)});}
    return {root,box,size,name};
  }
  async function instantiateAnimated(name,{x=0,y=0,z=0,height=2.25,rotationY=0,parent=null}={}){
    const gltf=await load(name);
    const root=cloneSkeleton(gltf.scene);
    root.rotation.y=rotationY;
    root.updateMatrixWorld(true);
    let box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
    root.scale.multiplyScalar(height/Math.max(size.y,.001));
    root.updateMatrixWorld(true);
    box=new THREE.Box3().setFromObject(root);
    const ctr=box.getCenter(new THREE.Vector3());
    root.position.x+=x-ctr.x;
    root.position.z+=z-ctr.z;
    root.position.y+=y-box.min.y;
    root.updateMatrixWorld(true);
    tune(root,{animated:true});
    (parent||null)?.add(root);
    return {root,animations:gltf.animations||[],name};
  }
  async function prewarm(names){await Promise.all([...new Set(names)].map(load));}
  return {BASE,url,load,prewarm,instantiateStatic,instantiateAnimated};
}
