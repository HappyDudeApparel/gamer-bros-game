import * as THREE from 'three';
import { getPass18Asset } from './asset-catalog.js';

export function pass18DefaultTargetMax(assetId) {
  const asset = getPass18Asset(assetId);
  const byCategory = {
    Terrain: 8.0,
    Cliffs: 7.5,
    Structures: 5.5,
    Ruins: 5.5,
    'Water/River': 8.0,
    Nature: 2.8,
    Decor: 3.0,
    Gameplay: 2.6,
  };
  return byCategory[asset.category] || 3.5;
}

export function preparePass18Renderable(root, {
  castShadow = true,
  receiveShadow = true,
  anisotropy = null,
} = {}) {
  root.traverse(node => {
    if (!node.isMesh) return;
    node.castShadow = castShadow;
    node.receiveShadow = receiveShadow;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      if (material?.map && anisotropy) material.map.anisotropy = anisotropy;
    }
  });
  return root;
}

export function normalizePass18Asset(root, targetMax = 3) {
  root.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const max = Math.max(size.x, size.y, size.z) || 1;
  root.scale.multiplyScalar(Number(targetMax) / max);
  root.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.y -= box.min.y;
  root.position.z -= center.z;
  root.updateMatrixWorld(true);
  return root;
}

export function createPass18PlacementRoot(object, record, options = {}) {
  const root = new THREE.Group();
  root.name = `Pass18Placement-${record.id || record.asset}`;
  const targetMax = Number(record.targetMax || pass18DefaultTargetMax(record.asset));
  preparePass18Renderable(object, options);
  normalizePass18Asset(object, targetMax);
  root.add(object);
  root.position.fromArray(record.position || [0, 0, 0]);
  root.rotation.y = Number(record.rotationY || 0);
  const scale = Array.isArray(record.scale) ? record.scale : [1, 1, 1];
  root.scale.fromArray(scale);
  root.userData.pass18PlacementId = record.id || null;
  root.userData.pass18AssetId = record.asset;
  root.userData.pass18TargetMax = targetMax;
  root.userData.pass18Authoring = true;
  return root;
}

export function applyPass18PlacementRecord(root, record) {
  root.position.fromArray(record.position || [0, 0, 0]);
  root.rotation.set(0, Number(record.rotationY || 0), 0);
  root.scale.fromArray(Array.isArray(record.scale) ? record.scale : [1, 1, 1]);
  root.userData.pass18PlacementId = record.id || root.userData.pass18PlacementId || null;
  root.userData.pass18AssetId = record.asset || root.userData.pass18AssetId;
  root.userData.pass18TargetMax = Number(record.targetMax || root.userData.pass18TargetMax || 1);
  return root;
}

export function collectPass18Meshes(root, target = []) {
  root.traverse(node => { if (node.isMesh) target.push(node); });
  return target;
}
