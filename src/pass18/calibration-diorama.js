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
const matMode = ['raw', 'fixed', 'fixed2', 'fixed3'].includes(matModeParam) ? matModeParam : 'fixed';
// Round-2 isolated variables, only meaningful under mat=fixed3:
const useAO = params.get('ao') !== '0';           // height-based fake AO shader injection
const useToneMap = params.get('tonemap') !== 'none'; // ACES vs none, tested directly per instructions
const useGrassCap = params.get('grasscap') === '1';  // grass-over-rock seam geometry
const useRim = params.get('rim') === '1';            // optional cool rim/back light

const canvas = document.getElementById('dio');
const status = document.getElementById('status');
const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = (matMode === 'fixed3' && !useToneMap) ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = matMode === 'raw' ? 1.0 : (matMode === 'fixed' ? 1.18 : (matMode === 'fixed3' ? (useToneMap ? 0.98 : 0.78) : 0.92));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const skyColor = matMode === 'fixed3' ? 0xa8d9ee : 0xaee3f5;
scene.background = new THREE.Color(skyColor);
// Experiment 8: warmer, slightly less cyan fog tint for fixed3 — a color
// change only, same near/far distances, tested (not assumed) at this scale.
scene.fog = new THREE.Fog(matMode === 'fixed3' ? 0xd8e9e4 : 0xcdeef8, 9, 26);

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
} else if (matMode === 'fixed3') {
  // Round 2: same "single dominant warm key, weak fill" philosophy as
  // fixed2 (that part tested well), refined further — slightly softer
  // shadow, optional cool rim light tested independently (see report §5).
  scene.add(new THREE.HemisphereLight(0xfff2d9, 0x3f5a2c, 0.7));
  const sun = new THREE.DirectionalLight(0xfff0d0, 2.2);
  sun.position.set(6, 8.5, 4.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -6; sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 20;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = 3.0;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbcd8ee, 0.14);
  fill.position.set(-5, 4, -3);
  scene.add(fill);
  if (useRim) {
    const rim = new THREE.DirectionalLight(0xbfe3ff, 0.35);
    rim.position.set(-3, 3, 6);
    scene.add(rim);
  }
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
window.__dio = { scene, root, renderer, THREE };

// Experiment 1 (report §1): per-material-FAMILY treatment instead of one
// blanket saturation multiplier. The kit reuses material NAMES across roles
// that should read differently (cliff_large_rock's rock surface and every
// path tile's dirt trim are both literally named "dirt" with the same
// color) — so this keys off the declared ROLE of the placement, not the
// glTF material name, and treats grass/foliage/rock/path/wood/flower
// distinctly. Tested against the prior blanket +55% saturation (fixed2).
// All values below were tuned EMPIRICALLY against the real runtime
// Color.getHSL()/setHSL() output (reading actual resulting hex back out of
// the live scene), not pre-computed externally. glTF baseColorFactor is
// defined in LINEAR space, and Three's ColorManagement keeps material.color
// in that same working space — so getHSL/setHSL operate in linear-space
// HSL, which does NOT match an sRGB-gamma HSL model (e.g. Python's
// colorsys). An external sRGB-space model of this same shift predicted a
// richer brown for "wood" than the linear-space edit actually produced
// (pale f6bc97 instead of the intended richer tone) — caught by reading the
// runtime color back out, not by trusting the prediction. Every value here
// is the result of that empirical loop, not a formula.
const FAMILY = {
  grass:   { hueShift: -0.16,  satMul: 1.00, lightAdd: 0.05,  greyMul: 0,    roughness: 0.88 },
  foliage: { hueShift: -0.10,  satMul: 0.95, lightAdd: 0.0,   greyMul: 0,    roughness: 0.80 },
  rock:    { hueShift: 0.0,    satMul: 0.60, lightAdd: -0.15, greyMul: 0.35, roughness: 0.60 },
  path:    { hueShift: 0.0,    satMul: 1.05, lightAdd: -0.04, greyMul: 0,    roughness: 0.92 },
  wood:    { hueShift: 0.0,    satMul: 1.15, lightAdd: -0.18, greyMul: 0,    roughness: 0.68 },
  flower:  { hueShift: 0.0,    satMul: 1.05, lightAdd: -0.13, greyMul: 0,    roughness: 0.42 },
};
const ROCK_GREY = new THREE.Color(0x8d8779);
const hsl = { h: 0, s: 0, l: 0 };

// Experiment 2 (report §2): low-frequency, texture-free "contact AO" —
// darkens each mesh toward its own local ground (y≈0) fading out by
// y≈0.7, independent of light direction, approximating the crevice/contact
// shadow pooling visible in the concept without any photographic texture.
function injectHeightAO(material) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vAOHeight;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAOHeight = position.y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vAOHeight;')
      .replace('#include <dithering_fragment>',
        'float aoT = clamp(vAOHeight / 0.7, 0.0, 1.0);\nfloat aoDark = mix(0.7, 1.0, aoT);\ngl_FragColor.rgb *= aoDark;\n#include <dithering_fragment>');
  };
  material.customProgramCacheKey = () => 'heightAO';
  material.needsUpdate = true;
}

