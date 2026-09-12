import * as THREE from 'three';
import { getPass18Asset } from './asset-catalog.js';
import { pass18Transform } from './asset-registry.js';

// Verified against ground_grass.glb, cliff_large_rock.glb,
// cliff_cornerLarge_rock.glb, cliff_steps_rock.glb,
// cliff_waterfall(Top)_rock.glb, ground_pathBend/Straight/Tile.glb,
// ground_river(Straight|Bend).glb and wall(-corner)/wall-arch.glb: every
// terrain-family module in the Kenney Nature Kit and Fantasy Town Kit is
// authored on a 1.0 world-unit XZ grid at native scale. Terrain must never
// go through normalizePass18Asset's arbitrary targetMax bounding-box fit —
// that function is for one-off props (rocks, trees, the bridge), not
// repeating floor/wall cells.
export const PASS18_TERRAIN_TILE_PITCH = 1.0;

function quantizeToRightAngle(radians) {
  const step = Math.PI / 2;
  return Math.round(Number(radians || 0) / step) * step;
}

export function groupPass18TerrainRecordsByAsset(records) {
  const groups = new Map();
  for (const record of records) {
    if (!groups.has(record.asset)) groups.set(record.asset, []);
    groups.get(record.asset).push(record);
  }
  return groups;
}

// TILE: rotation quantized to right angles — floor/wall cells must stay
// grid-aligned or neighboring modules won't line up edge-to-edge.
export function pass18TileMatrix(record) {
  return pass18Transform({ position: record.position, rotation: [0, quantizeToRightAngle(record.rotationY), 0] });
}

// Interpolates the creek's authored centerline using the same piecewise-
// linear method as the water ribbon shader, so bank tiling follows the
// creek's actual meander instead of a fixed straight corridor.
function pass18InterpCreekX(z, waterPoints) {
  for (let i = 0; i < waterPoints.length - 1; i += 1) {
    const z0 = waterPoints[i][2], x0 = waterPoints[i][0];
    const z1 = waterPoints[i + 1][2], x1 = waterPoints[i + 1][0];
    if (z <= z0 && z >= z1) {
      const t = (z0 - z) / (z0 - z1);
      return x0 + t * (x1 - x0);
    }
  }
  return waterPoints[0][0];
}

// Expands a creek-following bank description into individual native-scale
// tile records. Every record is a distinct placement later handed to
// createInstancedGroup — never a single scaled plane. West/east cliff-edge
// rows are returned as SEPARATE arrays (one entry per integer z, ascending)
// specifically so corner detection can walk same-side consecutive rows
// without ever comparing a west-edge entry to an east-edge entry.
export function expandPass18CreekBank(bank, waterPoints) {
  const fill = [], westEdge = [], eastEdge = [];
  for (let z = bank.fromZ; z <= bank.toZ; z += 1) {
    const cx = pass18InterpCreekX(z, waterPoints);
    const innerW = Math.max(Math.round(cx - bank.halfWidth - 1), bank.outerW + 1);
    const innerE = Math.min(Math.round(cx + bank.halfWidth + 1), bank.outerE - 1);
    for (let x = bank.outerW; x < innerW; x += 1) {
      fill.push({ id: `${bank.id}-fillW-${x}-${z}`, kind: 'tile', asset: bank.groundAsset, position: [x, bank.y, z], rotationY: 0, role: 'terrain', section: bank.section });
    }
    for (let x = innerE + 1; x <= bank.outerE; x += 1) {
      fill.push({ id: `${bank.id}-fillE-${x}-${z}`, kind: 'tile', asset: bank.groundAsset, position: [x, bank.y, z], rotationY: 0, role: 'terrain', section: bank.section });
    }
    westEdge.push({ id: `${bank.id}-cliffW-${z}`, kind: 'tile', asset: bank.cliffAsset, position: [innerW, bank.y, z], rotationY: Math.PI / 2, role: 'cliff', section: bank.section });
    eastEdge.push({ id: `${bank.id}-cliffE-${z}`, kind: 'tile', asset: bank.cliffAsset, position: [innerE, bank.y, z], rotationY: -Math.PI / 2, role: 'cliff', section: bank.section });
  }
  return { fill, westEdge, eastEdge };
}

// Closes lateral one-cell jogs in a bank's cliff edge (where the creek's
// meander shifts the retaining wall by exactly one grid cell between
// adjacent rows) with a cliff.corner tile at the notch cell. Walks each
// side's array independently and only ever compares adjacent same-side
// rows — never a west-edge row to an east-edge row.
export function expandPass18CreekBankCorners(bank, westEdge, eastEdge) {
  const corners = [];
  const detect = edge => {
    for (let i = 1; i < edge.length; i += 1) {
      const prev = edge[i - 1], cur = edge[i];
      if (Math.abs(cur.position[0] - prev.position[0]) === 1) {
        corners.push({
          id: `${bank.id}-corner-${cur.role}-${cur.position[2]}`,
          kind: 'tile',
          asset: bank.cliffCornerAsset,
          position: [prev.position[0], bank.y, cur.position[2]],
          rotationY: cur.rotationY,
          role: 'cliff',
          section: bank.section,
        });
      }
    }
  };
  detect(westEdge);
  detect(eastEdge);
  return corners;
}

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
