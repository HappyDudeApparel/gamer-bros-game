# PASS 18 — START HERE

This is the durable recovery/control file for the Prism Valley V2 rebuild.

## If a chat crashes or a new chat starts

Use this exact instruction:

> Resume Gamer Bros Pass 18 from `PASS18_START_HERE.md` and `PASS18_STATUS.md` on branch `pass18-rebuild`. Do not touch `main`. Execute only the NEXT TASK recorded in `PASS18_STATUS.md`, preserve the no-bandaid rules, update the status/checkpoint files before stopping, and report the exact branch SHA.

A new assistant should read, in order:
1. `PASS18_START_HERE.md`
2. `PASS18_STATUS.md`
3. `ASSET_DECISIONS.md`
4. `PASS17_CONCEPT_MATCH_BUILD_SPEC.md` only for the approved A→F map/visual target and gameplay intent, NOT as implementation architecture.
5. `PASS17B_ASSET_MAP.md` only as historical context; Pass 18 supersedes any incorrect asset assumptions in it.

## Branch safety

- Active rebuild branch: `pass18-rebuild`
- Production/live branch: `main`
- `main` stays untouched until Pass 18 has completed its visual, gameplay and mobile-performance approval gates.
- Pass 17 remains the live fallback while Pass 18 is built cleanly in isolation.

## Why Pass 18 exists

Pass 17 was technically playable but visually failed the approved Prism Valley V2 concept pack. It used a single low-resolution deformed plane, sparse dressing, incomplete runtime access to downloaded asset packs, weak mobile presentation settings, and functional CI gates that did not test visual resemblance.

Pass 18 is a clean world rebuild, not another patch layer.

## Non-negotiable engineering rules

1. **NO BANDAID WORK.** If an underlying module is wrong, replace the module. Do not stack patch scripts over generated output.
2. **No generated JavaScript world content.** Runtime logic is authored as JS modules; world placements live as JSON data/manifests.
3. **No custom geometry without a recorded kit search.** `ASSET_DECISIONS.md` must name the packs searched and explain why no real asset fits.
4. **No concept-match claim without matched-camera screenshots.** Booting, route probes, landmark names and successful CI are preconditions only.
5. **Approved visual language is frozen in files, not memory.** Later stages will produce `src/pass18/world-language.js`, `WORLD_LANGUAGE.md`, `cameras.json`, approved golden screenshots and `VISUAL_APPROVALS.md`.
6. **Performance is achieved by correct architecture, not by emptying the world.** Use merging/instancing/batching, LOD/far shells, chunking, shared materials/textures and cheap atmospheric depth.
7. **Keep what is actually good.** Preserve the working player/controller, camera interaction, touch controls, Prism Breaker contract, enemy state machine, checkpoints and portal unless a measured problem requires change.

## Engine decision

Keep Three.js r180. The failure was authoring/architecture, not the renderer. Pass 18 will use the capabilities already available: shared geometry/materials, `InstancedMesh`, `BatchedMesh`, merged static geometry, LOD/far shells, custom water/waterfall shaders and controlled shadows.

## Frozen high-level build sequence

### 18-0A — Real asset acquisition + kit audit
- Permanently vendor and verify the approved real kits.
- Required additions: Kenney Nature Kit, Kenney Fantasy Town Kit, Kenney Castle Kit.
- Preserve/use existing Kenney and KayKit packs.
- Record asset/custom-geometry decisions.
- Do NOT build the game world yet.

### 18-0B — Look calibration
- Tiny calibration scene using real final-family assets.
- Lock palette, lighting, shadow strategy, tone mapping, sky, fog/haze, environment lighting, FOV, camera pitch and mobile resolution policy.
- Output `src/pass18/world-language.js` and human-readable rules.

### 18-0C — AssetRegistry + gallery + budget HUD
- Replace duplicate Pass 17 asset loaders with one registry.
- Expose all approved packs.
- Dedupe resources.
- Provide merge/instance/single placement APIs.
- Build browser asset gallery and `?debug=1` metrics HUD.
- Establish dense-world collision architecture before art density rises.

### 18-1 — Whole-map structural skeleton
- Build A→F at final scale with cheap placeholder geometry.
- Lock elevations, river/gorge, traversal distances, sightlines and Prism Ridge visibility.
- No art-density pass yet.
- Content stored as JSON manifests.

### 18-1B — In-browser placement tool
- Filterable asset palette.
- Place/move/rotate/scale/delete.
- Grid/vertical snapping.
- Scatter brush for trees/rocks/flowers/grass.
- Fence/path polyline tool.
- Export chunk JSON.
- Capture approved camera poses.

### 18-2 — Golden Slice, in situ
- Creek Crossing vista looking downstream.
- Prove: layered grass-over-rock cliffs, winding dirt path/fences/flowers, creek/gorge water, stone bridge, one waterfall, distant readable Prism Ridge.
- First as a fixed matched concept camera, then with the gameplay camera/player.
- If this does not visibly read as Prism Valley, STOP. Do not build the remaining sections.

### 18-2B — Hard visual freeze
- Commit approved golden screenshots and camera poses.
- Record approval SHA/date.
- Lock world visual language.

### 18-3 onward — One section at a time
- B Creek Crossing (largely established by Golden Slice)
- C Riverworks
- A Portal Meadow
- D Clover Cliffs
- E Ruin Courtyard
- F Prism Ridge
- Each section: compose → compare → phone-test → approve → regression-lock.

### Final
- Full-world integration, streaming/LOD, performance/thermal validation, gameplay integration and deployment only after section approvals.

## Concept target

The approved Prism Valley V2 concept pack remains the visual/map target. It is a buildable composition target, not proof that every depicted object is one exact GLB. Real kit assets should be used wherever they exist; narrow custom work is allowed for things the kits genuinely do not provide (for example stylized water/waterfalls, enemy family, Prism crystal/glow treatment, far-atmosphere material).

## Resume discipline

Before doing any work, read `PASS18_STATUS.md`. At the end of every checkpoint:
- update `PASS18_STATUS.md` with PASS/PARTIAL/FAIL;
- record exact commit SHA(s);
- record what was actually validated;
- record the next single task;
- never claim green based only on work that was planned but not executed.
