import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PASS18_WORLD_LANGUAGE as WL, pass18MobileProfile, pass18PixelRatio } from './world-language.js';

const canvas = document.getElementById('calibration');
const status = document.getElementById('status');
const metricsEl = document.getElementById('metrics');
const mobile = pass18MobileProfile();
const pixelRatio = pass18PixelRatio(window.devicePixelRatio || 1, mobile);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: WL.renderer.antialias, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = WL.renderer.exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(WL.palette.fog, WL.atmosphere.fogNear, WL.atmosphere.fogFar);

const camera = new THREE.PerspectiveCamera(mobile ? WL.camera.mobileFov : WL.camera.desktopFov, window.innerWidth / window.innerHeight, WL.camera.near, WL.camera.far);
const cameraPose = mobile
  ? { position: [16.5, 7.1, 20.0], target: [0.0, 1.9, -10.0] }
  : { position: [15.0, 6.6, 18.0], target: [0.0, 1.7, -10.0] };
camera.position.fromArray(cameraPose.position);
camera.lookAt(...cameraPose.target);

const hemi = new THREE.HemisphereLight(WL.palette.hemiSky, WL.palette.hemiGround, WL.lighting.hemisphereIntensity);
scene.add(hemi);

const sun = new THREE.DirectionalLight(WL.palette.sun, WL.lighting.sunIntensity);
sun.position.fromArray(WL.lighting.sunPosition);
sun.castShadow = true;
sun.shadow.mapSize.set(mobile ? WL.renderer.shadowMapMobile : WL.renderer.shadowMapDesktop, mobile ? WL.renderer.shadowMapMobile : WL.renderer.shadowMapDesktop);
sun.shadow.bias = WL.lighting.shadowBias;
sun.shadow.normalBias = WL.lighting.shadowNormalBias;
sun.shadow.radius = mobile ? WL.lighting.shadowRadiusMobile : WL.lighting.shadowRadiusDesktop;
Object.assign(sun.shadow.camera, WL.lighting.shadowCamera);
sun.shadow.camera.updateProjectionMatrix();
scene.add(sun);

const fill = new THREE.DirectionalLight(0xd9f2ff, WL.lighting.fillIntensity);
fill.position.set(-14, 9, 16);
scene.add(fill);

const loader = new GLTFLoader();
const cache = new Map();
const loadedAssets = [];
const failures = [];
const assetRoot = new URL('../../assets/world-kit/kenney/nature-kit/', import.meta.url);

function loadAsset(file) {
  if (!cache.has(file)) {
    const url = new URL(file, assetRoot).href;
    cache.set(file, new Promise((resolve, reject) => loader.load(url, gltf => resolve(gltf.scene), undefined, reject)));
  }
  return cache.get(file).then(source => source.clone(true));
}

function prepareObject(object, { cast = true, receive = true } = {}) {
  object.traverse(node => {
    if (!node.isMesh) return;
    node.castShadow = cast;
    node.receiveShadow = receive;
    if (node.material) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        if (material.map) {
          material.map.colorSpace = THREE.SRGBColorSpace;
          material.map.anisotropy = Math.min(WL.materials.maxAnisotropy, renderer.capabilities.getMaxAnisotropy());
        }
      }
    }
  });
}

function fitAndPlace(object, targetMax, position, rotationY = 0, options = {}) {
  prepareObject(object, options);
  object.rotation.y = rotationY;
  object.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetMax / maxSize;
  object.scale.multiplyScalar(scale);
  object.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.set(position[0] - center.x, position[1] - box.min.y, position[2] - center.z);
  object.updateMatrixWorld(true);
  return object;
}

async function add(file, targetMax, position, rotationY = 0, options = {}) {
  try {
    const object = await loadAsset(file);
    fitAndPlace(object, targetMax, position, rotationY, options);
    object.userData.pass18Asset = file;
    scene.add(object);
    loadedAssets.push(file);
    return object;
  } catch (error) {
    failures.push({ file, message: String(error?.message || error) });
    console.error('Pass18 calibration asset failed', file, error);
    return null;
  }
}

