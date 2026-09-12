# PASS 18 STATUS

Active branch: `pass18-rebuild`
Production branch: `main` (DO NOT MODIFY during rebuild)

## Current checkpoint

**18-0B — Look Calibration**

Status: **COMPLETE / GREEN**

Production baseline remains:
- `main` / Pass 17C: `97834f6d21e0d4e6af0d9d36ad355215126ceda0`

Pass 18 remains isolated on `pass18-rebuild`.

## Completed checkpoint — 18-0A

18-0A Real asset acquisition + kit audit is **COMPLETE / GREEN**.

Successful workflow:
- `Import reusable world assets`
- run `34679720690`
- conclusion: **SUCCESS**
- generated asset commit: `c9cab92b0ff6c85c3248d92eaee316e89c2437d8`

Verified permanent library:
- total: **2,523 files / 84 MB**
- Kenney Nature Kit: **329 3D files**
- Kenney Fantasy Town Kit: **167 3D files**
- Kenney Castle Kit: **76 3D files**
- Kenney Platformer Kit: **153 3D files**
- KayKit Platformer Pack: **370 3D files**
- KayKit Medieval Hexagon: **221 3D files**
- KayKit Dungeon Remastered: **203 3D files**

`ASSET_DECISIONS.md` remains controlling: no custom geometry may be committed without a documented kit search and specific reason a real asset does not fit.

## 18-0B certification

18-0B is now **COMPLETE / GREEN**.

Controlling authored files:
- `src/pass18/world-language.js` — runtime visual-language constants, version `18-0B.2`.
- `src/pass18/calibration.js` — clean real-asset calibration scene; no generated JS/patch stack.
- `pass18-calibration/index.html` — browser proof surface.
- `data/pass18/cameras.json` — matched desktop and Android-landscape camera poses.
- `WORLD_LANGUAGE.md` — frozen human-readable world-language rules.
- `VISUAL_APPROVALS.md` — durable distinction between look-language acceptance and later concept-match approval.
- `checkpoints/PASS18_0B_LOOK_CALIBRATION.md` — complete checkpoint evidence.

Accepted visual/runtime language:
- Three.js r180 retained.
- ACES Filmic tone mapping; exposure **1.14**.
- sRGB output.
- Hemisphere intensity **1.78**; sun **2.35**; fill **0.52**.
- Desktop shadow map **2048**; mobile **1024**.
- Desktop DPR cap **1.5**; mobile DPR cap **1.25**.
- Desktop calibration FOV **46**; mobile-landscape FOV **50**.
- Atmospheric fog near/far **38 / 105**.
- Real authored kit materials preserved rather than globally recolored.
- Modular terrain composition required; giant block cliff backdrops rejected.

### Visual-review result

The first 18-0B.1 scene passed automation but was **rejected visually** because it used giant rear cliff blocks, sparse staging, a high camera and hard shadowing.

18-0B.2 was then recomposed with smaller real path/river/grass/cliff/platform modules, more vegetation, lower scenic framing and softer/brighter lighting. Desktop and Android-landscape screenshots were inspected and accepted as the **look-calibration foundation**.

This is deliberately **not** a claim that the calibration scene itself matches the approved Prism Valley V2 concept pack. The first real concept-resemblance gate remains **18-2 Golden Slice**, followed by 18-2B hard visual freeze.

### Latest validation evidence

Validated implementation/workflow head:
- `47e1e4c648632b27008e514cd10ca9049ea954d6`

Latest green workflow:
- `Validate Pass 18-0B Look Calibration`
- run `34680335274`
- job `103517714890`
- conclusion: **SUCCESS**

Latest proof artifact:
- artifact ID `10293628292`
- digest `sha256:8edd746afc655fe56d1163631808764a7cb9a35d55ad070fcdff55a8596cb304`

Desktop proof:
- 25 placements / 25 unique real assets
- 53 render calls
- 2,617 triangles
- DPR 1.0 in CI
- FOV 46
- 2048 shadow map
- SwiftShader smoke: 33.55 ms / 29.8 fps

Android-landscape proof:
- 25 placements / 25 unique real assets
- 53 render calls
- 2,617 triangles
- emulated DPR 2.75 capped to 1.25
- FOV 50
- 1024 shadow map
- SwiftShader smoke: 20.73 ms / 48.2 fps

SwiftShader numbers are regression smoke only, not physical-device performance claims.

Documentation checkpoint immediately preceding this status update:
- `2faab9b5533bddadbc356ea8cdace2d62c9d01c6` — seeded durable visual-approval ledger after the 18-0B checkpoint documentation.

## Durable recovery files

A future chat must read:
1. `PASS18_START_HERE.md`
2. `PASS18_STATUS.md`
3. `ASSET_DECISIONS.md`
4. `WORLD_LANGUAGE.md`
5. `VISUAL_APPROVALS.md`
6. the most recent file in `checkpoints/` for the current Pass 18 stage

Exact recovery command:

> Resume Gamer Bros Pass 18 from `PASS18_START_HERE.md` and `PASS18_STATUS.md` on branch `pass18-rebuild`. Do not touch `main`. Execute only the NEXT TASK recorded in `PASS18_STATUS.md`, preserve the no-bandaid rules, update the status/checkpoint files before stopping, and report the exact branch SHA.

## NEXT TASK

**18-0C — AssetRegistry + gallery + budget HUD**

Goal: establish the reusable asset/runtime architecture and visibility/performance instrumentation needed before the whole A→F map is authored.

Scope when explicitly authorized:
- replace duplicate Pass 17 asset loaders with one Pass 18 AssetRegistry;
- expose the approved real asset packs through one catalog/API;
- dedupe geometry/material/texture resources;
- provide explicit single/instance/batch placement paths;
- build a browser asset gallery for actual pack inspection;
- add `?debug=1` metrics/budget HUD;
- establish dense-world collision/visibility architecture before art density rises;
- preserve the 18-0B world-language constants and visual proof surface;
- add real-browser validation and update durable checkpoint files.

**Do not begin 18-0C until the user explicitly says GO.**
