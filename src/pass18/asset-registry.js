import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getPass18Asset, pass18AssetUrl } from './asset-catalog.js';

function firstMesh(root) {
  let found = null;
  root.traverse(node => { if (!found && node.isMesh) found = node; });
  return found;
}

function prepareRenderable(root, { castShadow = true, receiveShadow = true } = {}) {
  root.traverse(node => {
    if (!node.isMesh) return;
    node.castShadow = castShadow;
    node.receiveShadow = receiveShadow;
  });
  return root;
}

export class Pass18AssetRegistry {
  constructor({ loader = new GLTFLoader() } = {}) {
    this.loader = loader;
    this.sources = new Map();
    this.partsCache = new Map();
    this.metrics = {
      sourceLoads: 0,
      cacheHits: 0,
      placements: 0,
      instancedInstances: 0,
      staticBatchInstances: 0,
      staticBatches: 0,
      failures: []
    };
  }

  async source(id) {
    getPass18Asset(id); // fail early on catalog errors
    if (this.sources.has(id)) {
      this.metrics.cacheHits += 1;
      return this.sources.get(id);
    }
    const url = pass18AssetUrl(id);
    this.metrics.sourceLoads += 1;
    const promise = new Promise((resolve, reject) => {
      this.loader.load(url, gltf => resolve(gltf.scene), undefined, error => reject(error));
    }).catch(error => {
      this.sources.delete(id);
      this.metrics.failures.push({ id, url, message: String(error?.message || error) });
      throw error;
    });
    this.sources.set(id, promise);
    return promise;
  }

  async clone(id, options = {}) {
    const source = await this.source(id);
    // Object3D.clone(true) duplicates transforms/hierarchy but intentionally shares immutable
    // BufferGeometry, Material and Texture references. This is the normal Pass 18 placement path.
    const object = source.clone(true);
    object.userData.pass18AssetId = id;
    prepareRenderable(object, options);
    this.metrics.placements += 1;
    return object;
  }

  async firstMeshSource(id) {
    const source = await this.source(id);
    const mesh = firstMesh(source);
    if (!mesh?.geometry || !mesh?.material) throw new Error(`${id} has no mesh suitable for repeated placement`);
    return mesh;
  }

  async createInstanced(id, matrices, options = {}) {
    if (!Array.isArray(matrices) || !matrices.length) throw new Error('createInstanced requires matrices');
    const sourceMesh = await this.firstMeshSource(id);
    const instanced = new THREE.InstancedMesh(sourceMesh.geometry, sourceMesh.material, matrices.length);
    matrices.forEach((matrix, index) => instanced.setMatrixAt(index, matrix));
    instanced.instanceMatrix.needsUpdate = true;
    instanced.castShadow = options.castShadow ?? sourceMesh.castShadow ?? true;
    instanced.receiveShadow = options.receiveShadow ?? true;
    instanced.userData.pass18AssetId = id;
    instanced.userData.pass18PlacementMode = 'instanced';
    this.metrics.placements += matrices.length;
    this.metrics.instancedInstances += matrices.length;
    return instanced;
  }

  async createStaticBatch(id, matrices, options = {}) {
    if (!Array.isArray(matrices) || !matrices.length) throw new Error('createStaticBatch requires matrices');
    if (typeof THREE.BatchedMesh !== 'function') throw new Error('Three.js BatchedMesh unavailable');
    const sourceMesh = await this.firstMeshSource(id);
    const geometry = sourceMesh.geometry;
    const indexCount = geometry.index ? geometry.index.count : 0;
    const vertexCount = geometry.attributes.position?.count || 0;
    const batch = new THREE.BatchedMesh(matrices.length, vertexCount, indexCount, sourceMesh.material);
    const geometryId = batch.addGeometry(geometry);
    for (const matrix of matrices) {
      const instanceId = batch.addInstance(geometryId);
      batch.setMatrixAt(instanceId, matrix);
    }
    batch.castShadow = options.castShadow ?? false;
    batch.receiveShadow = options.receiveShadow ?? true;
    batch.userData.pass18AssetId = id;
    batch.userData.pass18PlacementMode = 'batched';
    this.metrics.placements += matrices.length;
    this.metrics.staticBatchInstances += matrices.length;
    this.metrics.staticBatches += 1;
    return batch;
  }

  // Returns every mesh primitive of a loaded source with its geometry,
  // material and its local-to-source-root matrix baked in. Multi-primitive
  // real assets (cliff.steps, cliff.waterfall(Top), bridge.stone, every
  // ground_path*/ground_river* variant) need one InstancedMesh per
  // primitive — createInstanced/createStaticBatch above only ever look at
  // the first primitive via firstMeshSource and would silently drop the
  // rest, so they are not safe to reuse for the terrain-tile family.
  async parts(id) {
    if (this.partsCache.has(id)) return this.partsCache.get(id);
    const source = await this.source(id);
    source.updateMatrixWorld(true);
    const parts = [];
    source.traverse(node => {
      if (node.isMesh) parts.push({ geometry: node.geometry, material: node.material, matrix: node.matrixWorld.clone() });
    });
    if (!parts.length) throw new Error(`${id} has no mesh parts for instancing`);
    this.partsCache.set(id, parts);
    return parts;
  }

  // Real multi-primitive-aware instancing: one THREE.InstancedMesh per mesh
  // primitive, each holding every placement of that asset. Draw calls scale
  // with primitive count, not instance count — this is how hundreds of
  // terrain-tile placements stay within the render-call budget instead of
  // becoming hundreds of individually cloned draw calls.
  async createInstancedGroup(id, matrices, options = {}) {
    if (!Array.isArray(matrices) || !matrices.length) throw new Error('createInstancedGroup requires matrices');
    const parts = await this.parts(id);
    const group = new THREE.Group();
    group.name = `Pass18Instanced-${id}`;
    group.userData.pass18AssetId = id;
    const combined = new THREE.Matrix4();
    for (const part of parts) {
      if (options.anisotropy && part.material?.map) part.material.map.anisotropy = options.anisotropy;
      const mesh = new THREE.InstancedMesh(part.geometry, part.material, matrices.length);
      mesh.castShadow = options.castShadow ?? true;
      mesh.receiveShadow = options.receiveShadow ?? true;
      mesh.userData.pass18AssetId = id;
      mesh.userData.pass18PlacementMode = 'instanced-group';
      matrices.forEach((matrix, index) => {
        combined.multiplyMatrices(matrix, part.matrix);
        mesh.setMatrixAt(index, combined);
      });
      mesh.instanceMatrix.needsUpdate = true;
      group.add(mesh);
    }
    this.metrics.placements += matrices.length;
    this.metrics.instancedInstances += matrices.length;
    this.metrics.instancedDrawCalls = (this.metrics.instancedDrawCalls || 0) + parts.length;
    return group;
  }

  snapshot() {
    return {
      ...this.metrics,
      uniqueSources: this.sources.size,
      failures: [...this.metrics.failures]
    };
  }
}

export function pass18Transform({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] } = {}) {
  const p = new THREE.Vector3(...position);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation));
  const s = new THREE.Vector3(...scale);
  return new THREE.Matrix4().compose(p, q, s);
}
