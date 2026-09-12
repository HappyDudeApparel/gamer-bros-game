# PASS 18 STATUS

Active branch: `pass18-rebuild`
Production branch: `main` (DO NOT MODIFY during rebuild)

## Current checkpoint

**18-0A — Real asset acquisition + kit audit**

Status: **COMPLETE / GREEN**

Production baseline remains:
- `main` / Pass 17C: `97834f6d21e0d4e6af0d9d36ad355215126ceda0`

Pass 18 remains isolated on `pass18-rebuild`.

## 18-0A certification

Successful workflow:
- `Import reusable world assets`
- run `34679720690`
- conclusion: **SUCCESS**
- trigger head: `250fb2fe052bec869a5e664584d4fea8e1e61eb8`
- generated asset commit: `c9cab92b0ff6c85c3248d92eaee316e89c2437d8`
- durable checkpoint file commit: `c4a7929ffa3c4977e95d2d2a676f091a2fa8a256`

Verified asset-library result:
- total permanent library: **2,523 files / 84 MB**
- Kenney Nature Kit: **329 3D files**
- Kenney Fantasy Town Kit: **167 3D files**
- Kenney Castle Kit: **76 3D files**
- Kenney Platformer Kit: **153 3D files**
- KayKit Platformer Pack: **370 3D files**
- KayKit Medieval Hexagon: **221 3D files**
- KayKit Dungeon Remastered: **203 3D files**

Hard spot-checks passed for:
- `kenney/nature-kit/bridge_stone.glb`
- `kenney/nature-kit/cliff_waterfall_rock.glb`
- `kenney/fantasy-town-kit/wall-arch.glb`
- `kenney/castle-kit/bridge-straight-pillar.glb`

The Nature kit now provides the missing real modular cliff, slope, cave, corner, step, waterfall-housing, bridge, path/river, fence, rock, flower, grass, bush and tree vocabulary. Fantasy Town provides arches/walls/broken walls, stairs, fences, planks/poles, lanterns and watermills. Castle provides bridge/gate, banner/flag, stair, tower and wall support.

The import workflow is branch-safe: it pushes generated assets back to the active `pass18-rebuild` branch only. `main` was not modified.

`ASSET_DECISIONS.md` is controlling: no custom geometry may be committed without a documented search of the approved kit family and a specific reason a real asset does not fit.

## Durable recovery files

A future chat must read:
1. `PASS18_START_HERE.md`
2. `PASS18_STATUS.md`
3. `ASSET_DECISIONS.md`
4. the most recent file in `checkpoints/` for the current Pass 18 stage

Exact recovery command:

> Resume Gamer Bros Pass 18 from `PASS18_START_HERE.md` and `PASS18_STATUS.md` on branch `pass18-rebuild`. Do not touch `main`. Execute only the NEXT TASK recorded in `PASS18_STATUS.md`, preserve the no-bandaid rules, update the status/checkpoint files before stopping, and report the exact branch SHA.

## NEXT TASK

**18-0B — Look Calibration**

Goal: prove and freeze the Prism Valley visual language BEFORE building the map.

Scope only:
- build a tiny clean calibration scene using real Pass 18 asset-family pieces;
- tune and compare palette, sunlight, mobile contact shadow strategy, tone mapping/exposure, sky, atmospheric haze, environment lighting, FOV/camera pitch and mobile resolution policy;
- use real Nature cliff/tree/grass/stone pieces, not proxy geometry as the visual proof;
- write the accepted runtime constants into `src/pass18/world-language.js` and human-readable calibration documentation;
- produce matched proof screenshots and performance measurements;
- update checkpoint/status files;
- STOP before 18-0C.

**Do not begin 18-0B until the user explicitly says GO.**
