import * as THREE from 'three';
import { Pass18AssetRegistry } from './asset-registry.js';
import {
  createPass18PlacementRoot,
  groupPass18TerrainRecordsByAsset,
  pass18TileMatrix,
  expandPass18CreekBank,
  expandPass18CreekBankCorners,
} from './asset-placement.js';
import { PASS18_WORLD_LANGUAGE as WL, pass18MobileProfile, pass18PixelRatio } from './world-language.js';

const canvas = document.getElementById('goldenSlice');
const status = document.getElementById('status');
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
sun.position.set(18, 29, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(mobile ? WL.renderer.shadowMapMobile : WL.renderer.shadowMapDesktop, mobile ? WL.renderer.shadowMapMobile : WL.renderer.shadowMapDesktop);
sun.shadow.bias = WL.lighting.shadowBias;
sun.shadow.normalBias = WL.lighting.shadowNormalBias;
sun.shadow.radius = mobile ? WL.lighting.shadowRadiusMobile : WL.lighting.shadowRadiusDesktop;
sun.shadow.camera.left = -24; sun.shadow.camera.right = 24; sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -24; sun.shadow.camera.near = 1; sun.shadow.camera.far = 75; sun.shadow.camera.updateProjectionMatrix();
scene.add(sun);
const fill = new THREE.DirectionalLight(0xd9f2ff, WL.lighting.fillIntensity);
fill.position.set(-16, 11, 25); scene.add(fill);

const registry = new Pass18AssetRegistry();
const worldRoot = new THREE.Group(); worldRoot.name = 'Pass18GoldenSliceRealAssets'; scene.add(worldRoot);
const effectsRoot = new THREE.Group(); effectsRoot.name = 'Pass18GoldenSliceEffects'; scene.add(effectsRoot);
let manifest = null;
let waterMaterial = null;
const waterfallMaterials = [];
let currentView = 'concept';
let waterReady = false;
let waterfallsReady = false;

function buildRibbon(points, width) {
  const positions = [], uvs = [], indices = [];
  const p = points.map(v => new THREE.Vector3(...v));
  for (let i = 0; i < p.length; i += 1) {
    const prev = p[Math.max(0, i - 1)], next = p[Math.min(p.length - 1, i + 1)];
    const tangent = next.clone().sub(prev); tangent.y = 0; tangent.normalize();
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(width * 0.5);
    const left = p[i].clone().add(side), right = p[i].clone().sub(side);
    positions.push(left.x,left.y,left.z,right.x,right.y,right.z);
    const v = i / Math.max(1, p.length - 1);
    uvs.push(0,v,1,v);
    if (i < p.length - 1) {
      const a=i*2,b=a+1,c=a+2,d=a+3;
      indices.push(a,c,b,b,c,d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2));
  g.setIndex(indices); g.computeVertexNormals();
  return g;
}

function waterShader(color, opacity=0.88) {
  return new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0},uColor:{value:new THREE.Color(color)},uOpacity:{value:opacity}},
    transparent:true, depthWrite:false, side:THREE.DoubleSide,
    vertexShader:`varying vec2 vUv; varying float vWave; uniform float uTime; void main(){vUv=uv; vec3 p=position; float w=sin((uv.y*18.0)+(uTime*2.2))+sin((uv.x*12.0)-(uTime*1.6)); p.y += w*0.035; vWave=w; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec2 vUv; varying float vWave; uniform float uTime; uniform vec3 uColor; uniform float uOpacity; void main(){float streak=0.5+0.5*sin(vUv.y*42.0-uTime*4.0+vUv.x*6.0); float shine=smoothstep(0.72,1.0,streak)*0.22 + vWave*0.025; vec3 c=uColor+vec3(shine); gl_FragColor=vec4(c,uOpacity);}`
  });
}

function addWater() {
  waterMaterial = waterShader(manifest.water.color, 0.86);
  const mesh = new THREE.Mesh(buildRibbon(manifest.water.points, manifest.water.width), waterMaterial);
  mesh.renderOrder = 2; mesh.userData.pass18GoldenWater = true; effectsRoot.add(mesh);
  const foamMat = new THREE.MeshBasicMaterial({color:manifest.water.foamColor,transparent:true,opacity:0.68,depthWrite:false});
  const foamGeo = new THREE.CircleGeometry(0.36,12); foamGeo.rotateX(-Math.PI/2);
  for (const p of [manifest.water.points[2],manifest.water.points[3],manifest.water.points[4]]) {
    for (let i=0;i<5;i+=1) {
      const foam = new THREE.Mesh(foamGeo,foamMat);
      foam.position.set(p[0] + (i-2)*0.48, p[1]+0.055, p[2] + Math.sin(i*1.7)*0.32);
      foam.scale.set(1.5,0.7,1); foam.renderOrder=3; effectsRoot.add(foam);
    }
  }
  waterReady = true;
}

