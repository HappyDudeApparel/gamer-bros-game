# GAMER BROS — CURRENT WORK

This file is overwritten as the project advances. It is the authoritative recovery/status handoff for any future chat. A user does **not** need a magic recovery phrase: ordinary instructions such as “continue,” “where did we leave off?”, “the last window crashed,” or “check where we were and proceed” should cause the assistant to read `PROJECT_CONTINUITY.md` and this file first.

## Active development

- Project: Gamer Bros / Prism Valley World 1 rebuild
- Active branch: `pass18-rebuild`
- Production/live branch: `main`
- Production baseline: `97834f6d21e0d4e6af0d9d36ad355215126ceda0` (Pass 17C)
- `main` is NOT authorized for modification during the current rebuild.

## Current stage

**18-0C — AssetRegistry + asset gallery + budget HUD + dense-world spatial architecture**

Status: **COMPLETE / GREEN**

The accepted 18-0B world-language baseline remains version `18-0B.2`.

## 18-0C certification

Validated runtime/proof head:
- `b582b5bbf22e995b8ffbb2753edb3f1b10f6aa12`

Durable checkpoint commit:
- `1451b7004aa4bb865b6eb69f110c256ba5a5f3cd`
- file: `checkpoints/PASS18_0C_ASSET_RUNTIME.md`

Final browser workflow:
- `Validate Pass 18-0C Asset Runtime`
- run `34681828884`
- job `103521735666`
- conclusion: **SUCCESS**
- proof artifact `10293149408`
- artifact digest `sha256:67d3aed46c70540f574b29ef5147be27cd176ba47a5450b0a0699ca33d8164a7`

Desktop and Android-landscape both exercised:
- 35 curated real catalog assets;
- 13 unique source loads / 3 cache hits;
- 48 placements;
- 24 `InstancedMesh` instances;
- 10 `BatchedMesh` instances;
- 1/3 spatial visual groups visible in the culling proof;
- 1/12 collision records returned as local candidates;
- 22 render calls / 4,097 triangles in the gallery proof;
- zero asset failures and zero severe browser errors.

The final screenshots were inspected. The real-asset gallery remains fully visible for human inspection; spatial culling is proven by dedicated test groups rather than hiding the gallery itself.

## Architecture now available

- `src/pass18/asset-catalog.js` — approved-pack roots + curated real asset catalog.
- `src/pass18/asset-registry.js` — one-load caching, shared resources, single/instanced/batched placement APIs.
- `src/pass18/spatial-grid.js` — render visibility cells + independent local collider index.
- `src/pass18/budget-hud.js` — `?debug=1` performance/resource instrumentation.
- `src/pass18/gallery.js` + `pass18-assets/` — browser real-asset inspection surface.

The old Pass 17 asset/world architecture is not the Pass 18 foundation.

## Required context for the next stage

Read, in order:
1. `PROJECT_CONTINUITY.md`
2. `CURRENT_WORK.md`
3. `ASSET_DECISIONS.md`
4. `WORLD_LANGUAGE.md`
5. `VISUAL_APPROVALS.md`
6. `checkpoints/PASS18_0C_ASSET_RUNTIME.md`
7. `PASS17_CONCEPT_MATCH_BUILD_SPEC.md` only for approved A→F visual/map intent and gameplay intent, NOT implementation architecture.

## NEXT TASK

**18-1 — Whole-map structural skeleton**

Status: **NOT STARTED — requires the user’s next GO**

Build the complete A→F geography at the intended final scale, but only at structural/low-detail fidelity:
- A Portal Meadow
- B Creek Crossing
- C Riverworks
- D Clover Cliffs
- E Ruin Courtyard
- F Prism Ridge

18-1 must establish:
- section positions and elevation hierarchy;
- real gorge/river course and waterfall/drop locations;
- main route and optional-route relationships;
- traversal distances and slope/step logic;
- key sightlines and valley depth;
- readable Prism Ridge destination silhouette from the appropriate earlier sections;
- content as JSON/manifests, not generated JavaScript.

18-1 must **not**:
- perform the art-density/decor pass;
- build the Golden Slice yet;
- reintroduce Pass 17’s giant deformed plane architecture;
- use invisible helper floors to disguise wrong visible terrain;
- begin 18-1B or 18-2 before its own structural checkpoint is validated and the user gives another GO.

When 18-1 completes, update this file again and write a new durable checkpoint before stopping.
