import * as THREE from 'three';
import { PASS18_ASSETS, pass18Categories, getPass18Asset } from './asset-catalog.js';
import { Pass18AssetRegistry } from './asset-registry.js';
import { PASS18_WORLD_LANGUAGE as WL, pass18MobileProfile, pass18PixelRatio } from './world-language.js';
import { Pass18EditorDocument, PASS18_EDITOR_SCHEMA } from './editor-state.js';
import {
  applyPass18PlacementRecord,
  collectPass18Meshes,
  createPass18PlacementRoot,
  pass18DefaultTargetMax,
  preparePass18Renderable,
} from './asset-placement.js';

const canvas = document.getElementById('editor');
const status = document.getElementById('status');
const assetSearch = document.getElementById('assetSearch');
const categoryFilters = document.getElementById('categoryFilters');
const assetList = document.getElementById('assetList');
const modeButtons = document.getElementById('modeButtons');
const selectionEl = document.getElementById('selection');
const summaryEl = document.getElementById('summary');
const gridSnap = document.getElementById('gridSnap');
const verticalSnap = document.getElementById('verticalSnap');
const gridStep = document.getElementById('gridStep');
const verticalStep = document.getElementById('verticalStep');
const scatterCount = document.getElementById('scatterCount');
const scatterRadius = document.getElementById('scatterRadius');
const finishPolylineButton = document.getElementById('finishPolyline');
const clearPolylineButton = document.getElementById('clearPolyline');
const deleteButton = document.getElementById('deleteSelected');
const cameraLabel = document.getElementById('cameraLabel');
const captureCameraButton = document.getElementById('captureCamera');
const exportButton = document.getElementById('exportJson');
const modeBadge = document.getElementById('modeBadge');
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
sun.shadow.camera.left = -48; sun.shadow.camera.right = 48; sun.shadow.camera.top = 48; sun.shadow.camera.bottom = -48;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 120; sun.shadow.camera.updateProjectionMatrix();
scene.add(sun);
const fill = new THREE.DirectionalLight(0xd9f2ff, WL.lighting.fillIntensity);
fill.position.set(-18, 12, 22); scene.add(fill);

const registry = new Pass18AssetRegistry();
const structuralRoot = new THREE.Group(); structuralRoot.name = 'Pass18EditorStructuralWorld'; scene.add(structuralRoot);
const editableRoot = new THREE.Group(); editableRoot.name = 'Pass18EditorPlacements'; scene.add(editableRoot);
const routeRoot = new THREE.Group(); routeRoot.name = 'Pass18EditorRouteGuides'; scene.add(routeRoot);
const polylineRoot = new THREE.Group(); polylineRoot.name = 'Pass18EditorPolylines'; scene.add(polylineRoot);
const helperRoot = new THREE.Group(); helperRoot.name = 'Pass18EditorHelpers'; scene.add(helperRoot);

const fineGrid = new THREE.GridHelper(144, 144, 0x7aa0a8, 0xb8d5d6);
fineGrid.position.y = 0.015; fineGrid.material.transparent = true; fineGrid.material.opacity = 0.16; helperRoot.add(fineGrid);
const chunkGrid = new THREE.GridHelper(144, 6, 0x194f60, 0x194f60);
chunkGrid.position.y = 0.025; chunkGrid.material.transparent = true; chunkGrid.material.opacity = 0.34; helperRoot.add(chunkGrid);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const worldRaycastMeshes = [];
const placementObjects = new Map();
const committedPolylineVisuals = new Map();
const selectionHelper = new THREE.Box3Helper(new THREE.Box3(), 0xffe269);
selectionHelper.visible = false; helperRoot.add(selectionHelper);

let manifest = null;
let documentModel = null;
let activeAssetId = 'nature.tree.default';
let activeCategory = 'All';
let activeMode = 'select';
let selectedId = null;
let currentPolyline = { role: null, points: [] };
let currentPolylineVisual = null;
let scatterSeed = 180100;
let interaction = null;

const orbit = {
  target: new THREE.Vector3(0, 6, -8),
  yaw: 0.45,
  pitch: 0.55,
  distance: 58,
};

