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