// registry.clone() intentionally SHARES the underlying Material across every
// instance of the same source asset (see asset-registry.js) — geometry is
// cloned, materials are not. This diorama places some assets many times
// (20 ground tiles share one "grass" material object), so a naive transform
// applied inside every place() call would re-apply itself cumulatively on
// the same shared material each time. That bug produced a pure-white ground
// (20x compounding lightAdd pushed HSL lightness to 1.0, which is white
// regardless of hue/saturation) on the first fixed3 render — caught by
// reading the actual runtime material color back out of the live scene
// rather than trusting the screenshot's plausibility. Track already-treated
// materials by identity so each one is transformed exactly once per mode.
const treatedMaterials = new WeakSet();

// A placement's declared role (e.g. 'foliage' for a whole tree) is only a
// fallback — a single object can contain multiple materials that need
// DIFFERENT families (a tree is woodBark trunk + leafsGreen canopy; the
// first attempt applied one 'foliage' treatment to both and shifted the
// trunk's hue toward green, rendering it pink). Recognized material names
// route to their real family; only a genuinely ambiguous name ("dirt" is
// reused by both cliff rock and path dirt in the source kit) falls back to
// the caller's declared role.
const NAME_TO_FAMILY = {
  grass: 'grass', leafsGreen: 'foliage', woodBark: 'wood',
  colorPurple: 'flower', colorYellow: 'flower',
};
// "dirt"/"dirtDark" is reused for the cliff's rock face, every path tile's
// trim, AND platform_grass's small underside/edge trim. The first two are
// legitimately ambiguous (resolved by the caller's declared role below) —
// but naively falling back to a caller-declared role of 'grass' (as
// platform.grass placements pass) applied the grass family's hue-shift
// (tuned for grass's ~169° teal hue) to dirt's ~19° orange-brown hue,
// rotating it into pink/magenta. Only 'rock' or 'path' are ever valid
// resolutions for a dirt-named material; anything else defaults to 'path'.
function resolveFamily(materialName, declaredFamily) {
  if (NAME_TO_FAMILY[materialName]) return NAME_TO_FAMILY[materialName];
  if (materialName === 'dirt' || materialName === 'dirtDark') {
    return declaredFamily === 'rock' ? 'rock' : 'path';
  }
  return declaredFamily;
}

function fixMaterials(object, family = 'grass') {
  if (matMode === 'raw') return;
  object.traverse(node => {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const m of materials) {
      if (!m || treatedMaterials.has(m)) continue;
      treatedMaterials.add(m);
      const resolvedFamily = resolveFamily(m.name, family);
      const treatment = matMode === 'fixed3' ? FAMILY[resolvedFamily] : null;
      const roughness = matMode === 'fixed2' ? 0.72 : (treatment ? treatment.roughness : 0.82);
      if (m.map) {
        // Unlike the Nature Kit, this asset already ships a real baseColor
        // texture with correct metalness/roughness (verified: KayKit's
        // barrier is metallicFactor:0, roughness:0.3, real PNG map) — this
        // is category A from the Phase-2 asset check, not category B.
        // Leave it alone; forcing our flat-color family roughness onto an
        // already-good textured material would make it worse, not better.
        continue;
      }
      m.metalness = 0.0;
      m.roughness = roughness;
      if (matMode === 'fixed2') {
        m.color.getHSL(hsl);
        m.color.setHSL(hsl.h, Math.min(1, hsl.s * 1.55), hsl.l);
      } else if (matMode === 'fixed3' && treatment) {
        m.color.getHSL(hsl);
        let h = (hsl.h + treatment.hueShift + 1) % 1;
        let s = Math.min(1, hsl.s * treatment.satMul);
        let l = Math.max(0, Math.min(1, hsl.l + treatment.lightAdd));
        m.color.setHSL(h, s, l);
        if (treatment.greyMul > 0) m.color.lerp(ROCK_GREY, treatment.greyMul);
        if (useAO) injectHeightAO(m);
      }
      m.needsUpdate = true;
    }
  });
}

