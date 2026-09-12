export const PASS18_WORLD_LANGUAGE = Object.freeze({
  version: '18-0B.2',
  renderer: Object.freeze({
    toneMapping: 'ACESFilmicToneMapping',
    exposure: 1.14,
    outputColorSpace: 'SRGBColorSpace',
    antialias: true,
    pixelRatioDesktopMax: 1.5,
    pixelRatioMobileMax: 1.25,
    shadowMapDesktop: 2048,
    shadowMapMobile: 1024
  }),
  palette: Object.freeze({
    sky: 0xa9def2,
    fog: 0xc9edf5,
    sun: 0xffefd0,
    hemiSky: 0xf2fcff,
    hemiGround: 0x70875b,
    clear: 0xa9def2,
    uiInk: '#10212d'
  }),
  lighting: Object.freeze({
    hemisphereIntensity: 1.78,
    sunIntensity: 2.35,
    fillIntensity: 0.52,
    sunPosition: Object.freeze([13, 24, 9]),
    shadowBias: -0.00028,
    shadowNormalBias: 0.032,
    shadowRadiusDesktop: 2.5,
    shadowRadiusMobile: 1.25,
    shadowCamera: Object.freeze({ left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 65 })
  }),
  atmosphere: Object.freeze({
    fogNear: 38,
    fogFar: 105
  }),
  camera: Object.freeze({
    desktopFov: 46,
    mobileFov: 50,
    near: 0.08,
    far: 180,
    scenicPitchRadians: 0.17
  }),
  materials: Object.freeze({
    maxAnisotropy: 8,
    preserveAuthoredKitMaterials: true,
    rule: 'Do not recolor kit materials globally. Use light, atmosphere, composition and selective authored accent materials to unify the world.'
  }),
  composition: Object.freeze({
    depthPlanes: 5,
    horizonRule: 'Keep readable landforms in foreground, play space, landmark midground, ridge background and atmospheric far plane.',
    densityRule: 'Density comes from repeated real kit assets, instancing/batching and silhouette variation, not proxy blocks or an empty heightfield.',
    calibrationLesson: 'Do not use giant cliff blocks as a backdrop. Build depth from multiple smaller real terrain modules, river/path tiles, vegetation and offset shelves.'
  })
});

export function pass18MobileProfile(userAgent = navigator.userAgent) {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
}

export function pass18PixelRatio(devicePixelRatio = window.devicePixelRatio || 1, mobile = pass18MobileProfile()) {
  const cap = mobile ? PASS18_WORLD_LANGUAGE.renderer.pixelRatioMobileMax : PASS18_WORLD_LANGUAGE.renderer.pixelRatioDesktopMax;
  return Math.min(devicePixelRatio, cap);
}
