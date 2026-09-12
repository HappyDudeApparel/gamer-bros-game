# PASS 18-0B — LOOK CALIBRATION CHECKPOINT

Status: **COMPLETE / GREEN**

## Purpose

Prove and freeze a viable Prism Valley rendering/lighting/camera/mobile presentation language using real final-family assets **before** building the map.

This checkpoint certifies the look-language foundation. It does **not** certify that a tiny calibration scene already matches the approved Prism Valley V2 concept pack. The first mandatory in-situ concept-resemblance test remains 18-2 Golden Slice.

## Files authored

- `src/pass18/world-language.js` — controlling runtime constants, version `18-0B.2`.
- `src/pass18/calibration.js` — clean real-asset calibration scene.
- `pass18-calibration/index.html` — dedicated browser proof surface.
- `data/pass18/cameras.json` — fixed desktop and Android-landscape matched proof cameras.
- `scripts/test_pass18_0b_look.py` — real-browser visual/runtime/performance smoke.
- `.github/workflows/validate-pass18-0b-look.yml` — read-only branch-safe proof workflow.
- `WORLD_LANGUAGE.md` — human-readable frozen visual rules.

No generated JavaScript world content and no patch-script stack were introduced.

## Real assets proven in the accepted scene

The accepted 18-0B.2 scene contains 25 unique Kenney Nature Kit placements, including:
- path, river and grass ground modules;
- stone bridge;
- grass platform;
- multiple cliff/corner/step/waterfall-top terrain modules;
- multiple trees and bushes;
- rocks;
- fence and stone path;
- flowers, grass and mushrooms.

Every visible landform/prop in the proof comes from the real approved kit family. No proxy plane or invisible helper floor is being used as the visual proof.

## Visual review history

### 18-0B.1 — REJECTED VISUALLY

The first proof passed its automated checks but was not accepted visually. Its giant brown rear cliff blocks, sparse composition, high camera and hard shadowing made it read like a test stage rather than Prism Valley.

That result is intentionally preserved as a lesson: **automation passing is not visual approval**.

### 18-0B.2 — ACCEPTED AS LOOK CALIBRATION

The scene was recomposed with smaller real terrain modules, actual path/river kit pieces, more vegetation, a lower scenic camera, brighter/softer lighting and a clearer blue-green atmosphere.

The desktop and Android-landscape screenshots were inspected. The accepted result establishes:
- bright toy-like palette;
- readable real-kit materials;
- clearer terrain layering;
- useful horizon/world depth;
- readable bridge/path/river vocabulary;
- suitable mobile landscape crop;
- controlled shadow contrast.

Remaining caveat: the rear Kenney cliff vocabulary is inherently blocky when composed poorly. Pass 18 must solve this through modular composition, shelves, offsets, vegetation and silhouette variation. Do not hide it with ad-hoc custom geometry. If a later stage genuinely requires custom terrain geometry, `ASSET_DECISIONS.md` must first document the kit search and insufficiency.

## Latest validation evidence

Validated implementation/workflow head:
- `47e1e4c648632b27008e514cd10ca9049ea954d6`

GitHub Actions:
- workflow: `Validate Pass 18-0B Look Calibration`
- run: `34680335274`
- job: `103517714890`
- conclusion: **SUCCESS**

Latest proof artifact:
- name: `pass18-0b-look-proof`
- artifact ID: `10293628292`
- digest: `sha256:8edd746afc655fe56d1163631808764a7cb9a35d55ad070fcdff55a8596cb304`

### Desktop proof

- 25 placements / 25 unique assets
- 53 render calls
- 2,617 triangles reported by renderer for the proof scene
- DPR 1.0 in CI
- FOV 46
- 2048 shadow map
- SwiftShader smoke: 33.55 ms average / 29.8 fps

### Android-landscape proof

- 25 placements / 25 unique assets
- 53 render calls
- 2,617 triangles reported by renderer for the proof scene
- emulated device DPR 2.75 successfully capped to 1.25
- FOV 50
- 1024 shadow map
- SwiftShader smoke: 20.73 ms average / 48.2 fps

The SwiftShader numbers are regression smoke only and are **not** physical-device performance claims.

## Frozen 18-0B.2 values

- ACES Filmic tone mapping
- exposure 1.14
- sRGB output
- desktop DPR cap 1.5
- mobile DPR cap 1.25
- desktop shadow map 2048
- mobile shadow map 1024
- hemisphere intensity 1.78
- sun intensity 2.35
- fill intensity 0.52
- fog 38 → 105
- desktop calibration FOV 46
- Android-landscape calibration FOV 50
- approximately 0.17 rad scenic pitch intent

See `WORLD_LANGUAGE.md` and `src/pass18/world-language.js` for the controlling detail.

## Gate result

**PASS.** The visual-language foundation is credible enough to proceed to architecture/tooling work without building the actual A→F map yet.

## Next stage

**18-0C — AssetRegistry + gallery + budget HUD**

Do not begin 18-0C until the user explicitly says GO.