async function place(assetId, position, rotationY = 0, scale = 1, family = 'grass') {
  const object = await registry.clone(assetId, { castShadow: true, receiveShadow: true });
  fixMaterials(object, family);
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
      await place('nature.ground.grass', [x, 0, z], 0, 1, 'grass');
    }
  }

  // Rock edge along the +Z side (the ledge the concept crop stands on,
  // dropping toward the valley) — cliff face + one corner, native scale.
  await place('nature.cliff.large', [-2, 0, 2], 0, 1, 'rock');
  await place('nature.cliff.large', [-1, 0, 2], 0, 1, 'rock');
  await place('nature.cliff.large', [0, 0, 2], 0, 1, 'rock');
  await place('nature.cliff.large', [1, 0, 2], 0, 1, 'rock');
  await place('nature.cliff.corner', [2, 0, 2], -Math.PI / 2, 1, 'rock');
  await place('nature.cliff.large', [2, 0, 1], -Math.PI / 2, 1, 'rock');

  // Experiment 3 (report §3): grass-over-rock transition. Rather than a
  // hard seam where the grass tile ends and the cliff tile begins, cap
  // each cliff module with a grass ledge that physically overlaps its top
  // edge, plus one grass tuft right at the lip — geometry solves the seam,
  // vegetation only lightly reinforces it (not "hidden with bushes").
  if (useGrassCap) {
    for (const x of [-2, -1, 0, 1]) {
      await place('nature.platform.grass', [x, 0.97, 1.72], 0, 1.05, 'grass');
    }
    await place('nature.platform.grass', [2, 0.97, 1.3], Math.PI / 2, 1.0, 'grass');
    await place('nature.grass', [-0.5, 0.97, 1.85], 0.3, 1.6, 'grass');
    await place('nature.grass', [0.6, 0.97, 1.8], 1.4, 1.6, 'grass');
  }

  // Short dirt path crossing the plinth.
  await place('nature.path.straight', [-1, 0, 0], 0, 1, 'path');
  await place('nature.path.straight', [0, 0, 0], 0, 1, 'path');

  // Wood fence along the ledge, echoing the concept's foreground railing.
  await place('kaykit.barrier.green', [-1.5, 0, 1.55], 0, 0.5, 'wood');
  await place('kaykit.barrier.green', [0.5, 0, 1.55], 0, 0.5, 'wood');

  // Vegetation: 2 trees, 1 bush, 2 flowers, 1 grass clump.
  const t1 = await registry.clone('nature.tree.default', { castShadow: true, receiveShadow: true });
  fixMaterials(t1, 'foliage'); t1.scale.setScalar(2.6); t1.position.set(-1.6, 0, -1.5); root.add(t1);
  const t2 = await registry.clone('nature.tree.oak', { castShadow: true, receiveShadow: true });
  fixMaterials(t2, 'foliage'); t2.scale.setScalar(2.2); t2.position.set(1.5, 0, -1.1); root.add(t2);
  const b1 = await registry.clone('nature.bush.detailed', { castShadow: true, receiveShadow: true });
  fixMaterials(b1, 'foliage'); b1.scale.setScalar(1.8); b1.position.set(0.9, 0, -1.4); root.add(b1);

  await place('nature.flower.purpleA', [-0.6, 0, 0.55], 0.4, 2.2, 'flower');
  await place('nature.flower.yellowB', [0.5, 0, 0.6], 1.1, 2.2, 'flower');
  await place('nature.grass', [-0.2, 0, -0.3], 0.8, 2.0, 'grass');
  await place('nature.rock.largeA', [1.7, 0, 0.6], 0.6, 1.4, 'rock');

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
