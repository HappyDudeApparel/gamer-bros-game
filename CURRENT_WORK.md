# GAMER BROS — CURRENT WORK

This file is overwritten as the project advances. It is the authoritative recovery/status handoff for any future chat.

## Active development

- Project: Gamer Bros / Prism Valley World 1 rebuild
- Active branch: `pass18-rebuild`
- Production/live branch: `main`
- Production baseline: `97834f6d21e0d4e6af0d9d36ad355215126ceda0` (Pass 17C)
- `main` is NOT authorized for modification during the current rebuild.

## Current stage

**18-0C — AssetRegistry + asset gallery + budget HUD + dense-world spatial architecture**

Status: **IN PROGRESS**

The previous checkpoint, 18-0B Look Calibration, is COMPLETE / GREEN. Its accepted world-language baseline is version `18-0B.2` and must not be casually rewritten during 18-0C.

## Required context

Read, in order:
1. `PROJECT_CONTINUITY.md`
2. `CURRENT_WORK.md`
3. `ASSET_DECISIONS.md`
4. `WORLD_LANGUAGE.md`
5. `VISUAL_APPROVALS.md`
6. `checkpoints/PASS18_0B_LOOK_CALIBRATION.md`
7. `PASS17_CONCEPT_MATCH_BUILD_SPEC.md` only for approved A→F visual/map intent, not implementation architecture.

## Current objective

Build the reusable runtime/tooling foundation needed before the A→F skeleton is authored:

- one clean Pass 18 AssetRegistry with one-load-per-asset caching and shared geometry/material/texture resources across repeated placements;
- pack roots for every approved permanent asset family;
- explicit single, instanced and static-batched placement paths;
- an actual browser asset gallery for inspection of the real vendored art;
- a `?debug=1` metrics/budget HUD;
- spatial visibility/chunk and collision-candidate architecture so dense art never means raycasting thousands of render meshes;
- real desktop + Android browser validation;
- no generated-JS or patch-script stack.

## No-bandaid constraints for this stage

- Do not modify the Pass 17 loader and call it Pass 18; author the new registry cleanly under `src/pass18/`.
- Do not deep-clone geometry/material/texture for repeated placements. Repeated clones of one cached source must share immutable render resources by default.
- Do not introduce risky cross-file material/texture deduplication without measurements. Cache each source file once first; broader atlas/resource consolidation is a measured future optimization.
- Do not build the A→F world yet.
- Do not change the accepted 18-0B look simply to make the gallery easier.

## NEXT TASK

Finish **18-0C only**:
1. Implement registry/catalog/spatial/budget-HUD modules.
2. Build the real-asset browser gallery.
3. Add browser validation/workflow on desktop and Android-landscape.
4. Inspect proof screenshots/metrics; repair underlying modules if needed.
5. Write `checkpoints/PASS18_0C_ASSET_RUNTIME.md` and update this file to COMPLETE / GREEN only after executed validation.
6. STOP before 18-1. Do not build the whole-map skeleton until the user gives the next GO.
