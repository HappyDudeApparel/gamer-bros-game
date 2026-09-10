import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// The shared starter FBX is authored Z-up. Assimp preserves that orientation when it
// converts to GLB, while Gamer Bros gameplay is Y-up. Normalize only this imported
// world before Pass 6 measures it, chooses spawn points, or builds raycast collision.
const originalLoadAsync=GLTFLoader.prototype.loadAsync;
GLTFLoader.prototype.loadAsync=async function(url,onProgress){
  const gltf=await originalLoadAsync.call(this,url,onProgress);
  if(String(url).includes('tutorial-starter-level.glb')&&!gltf.scene.userData.gamerBrosYUp){
    gltf.scene.rotation.x=-Math.PI/2;
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.userData.gamerBrosYUp=true;
    window.__leapLandOrientationFixed=true;
  }
  return gltf;
};
