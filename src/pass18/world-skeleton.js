import * as THREE from 'three';
import { Pass18AssetRegistry } from './asset-registry.js';
import { Pass18SpatialGrid } from './spatial-grid.js';
import { createPass18BudgetHud } from './budget-hud.js';
import { PASS18_WORLD_LANGUAGE as WL, pass18MobileProfile, pass18PixelRatio } from './world-language.js';

const canvas = document.getElementById('world');
const status = document.getElementById('status');
const metricsEl = document.getElementById('metrics');
const viewButtons = document.getElementById('views');
const mobile = pass18MobileProfile();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: WL.renderer.antialias, powerPreference: 'high-performance' });
renderer.setPixelRatio(pass18PixelRatio(devicePixelRatio || 1, mobile));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = WL.renderer.exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(WL.palette.sky);
scene.fog = new THREE.Fog(WL.palette.fog, WL.atmosphere.fogNear, WL.atmosphere.fogFar);

const camera = new THREE.PerspectiveCamera(mobile ? WL.camera.mobileFov : WL.camera.desktopFov, innerWidth / innerHeight, WL.camera.near, WL.camera.far);
scene.add(new THREE.HemisphereLight(WL.palette.hemiSky, WL.palette.hemiGround, WL.lighting.hemisphereIntensity));
const sun = new THREE.DirectionalLight(WL.palette.sun, WL.lighting.sunIntensity);
sun.position.fromArray(WL.lighting.sunPosition);
sun.castShadow = true;
sun.shadow.mapSize.set(mobile ? WL.renderer.shadowMapMobile : WL.renderer.shadowMapDesktop, mobile ? WL.renderer.shadowMapMobile : WL.renderer.shadowMapDesktop);
sun.shadow.bias = WL.lighting.shadowBias;
sun.shadow.normalBias = WL.lighting.shadowNormalBias;
sun.shadow.radius = mobile ? WL.lighting.shadowRadiusMobile : WL.lighting.shadowRadiusDesktop;
Object.assign(sun.shadow.camera, WL.lighting.shadowCamera);
sun.shadow.camera.left = -42; sun.shadow.camera.right = 42; sun.shadow.camera.top = 42; sun.shadow.camera.bottom = -42;
sun.shadow.camera.far = 95; sun.shadow.camera.updateProjectionMatrix();
scene.add(sun);
const fill = new THREE.DirectionalLight(0xd9f2ff, WL.lighting.fillIntensity);
fill.position.set(-18, 12, 22); scene.add(fill);

const registry = new Pass18AssetRegistry();
const spatial = new Pass18SpatialGrid({ cellSize: 24 });
const hud = createPass18BudgetHud({ renderer, registry, spatial });
const worldRoot = new THREE.Group(); worldRoot.name = 'Pass18StructuralWorld'; scene.add(worldRoot);
const routeRoot = new THREE.Group(); routeRoot.name = 'Pass18StructuralRoutes'; scene.add(routeRoot);
const labelRoot = new THREE.Group(); labelRoot.name = 'Pass18SectionLabels'; scene.add(labelRoot);
const sectionGroups = new Map();
const sectionAnchors = new Map();
const assetBoxes = [];
let manifest = null;
let activeView = 'overview';
let riverSegments = 0;
let terrainPlacements = 0;
let structurePlacements = 0;

function prepareObject(object) {
  object.traverse(node => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of mats) {
      if (!material?.map) continue;
      material.map.colorSpace = THREE.SRGBColorSpace;
      material.map.anisotropy = Math.min(WL.materials.maxAnisotropy, renderer.capabilities.getMaxAnisotropy());
    }
  });
}

function fitAndPlace(object, placement) {
  prepareObject(object);
  object.rotation.y = placement.rotationY || 0;
  object.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const scale = placement.targetMax / (Math.max(size.x, size.y, size.z) || 1);
  object.scale.multiplyScalar(scale);
  object.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.set(placement.position[0] - center.x, placement.position[1] - box.min.y, placement.position[2] - center.z);
  object.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(object);
  object.userData.pass18PlacementId = placement.id;
  object.userData.pass18Section = placement.section;
  return box;
}

