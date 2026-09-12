import * as THREE from 'three';

function key(x, z) { return `${x},${z}`; }

export class Pass18SpatialGrid {
  constructor({ cellSize = 24 } = {}) {
    this.cellSize = cellSize;
    this.visuals = new Map();
    this.colliders = new Map();
    this.visibleKeys = new Set();
    this.lastCollisionCandidates = 0;
  }

  cellFor(position) {
    return [Math.floor(position.x / this.cellSize), Math.floor(position.z / this.cellSize)];
  }

  registerVisual(group, { x = group.position.x, z = group.position.z } = {}) {
    const [cx, cz] = this.cellFor(new THREE.Vector3(x, 0, z));
    const k = key(cx, cz);
    if (!this.visuals.has(k)) this.visuals.set(k, new Set());
    this.visuals.get(k).add(group);
    group.userData.pass18SpatialCell = k;
    return k;
  }

  registerCollider(box, metadata = {}) {
    if (!(box instanceof THREE.Box3)) throw new Error('registerCollider requires THREE.Box3');
    const center = box.getCenter(new THREE.Vector3());
    const [cx, cz] = this.cellFor(center);
    const k = key(cx, cz);
    if (!this.colliders.has(k)) this.colliders.set(k, []);
    const record = { box: box.clone(), metadata };
    this.colliders.get(k).push(record);
    return record;
  }

  updateVisible(center, radiusCells = 1) {
    const [cx, cz] = this.cellFor(center);
    const next = new Set();
    for (let dz = -radiusCells; dz <= radiusCells; dz += 1) {
      for (let dx = -radiusCells; dx <= radiusCells; dx += 1) next.add(key(cx + dx, cz + dz));
    }
    for (const [k, groups] of this.visuals) {
      const visible = next.has(k);
      groups.forEach(group => { group.visible = visible; });
    }
    this.visibleKeys = next;
    return next;
  }

  queryColliders(position, radius = 4) {
    const min = new THREE.Vector3(position.x - radius, 0, position.z - radius);
    const max = new THREE.Vector3(position.x + radius, 0, position.z + radius);
    const [minX, minZ] = this.cellFor(min);
    const [maxX, maxZ] = this.cellFor(max);
    const probe = new THREE.Box3(
      new THREE.Vector3(position.x - radius, -1e6, position.z - radius),
      new THREE.Vector3(position.x + radius, 1e6, position.z + radius)
    );
    const results = [];
    for (let cz = minZ; cz <= maxZ; cz += 1) {
      for (let cx = minX; cx <= maxX; cx += 1) {
        const entries = this.colliders.get(key(cx, cz)) || [];
        for (const entry of entries) if (entry.box.intersectsBox(probe)) results.push(entry);
      }
    }
    this.lastCollisionCandidates = results.length;
    return results;
  }

  snapshot() {
    let totalVisualGroups = 0;
    this.visuals.forEach(groups => { totalVisualGroups += groups.size; });
    let totalColliders = 0;
    this.colliders.forEach(items => { totalColliders += items.length; });
    let visibleGroups = 0;
    for (const [k, groups] of this.visuals) if (this.visibleKeys.has(k)) visibleGroups += groups.size;
    return {
      cellSize: this.cellSize,
      totalCells: this.visuals.size,
      totalVisualGroups,
      visibleGroups,
      totalColliders,
      collisionCandidates: this.lastCollisionCandidates
    };
  }
}
