import * as THREE from 'three';
import { PASS18_ASSETS, pass18Categories } from './asset-catalog.js';
import { Pass18AssetRegistry, pass18Transform } from './asset-registry.js';
import { Pass18SpatialGrid } from './spatial-grid.js';
import { createPass18BudgetHud } from './budget-hud.js';
import { PASS18_WORLD_LANGUAGE as WL, pass18MobileProfile, pass18PixelRatio } from './world-language.js';

const canvas = document.getElementById('gallery');
const status = document.getElementById('status');
const assetList = document.getElementById('assetList');
const search = document.getElementById('search');
const filters = document.getElementById('filters');
const mobile = pass18MobileProfile();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(pass18PixelRatio(window.devicePixelRatio || 1, mobile));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = WL.renderer.exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(WL.palette.sky);
scene.fog = new THREE.Fog(WL.palette.fog, 54, 150);
const camera = new THREE.PerspectiveCamera(mobile ? 50 : 46, innerWidth / innerHeight, .08, 220);
camera.position.set(29, 23, 39);
camera.lookAt(9, 1.8, -7);

scene.add(new THREE.HemisphereLight(WL.palette.hemiSky, WL.palette.hemiGround, WL.lighting.hemisphereIntensity));
const sun = new THREE.DirectionalLight(WL.palette.sun, WL.lighting.sunIntensity);
sun.position.fromArray(WL.lighting.sunPosition); sun.castShadow = true;
sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
sun.shadow.bias = WL.lighting.shadowBias; sun.shadow.normalBias = WL.lighting.shadowNormalBias;
Object.assign(sun.shadow.camera, WL.lighting.shadowCamera); sun.shadow.camera.updateProjectionMatrix(); scene.add(sun);

const registry = new Pass18AssetRegistry();
// The gallery stays fully visible for human inspection. Spatial culling is proven with dedicated
// near/mid/far groups below so the proof itself does not hide the assets we are trying to inspect.
const spatial = new Pass18SpatialGrid({ cellSize: 28 });
const hud = createPass18BudgetHud({ renderer, registry, spatial });
const galleryRoot = new THREE.Group(); scene.add(galleryRoot);
const showcase = new THREE.Group(); scene.add(showcase);

function fit(object, target = 5) {
  object.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const max = Math.max(size.x, size.y, size.z) || 1;
  object.scale.multiplyScalar(target / max);
  object.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(object);
  object.position.y -= box.min.y;
  return object;
}

async function placeCard(id, x, z, target = 5) {
  const object = fit(await registry.clone(id), target);
  object.position.x += x; object.position.z += z;
  const group = new THREE.Group(); group.add(object); galleryRoot.add(group);
  return object;
}

function buildFilters() {
  const categories = ['All', ...pass18Categories()];
  for (const category of categories) {
    const button = document.createElement('button'); button.textContent = category; button.dataset.category = category;
    if (category === 'All') button.classList.add('active'); filters.appendChild(button);
  }
  let active = 'All';
  function refresh() {
    const q = search.value.trim().toLowerCase();
    assetList.innerHTML = '';
    PASS18_ASSETS.filter(a => (active === 'All' || a.category === active) && (!q || `${a.label} ${a.id} ${a.pack}`.toLowerCase().includes(q))).forEach(a => {
      const row = document.createElement('div'); row.className = 'assetRow';
      row.innerHTML = `<b>${a.label}</b><span>${a.category} · ${a.pack}</span><code>${a.file}</code>`;
      assetList.appendChild(row);
    });
  }
  filters.addEventListener('click', e => {
    if (!(e.target instanceof HTMLButtonElement)) return;
    active = e.target.dataset.category; [...filters.children].forEach(b => b.classList.toggle('active', b === e.target)); refresh();
  });
  search.addEventListener('input', refresh); refresh();
}