function addWaterfall(record) {
  const g = new THREE.PlaneGeometry(record.width, record.height, 1, 12);
  const m = new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0},uFar:{value:record.far?1:0}}, transparent:true, depthWrite:false, side:THREE.DoubleSide,
    vertexShader:`varying vec2 vUv; uniform float uTime; void main(){vUv=uv; vec3 p=position; p.z += sin(uv.y*24.0+uTime*3.0)*0.035; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec2 vUv; uniform float uTime; uniform float uFar; void main(){float line=0.5+0.5*sin(vUv.x*34.0+vUv.y*9.0-uTime*5.0); float foam=smoothstep(0.72,1.0,line); vec3 base=mix(vec3(0.20,0.68,0.92),vec3(0.86,0.98,1.0),foam*0.6); float a=mix(0.82,0.55,uFar); gl_FragColor=vec4(base,a);}`
  });
  const mesh = new THREE.Mesh(g,m); mesh.position.fromArray(record.position); mesh.rotation.y=record.rotationY||0; mesh.renderOrder=2; effectsRoot.add(mesh); waterfallMaterials.push(m);
  const foamMat = new THREE.MeshBasicMaterial({color:0xe8fbff,transparent:true,opacity:record.far?0.42:0.72,depthWrite:false});
  const foam = new THREE.Mesh(new THREE.CircleGeometry(record.width*.55,16),foamMat); foam.rotation.x=-Math.PI/2; foam.position.set(record.position[0],record.position[1]-record.height*.5+0.08,record.position[2]+0.16); foam.scale.z=.42; foam.renderOrder=3; effectsRoot.add(foam);
}

function addPrismAccents() {
  for (const record of manifest.prismAccents) {
    const mat = new THREE.MeshStandardMaterial({color:record.color,emissive:record.color,emissiveIntensity:1.35,roughness:.18,metalness:.05,transparent:true,opacity:.92});
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(record.scale*.45,0),mat);
    crystal.scale.y=2.4; crystal.position.fromArray(record.position); crystal.rotation.z=.08; effectsRoot.add(crystal);
    const glow = new THREE.PointLight(record.color, mobile?0.45:0.7, 9,2); glow.position.copy(crystal.position); effectsRoot.add(glow);
  }
}

function setView(name='concept') {
  const view = manifest.cameraViews[name]; if (!view) throw new Error(`Unknown Golden Slice view ${name}`);
  currentView=name;
  if (name === 'concept') {
    camera.position.set(mobile ? 16.5 : 18.5, mobile ? 16.5 : 17.5, mobile ? 40.0 : 42.5);
    camera.fov = mobile ? 58 : 54;
    camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
    camera.lookAt(new THREE.Vector3(-1.0, 4.0, -7.0)); camera.updateMatrixWorld(true); return name;
  }
  camera.position.fromArray(view.position); camera.fov=mobile?view.fovMobile:view.fovDesktop; camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); camera.lookAt(new THREE.Vector3(...view.target)); camera.updateMatrixWorld(true); return name;
}

function ridgeProjection() {
  const target = new THREE.Vector3(-2,20.5,-43);
  const distance = camera.position.distanceTo(target);
  const p = target.clone().project(camera);
  return {distance, projected:[p.x,p.y,p.z], inCurrentFrustum:Math.abs(p.x)<=1 && Math.abs(p.y)<=1 && p.z>=-1 && p.z<=1, withinFogBudget:distance<=WL.atmosphere.fogFar};
}

function roleCounts() {
  const out={}; for (const p of manifest.__allPlacements) out[p.role]=(out[p.role]||0)+1; return out;
}