async function buildCalibrationScene() {
  status.textContent = 'Loading layered Nature Kit terrain…';

  // Every visible landform/prop below is a real Kenney Nature Kit asset. No proxy terrain.
  // Four compatible ground modules form a small continuous valley vocabulary instead of one giant plane.
  await add('ground_pathBend.glb', 12.2, [-6.0, -0.08, -4.0], 0, { cast: false, receive: true });
  await add('ground_riverStraight.glb', 12.2, [6.0, -0.08, -4.0], 0, { cast: false, receive: true });
  await add('ground_grass.glb', 12.2, [-6.0, -0.08, -16.0], 0, { cast: false, receive: true });
  await add('ground_riverBend.glb', 12.2, [6.0, -0.08, -16.0], Math.PI, { cast: false, receive: true });

  // Midground landmark and layered shelves. Keep terrain modules modest: giant block backdrops are rejected.
  await add('bridge_stone.glb', 7.0, [5.7, 0.18, -6.0], Math.PI * 0.5);
  await add('platform_grass.glb', 7.4, [-6.3, 0.55, -15.3], 0.12);
  await add('cliff_large_rock.glb', 5.8, [-8.7, 0.0, -21.1], 0.18);
  await add('cliff_cornerLarge_rock.glb', 5.6, [-1.0, 0.0, -22.1], -0.34);
  await add('cliff_steps_rock.glb', 5.2, [7.1, 0.0, -21.0], 0.24);
  await add('cliff_waterfallTop_rock.glb', 4.8, [11.0, 0.15, -19.8], -0.15);

  // Vegetation and prop silhouette layers.
  await add('tree_default.glb', 6.6, [-8.0, 0.0, -8.7], -0.35);
  await add('tree_oak.glb', 5.8, [-2.4, 0.0, -16.0], 0.24);
  await add('tree_tall.glb', 6.1, [8.6, 0.0, -12.6], 0.42);
  await add('plant_bushDetailed.glb', 1.9, [-2.7, 0.0, -7.2], 0.25, { cast: false, receive: true });
  await add('plant_bushLarge.glb', 2.3, [4.0, 0.0, -13.6], -0.18, { cast: false, receive: true });
  await add('rock_largeA.glb', 2.4, [2.4, 0.0, -2.2], -0.2);
  await add('rock_largeC.glb', 1.9, [-4.0, 0.0, -2.8], 0.5);
  await add('fence_simple.glb', 3.3, [-5.6, 0.0, -6.8], Math.PI * 0.45, { cast: false, receive: true });
  await add('path_stone.glb', 2.3, [-1.0, 0.0, -3.8], 0.2, { cast: false, receive: true });

  const small = [
    ['flower_purpleA.glb', 0.82, [-4.5, 0.0, -4.7], 0.0],
    ['flower_yellowB.glb', 0.78, [-3.8, 0.0, -4.1], 0.7],
    ['flower_redC.glb', 0.76, [3.0, 0.0, -9.3], 0.2],
    ['grass.glb', 1.0, [1.8, 0.0, -1.8], 0.0],
    ['grass_large.glb', 1.2, [6.5, 0.0, -10.1], -0.3],
    ['mushroom_redGroup.glb', 0.88, [-7.8, 0.0, -3.0], 0.0]
  ];
  for (const [file, size, pos, rot] of small) await add(file, size, pos, rot, { cast: false, receive: true });

  if (failures.length) throw new Error(`Calibration asset failures: ${JSON.stringify(failures)}`);
  if (loadedAssets.length < 24) throw new Error(`Expected >=24 real asset placements, loaded ${loadedAssets.length}`);

  status.textContent = mobile ? 'Android look profile — layered real-asset proof' : 'Desktop look profile — layered real-asset proof';
  document.documentElement.dataset.pass18Ready = '1';
  window.__pass18CalibrationReady = true;
}

const frameSamples = [];
let lastFrame = performance.now();
let sampleStart = lastFrame;
function animate(now) {
  requestAnimationFrame(animate);
  const dt = now - lastFrame;
  lastFrame = now;
  if (document.documentElement.dataset.pass18Ready === '1' && dt > 0 && dt < 250) {
    frameSamples.push(dt);
    if (frameSamples.length > 180) frameSamples.shift();
  }
  renderer.render(scene, camera);
  if (now - sampleStart > 500) {
    sampleStart = now;
    const avg = frameSamples.length ? frameSamples.reduce((a, b) => a + b, 0) / frameSamples.length : 0;
    const fps = avg ? 1000 / avg : 0;
    metricsEl.textContent = `${mobile ? 'MOBILE' : 'DESKTOP'} · DPR ${pixelRatio.toFixed(2)} · ${loadedAssets.length} placements · ${renderer.info.render.calls} calls · ${fps.toFixed(1)} fps`;
  }
}
requestAnimationFrame(animate);

function resize() {
  renderer.setPixelRatio(pass18PixelRatio(window.devicePixelRatio || 1, mobile));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize, { passive: true });

window.__pass18Calibration = {
  version: WL.version,
  mobile,
  pixelRatio,
  cameraPose,
  getMetrics() {
    const avgMs = frameSamples.length ? frameSamples.reduce((a, b) => a + b, 0) / frameSamples.length : 0;
    return {
      version: WL.version,
      mobile,
      pixelRatio,
      fov: camera.fov,
      exposure: renderer.toneMappingExposure,
      toneMapping: WL.renderer.toneMapping,
      fogNear: scene.fog.near,
      fogFar: scene.fog.far,
      shadowMapSize: sun.shadow.mapSize.x,
      loadedAssets: [...loadedAssets],
      uniqueAssets: [...new Set(loadedAssets)],
      failures: [...failures],
      renderCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      avgFrameMs: Number(avgMs.toFixed(2)),
      fps: avgMs ? Number((1000 / avgMs).toFixed(1)) : 0,
      canvasWidth: renderer.domElement.width,
      canvasHeight: renderer.domElement.height
    };
  }
};

buildCalibrationScene().catch(error => {
  console.error(error);
  status.textContent = `FAILED: ${error.message}`;
  document.documentElement.dataset.pass18Failed = '1';
  window.__pass18CalibrationError = String(error?.stack || error);
});