async function placeAsset(placement, kind) {
  const group = sectionGroups.get(placement.section);
  if (!group) throw new Error(`Unknown section for ${placement.id}: ${placement.section}`);
  const object = await registry.clone(placement.asset);
  group.add(object);
  const box = fitAndPlace(object, placement);
  spatial.registerCollider(box, { placementId: placement.id, section: placement.section, kind, asset: placement.asset });
  assetBoxes.push({ id: placement.id, section: placement.section, kind, box });
  if (kind === 'terrain') terrainPlacements += 1; else structurePlacements += 1;
  return object;
}

function addRiver(data) {
  const material = new THREE.MeshStandardMaterial({
    color: data.surfaceColor,
    roughness: 0.42,
    metalness: 0.02,
    transparent: true,
    opacity: 0.88,
    emissive: 0x0a3748,
    emissiveIntensity: 0.12
  });
  const dropSet = new Set(data.waterfallAfterPointIndices || []);
  for (let i = 0; i < data.points.length - 1; i += 1) {
    const a = new THREE.Vector3(...data.points[i]);
    const b = new THREE.Vector3(...data.points[i + 1]);
    const delta = b.clone().sub(a);
    const length = delta.length();
    const width = dropSet.has(i) ? data.width * 0.92 : data.width;
    const geometry = new THREE.BoxGeometry(width, dropSet.has(i) ? 0.05 : 0.08, length + 0.35);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), delta.normalize());
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    mesh.userData.pass18WaterSegment = i;
    mesh.userData.pass18Waterfall = dropSet.has(i);
    worldRoot.add(mesh);
    riverSegments += 1;
  }
}

const routeColors = {
  main: 0xffd45a,
  springShortcut: 0x58e6ff,
  pipeLoop: 0x52d6a5,
  cloverMastery: 0xe686ff,
  lowerBypass: 0x98c8ff,
  ruinHighRoute: 0xff8ac7
};

function addRoutes(routes) {
  for (const [id, route] of Object.entries(routes)) {
    const points = route.points.map(p => new THREE.Vector3(p[0], p[1] + 0.28, p[2]));
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.45);
    const sampled = curve.getPoints(Math.max(28, points.length * 6));
    const geometry = new THREE.BufferGeometry().setFromPoints(sampled);
    const material = new THREE.LineBasicMaterial({ color: routeColors[id] || 0xffffff, transparent: true, opacity: id === 'main' ? 0.95 : 0.78, depthTest: true });
    const line = new THREE.Line(geometry, material);
    line.userData.pass18Route = id;
    routeRoot.add(line);
  }
}