function setOrbitFromPose(position, target) {
  camera.position.fromArray(position);
  orbit.target.fromArray(target);
  const delta = camera.position.clone().sub(orbit.target);
  orbit.distance = Math.max(2, delta.length());
  orbit.yaw = Math.atan2(delta.x, delta.z);
  orbit.pitch = Math.asin(THREE.MathUtils.clamp(delta.y / orbit.distance, -0.96, 0.96));
  applyOrbit();
}

function applyOrbit() {
  orbit.pitch = THREE.MathUtils.clamp(orbit.pitch, -0.05, 1.35);
  orbit.distance = THREE.MathUtils.clamp(orbit.distance, 4, 135);
  const horizontal = Math.cos(orbit.pitch) * orbit.distance;
  camera.position.set(
    orbit.target.x + Math.sin(orbit.yaw) * horizontal,
    orbit.target.y + Math.sin(orbit.pitch) * orbit.distance,
    orbit.target.z + Math.cos(orbit.yaw) * horizontal,
  );
  camera.lookAt(orbit.target);
  camera.updateMatrixWorld(true);
}

function cameraNudge({ yaw = 0, pitch = 0, zoom = 1, panY = 0 } = {}) {
  orbit.yaw += yaw;
  orbit.pitch += pitch;
  orbit.distance *= zoom;
  orbit.target.y += panY;
  applyOrbit();
}

function pointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
}

function surfacePointFromEvent(event) {
  pointFromEvent(event);
  scene.updateMatrixWorld(true);
  const hits = raycaster.intersectObjects(worldRaycastMeshes, false);
  if (hits.length) return documentModel.snapPosition(hits[0].point.toArray());
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const fallback = new THREE.Vector3();
  return raycaster.ray.intersectPlane(plane, fallback) ? documentModel.snapPosition(fallback.toArray()) : null;
}

function surfaceYAt(x, z, fallbackY = 0) {
  raycaster.set(new THREE.Vector3(x, 90, z), new THREE.Vector3(0, -1, 0));
  scene.updateMatrixWorld(true);
  const hits = raycaster.intersectObjects(worldRaycastMeshes, false);
  return hits.length ? documentModel.snapPosition([x, hits[0].point.y, z])[1] : fallbackY;
}

function findPlacementRoot(object) {
  let current = object;
  while (current && current !== scene) {
    if (current.userData?.pass18PlacementId && placementObjects.has(current.userData.pass18PlacementId)) return current;
    current = current.parent;
  }
  return null;
}

function placementFromEvent(event) {
  pointFromEvent(event);
  scene.updateMatrixWorld(true);
  const hits = raycaster.intersectObjects([...placementObjects.values()], true);
  return hits.length ? findPlacementRoot(hits[0].object) : null;
}

function syncSelectionHelper() {
  const root = selectedId ? placementObjects.get(selectedId) : null;
  if (!root) { selectionHelper.visible = false; return; }
  selectionHelper.box.setFromObject(root);
  selectionHelper.visible = true;
}

function selectPlacement(id) {
  selectedId = id && placementObjects.has(id) ? id : null;
  syncSelectionHelper();
  const record = selectedId ? documentModel.placements.get(selectedId) : null;
  selectionEl.textContent = record
    ? `${record.id} · ${getPass18Asset(record.asset).label}\n${record.section || '—'} · chunk ${record.chunk}\npos ${record.position.join(', ')}\nrotY ${record.rotationY.toFixed(2)} · scale ${record.scale.map(v => v.toFixed(2)).join('/')}`
    : 'Nothing selected';
  refreshSummary();
  return record ? { ...record } : null;
}

function setMode(mode) {
  const allowed = ['place', 'select', 'move', 'rotate', 'scale', 'scatter', 'path', 'fence'];
  if (!allowed.includes(mode)) throw new Error(`Unknown editor mode ${mode}`);
  activeMode = mode;
  [...modeButtons.querySelectorAll('[data-mode]')].forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
  modeBadge.textContent = `${mode.toUpperCase()} · ${getPass18Asset(activeAssetId).label}`;
  canvas.dataset.mode = mode;
  return mode;
}

function defaultAssetTarget(assetId) {
  return pass18DefaultTargetMax(assetId);
}

