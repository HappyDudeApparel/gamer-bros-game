# CHECKPOINT — PASS 18-0C ASSET RUNTIME

Status: **COMPLETE / GREEN**

This checkpoint certifies the reusable asset/runtime/tooling foundation required before the Prism Valley A→F structural skeleton is authored. It does **not** certify concept-art resemblance or a finished game world.

## Validated implementation head

- Branch: `pass18-rebuild`
- Runtime/proof head: `b582b5bbf22e995b8ffbb2753edb3f1b10f6aa12`
- Production `main` was not modified.

## Final green browser gate

- Workflow: `Validate Pass 18-0C Asset Runtime`
- Run: `34681828884`
- Job: `103521735666`
- Result: **SUCCESS**
- Proof artifact: `10293149408`
- Artifact digest: `sha256:67d3aed46c70540f574b29ef5147be27cd176ba47a5450b0a0699ca33d8164a7`

Both desktop (1280×720) and Android-landscape (915×412 emulation) passed the same clean authored runtime.

Final proof metrics on both browser profiles:
- curated gallery catalog: **35** real assets
- unique source loads: **13**
- cache hits: **3**
- total placements exercised: **48**
- `InstancedMesh` instances: **24**
- `BatchedMesh` instances: **10**
- spatial visibility proof: **1 / 3** groups visible
- collision query proof: **1 / 12** candidates returned
- render calls: **22**
- rendered triangles: **4,097**
- asset failures: **0**
- severe browser errors: **0**

The proof screenshots were inspected after automation. The final gallery keeps the representative art visible for human inspection while using separate near/mid/far groups to prove visibility culling. This fixed an earlier proof design where the culling demonstration itself hid most gallery assets. The gallery is a developer inspection/tooling surface, not a claim that its floating display layout resembles Prism Valley.

## Architecture now available

### `src/pass18/asset-catalog.js`
- one curated catalog API over approved real vendored pack roots;
- representative Nature, Fantasy Town, Castle, Kenney Platformer, KayKit Platformer and Dungeon assets;
- pack roots also established for the other approved permanent libraries.

### `src/pass18/asset-registry.js`
- one source-load Promise per asset ID;
- normal cloned placements share immutable geometry/material/texture resources;
- explicit `InstancedMesh` path for repeated identical assets;
- explicit `BatchedMesh` path for appropriate static groups;
- load/cache/placement/failure metrics.

### `src/pass18/spatial-grid.js`
- independent spatial cells for render-group visibility;
- lightweight `Box3` collider records for local collision-candidate queries;
- dense visible art no longer implies testing every render mesh for gameplay collision.

### `src/pass18/budget-hud.js`
- `?debug=1` live HUD for frame time/FPS, calls, triangles, GPU resource counts, source loads/cache hits, placement modes, visible groups and collision candidates.

### `pass18-assets/` + `src/pass18/gallery.js`
- real browser asset inspection surface;
- search and category filters;
- representative real-pack render proof;
- no Pass 17 world generator/loader architecture reused.

## Problems caught instead of papered over

1. An early static gate named nonexistent Castle files (`gate-complex.glb` / `bridge-corner.glb`). The catalog was corrected to verified real files (`gate.glb`, `bridge-draw.glb`) and the workflow now prints/verifies each required asset explicitly.
2. The first green gallery proof registered the displayed gallery objects themselves into the culling test, so screenshots hid most of the assets. The underlying gallery module was corrected so human inspection stays visible and spatial culling is proven by dedicated test groups. No patch script was added.

These are examples of the Pass 18 rule working as intended: correct the source module/assumption rather than stack a workaround.

## Explicit non-claims

18-0C does **not** prove:
- the full 2,523-file library should be loaded at once;
- final mobile performance of the completed valley;
- final collision shapes for authored terrain;
- concept-art resemblance;
- Golden Slice approval.

Those remain later stage gates. SwiftShader/CI is an architectural regression proof, not a physical-device benchmark.

## Next authorized stage when the user says GO

**18-1 — Whole-map structural skeleton**

Scope:
- A Portal Meadow
- B Creek Crossing
- C Riverworks
- D Clover Cliffs
- E Ruin Courtyard
- F Prism Ridge

Build only the low-detail structural geography at final intended scale: elevations, main gorge/river course, route relationships, traversal distances, sightlines and a readable Prism Ridge destination silhouette. Use JSON/manifests for content. Do **not** begin decorative art-density work or the Golden Slice in this stage.

STOP after 18-1 and create its own durable checkpoint before proceeding.
