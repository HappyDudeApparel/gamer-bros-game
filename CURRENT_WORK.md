# GAMER BROS — CURRENT WORK

This file is overwritten as the project advances. It is the authoritative recovery/status handoff for any future chat. A user does **not** need a magic recovery phrase: ordinary instructions such as “continue,” “where did we leave off?”, “the last window crashed,” or “check where we were and proceed” should cause the assistant to read `PROJECT_CONTINUITY.md` and this file first.

## Active development

- Project: Gamer Bros / Prism Valley World 1 rebuild
- Active branch: `pass18-rebuild`
- Production/live branch: `main`
- Production baseline: `97834f6d21e0d4e6af0d9d36ad355215126ceda0` (Pass 17C)
- `main` is NOT authorized for modification during the current rebuild.

## Current stage

**18-1 — Whole-map structural skeleton**

Status: **COMPLETE / GREEN**

The accepted 18-0B world-language baseline remains version `18-0B.2`. The 18-0C registry/spatial architecture remains the runtime foundation.

## 18-1 certification

Validated structural implementation head:
- `d01a65cf082c9b3fca94d70ad6f9e9e28632f620`

Durable checkpoint:
- `checkpoints/PASS18_1_STRUCTURAL_SKELETON.md`
- checkpoint creation commit: `f9d199a1788892d44d6d893e34f0e4a0506774fb`

Final browser workflow:
- `Validate Pass 18-1 Structural Skeleton`
- run `34686731568`
- job `103534922403`
- conclusion: **SUCCESS**
- proof artifact `10295114583`
- artifact digest `sha256:263685f061b5b79e4babd4650763cbcd98ff3914457b52be4e90179c2647ea19`

Validated on desktop and Android landscape:
- exact A→F structural order: Portal Meadow → Creek Crossing → Riverworks → Clover Cliffs → Ruin Courtyard → Prism Ridge;
- 35 real terrain-module placements;
- 12 real structural landmarks;
- 13-point / 12-segment river-gorge course;
- six connected route contracts;
- main route length 98.87u, longest segment 6.44u, maximum grade 0.4767 under the 0.48 structural ceiling;
- Portal Meadow → Prism Ridge sightline and Prism Ridge lookback both inside their distance/frustum budgets;
- 47 visible-asset collider records and a local collision-candidate subset;
- 20 unique real asset sources;
- 96 render calls / 5,833 triangles in the final overview proof;
- zero asset failures and zero severe browser errors.

The final screenshots were inspected. The first green visual proof was not accepted as-is: oversized nearby section labels and a weak distant Prism Ridge read were corrected before certification. The final spawn proof centers the valley destination, suppresses obstructive near labels and gives Prism Ridge a stronger real gate/platform silhouette.

18-1 is a **structural** acceptance only. It is intentionally sparse/blockout-like and is not a final concept-match or art-density claim.

## Architecture and authored content now available

- `data/pass18/world-skeleton.json` — A→F map/elevation/river/routes/sightlines/cameras as data.
- `src/pass18/world-skeleton.js` — manifest-driven structural renderer using the Pass 18 AssetRegistry and spatial index.
- `pass18-skeleton/` — fixed-view structural proof surface.
- `src/pass18/asset-catalog.js` / `asset-registry.js` — approved real-asset vocabulary and shared-resource placement APIs.
- `src/pass18/spatial-grid.js` — visibility cells + local collider candidates.
- `src/pass18/budget-hud.js` — `?debug=1` metrics instrumentation.

No generated-world JavaScript, no Pass 18 patch stack, and no unrelated invisible helper floor were introduced.

## Required context for the next stage

Read, in order:
1. `PROJECT_CONTINUITY.md`
2. `CURRENT_WORK.md`
3. `ASSET_DECISIONS.md`
4. `WORLD_LANGUAGE.md`
5. `VISUAL_APPROVALS.md`
6. `checkpoints/PASS18_1_STRUCTURAL_SKELETON.md`
7. `checkpoints/PASS18_0C_ASSET_RUNTIME.md`
8. `PASS17_CONCEPT_MATCH_BUILD_SPEC.md` only for approved A→F visual/map intent and gameplay intent, NOT implementation architecture.

## NEXT TASK

**18-1B — In-browser placement tool**

Status: **NOT STARTED — requires the user’s next GO**

Build an authoring tool on top of the accepted Pass 18 registry + structural manifest architecture with:
- filterable/searchable approved real-asset palette;
- place / select / move / rotate / scale / delete;
- grid snapping and vertical snapping;
- scatter brush for trees, rocks, flowers and grass;
- fence/path polyline authoring;
- chunk-aware JSON export compatible with the data-driven world architecture;
- capture/export of approved camera poses;
- desktop + Android-landscape validation where applicable;
- no generated-JS or patch-script architecture.

18-1B must **not**:
- perform the Golden Slice art pass itself;
- modify production `main`;
- bypass the real AssetRegistry with ad-hoc loaders;
- write placements into generated JavaScript;
- begin 18-2 until 18-1B has its own validated checkpoint and the user gives another GO.

When 18-1B completes, update this file again and write a new durable checkpoint before stopping.
