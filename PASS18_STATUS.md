# PASS 18 STATUS

Active branch: `pass18-rebuild`
Production branch: `main` (DO NOT MODIFY during rebuild)

## Current checkpoint

**18-0B — Look Calibration**

Status: **IN PROGRESS**

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

## 18-0B work already committed

- `src/pass18/world-language.js` — first authored runtime visual-language constants; no generated patch layer.
- `src/pass18/calibration.js` — tiny clean Three.js calibration scene using real Kenney Nature Kit assets.
- `pass18-calibration/index.html` — dedicated calibration browser surface.
- `data/pass18/cameras.json` — fixed desktop and Android-landscape proof camera poses.

Current calibration design intentionally uses real Nature Kit ground/cliff/waterfall-housing/bridge/tree/rock/bush/flower/grass/mushroom assets as the visible proof. It does not use proxy world terrain.

## 18-0B values under test

- Three.js r180 retained.
- ACES filmic tone mapping; exposure 1.12.
- sRGB output.
- Hemisphere environment light plus directional sun and light fill.
- Desktop shadow map 2048; mobile 1024.
- Desktop DPR cap 1.5; mobile DPR cap 1.25.
- Desktop FOV 48; mobile landscape FOV 52.
- Atmospheric fog near/far 42 / 112.
- Real authored kit materials are preserved rather than globally recolored.

These values are NOT certified until the browser proof workflow succeeds and the screenshots are visually inspected.

## Durable recovery files

A future chat must read:
1. `PASS18_START_HERE.md`
2. `PASS18_STATUS.md`
3. `ASSET_DECISIONS.md`
4. the most recent file in `checkpoints/` for the current Pass 18 stage

Exact recovery command:

> Resume Gamer Bros Pass 18 from `PASS18_START_HERE.md` and `PASS18_STATUS.md` on branch `pass18-rebuild`. Do not touch `main`. Execute only the NEXT TASK recorded in `PASS18_STATUS.md`, preserve the no-bandaid rules, update the status/checkpoint files before stopping, and report the exact branch SHA.

## NEXT TASK

**Finish 18-0B only:**
1. Add the browser validation/performance proof and workflow.
2. Validate the calibration scene on desktop and Android-landscape profiles.
3. Capture matched screenshots and inspect them for brightness, depth, real-asset readability, shadows, framing and mobile crop.
4. Repair the authored calibration module/constants if the proof is weak; do not stack patch scripts.
5. Freeze accepted values in `WORLD_LANGUAGE.md` and the 18-0B checkpoint record.
6. Update this file to `18-0B COMPLETE / GREEN` with the exact final branch SHA and workflow evidence.
7. STOP. Do NOT begin 18-0C without the user's next GO.