function getMetrics() {
  const snap=registry.snapshot(); return {
    version:manifest.version, worldLanguage:manifest.worldLanguage, reviewStatus:manifest.reviewStatus, currentView,
    realPlacements:manifest.__allPlacements.length, roles:roleCounts(), bridgeAsset:manifest.bridge?.asset,
    waterfallHousingCount:manifest.__allPlacements.filter(p=>p.asset==='nature.cliff.waterfall'||p.asset==='nature.cliff.waterfallTop').length,
    waterReady, waterfallsReady, prismAccents:manifest.prismAccents.length, ridge:ridgeProjection(), registry:snap,
    render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures},
    acceptance:manifest.acceptance
  };
}

// Presentation adjustment now applies only to genuine props whose role still
// benefits from a depth-legibility nudge. Terrain/cliff/bridge no longer
// pass through here at all — they carry no targetMax and are placed at
// native tile scale (terrain) or an explicit authored non-uniform scale
// (the bridge). This is deliberately not a percentage patch on the terrain
// — the terrain problem was fixed at the placement-method level instead.
function presentationRecord(record) {
  const out = { ...record };
  if (record.role === 'ridgeLandmark') out.targetMax = record.targetMax * 0.86;
  return out;
}

async function buildTerrain(anisotropy) {
  const bankRecords = (manifest.creekBanks || []).map(bank => {
    const { fill, westEdge, eastEdge } = expandPass18CreekBank(bank, manifest.water.points);
    const corners = expandPass18CreekBankCorners(bank, westEdge, eastEdge);
    return [...fill, ...westEdge, ...eastEdge, ...corners];
  }).flat();
  const authoredTiles = manifest.placements.filter(p => p.kind === 'tile');
  const terrainRecords = [...authoredTiles, ...bankRecords];

  const groups = groupPass18TerrainRecordsByAsset(terrainRecords);
  for (const [assetId, group] of groups) {
    const matrices = group.map(record => pass18TileMatrix(record));
    const instanced = await registry.createInstancedGroup(assetId, matrices, { castShadow: true, receiveShadow: true, anisotropy });
    instanced.userData.pass18GoldenRole = group[0].role;
    worldRoot.add(instanced);
  }
  return terrainRecords;
}

async function buildProps(anisotropy) {
  const propRecords = manifest.placements.filter(p => p.kind !== 'tile');
  for (const record of propRecords) {
    const object = await registry.clone(record.asset, { castShadow: record.castShadow !== false, receiveShadow: true });
    const root = createPass18PlacementRoot(object, presentationRecord(record), { castShadow: record.castShadow !== false, receiveShadow: true, anisotropy });
    root.userData.pass18GoldenRole = record.role; worldRoot.add(root);
  }
  return propRecords;
}

async function build() {
  status.textContent='Building Creek Crossing from real kit assets…';
  manifest=await fetch('../data/pass18/golden-slice-creek.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`manifest ${r.status}`);return r.json();});
  if (manifest.version!=='18-2.1'||manifest.worldLanguage!==WL.version||manifest.reviewStatus!=='PENDING_USER') throw new Error('Golden Slice manifest contract mismatch');
  const anisotropy=Math.min(WL.materials.maxAnisotropy,renderer.capabilities.getMaxAnisotropy());
  const terrainRecords = await buildTerrain(anisotropy);
  const propRecords = await buildProps(anisotropy);
  manifest.__allPlacements = [...terrainRecords, ...propRecords];
  addWater(); manifest.waterfalls.forEach(addWaterfall); waterfallsReady=waterfallMaterials.length===manifest.waterfalls.length; addPrismAccents();
  setView('concept');
  status.textContent='18-2 technical proof ready · visual approval pending';
  document.documentElement.dataset.pass18GoldenSliceReady='1'; window.__pass18GoldenSliceReady=true;
  window.__pass18GoldenSlice={getMetrics,setView,manifest,registry};
}

const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();if(waterMaterial)waterMaterial.uniforms.uTime.value=t*manifest.water.flowSpeed;waterfallMaterials.forEach(m=>m.uniforms.uTime.value=t);effectsRoot.children.forEach((o,i)=>{if(o.geometry?.type==='OctahedronGeometry')o.rotation.y=t*.18+i*.2;});renderer.render(scene,camera);}
requestAnimationFrame(animate);
addEventListener('resize',()=>{renderer.setPixelRatio(pass18PixelRatio(devicePixelRatio||1,mobile));renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();},{passive:true});
build().catch(error=>{console.error(error);status.textContent=`FAILED: ${error.message}`;document.documentElement.dataset.pass18GoldenSliceFailed='1';window.__pass18GoldenSliceError=String(error?.stack||error);});