async function buildPlacementObject(record, { select = false } = {}) {
  const object = await registry.clone(record.asset, { castShadow: true, receiveShadow: true });
  const root = createPass18PlacementRoot(object, record, { anisotropy: Math.min(WL.materials.maxAnisotropy, renderer.capabilities.getMaxAnisotropy()) });
  editableRoot.add(root);
  placementObjects.set(record.id, root);
  if (select) selectPlacement(record.id);
  refreshSummary();
  return root;
}

async function placeAsset(assetId, position, options = {}) {
  getPass18Asset(assetId);
  const record = documentModel.addPlacement({
    asset: assetId,
    position,
    rotationY: options.rotationY || 0,
    scale: options.scale || [1, 1, 1],
    targetMax: options.targetMax || defaultAssetTarget(assetId),
    section: options.section || null,
    mode: options.mode || 'manual',
    tags: options.tags || [],
  });
  try {
    await buildPlacementObject(record, { select: options.select !== false });
    return record;
  } catch (error) {
    documentModel.removePlacement(record.id);
    throw error;
  }
}

function updatePlacement(id, patch = {}) {
  const record = documentModel.updatePlacement(id, patch);
  const root = placementObjects.get(id);
  if (root) applyPass18PlacementRecord(root, record);
  if (selectedId === id) selectPlacement(id); else refreshSummary();
  return record;
}

function removePlacement(id) {
  const record = documentModel.removePlacement(id);
  const root = placementObjects.get(id);
  if (root) { editableRoot.remove(root); placementObjects.delete(id); }
  if (selectedId === id) selectPlacement(null);
  refreshSummary();
  return record;
}

async function scatterAt(assetId, center, options = {}) {
  const asset = getPass18Asset(assetId);
  if (asset.category !== 'Nature' || !asset.repeatable) throw new Error('Scatter requires a repeatable Nature asset');
  const records = documentModel.scatter({
    asset: assetId,
    center,
    count: options.count ?? Number(scatterCount.value || 6),
    radius: options.radius ?? Number(scatterRadius.value || 3),
    seed: options.seed ?? scatterSeed++,
    targetMax: options.targetMax || defaultAssetTarget(assetId),
  });
  for (const record of records) {
    const y = surfaceYAt(record.position[0], record.position[2], record.position[1]);
    const adjusted = documentModel.updatePlacement(record.id, { position: [record.position[0], y, record.position[2]] });
    await buildPlacementObject(adjusted, { select: false });
  }
  if (records.length) selectPlacement(records[records.length - 1].id);
  refreshSummary();
  return records.map(record => ({ ...documentModel.placements.get(record.id) }));
}

function polylineColor(role) {
  return role === 'fence' ? 0x53d0c3 : 0xffd45a;
}

function makePolylineVisual(points, role, opacity = 0.95) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(point => new THREE.Vector3(...point).add(new THREE.Vector3(0, 0.12, 0))));
  const material = new THREE.LineBasicMaterial({ color: polylineColor(role), transparent: true, opacity, depthTest: true });
  const line = new THREE.Line(geometry, material);
  line.userData.pass18EditorPolyline = role;
  return line;
}

function refreshCurrentPolyline() {
  if (currentPolylineVisual) {
    polylineRoot.remove(currentPolylineVisual);
    currentPolylineVisual.geometry.dispose(); currentPolylineVisual.material.dispose();
    currentPolylineVisual = null;
  }
  if (currentPolyline.points.length >= 2) {
    currentPolylineVisual = makePolylineVisual(currentPolyline.points, currentPolyline.role, 0.75);
    currentPolylineVisual.userData.pass18EditorDraft = true;
    polylineRoot.add(currentPolylineVisual);
  }
  finishPolylineButton.disabled = currentPolyline.points.length < 2;
}

function addPolylinePoint(role, point) {
  if (currentPolyline.role && currentPolyline.role !== role) clearCurrentPolyline();
  currentPolyline.role = role;
  currentPolyline.points.push(documentModel.snapPosition(point));
  refreshCurrentPolyline();
  refreshSummary();
  return currentPolyline.points.map(p => [...p]);
}

