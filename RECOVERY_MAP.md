# Gamer Bros Recovery Map

This file defines the no-regression source map for the unified playable recovery build.

## Non-negotiable recovery rule

Do not replace a proven authored asset/system with a primitive stand-in simply because the stand-in is easier to wire up. Preserve the strongest working version, integrate in isolation, and keep the last playable build available until the replacement is demonstrably better.

## Canonical live/playable baselines

### Outdoor world / movement baseline
- **Source:** root v0.8.7 runtime (`legacy-main-v087.html`, `src/main-v087.js`, `src/overlay-v085.js`, `src/v087.js`).
- **Keep:** natural camera-relative movement, analog/mobile controls, follow camera, open portal hub, expanded route network, bridge/platform collision helpers, Happy Dude Leafs, v0.5-derived portal/floor/crystal/material foundation.
- **Do not regress to:** Training Grounds' simplified character/world/collision architecture.

### Portal / tube visual baseline
- **Source lineage:** Stone Portal Room v0.5 -> Gamer Bros Portal Room v0.7 -> Portal World v0.8.x.
- **Keep:** modern stone/material response, glass/transmission look, metal/bronze structure, crystal lighting, portal energy shaders, four-stage transition (charge -> convert -> dissipate -> afterglow), hero load/transmission presentation, adaptive quality behavior.
- **Do not replace with:** simplified Room 01 tube geometry when the stronger portal lineage is available.

### Gamer Bro baseline
- **Source:** advanced procedural Gamer Bro used by v0.7/v0.8.x and preserved in `playground-v2/gamer-bro.js` / Hybrid clean source.
- **Keep:** 2.62-height authored proportions, high/low geometry tiers, layered lighting, idle/walk/run/action animation, detailed head/hair/visor/body/hands/shoes, PBR material treatment.

## Recovered authored asset targets

### Citrus / Dash
- A protected backup exists immediately before direct Citrus integration.
- The authored Blender lineage uses explicit Citrus materials (orange/blue/eyes/emblem) and should be recovered from the canonical asset package/local art pipeline rather than recreated as an orange sphere.
- **Status in this repository:** final Citrus GLB is not currently present. Do not substitute a primitive placeholder in the unified build.

### Ghost
- Canonical production source expects an authored `characters/ghost` rig/model and treats it as an authored enemy asset.
- **Status in this repository:** final Ghost GLB is not currently present. Keep the recovery hook/slot, but do not replace it with the simplified Training Grounds sphere as the canonical Ghost.

### Other recovered enemy rigs
Canonical production source expects authored local rigs for:
- stump
- ghost
- cthulhu
- yeti
- hero-derived/water-tinted actor

Use authored models/animation clips when their GLBs are recovered; retain gameplay proxy/fallback only as a safety layer, not as the visual target.

## Authored outdoor arena / environment target

### Canonical arena source
- **Source:** recovered `ConceptArena.ts` / `LocalProductionScene.ts` lineage.
- **Expected terrain asset:** `terrain/concept_arena` GLB.
- **Layout:** pond -> stone ramp -> ruins -> rope bridge -> shrine.
- **Keep:** ArenaStone/ArenaGrass/ArenaWood material treatment, animated water/fall, Shrine_Core/Shrine_Shaft/Shrine_Gems, destructible bricks, collectible gems, authored scenic dressing and quality-scaled foliage.

### Collision rule
- Visible routes and gameplay collision must share the same endpoints/shape assumptions.
- Bridges must have continuous traversable surfaces from landing to landing.
- Do not ship decorative walkable-looking terrain with unrelated coarse collision rectangles beneath it.

### Environment detail
Recover/use the stronger authored tree, rock, ruin, stair, arch, vine, fern/bush/foliage and shrine dressing assets where available. Quality settings may reduce density or shadow cost, but should not swap the world back to crude stand-ins.

## Currently vendored GLB environment assets
The repository currently contains these safe local GLBs under `hybrid-v09/assets/kenney/`:
- dungeon/gate.glb
- dungeon/stairs.glb
- furniture/bookcaseClosedWide.glb
- furniture/bookcaseOpen.glb
- furniture/lampWall.glb

They are valid authored environment pieces for the Crystal Library and can remain available as local assets.

## Current playable paths
- `/legacy-main-v087.html` — preserved outdoor v0.8.7 baseline.
- `/hybrid-v09/` — preserved Hybrid v0.9 Crystal Library / portal lineage.
- `/room01-v1/` — integration experiment only; not canonical art direction.
- `/playground-v2/` — gameplay recovery test only; not canonical art direction.

## Unified build order
1. Preserve v0.8.7 + Hybrid v0.9 as live rollback references.
2. Recover binary character/environment GLBs from the canonical recovery/local art package.
3. Build the unified outdoor scene from authored terrain/collision first.
4. Mount the strongest portal/tube system at the destination.
5. Integrate advanced Gamer Bro plus recovered Citrus/Dash and Ghost without primitive replacements.
6. Restore authored trees/foliage/ruins and enemy rigs.
7. Reattach powers, brick destruction, enemies, pickups, finish/portal sequence.
8. Validate mobile movement, bridge traversal, fall protection, frame pacing and startup before replacing the live default.