async function build() {
  status.textContent = 'Loading curated real-asset palette…';
  const displayIds = [
    'nature.cliff.large','nature.cliff.corner','nature.cliff.steps','nature.bridge.stone',
    'nature.tree.oak','nature.rock.largeA','fantasy.wall.arch','fantasy.wall.corner',
    'castle.bridge.pillar','castle.gate','castle.stairs.stone','kenney.platform.slope'
  ];
  for (let i = 0; i < displayIds.length; i += 1) {
    const col = i % 4, row = Math.floor(i / 4);
    await placeCard(displayIds[i], col * 8 - 8, -row * 8, 5.2);
  }

  // Cache-sharing proof: same source requested through clone and instanced paths.
  const treeA = fit(await registry.clone('nature.tree.default'), 4.4); treeA.position.set(-12, 0, 8); showcase.add(treeA);
  const treeB = fit(await registry.clone('nature.tree.default'), 3.7); treeB.position.set(-7, 0, 8); showcase.add(treeB);
  const treeMatrices = [];
  for (let i = 0; i < 24; i += 1) treeMatrices.push(pass18Transform({ position: [-16 + (i % 8) * 2.3, 0, 16 + Math.floor(i / 8) * 2.8], scale: [2.3,2.3,2.3] }));
  const trees = await registry.createInstanced('nature.tree.default', treeMatrices, { castShadow: true, receiveShadow: true }); showcase.add(trees);

  // Explicit BatchedMesh proof. A batch is a tooling/runtime option for static groups; repeated identical
  // objects should normally prefer InstancedMesh, but both paths are validated before map authoring.
  const rockMatrices = [];
  for (let i = 0; i < 10; i += 1) rockMatrices.push(pass18Transform({ position: [13 + (i % 5) * 2.0, 0, 13 + Math.floor(i / 5) * 2.5], rotation: [0, i * .47, 0], scale: [1.5,1.5,1.5] }));
  const rockBatch = await registry.createStaticBatch('nature.rock.largeA', rockMatrices); showcase.add(rockBatch);

  // Dedicated spatial architecture proof: render visibility and gameplay collision candidates are indexed
  // independently of the dense gallery/render hierarchy.
  const near = new THREE.Group(); const mid = new THREE.Group(); const far = new THREE.Group();
  near.position.set(0,0,0); mid.position.set(35,0,0); far.position.set(70,0,0);
  scene.add(near, mid, far); spatial.registerVisual(near); spatial.registerVisual(mid); spatial.registerVisual(far);
  for (let i = 0; i < 12; i += 1) {
    const x = i * 8;
    spatial.registerCollider(new THREE.Box3(new THREE.Vector3(x-1,-1,-1), new THREE.Vector3(x+1,3,1)), { testIndex: i });
  }
  spatial.updateVisible(new THREE.Vector3(0,0,0), 0);
  const nearby = spatial.queryColliders(new THREE.Vector3(0,0,0), 5);

  const snap = registry.snapshot();
  if (snap.sourceLoads < 10 || snap.cacheHits < 2 || snap.instancedInstances < 20 || snap.staticBatchInstances < 8) throw new Error(`Registry proof incomplete ${JSON.stringify(snap)}`);
  const spatialSnap = spatial.snapshot();
  if (nearby.length >= spatialSnap.totalColliders || spatialSnap.visibleGroups >= spatialSnap.totalVisualGroups) throw new Error(`Spatial proof incomplete ${JSON.stringify(spatialSnap)}`);

  status.textContent = `${PASS18_ASSETS.length} catalog assets · ${snap.uniqueSources} sources loaded · shared/instanced/batched paths ready`;
  document.documentElement.dataset.pass18AssetRuntimeReady = '1';
  window.__pass18AssetRuntimeReady = true;
  window.__pass18AssetRuntime = { registry, spatial, getMetrics: () => ({ registry: registry.snapshot(), spatial: spatial.snapshot(), render: { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }, hudVisible: !!hud.element, catalogCount: PASS18_ASSETS.length }) };
}

buildFilters();
function animate(now) {
  requestAnimationFrame(animate); hud.update(now); renderer.render(scene, camera);
}
requestAnimationFrame(animate);

addEventListener('resize', () => { renderer.setPixelRatio(pass18PixelRatio(devicePixelRatio || 1, mobile)); renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); }, { passive: true });

build().catch(error => {
  console.error(error); status.textContent = `FAILED: ${error.message}`; document.documentElement.dataset.pass18AssetRuntimeFailed = '1'; window.__pass18AssetRuntimeError = String(error?.stack || error);
});
