# PASS 18-1B — IN-BROWSER WORLD AUTHORING TOOL

Status: **COMPLETE / GREEN**

This checkpoint certifies the clean in-browser authoring tool required before the Prism Valley Golden Slice. It is a tooling/runtime checkpoint only. It does **not** certify Golden Slice art, concept resemblance, finished gameplay, or production readiness.

## Branch safety

- Active rebuild branch: `pass18-rebuild`
- Production/live branch: `main`
- Production baseline remains Pass 17C at `97834f6d21e0d4e6af0d9d36ad355215126ceda0`.
- `main` was not modified during 18-1B.

## Validated implementation head

- `4859bdadc94ba8ef56a7c4e7e5fdec6e3bc1ea86`

## Controlling authored files

- `src/pass18/editor-state.js` — schema `18-1B.0`, snapping, placement/polyline/camera document model and deterministic chunk export.
- `src/pass18/asset-placement.js` — reusable real-asset normalization/placement helpers.
- `src/pass18/editor.js` — in-browser editor runtime on the accepted Pass 18 AssetRegistry + 18-1 structural manifest.
- `pass18-editor/index.html` — responsive desktop/Android-landscape authoring surface.
- `scripts/test_pass18_1b_editor.py` — desktop + Android-landscape functional browser validation.
- `.github/workflows/validate-pass18-1b-editor.yml` — read-only CI gate.

There is no generated-world JavaScript, no Pass 18 patch-script stack, no Pass 17 world runtime dependency, and no ad-hoc asset loader.

## Authoring capabilities certified

### Approved real-asset palette

- Uses the existing `PASS18_ASSETS` catalog and `Pass18AssetRegistry`.
- **35** approved curated real assets exposed to the editor.
- Search and category filtering are available in the browser UI.
- Browser validation searched `tree` and returned the expected **3** curated tree entries.

### Placement and editing

The editor provides explicit modes for:
- PLACE
- SELECT
- MOVE
- ROTATE
- SCALE
- SCATTER
- PATH
- FENCE

Selected objects can be moved on X/Y/Z with precision nudge controls, manipulated by pointer in MOVE/ROTATE/SCALE modes, or deleted. Authoring objects are maintained separately from the locked 18-1 structural background.

### Snapping

Default authoring snap contract:
- X/Z grid: **0.5u**
- vertical Y snap: **0.25u**

Both are configurable and can be toggled independently. The browser test placed a real tree at `[1.24, 2.13, 3.26]` and verified the exported snapped position `[1, 2.25, 3.5]`.

### Scatter brush

- Restricted to approved repeatable Nature assets.
- Deterministic seeded scatter model for reproducible authoring/tests.
- Places real AssetRegistry clones while preserving shared immutable source resources.
- Browser proof exercised a 4-flower scatter operation and subsequent edit/delete behavior.

### Path and fence authoring

Polyline authoring stores authored world points as data rather than generated JavaScript.

Default real-asset hints:
- PATH → `nature.path.bend`
- FENCE → `kaykit.barrier.green`

The polyline data carries spacing/width, section and chunk metadata for later production realization.

### Camera-pose capture

The editor can orbit/zoom the world, set a deterministic camera pose through its test/tool API, and capture/export:
- camera position
- target
- FOV
- label
- section
- chunk

### Chunk-aware JSON export

Export schema:
- version: `18-1B.0`
- type: `pass18-world-authoring`
- source world: `data/pass18/world-skeleton.json`
- chunk cell size: **24u**

Exports are grouped by chunk and contain:
- placements
- polylines
- cameras

Each placement carries its approved asset ID, snapped position, section, chunk, Y rotation, scale, target size, placement mode and tags. Structural skeleton content remains separate and is not mutated by authoring export.

## Structural integration

The editor loads the accepted `18-1.0` structural manifest directly and renders all **35 terrain + 12 structural landmark** anchors through the real Pass 18 AssetRegistry. These visible structural meshes are also the editor's raycast surfaces for mouse/touch placement; an unrelated hidden authoring floor was not introduced to disguise the terrain.

The structural main/optional route and river lines are shown as authoring guides. They are editor/debug helpers rather than claims of final path or water art.

## Final automated proof

Workflow: `Validate Pass 18-1B World Authoring Tool`

- Run: `34694655272`
- Job: `103555945472`
- Head: `4859bdadc94ba8ef56a7c4e7e5fdec6e3bc1ea86`
- Conclusion: **SUCCESS**
- Proof artifact: `10298154057`
- Artifact digest: `sha256:8c1e925b1e8f135ec30b40541a91b866a83b65e5b3ef3b638cb1e8e4d397eb77`

Desktop browser proof:
- palette: 35
- tree search results: 3
- final test placements: 4 after intentional deletion
- polylines: 2
- captured cameras: 1
- exported chunks: 2
- unique registry sources loaded: 22
- render calls: 87
- rendered triangles: 5,829
- zero registry failures / zero severe browser errors

Android-landscape browser proof:
- same functional authoring/data contracts
- palette: 35
- final test placements: 4
- polylines: 2
- captured cameras: 1
- exported chunks: 2
- 87 render calls / 5,829 triangles
- zero registry failures / zero severe browser errors

The browser tests exercised placement, snapping, move/rotate/scale state changes, scatter, path/fence authoring, actual selection/nudge/delete UI wiring, mode switching, camera capture and chunk export.

## Visual inspection

Both uploaded proof screenshots were inspected after the automated gate passed.

Desktop:
- the palette and tool panels are fully visible;
- the center remains a large usable world-authoring viewport;
- the accepted 18-1 structural map remains readable behind the tooling.

Android landscape:
- palette and tool panels remain fully inside the viewport;
- a usable central authoring viewport remains between them;
- controls are compact but present and operational.

Measured browser UI bounds from the final proof:
- Desktop CSS viewport: 1365×625; palette x 10–302; tools x 1049–1355.
- Android landscape: 915×412; palette x 10–210; tools x 667–905.

This visual review certifies the usability/presentation of the authoring tool only. It does not elevate the sparse 18-1 structural world into a visual concept-match approval.

## Explicit non-claims

18-1B does **not**:
- perform the Creek Crossing Golden Slice art pass;
- certify concept resemblance;
- freeze final world art;
- add final water/waterfall production effects;
- decorate all A→F sections;
- modify production `main`;
- authorize promotion/deployment.

## Next checkpoint

**18-2 — Golden Slice, Creek Crossing**

The next stage must use the accepted structural world, AssetRegistry, world language and authoring/data architecture to build the first true concept-resemblance gate at Creek Crossing. Required visual proof includes layered grass-over-rock cliffs, winding path/fences/flowers, creek/gorge water, stone bridge, waterfall and a readable distant Prism Ridge, with matched scenic framing on desktop and phone/Android.

If the Golden Slice does not visibly read as the approved Prism Valley V2 concept direction, stop and repair it before constructing the remaining world sections.

Do not begin 18-2 until the user gives the next GO.
