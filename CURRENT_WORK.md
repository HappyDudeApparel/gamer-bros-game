# GAMER BROS — CURRENT WORK

This file is overwritten as the project advances. It is the authoritative recovery/status handoff for any future chat. A user does **not** need a magic recovery phrase: ordinary instructions such as “continue,” “where did we leave off?”, “the last window crashed,” or “check where we were and proceed” should cause the assistant to read `PROJECT_CONTINUITY.md` and this file first.

## Active development

- Project: Gamer Bros / Prism Valley World 1 rebuild
- Active branch: `pass18-rebuild`
- Production/live branch: `main`
- Production baseline: `97834f6d21e0d4e6af0d9d36ad355215126ceda0` (Pass 17C)
- `main` is NOT authorized for modification during the current rebuild.

## Current stage

**18-2 — Golden Slice, Creek Crossing**

Status: **ACTIVE / TECHNICALLY GREEN / VISUALLY RED**

Three CI runs on `validate-pass18-2-golden-slice.yml` are green as of
`25232b7` (`34697743985` failed on an asset-catalog typo, since fixed;
`34700076003` and `25232b7`'s run `34703057628` are green). The visual gate
remains explicitly **refused** by the project owner: the first cut read as
oversized disconnected cliff slabs; a camera-and-scale-multiplier repair
(`25232b7`) made the frame readable but exposed a second failure —
disconnected terrain islands with unexplained void between banks. Root
cause diagnosed: terrain-family kit modules (ground/path/river/cliff, and
the bridge) were being routed through the prop bounding-box normalizer
(`normalizePass18Asset`) instead of being placed at their verified native
1-unit grid scale, and the manifest's straight approach/exit route crossed
the creek's own meander at ground level in several rows.

A full terrain-rebuild design was produced and geometry-verified (real
glTF vertex/triangle decode, not bounding-box guesses) covering: creek-
following bank tiling, real multi-primitive `InstancedMesh` batching,
same-side west/east cliff-corner generation, an explicit route with a
single-instance `nature.bridge.stone` prop oriented on its verified local-X
walking axis, and corrected ridge classification (`nature.platform.grass`
reclassified from prop to tile). Implementation of that design is
**in progress on this branch** — see the checkpoint written alongside it
once complete, and do not treat any resulting green CI run as visual
approval until a human has looked at the actual screenshots.

## Historical: 18-1B — In-browser world authoring tool

Status: **COMPLETE / GREEN**

The accepted 18-0B world-language baseline remains version `18-0B.2`; the 18-0C AssetRegistry/spatial architecture and 18-1 structural skeleton remain the production foundations for the rebuild.

## 18-1B certification

Validated authoring implementation head:
- `4859bdadc94ba8ef56a7c4e7e5fdec6e3bc1ea86`

Durable checkpoint:
- `checkpoints/PASS18_1B_WORLD_AUTHORING_TOOL.md`

Final browser workflow:
- `Validate Pass 18-1B World Authoring Tool`
- run `34694655272`
- job `103555945472`
- conclusion: **SUCCESS**
- proof artifact `10298154057`
- artifact digest `sha256:8c1e925b1e8f135ec30b40541a91b866a83b65e5b3ef3b638cb1e8e4d397eb77`

Validated on desktop and Android landscape:
- 35 approved curated real assets in the searchable/filterable palette;
- place / select / move / rotate / scale / delete authoring contracts;
- configurable X/Z and Y snapping, defaulting to 0.5u / 0.25u;
- repeatable-Nature scatter brush;
- path/fence polyline authoring with real asset hints;
- camera-pose capture;
- deterministic 24u chunk-aware JSON export;
- editor loads the accepted 18-1 structural world through the real Pass 18 AssetRegistry;
- zero registry failures and zero severe browser errors.

Final proof metrics on both browser targets after the functional editing sequence:
- palette: 35
- tree search results: 3
- placements: 4 after intentional delete test
- polylines: 2
- cameras: 1
- chunks: 2
- unique sources loaded: 22
- render calls: 87
- rendered triangles: 5,829

The proof screenshots were inspected. Desktop retains a large central editing viewport between the palette and tool panels. Android landscape keeps both panels fully inside the viewport while retaining usable central world space. This is a tooling/usability acceptance only, not a concept-match approval of the sparse 18-1 structural map.

## Architecture and authored content now available

- `data/pass18/world-skeleton.json` — accepted A→F structural geography/routes/river/sightlines/cameras.
- `src/pass18/asset-catalog.js` / `asset-registry.js` — approved real-asset vocabulary and shared-resource runtime.
- `src/pass18/spatial-grid.js` — visibility/collision spatial architecture.
- `src/pass18/editor-state.js` — schema `18-1B.0`, snapping, placement/polyline/camera document model and chunk export.
- `src/pass18/asset-placement.js` — reusable real-asset placement/normalization helpers.
- `src/pass18/editor.js` — in-browser authoring runtime over the structural world.
- `pass18-editor/` — desktop/Android-landscape authoring surface.
- `checkpoints/PASS18_1_STRUCTURAL_SKELETON.md` — structural map acceptance.
- `checkpoints/PASS18_1B_WORLD_AUTHORING_TOOL.md` — authoring tool acceptance.

No generated-world JavaScript, no Pass 18 patch stack, no Pass 17 world dependency and no ad-hoc loader were introduced.

## Required context for the next stage

Read, in order:
1. `PROJECT_CONTINUITY.md`
2. `CURRENT_WORK.md`
3. `ASSET_DECISIONS.md`
4. `WORLD_LANGUAGE.md`
5. `VISUAL_APPROVALS.md`
6. `checkpoints/PASS18_1B_WORLD_AUTHORING_TOOL.md`
7. `checkpoints/PASS18_1_STRUCTURAL_SKELETON.md`
8. `checkpoints/PASS18_0C_ASSET_RUNTIME.md`
9. `PASS17_CONCEPT_MATCH_BUILD_SPEC.md` only for approved A→F visual/map intent and gameplay intent, NOT implementation architecture.

## NEXT TASK

**18-2 — Golden Slice, Creek Crossing (terrain rebuild)**

Status: **IN PROGRESS** — see "Current stage" above.

This is the first true concept-resemblance gate. Build Creek Crossing in situ at final intended scale using the accepted Pass 18 architecture and real-asset vocabulary.

Required proof:
- Creek Crossing vista composed at final world scale;
- matched scenic/concept camera framing;
- layered grass-over-rock cliffs rather than a test-strip or giant-block backdrop;
- winding path, fences and flowers that explain traversal;
- creek/gorge water integrated into the terrain;
- real stone bridge as the primary crossing;
- waterfall/drop treatment using approved real cliff housings plus the already-approved lightweight custom water effect where needed;
- distant Prism Ridge still readable as the destination;
- desktop and Android/phone visual proof.

The Golden Slice must preserve the accepted 18-0B.2 palette/lighting/atmosphere direction, use the AssetRegistry and data-driven placement architecture, and treat the 18-1 structural geography as the world framework rather than replacing it with another monolithic terrain implementation.

If the Golden Slice does **not** visibly read as the approved Prism Valley V2 concept direction, stop and repair it before constructing the remaining A→F art-density pass.

18-2 must **not**:
- modify production `main`;
- build all remaining sections before Creek Crossing visually passes;
- treat a technical browser/route/performance PASS as visual approval;
- begin 18-2B hard visual freeze until the Golden Slice itself is accepted and the user gives the next GO.

When 18-2 completes, update this file again, update `VISUAL_APPROVALS.md` only if the visual gate is genuinely accepted, and write a new durable checkpoint before stopping.