function clearCurrentPolyline() {
  currentPolyline = { role: null, points: [] };
  refreshCurrentPolyline();
}

function renderCommittedPolyline(record) {
  const line = makePolylineVisual(record.points, record.role, 0.92);
  line.userData.pass18PolylineId = record.id;
  polylineRoot.add(line);
  committedPolylineVisuals.set(record.id, line);
}

function commitCurrentPolyline() {
  if (currentPolyline.points.length < 2 || !currentPolyline.role) return null;
  const role = currentPolyline.role;
  const record = documentModel.addPolyline({
    role,
    points: currentPolyline.points,
    assetHint: role === 'fence' ? 'kaykit.barrier.green' : 'nature.path.bend',
    spacing: role === 'fence' ? 1.5 : 1.2,
    width: role === 'path' ? 1.8 : 0.35,
  });
  renderCommittedPolyline(record);
  clearCurrentPolyline();
  refreshSummary();
  return record;
}

function addPolyline(role, points, options = {}) {
  const record = documentModel.addPolyline({
    role,
    points,
    assetHint: options.assetHint || (role === 'fence' ? 'kaykit.barrier.green' : 'nature.path.bend'),
    spacing: options.spacing || (role === 'fence' ? 1.5 : 1.2),
    width: options.width || (role === 'path' ? 1.8 : 0.35),
  });
  renderCommittedPolyline(record);
  refreshSummary();
  return record;
}

function captureCamera(label = cameraLabel.value.trim()) {
  const record = documentModel.addCamera({
    label,
    position: camera.position.toArray(),
    target: orbit.target.toArray(),
    fov: camera.fov,
  });
  cameraLabel.value = '';
  refreshSummary();
  return record;
}

function exportAuthoringObject() {
  return documentModel.exportObject({ name: 'Prism Valley Pass 18 authoring', includeGeneratedAt: false });
}

function downloadAuthoringJson() {
  const data = documentModel.exportJSON({ name: 'Prism Valley Pass 18 authoring', includeGeneratedAt: true });
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'prism-valley-pass18-authoring.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function refreshSummary() {
  if (!documentModel) return;
  const snap = documentModel.snapshot();
  const reg = registry.snapshot();
  summaryEl.textContent = `${snap.placements} placements · ${snap.polylines} polylines · ${snap.cameras} cameras\n${snap.chunks} chunks · ${reg.uniqueSources} sources · ${reg.failures.length} failures`;
  modeBadge.textContent = `${activeMode.toUpperCase()} · ${getPass18Asset(activeAssetId).label}`;
}

function buildPalette() {
  const categories = ['All', ...pass18Categories()];
  for (const category of categories) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = category; button.dataset.category = category;
    if (category === 'All') button.classList.add('active');
    categoryFilters.appendChild(button);
  }

  function refresh() {
    const q = assetSearch.value.trim().toLowerCase();
    const matches = PASS18_ASSETS.filter(asset =>
      (activeCategory === 'All' || asset.category === activeCategory) &&
      (!q || `${asset.label} ${asset.id} ${asset.pack} ${asset.category}`.toLowerCase().includes(q))
    );
    assetList.innerHTML = '';
    for (const asset of matches) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'assetRow'; button.dataset.assetId = asset.id;
      if (asset.id === activeAssetId) button.classList.add('active');
      button.innerHTML = `<b>${asset.label}</b><span>${asset.category} · ${asset.pack}${asset.repeatable ? ' · repeatable' : ''}</span><code>${asset.id}</code>`;
      assetList.appendChild(button);
    }
    assetList.dataset.visibleCount = String(matches.length);
    return matches.length;
  }

  categoryFilters.addEventListener('click', event => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    [...categoryFilters.children].forEach(child => child.classList.toggle('active', child === button));
    refresh();
  });
  assetSearch.addEventListener('input', refresh);
  assetList.addEventListener('click', event => {
    const button = event.target.closest('button[data-asset-id]');
    if (!button) return;
    activeAssetId = button.dataset.assetId;
    refresh();
    setMode('place');
  });
  return refresh;
}

const refreshPalette = buildPalette();

