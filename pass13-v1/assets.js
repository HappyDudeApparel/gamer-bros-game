import * as THREE from 'three';

export function createAssetStreamer({ artRoot, mobile, elev, refreshBounds }) {
  let loaderPromise = null;
  const cache = new Map();
  async function getLoader(){ if(!loaderPromise)loaderPromise=import('three/addons/loaders/GLTFLoader.js').then(m=>new m.GLTFLoader()); return loaderPromise; }
  async function loadTemplate(url){ if(cache.has(url))return cache.get(url); const p=getLoader().then(l=>l.loadAsync(url)).then(g=>g.scene);cache.set(url,p);return p; }
  async function place(url,{x,z,y=null,height=null,width=null,scale=1,ry=0,name='world-art'}={}){
    try{
      const src=await loadTemplate(url),root=src.clone(true);root.name=name;
      root.traverse(o=>{if(o.isMesh){o.castShadow=!mobile;o.receiveShadow=true;o.frustumCulled=true;}});
      root.updateMatrixWorld(true);const b0=new THREE.Box3().setFromObject(root),s0=b0.getSize(new THREE.Vector3());let f=scale;
      if(height)f*=height/Math.max(.001,s0.y);else if(width)f*=width/Math.max(.001,Math.max(s0.x,s0.z));
      root.scale.multiplyScalar(f);root.rotation.y=ry;root.position.set(x,0,z);root.updateMatrixWorld(true);const b1=new THREE.Box3().setFromObject(root);
      root.position.y+=(y==null?elev(z):y)-b1.min.y;artRoot.add(root);return root;
    }catch(err){console.warn('[Pass13 asset skipped]',url,err);return null;}
  }
  async function stream(){
    window.__artStreamingStarted=true;
    const A='../assets/world-kit/',city=A+'kenney/city-builder/models/',kp=A+'kenney/platformer-kit/Models/GLB format/',kay=A+'kaykit/platformer-pack/KayKit_Platformer_Pack_1.0_FREE/Assets/gltf/neutral/';
    const items=[
      [city+'building-small-a.glb',{x:-14,z:-8,height:18,ry:.14,name:'village-landmark'}],[city+'building-small-c.glb',{x:17,z:-18,height:17,ry:-.08,name:'village-landmark'}],[city+'building-small-d.glb',{x:-15,z:-30,height:16,ry:.1,name:'village-landmark'}],
      [city+'pavement-fountain.glb',{x:7,z:-8,width:4.5,name:'village-fountain'}],[city+'grass-trees.glb',{x:-28,z:18,height:7,ry:.4,name:'tree-cluster'}],[city+'grass-trees.glb',{x:30,z:-6,height:7,ry:-.3,name:'tree-cluster'}],[city+'grass-trees.glb',{x:-32,z:-57,height:7,ry:.5,name:'tree-cluster'}],[city+'grass-trees.glb',{x:34,z:-98,height:7,ry:.1,name:'tree-cluster'}],
      [kp+'chest.glb',{x:-25,z:-1,y:elev(-1)+2.8,height:1.4,ry:.3,name:'lookout-chest'}],[kp+'chest.glb',{x:-24,z:-18,y:elev(-18)+3.75,height:1.4,ry:-.2,name:'village-chest'}],[kp+'chest.glb',{x:-10,z:-127,y:elev(-127)+3.25,height:1.4,ry:.2,name:'ruin-chest'}],
      [kp+'spring.glb',{x:27,z:-44,y:elev(-44)+1.12,width:2.4,name:'river-spring'}],[kp+'pipe.glb',{x:29,z:-51,y:elev(-51)+1.25,width:4.8,ry:Math.PI/2,name:'river-pipe'}],[kp+'crate-strong.glb',{x:22,z:-38,y:elev(-38)+.8,height:1.5,ry:.2,name:'river-crate'}],[kp+'flag.glb',{x:-29,z:-80,y:elev(-80)+4.3,height:3.3,name:'ridge-flag'}],
      [kay+'arch_tall_neutral.gltf',{x:4,z:-106,y:elev(-106)+.3,height:6.2,name:'ruin-arch'}],[kay+'arch_tall_neutral.gltf',{x:-12,z:-114,y:elev(-114)+.3,height:5.6,ry:.1,name:'ruin-arch'}],[kay+'arch_tall_neutral.gltf',{x:16,z:-115,y:elev(-115)+.3,height:5.6,ry:-.12,name:'ruin-arch'}],[kay+'arch_tall_neutral.gltf',{x:-10,z:-127,y:elev(-127)+.3,height:5.8,ry:.15,name:'ruin-arch'}],[kay+'arch_tall_neutral.gltf',{x:13,z:-130,y:elev(-130)+.3,height:5.8,ry:-.15,name:'ruin-arch'}],
      [kay+'arch_tall_neutral.gltf',{x:-7,z:-158,y:elev(-158)+.2,height:7,ry:.1,name:'shrine-arch'}],[kay+'arch_tall_neutral.gltf',{x:7,z:-158,y:elev(-158)+.2,height:7,ry:-.1,name:'shrine-arch'}],[kay+'flag_A_neutral.gltf',{x:-6,z:-151,y:elev(-151)+1.25,height:3.3,name:'shrine-flag'}],[kay+'flag_A_neutral.gltf',{x:6,z:-151,y:elev(-151)+1.25,height:3.3,name:'shrine-flag'}]
    ];
    const batchSize=mobile?2:5;
    for(let i=0;i<items.length;i+=batchSize){await Promise.allSettled(items.slice(i,i+batchSize).map(([url,o])=>place(url,o)));if(mobile)await new Promise(r=>setTimeout(r,100));}
    refreshBounds();window.__artStreamingComplete=true;
  }
  return { stream };
}
