# PASS 18 — HISTORICAL START / PLAN

> **RECOVERY NOTICE:** This file is no longer the current recovery entry point. It is retained as historical Pass 18 planning context only. For any future chat/window — including future Pass 19, 20, or differently named work — read `PROJECT_CONTINUITY.md` and then `CURRENT_WORK.md`. The user does not need to use any exact recovery phrase.

## Why Pass 18 exists

Pass 17 was technically playable but visually failed the approved Prism Valley V2 concept pack. It used a single low-resolution deformed plane, sparse dressing, incomplete runtime access to downloaded asset packs, weak mobile presentation settings, and functional CI gates that did not test visual resemblance.

Pass 18 is a clean world rebuild, not another patch layer.

## Non-negotiable engineering rules

1. **NO BANDAID WORK.** If an underlying module is wrong, replace the module. Do not stack patch scripts over generated output.
2. **No generated JavaScript world content.** Runtime logic is authored as JS modules; world placements live as JSON data/manifests.
3. **No custom geometry without a recorded kit search.** `ASSET_DECISIONS.md` must name the packs searched and explain why no real asset fits.
4. **No concept-match claim without matched-camera screenshots.** Booting, route probes, landmark names and successful CI are preconditions only.
5. **Approved visual language is frozen in files, not memory.** Use `WORLD_LANGUAGE.md`, `VISUAL_APPROVALS.md`, camera data and approved proof artifacts.
6. **Performance is achieved by correct architecture, not by emptying the world.** Use shared resources, instancing/batching, LOD/far shells, chunking and cheap atmospheric depth.
7. **Keep what is actually good.** Preserve proven player/controller, camera/touch, Prism Breaker, enemy state machine, checkpoints and portal unless a measured problem requires change.

## Engine decision

Keep Three.js r180. The Pass 17 failure was authoring/architecture, not the renderer.

## Historical Pass 18 build sequence

### 18-0A — Real asset acquisition + kit audit
Permanent approved real kits, including Kenney Nature/Fantasy Town/Castle plus retained Kenney/KayKit libraries.

### 18-0B — Look calibration
Tiny real-asset scene to freeze lighting, shadows, tone mapping, sky/fog, FOV/camera and mobile resolution policy.

### 18-0C — Asset runtime/tooling foundation
One AssetRegistry, real-asset gallery, debug budget HUD, shared/instanced/batched placement paths and dense-world spatial/collision architecture.

### 18-1 — Whole-map structural skeleton
A→F at final intended scale with low-detail geography, elevations, gorge/river, routes, sightlines and Prism Ridge visibility.

### 18-1B — In-browser placement tool
Filterable asset palette, transform tools, snapping, scatter brush, fence/path tool, JSON export and camera capture.

### 18-2 — Golden Slice, in situ
Creek Crossing vista looking downstream. Prove layered grass-over-rock cliffs, path/fences/flowers, gorge water, stone bridge, waterfall and distant readable Prism Ridge.

### 18-2B — Hard visual freeze
Commit approved screenshots/cameras and lock world visual language.

### 18-3 onward — One approved section at a time
B Creek Crossing, C Riverworks, A Portal Meadow, D Clover Cliffs, E Ruin Courtyard, F Prism Ridge. Each section is composed, compared, phone-tested, approved and regression-locked before moving on.

## Concept target

The approved Prism Valley V2 concept pack remains the visual/map target. It is a buildable composition target, not proof that every depicted object is one exact GLB. Real kit assets are used wherever they exist; narrow custom work is allowed only where the kits genuinely do not provide the required result.

## Current recovery rule

Do **not** infer the present stage from this historical file. Read:
1. `PROJECT_CONTINUITY.md`
2. `CURRENT_WORK.md`

Those files always control the active branch, current checkpoint and next task.