function configureSnapFromUi() {
  if (!documentModel) return;
  documentModel.configureSnap({
    snapGrid: gridSnap.checked,
    snapVertical: verticalSnap.checked,
    gridStep: Math.max(0.05, Number(gridStep.value || 0.5)),
    verticalStep: Math.max(0.05, Number(verticalStep.value || 0.25)),
  });
  refreshSummary();
}

gridSnap.addEventListener('change', configureSnapFromUi);
verticalSnap.addEventListener('change', configureSnapFromUi);
gridStep.addEventListener('change', configureSnapFromUi);
verticalStep.addEventListener('change', configureSnapFromUi);
modeButtons.addEventListener('click', event => {
  const button = event.target.closest('button[data-mode]');
  if (button) setMode(button.dataset.mode);
});

deleteButton.addEventListener('click', () => { if (selectedId) removePlacement(selectedId); });
finishPolylineButton.addEventListener('click', commitCurrentPolyline);
clearPolylineButton.addEventListener('click', clearCurrentPolyline);
captureCameraButton.addEventListener('click', () => captureCamera());
exportButton.addEventListener('click', downloadAuthoringJson);

document.querySelectorAll('[data-nudge]').forEach(button => button.addEventListener('click', () => {
  if (!selectedId) return;
  const record = documentModel.placements.get(selectedId);
  const step = documentModel.snap.gridStep;
  const vertical = documentModel.snap.verticalStep;
  const [x, y, z] = record.position;
  const code = button.dataset.nudge;
  const positions = {
    xm: [x - step, y, z], xp: [x + step, y, z],
    ym: [x, y - vertical, z], yp: [x, y + vertical, z],
    zm: [x, y, z - step], zp: [x, y, z + step],
  };
  if (positions[code]) updatePlacement(selectedId, { position: positions[code] });
}));

document.querySelectorAll('[data-camera]').forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.camera;
  if (action === 'left') cameraNudge({ yaw: -0.14 });
  if (action === 'right') cameraNudge({ yaw: 0.14 });
  if (action === 'up') cameraNudge({ pitch: 0.08 });
  if (action === 'down') cameraNudge({ pitch: -0.08 });
  if (action === 'in') cameraNudge({ zoom: 0.86 });
  if (action === 'out') cameraNudge({ zoom: 1.16 });
}));

function updateSelectedFromRoot(root) {
  const id = root.userData.pass18PlacementId;
  const patch = {
    position: root.position.toArray(),
    rotationY: root.rotation.y,
    scale: root.scale.toArray(),
  };
  const record = documentModel.updatePlacement(id, patch);
  applyPass18PlacementRecord(root, record);
  selectPlacement(id);
  return record;
}

function beginObjectInteraction(event, root) {
  selectPlacement(root.userData.pass18PlacementId);
  const record = documentModel.placements.get(selectedId);
  interaction = {
    kind: activeMode,
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    startRotation: record.rotationY,
    startScale: [...record.scale],
    startPosition: [...record.position],
  };
  canvas.setPointerCapture?.(event.pointerId);
}

