import * as THREE from 'three';
const proto=THREE.Raycaster.prototype;
const original=proto.intersectObjects;
const cache=new Map();
proto.intersectObjects=function(objects,recursive=false,optionalTarget){
  const d=this.ray.direction,o=this.ray.origin;
  const isGround=Array.isArray(objects)&&d.y<-.995&&Math.abs(d.x)<.01&&Math.abs(d.z)<.01;
  if(!isGround)return original.call(this,objects,recursive,optionalTarget);
  const q=.65,qx=Math.round(o.x/q),qz=Math.round(o.z/q);
  const key=`${objects.length}:${qx}:${qz}`;
  const saved=cache.get(key);
  if(saved)return saved;
  const hits=original.call(this,objects,recursive,optionalTarget);
  cache.set(key,hits);
  if(cache.size>1800){const first=cache.keys().next().value;cache.delete(first);}
  window.__groundRayCache={entries:cache.size,last:key,hits:hits.length};
  return hits;
};
window.__groundRayCacheReady=true;
