import * as THREE from 'three';
import { Pass18AssetRegistry } from './asset-registry.js';

// Isolated Pass 18 VISUAL CALIBRATION DIORAMA.
//
// This is deliberately NOT part of the Golden Slice. It exists only to test
// whether the real asset library + this Three.js pipeline can approximate
// the Prism Valley concept art's graphical quality, in total isolation from
// world-composition questions (route, creek, waterfall, ridge — none of
// that is here). See CURRENT_WORK.md / the calibration report for context.
//
// URL params:
//   ?mat=raw    use materials exactly as loaded from the glTF (metalness=1,
//               roughness=1, no texture — this is what every Pass 18 stage
//               has been rendering with so far, untested until now).
//   ?mat=fixed  (default) correct metalness/roughness for a matte, non-metal
//               look and use a warm-key/cool-fill two-light rig.

const params = new URLSearchParams(location.search);
const matModeParam = params.get('mat');
const matMode = ['raw', 'fixed', 'fixed2'].includes(matModeParam) ? matModeParam : 'fixed';

const canvas = document.getElementById('dio');
const status = document.getElementById('status');
const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = matMode === 'raw' ? 1.0 : (matMode === 'fixed' ? 1.18 : 0.92);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const skyColor = 0xaee3f5;
scene.background = new THREE.Color(skyColor);
scene.fog = new THREE.Fog(0xcdeef8, 9, 26);

const camera = new THREE.PerspectiveCamera(mobile ? 46 : 40, innerWidth / innerHeight, 0.05, 60);
camera.position.set(5.4, 2.7, 6.6);
camera.lookAt(0, 0.7, 0.3);

if (matMode === 'fixed') {
  // First correction attempt: metalness->0 (physically-correct non-metal),
  // warm key + cool ambient fill. Tested and rejected below (report §4) —
  // full diffuse averaging across a warm key AND a cool fill washes the
  // saturated base colors out to pastel. Kept here for the side-by-side.
  scene.add(new THREE.HemisphereLight(0xeaf7ff, 0x6f8a54, 1.55));
  const sun = new THREE.DirectionalLight(0xffe8bf, 2.5);
  sun.position.set(6, 9, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -6; sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 20;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = 2.5;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xcfe8ff, 0.45);
  fill.position.set(-5, 4, -3);
  scene.add(fill);
} else if (matMode === 'fixed2') {
  // Second correction attempt: keep metalness->0, but stop diluting
  // saturation — single dominant warm key, weak/no cool fill, dimmer and
  // more saturated hemisphere so faces don't average toward pastel.
  scene.add(new THREE.HemisphereLight(0xfff2d9, 0x3f5a2c, 0.75));
  const sun = new THREE.DirectionalLight(0xfff0d0, 2.3);
  sun.position.set(6, 9, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -6; sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 20;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = 2.2;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbcd8ee, 0.12);
  fill.position.set(-5, 4, -3);
  scene.add(fill);
} else {
  // Matches world-language.js's existing hemisphere+sun+fill rig exactly —
  // this is what the Golden Slice/skeleton/editor have all been using.
  scene.add(new THREE.HemisphereLight(0xf2fcff, 0x70875b, 1.78));
  const sun = new THREE.DirectionalLight(0xffefd0, 2.35);
  sun.position.set(6, 9, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -6; sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 20;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd9f2ff, 0.52);
  fill.position.set(-5, 4, -3);
  scene.add(fill);
}

const registry = new Pass18AssetRegistry();
const root = new THREE.Group();
scene.add(root);

const hsl = { h: 0, s: 0, l: 0 };
function fixMaterials(object) {
  if (matMode === 'raw') return;
  const roughness = matMode === 'fixed2' ? 0.72 : 0.82;
  object.traverse(node => {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const m of materials) {
      if (!m) continue;
      m.metalness = 0.0;
      m.roughness = roughness;
      if (matMode === 'fixed2') {
        // The kit's flat baseColorFactor-only materials (no texture, see
        // report §Phase2) are noticeably muted/teal for "grass" — a modest
        // saturation boost on load, not a post-process color grade.
        m.color.getHSL(hsl);
        m.color.setHSL(hsl.h, Math.min(1, hsl.s * 1.55), hsl.l);
      }
      m.needsUpdate = true;
    }
  });
}

async function place(assetId, position, rotationY = 0, scale = 1) {
  const object = await registry.clone(assetId, { castShadow: true, receiveShadow: true });
  fixMaterials(object);
  const holder = new THREE.Group();
  holder.add(object);
  holder.position.fromArray(position);
  holder.rotation.y = rotationY;
  holder.scale.setScalar(scale);
  root.add(holder);
  return holder;
}

async function build() {
  status.textContent = `Building calibration diorama (mat=${matMode})…`;

  // Grass plinth: 5x4 native-scale ground tiles.
  for (let x = -2; x <= 2; x += 1) {
    for (let z = -2; z <= 1; z += 1) {
      await place('nature.ground.grass', [x, 0, z], 0);
    }
  }

  // Rock edge along the +Z side (the ledge the concept crop stands on,
  // dropping toward the valley) — cliff face + one corner, native scale.
  await place('nature.cliff.large', [-2, 0, 2], 0);
  await place('nature.cliff.large', [-1, 0, 2], 0);
  await place('nature.cliff.large', [0, 0, 2], 0);
  await place('nature.cliff.large', [1, 0, 2], 0);
  await place('nature.cliff.corner', [2, 0, 2], -Math.PI / 2);
  await place('nature.cliff.large', [2, 0, 1], -Math.PI / 2);

  // Short dirt path crossing the plinth.
  await place('nature.path.straight', [-1, 0, 0], 0);
  await place('nature.path.straight', [0, 0, 0], 0);

  // Wood fence along the ledge, echoing the concept's foreground railing.
  await place('kaykit.barrier.green', [-1.5, 0, 1.55], 0, 0.5);
  await place('kaykit.barrier.green', [0.5, 0, 1.55], 0, 0.5);

  // Vegetation: 2 trees, 1 bush, 2 flowers, 1 grass clump.
  const t1 = await registry.clone('nature.tree.default', { castShadow: true, receiveShadow: true });
  fixMaterials(t1); t1.scale.setScalar(2.6); t1.position.set(-1.6, 0, -1.5); root.add(t1);
  const t2 = await registry.clone('nature.tree.oak', { castShadow: true, receiveShadow: true });
  fixMaterials(t2); t2.scale.setScalar(2.2); t2.position.set(1.5, 0, -1.1); root.add(t2);
  const b1 = await registry.clone('nature.bush.detailed', { castShadow: true, receiveShadow: true });
  fixMaterials(b1); b1.scale.setScalar(1.8); b1.position.set(0.9, 0, -1.4); root.add(b1);

  await place('nature.flower.purpleA', [-0.6, 0, 0.55], 0.4, 2.2);
  await place('nature.flower.yellowB', [0.5, 0, 0.6], 1.1, 2.2);
  await place('nature.grass', [-0.2, 0, -0.3], 0.8, 2.0);
  await place('nature.rock.largeA', [1.7, 0, 0.6], 0.6, 1.4);

  status.textContent = `Calibration diorama ready · mat=${matMode}`;
  document.documentElement.dataset.pass18DioramaReady = '1';
  window.__pass18Diorama = { matMode };
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}, { passive: true });

build().catch(error => {
  console.error(error);
  status.textContent = `FAILED: ${error.message}`;
  document.documentElement.dataset.pass18DioramaFailed = '1';
});