canvas.addEventListener('pointerdown', async event => {
  if (!documentModel) return;
  if (event.button === 2 || event.altKey) {
    interaction = { kind: 'camera', pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture?.(event.pointerId);
    return;
  }

  const root = placementFromEvent(event);
  if (['select', 'move', 'rotate', 'scale'].includes(activeMode) && root) {
    if (activeMode === 'select') selectPlacement(root.userData.pass18PlacementId);
    else beginObjectInteraction(event, root);
    return;
  }
  if (activeMode === 'select') { selectPlacement(null); return; }

  const point = surfacePointFromEvent(event);
  if (!point) return;
  try {
    if (activeMode === 'place') await placeAsset(activeAssetId, point);
    else if (activeMode === 'scatter') await scatterAt(activeAssetId, point);
    else if (activeMode === 'path' || activeMode === 'fence') addPolylinePoint(activeMode, point);
  } catch (error) {
    console.error(error); status.textContent = `EDITOR: ${error.message}`;
  }
});

canvas.addEventListener('pointermove', event => {
  if (!interaction || interaction.pointerId !== event.pointerId || !documentModel) return;
  if (interaction.kind === 'camera') {
    const dx = event.clientX - interaction.x, dy = event.clientY - interaction.y;
    interaction.x = event.clientX; interaction.y = event.clientY;
    orbit.yaw -= dx * 0.006;
    orbit.pitch += dy * 0.004;
    applyOrbit();
    return;
  }
  const root = selectedId ? placementObjects.get(selectedId) : null;
  if (!root) return;
  if (interaction.kind === 'move') {
    if (event.shiftKey) {
      const dy = interaction.y - event.clientY;
      const y = interaction.startPosition[1] + dy * 0.045;
      root.position.fromArray(documentModel.snapPosition([interaction.startPosition[0], y, interaction.startPosition[2]]));
    } else {
      const point = surfacePointFromEvent(event);
      if (point) root.position.fromArray(point);
    }
  } else if (interaction.kind === 'rotate') {
    let value = interaction.startRotation + (event.clientX - interaction.x) * 0.012;
    if (documentModel.snap.snapGrid) value = Math.round(value / (Math.PI / 12)) * (Math.PI / 12);
    root.rotation.y = value;
  } else if (interaction.kind === 'scale') {
    let scalar = Math.max(0.15, interaction.startScale[0] + (interaction.y - event.clientY) * 0.012);
    if (documentModel.snap.snapGrid) scalar = Math.round(scalar * 10) / 10;
    root.scale.setScalar(scalar);
  }
  syncSelectionHelper();
});

function endPointerInteraction(event) {
  if (!interaction || interaction.pointerId !== event.pointerId) return;
  if (interaction.kind !== 'camera') {
    const root = selectedId ? placementObjects.get(selectedId) : null;
    if (root) updateSelectedFromRoot(root);
  }
  interaction = null;
  canvas.releasePointerCapture?.(event.pointerId);
}
canvas.addEventListener('pointerup', endPointerInteraction);
canvas.addEventListener('pointercancel', endPointerInteraction);
canvas.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('wheel', event => {
  event.preventDefault();
  cameraNudge({ zoom: event.deltaY > 0 ? 1.08 : 0.92 });
}, { passive: false });

addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  const keyModes = { '1': 'place', '2': 'select', '3': 'move', '4': 'rotate', '5': 'scale', g: 'scatter', p: 'path', f: 'fence' };
  if (keyModes[event.key.toLowerCase()]) setMode(keyModes[event.key.toLowerCase()]);
  if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) removePlacement(selectedId);
  if (event.key === 'Enter' && currentPolyline.points.length >= 2) commitCurrentPolyline();
  if (event.key === 'Escape') clearCurrentPolyline();
});

function addStructuralGuides() {
  const riverPoints = manifest.river.points.map(p => new THREE.Vector3(...p).add(new THREE.Vector3(0, 0.08, 0)));
  const river = new THREE.Line(new THREE.BufferGeometry().setFromPoints(riverPoints), new THREE.LineBasicMaterial({ color: 0x2f9fc6, transparent: true, opacity: 0.72 }));
  river.userData.pass18EditorGuide = 'river'; routeRoot.add(river);
  const colors = { main: 0xffd45a, springShortcut: 0x58e6ff, pipeLoop: 0x52d6a5, cloverMastery: 0xe686ff, lowerBypass: 0x98c8ff, ruinHighRoute: 0xff8ac7 };
  for (const [id, route] of Object.entries(manifest.routes)) {
    const points = route.points.map(p => new THREE.Vector3(p[0], p[1] + 0.22, p[2]));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: colors[id] || 0xffffff, transparent: true, opacity: id === 'main' ? 0.72 : 0.38 }));
    line.userData.pass18EditorGuide = id; routeRoot.add(line);
  }
}

async function loadStructuralAsset(placement, kind) {
  const object = await registry.clone(placement.asset, { castShadow: true, receiveShadow: true });
  preparePass18Renderable(object, { anisotropy: Math.min(WL.materials.maxAnisotropy, renderer.capabilities.getMaxAnisotropy()) });
  const record = {
    id: `locked-${placement.id}`,
    asset: placement.asset,
    position: placement.position,
    rotationY: placement.rotationY || 0,
    scale: [1, 1, 1],
    targetMax: placement.targetMax,
  };
  const root = createPass18PlacementRoot(object, record);
  root.userData.pass18EditorLocked = true;
  root.userData.pass18StructuralKind = kind;
  structuralRoot.add(root);
  collectPass18Meshes(root, worldRaycastMeshes);
}

