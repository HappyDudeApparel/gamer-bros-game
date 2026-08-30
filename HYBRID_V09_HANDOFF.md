# Hybrid v0.9 Handoff

## Current status — Phase 2B clean runtime

Hybrid v0.9 is the active experimental line. **Do not alter the live v0.8.7 root game yet.**

- Development branch: `hybrid-v0.9`
- Isolated public preview: `https://game.happydude.ca/hybrid-v09/`
- Public preview files live under `main/hybrid-v09/` only.
- Root `main/index.html` remains `Gamer Bros Portal World v0.8.7`, blob `9f22093aa75c7ddd4a8259618e7e299f0a71ad43`.
- GitHub Pages run `33337421986` completed successfully for the Phase 2B cleanup deployment.

## Architecture rule going forward

Do **not** return to the Phase 1 helper-stack approach.

The previous preview layered behavior through:
- `phase1b.js`
- `phase1c.js`
- `phase1d.js`

Those files were physically deleted from both `hybrid-v0.9/hybrid-v09/` and `main/hybrid-v09/`. Their required behavior was consolidated into the single Hybrid runtime patch in `hybrid-v09/main.js`.

Current preview loads only:
1. `hybrid-v09/main.js`
2. `hybrid-v09/phase2a.js`

When replacing obsolete behavior, delete/rebuild the old path rather than stacking another post-load overlay.

## Character — one native Gamer Bro

The portal regression came from the separate `v087CharacterPolish` overlay disappearing during conversion, exposing the older base character underneath.

Phase 2B removes that overlay architecture entirely.

The real base Gamer Bro already contains:
- distinct left/right glasses frames and lenses;
- native hair cap and hair-lock geometry;
- multi-part headphones;
- controller model and controller emitter;
- left/right arm pivots and action blend;
- materials already wired into the portal dissolve.

Phase 2B styles those native meshes directly:
- navy glasses frames instead of an all-black slab;
- bright magenta lenses;
- teal/orange/navy/magenta headphone treatment;
- extra hair-lock geometry added into the native hair definition;
- no post-load character shell or duplicate avatar.

The intended result is the same character before, during and after portal conversion.

## Movement and camera

Phase 2B control semantics:
- circular analog stick;
- stick up = **forward in the current camera view**;
- stick right = screen/camera right;
- diagonals blend continuously;
- movement reads current camera yaw every frame;
- dragging the world directly rotates camera yaw/pitch even while the joystick is held;
- after both camera drag and analog input stop, follow recenter may softly resume;
- persistent pinch/wheel zoom remains;
- player step allowance increased from `0.52` to `0.90` so small stairs/height transitions do not act like invisible walls.

Do not reintroduce the Phase 1.3 workaround that prevented camera heading changes while analog input was active.

## World traversal

The earlier landscape had disconnected/awkward sections that could prevent reaching the enemies.

Phase 2B rebuilds the main traversal route with:
- a long gradual connection from the portal toward the first gameplay meadow;
- a much larger central meadow;
- connected left/right enemy plateaus;
- connected forward plateaus/ramps;
- decorative route-blocking boxes removed;
- slightly fewer trees/rocks for clearer paths and safer performance.

If rendered-device testing finds another blockage, fix the actual walk surface/geometry rather than adding teleport workarounds.

## Portal

Portal behavior is now folded directly into the clean runtime:
- automatic entry with arm/re-arm state;
- automatic activation once the hero reaches the tube;
- the same native Gamer Bro enters and converts;
- no separate visual layer that can expose an older avatar;
- completion exits immediately at the end of conversion instead of holding through the old long dissipate/afterglow stall;
- hero respawns on a distant connected plateau around `z=57`;
- camera returns to follow mode;
- portal does not re-arm until the player leaves its trigger radius.

Rendered-device validation is still required for exact timing and appearance.

## Controller ZAP

Controller ZAP is also part of the clean runtime:
- press-and-hold `ZAP`;
- native `bro.setAction(actionActive)` action state;
- controller belongs to the character rig;
- left and right arms are separately restaged toward opposite controller grips;
- beam origin and direction come from `bro.controllerEmitter`;
- broad environment raycasting is disabled in the core beam path for safety/performance;
- Phase 2A separately raycasts enemies for combat hits.

## Phase 2A enemies retained

`hybrid-v09/phase2a.js` remains active with three lightweight local enemies:
- Stump
- Ghost
- Mushroom

Current behavior:
- patrol routes;
- local detection/chase;
- 2 HP;
- controller-ZAP hits;
- hit pulse;
- defeat burst.

These are self-contained procedural stand-ins. Do not load their models at runtime from the old private repository.

Preserved upgrade source remains in:
- repo: `HappyDudeApparel/sprite-3d-arena`
- branch: `bootstrap/performance-baseline`

Useful preserved assets/source include `src/entities/EnemySystem.ts` and the authored `stump.glb`, `ghost.glb`, `mushroom.glb`, `cactus.glb`, `cthulhu.glb`, `demon.glb`, `skull.glb`, and `yeti.glb`.

## Current rendered-device priorities

Validate the cleaned public preview for these foundation points:
1. character no longer changes to the old all-black-glasses version in the tube;
2. joystick up consistently means camera-forward and diagonals feel natural;
3. camera can be dragged freely while the joystick remains held;
4. player can walk from portal to enemy areas without stairs/gaps blocking progress;
5. portal does not visibly hang at disappearance;
6. both hands convincingly hold the controller during ZAP.

Small corrections to these are allowed, but keep them inside the clean runtime rather than restoring helper overlays.

## Next phases

### Phase 2C — combat/presentation
- improve enemy visuals using preserved authored sources where worthwhile;
- enemy attacks/contact behavior;
- player hit response, knockback and temporary invulnerability;
- clearer enemy hit/defeat feedback;
- continue watching phone/PC performance.

### Phase 3 — Happy Dude Maple Leafs
- hovering/collectible Leafs;
- enemy defeat rewards;
- score/session state;
- later connect boxes and other rewards to Leafs.

### Phase 4 — reward boxes + richer ZAP FX
- jump-hit/reward boxes;
- Leafs released from rewards;
- more animated controller beam, charge/motion/impact effects.

### Later character track
Use recovered Citrus/Dash Blender/GLB material as an authored character-pipeline reference. Do not put heavy high-poly Blender source directly into the browser build; retopology/rigging/optimized GLB is a separate art track.

## Design direction

Hybrid v0.9 combines the stronger v0.5 portal/tube foundation, a clean landscaped third-person world, recovered arena gameplay architecture/enemy ideas, the Gamer Bros controller/ZAP identity, and later the Happy Dude Leaf reward loop.

The priority is now a clean, maintainable playable game rather than accumulating compatibility patches from older builds.