function labelTexture(text, accent) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(16,33,45,.82)'; ctx.beginPath(); ctx.roundRect(8, 12, 496, 104, 30); ctx.fill();
  ctx.strokeStyle = accent; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '800 34px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function addSectionLabels(sections) {
  const accents = ['#ff7ab6','#63dcff','#63d5a0','#b99cff','#ffb867','#9cecff'];
  sections.forEach((section, index) => {
    const material = new THREE.SpriteMaterial({ map: labelTexture(`${section.id} · ${section.name.toUpperCase()}`, accents[index]), transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(5.6, 1.4, 1);
    sprite.position.set(section.center[0], section.center[1] + 5.2, section.center[2]);
    sprite.renderOrder = 20;
    sprite.userData.pass18SectionLabel = section.id;
    labelRoot.add(sprite);
    sectionAnchors.set(section.id, new THREE.Vector3(...section.center));
  });
}

function routeMetrics(route, mainRoute) {
  let length = 0, maxSegment = 0, maxGrade = 0;
  for (let i = 0; i < route.points.length - 1; i += 1) {
    const a = new THREE.Vector3(...route.points[i]);
    const b = new THREE.Vector3(...route.points[i + 1]);
    const d = a.distanceTo(b); length += d; maxSegment = Math.max(maxSegment, d);
    const horizontal = Math.hypot(b.x - a.x, b.z - a.z);
    if (horizontal > 0.001) maxGrade = Math.max(maxGrade, Math.abs(b.y - a.y) / horizontal);
  }
  const nearestMain = point => Math.min(...mainRoute.points.map(p => new THREE.Vector3(...p).distanceTo(new THREE.Vector3(...point))));
  return {
    length,
    maxSegment,
    maxGrade,
    allowedGrade: route.maxGrade,
    gradePass: maxGrade <= route.maxGrade + 1e-6,
    startReconnect: route === mainRoute ? 0 : nearestMain(route.points[0]),
    endReconnect: route === mainRoute ? 0 : nearestMain(route.points[route.points.length - 1]),
    reconnectTolerance: route.reconnectTolerance || 0
  };
}

function getSightlines() {
  if (!manifest) return {};
  const result = {};
  camera.updateMatrixWorld(true); camera.updateProjectionMatrix();
  for (const sightline of manifest.sightlines) {
    const from = new THREE.Vector3(...sightline.from);
    const to = new THREE.Vector3(...sightline.to);
    const projected = to.clone().project(camera);
    result[sightline.id] = {
      distance: from.distanceTo(to),
      maxDistance: sightline.maxDistance,
      withinFogBudget: from.distanceTo(to) <= sightline.maxDistance,
      inCurrentFrustum: projected.z > -1 && projected.z < 1 && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1,
      projected: { x: projected.x, y: projected.y, z: projected.z },
      purpose: sightline.purpose
    };
  }
  return result;
}

function setView(name) {
  if (!manifest?.cameraViews?.[name]) return false;
  const pose = manifest.cameraViews[name];
  camera.position.fromArray(pose.position);
  camera.lookAt(...pose.target);
  camera.updateMatrixWorld(true);
  activeView = name;
  const focusedSection = ({ spawn: 'A', clover: 'D', ruins: 'E', ridge: 'F' })[name] || null;
  for (const sprite of labelRoot.children) {
    const sectionId = sprite.userData.pass18SectionLabel;
    const anchor = sectionAnchors.get(sectionId);
    const distance = anchor ? camera.position.distanceTo(anchor) : Infinity;
    sprite.visible = name === 'overview' || (sectionId !== focusedSection && distance > 28);
  }
  document.documentElement.dataset.pass18SkeletonView = name;
  if (viewButtons) [...viewButtons.querySelectorAll('button')].forEach(button => button.classList.toggle('active', button.dataset.view === name));
  return true;
}

function buildViewButtons() {
  if (!viewButtons) return;
  for (const name of Object.keys(manifest.cameraViews)) {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.view = name; button.textContent = name.toUpperCase();
    button.addEventListener('click', () => setView(name));
    viewButtons.appendChild(button);
  }
}

function getMetrics() {
  const routes = {};
  const main = manifest.routes.main;
  for (const [id, route] of Object.entries(manifest.routes)) routes[id] = routeMetrics(route, main);
  const localCandidates = spatial.queryColliders(sectionAnchors.get('C') || new THREE.Vector3(), 6);
  return {
    version: manifest.version,
    activeView,
    sections: manifest.sections.map(s => ({ id: s.id, name: s.name, center: s.center, elevation: s.elevation })),
    terrainPlacements,
    structurePlacements,
    riverSegments,
    routeCount: Object.keys(manifest.routes).length,
    routes,
    sightlines: getSightlines(),
    registry: registry.snapshot(),
    spatial: spatial.snapshot(),
    localCollisionCandidates: localCandidates.length,
    render: { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures },
    worldLanguage: WL.version,
    visibleAssetColliderCount: assetBoxes.length,
    hudVisible: !!hud.element
  };
}

async function build() {
  status.textContent = 'Loading Pass 18-1 structural manifest…';
  const response = await fetch('../../data/pass18/world-skeleton.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`world-skeleton.json HTTP ${response.status}`);
  manifest = await response.json();
  if (manifest.version !== '18-1.0') throw new Error(`Unexpected skeleton manifest ${manifest.version}`);
  if (manifest.sections.map(s => s.id).join('') !== 'ABCDEF') throw new Error('A→F section order missing');

  for (const section of manifest.sections) {
    const group = new THREE.Group(); group.name = `Section-${section.id}-${section.name}`; group.userData.pass18Section = section.id;
    worldRoot.add(group); sectionGroups.set(section.id, group);
  }
  status.textContent = 'Loading real terrain modules…';
  for (const placement of manifest.terrain) await placeAsset(placement, 'terrain');
  status.textContent = 'Loading structural landmarks…';
  for (const placement of manifest.structures) await placeAsset(placement, 'structure');

  addRiver(manifest.river);
  addRoutes(manifest.routes);
  addSectionLabels(manifest.sections);
  for (const section of manifest.sections) spatial.registerVisual(sectionGroups.get(section.id), { x: section.center[0], z: section.center[2] });
  spatial.updateVisible(new THREE.Vector3(0, 0, -5), 4);
  buildViewButtons();
  setView(new URLSearchParams(location.search).get('view') || 'overview');

  const routeStats = Object.fromEntries(Object.entries(manifest.routes).map(([id, route]) => [id, routeMetrics(route, manifest.routes.main)]));
  if (terrainPlacements < 30 || structurePlacements < 10) throw new Error(`Structural density incomplete terrain=${terrainPlacements} structures=${structurePlacements}`);
  if (riverSegments < 10) throw new Error(`River course incomplete ${riverSegments}`);
  if (!Object.values(routeStats).every(r => r.gradePass)) throw new Error(`Route grade contract failed ${JSON.stringify(routeStats)}`);
  for (const [id, r] of Object.entries(routeStats)) {
    if (id !== 'main' && (r.startReconnect > r.reconnectTolerance || r.endReconnect > r.reconnectTolerance)) throw new Error(`Route ${id} does not reconnect ${JSON.stringify(r)}`);
  }
  const sightlineDistanceFailures = manifest.sightlines.filter(s => new THREE.Vector3(...s.from).distanceTo(new THREE.Vector3(...s.to)) > s.maxDistance);
  if (sightlineDistanceFailures.length) throw new Error(`Sightline budget failed ${JSON.stringify(sightlineDistanceFailures)}`);
  if (registry.snapshot().failures.length) throw new Error(`Asset failures ${JSON.stringify(registry.snapshot().failures)}`);

  document.documentElement.dataset.pass18SkeletonReady = '1';
  window.__pass18SkeletonReady = true;
  window.__pass18Skeleton = { manifest, registry, spatial, setView, getMetrics };
  status.textContent = `18-1 STRUCTURE READY · ${terrainPlacements} terrain · ${structurePlacements} landmarks · ${Object.keys(manifest.routes).length} routes`;
}

let lastMetrics = 0;
function animate(now) {
  requestAnimationFrame(animate);
  hud.update(now);
  renderer.render(scene, camera);
  if (now - lastMetrics > 450 && manifest) {
    lastMetrics = now;
    const m = getMetrics();
    metricsEl.textContent = `${m.sections.length} sections · main ${m.routes.main.length.toFixed(0)}u · ${m.render.calls} calls · ${m.render.triangles} tris`;
  }
}
requestAnimationFrame(animate);

addEventListener('resize', () => {
  renderer.setPixelRatio(pass18PixelRatio(devicePixelRatio || 1, mobile));
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
}, { passive: true });

build().catch(error => {
  console.error(error);
  status.textContent = `FAILED: ${error.message}`;
  document.documentElement.dataset.pass18SkeletonFailed = '1';
  window.__pass18SkeletonError = String(error?.stack || error);
});