function uiMetrics() {
  const viewport = { width: innerWidth, height: innerHeight };
  const box = id => {
    const el = document.getElementById(id); if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  };
  return { viewport, palette: box('palettePanel'), tools: box('toolPanel'), visibleAssets: Number(assetList.dataset.visibleCount || 0) };
}

function getMetrics() {
  return {
    schema: PASS18_EDITOR_SCHEMA,
    worldLanguage: WL.version,
    manifestVersion: manifest?.version || null,
    paletteCount: PASS18_ASSETS.length,
    activeAssetId,
    activeMode,
    selectedId,
    state: documentModel?.snapshot() || null,
    registry: registry.snapshot(),
    render: { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures },
    structuralRaycastMeshes: worldRaycastMeshes.length,
    ui: uiMetrics(),
    camera: { position: camera.position.toArray(), target: orbit.target.toArray(), fov: camera.fov },
  };
}

function paletteSearch(query = '', category = 'All') {
  const q = query.trim().toLowerCase();
  return PASS18_ASSETS.filter(asset =>
    (category === 'All' || asset.category === category) &&
    (!q || `${asset.label} ${asset.id} ${asset.pack} ${asset.category}`.toLowerCase().includes(q))
  ).map(asset => ({ ...asset }));
}

async function build() {
  status.textContent = 'Loading 18-1 structural world into authoring tool…';
  const response = await fetch('../../data/pass18/world-skeleton.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`world-skeleton.json HTTP ${response.status}`);
  manifest = await response.json();
  if (manifest.version !== '18-1.0') throw new Error(`Unexpected structural manifest ${manifest.version}`);
  documentModel = new Pass18EditorDocument({ cellSize: 24, sections: manifest.sections });
  configureSnapFromUi();

  for (const placement of manifest.terrain) await loadStructuralAsset(placement, 'terrain');
  for (const placement of manifest.structures) await loadStructuralAsset(placement, 'structure');
  addStructuralGuides();
  const overview = manifest.cameraViews?.overview || { position: [31, 34, 38], target: [0, 6, -8] };
  setOrbitFromPose(overview.position, overview.target);
  refreshPalette();
  setMode('select');
  refreshSummary();

  if (!worldRaycastMeshes.length) throw new Error('No structural raycast surfaces loaded');
  if (registry.snapshot().failures.length) throw new Error(`Asset failures ${JSON.stringify(registry.snapshot().failures)}`);

  window.__pass18Editor = {
    schema: PASS18_EDITOR_SCHEMA,
    registry,
    get document() { return documentModel; },
    get manifest() { return manifest; },
    getMetrics,
    paletteSearch,
    setMode,
    select: selectPlacement,
    place: (asset, position, options = {}) => placeAsset(asset, position, options),
    update: updatePlacement,
    remove: removePlacement,
    scatter: (asset, center, options = {}) => scatterAt(asset, center, options),
    addPolyline,
    captureCamera,
    setCameraPose(position, target, fov = camera.fov) { camera.fov = fov; camera.updateProjectionMatrix(); setOrbitFromPose(position, target); return getMetrics().camera; },
    exportObject: exportAuthoringObject,
    exportJSON: () => documentModel.exportJSON({ name: 'Prism Valley Pass 18 authoring', includeGeneratedAt: false }),
    configureSnap(options) {
      const next = documentModel.configureSnap(options); refreshSummary(); return next;
    },
  };
  document.documentElement.dataset.pass18EditorReady = '1';
  window.__pass18EditorReady = true;
  status.textContent = `18-1B READY · ${PASS18_ASSETS.length} approved assets · ${manifest.terrain.length + manifest.structures.length} structural anchors`;
}

let lastSummary = 0;
function animate(now) {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (documentModel && now - lastSummary > 650) { lastSummary = now; refreshSummary(); syncSelectionHelper(); }
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
  document.documentElement.dataset.pass18EditorFailed = '1';
  window.__pass18EditorError = String(error?.stack || error);
});
