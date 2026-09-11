# Gamer Bros Recovery Map

This file defines the no-regression source map for the unified playable recovery build.

## Non-negotiable recovery rule

Do not replace a proven authored asset/system with a primitive stand-in simply because the stand-in is easier to wire up. Preserve the strongest working version, integrate in isolation, and keep the last playable build available until the replacement is demonstrably better.

## Canonical live/playable baselines

### Movement / camera baseline — LOCKED TO CRYSTAL LIBRARY v2
- **Source:** `hybrid-v09/src/game.js` Crystal Library v2 playable slice.
- **Keep exactly:** camera-relative movement, analog/mobile controls, follow camera recenter behavior, camera drag/pinch sensitivity, 3.75 walk / 6.35 run, 8.5 turn damping, permissive jump/double-jump/hold-boost behavior, idle/walk/run Gamer Bro animation switching.
- **Additive safety allowed:** terrain-derived camera occlusion / collision protection when required by an outdoor authored map.
- **Do not regress to:** Portal World outdoor thumbstick/camera, Pass 6 Leap Land controls, or a new handwritten controller when this baseline already works.

### Portal / tube visual and transition baseline — LOCKED TO CRYSTAL LIBRARY v2
- **Exact source:** `hybrid-v09/src/game.js`, section `PORTAL MACHINE — SAME SILHOUETTE, BETTER MATERIAL RESPONSE`, plus its integrated hero dissolve / particle / portal phase code.
- **Recovered shared component:** `src/crystal-library-tube-v2.js`.
- **Keep:** exact metalDark/metalMid/metalLight/bronze/glass material values; 2.30/2.42 base silhouette; 1.52-radius x 4.40 glass chamber; four pylons and glow strips; cyan/violet ring system; front control panel; energy column/disc shaders; rising rings; particle/arc system; PBR-preserving hero dissolve; character-derived particles; charge -> convert -> sustain -> dissipate -> afterglow timeline; shader/program prewarming before entry.
- **Performance rule:** pre-create and precompile the dissolve-enabled hero materials, particles and portal shaders before the player enters the tube. Do not make first-use shader compilation part of the dissolve frame.
- **Do NOT substitute:** `room01-v1/portal-v2.js`, `src/advanced-tube-v1.js`, Pass 5 placeholder tube, flat stone portal, or a newly improvised tube. Those are not the user's accepted Crystal Library v2 tube.

### Gamer Bro baseline
- **Source:** advanced procedural Gamer Bro used by v0.7/v0.8.x and preserved in `playground-v2/gamer-bro.js` / Hybrid clean source.
- **Keep:** 2.62-height authored proportions, high/low geometry tiers, layered lighting, idle/walk/run/action animation, detailed head/hair/visor/body/hands/shoes, PBR material treatment.
- **Starting playable roster:** GB1 pink + GB2 teal only.
- **Reserved unlock:** Citrus/Dash (`pass1-v1/assets/recovered/characters/sprite_hero.glb`) may become selectable only after Level 1 completion.
- **Enemy-only for now:** Ghost, Stump, Cthulhu, Yeti.

## Recovered authored character assets

These authored GLBs are present under `pass1-v1/assets/recovered/characters/`:
- `sprite_hero.glb` — Citrus/Dash reserved unlockable player.
- `ghost.glb` — enemy.
- `stump.glb` — enemy.
- `cthulhu.glb` — enemy.
- `yeti.glb` — enemy.
- `hero.glb` — generic recovered model; not a substitute for the canonical procedural Gamer Bro.

Do not replace these with primitive proxy spheres or rebuilt low-quality historical models.

## Authored outdoor arena / environment target

### Recovered canonical arena source
- **Source:** recovered `ConceptArena.ts` / `LocalProductionScene.ts` lineage.
- **Terrain asset:** `pass1-v1/assets/recovered/terrain/concept_arena.glb`.
- **Layout:** pond -> stone ramp -> ruins -> rope bridge -> shrine.
- **Keep:** ArenaStone/ArenaGrass/ArenaWood material treatment, water/foam, wood/rope, gems/core and authored scene composition.
- **Pass 8 test rule:** render this authored GLB directly. Do not hide it under a procedural cylinder, fake path tiles, or a manually invented replacement map.

### External world direction
- Prefer finished, professionally authored, commercially compatible outdoor levels/maps with broad readable continuous traversal.
- Visual preference: KayKit / Kenney lush stylized nature. Leap Land and Quaternius assets may supplement later where licensing and fit are clear.
- Do not present an asset-pack showcase screenshot as a downloadable finished level unless the actual assembled scene is included.
- Do not build another arbitrary maze/corridor arrangement simply because modular assets are available.

### Collision rule
- Visible routes and gameplay collision must derive from the authored geometry or faithfully match it.
- Bridges must have continuous traversable surfaces from landing to landing.
- Do not ship decorative walkable-looking terrain with unrelated coarse collision rectangles beneath it.
- Camera should avoid authored geometry blocking the player where possible.

## Currently vendored environment assets
The repository contains:
- `assets/vendor/kenney-platformer/models/` — official Kenney Platformer Kit CC0 GLBs.
- `hybrid-v09/assets/kenney/` — authored Kenney pieces used by Crystal Library.
- `pass1-v1/assets/recovered/` — recovered authored arena, nature, kit and character GLBs.

These remain available as dressing/supplemental assets. A good asset library does not itself count as a finished level design.

## Current preserved paths
- `/legacy-main-v087.html` — old outdoor v0.8.7 rollback reference; not current movement/camera target.
- `/hybrid-v09/` — preserved Crystal Library v2 / correct tube / accepted control-performance lineage.
- `/pass6-v1/` — Leap Land experiment; rejected for navigation/collision/gameplay quality.
- `/pass7-v1/` — Kenney Gardens experiment; assets useful, level design and tube rejected.
- `/pass8-v1/` — gold-baseline integration test: authored recovered arena + Crystal Library v2 controls/camera + exact recovered Crystal Library v2 tube; no enemies.
- `/room01-v1/` — integration experiment only; its tube is not canonical.
- `/playground-v2/` — Gamer Bro/gameplay component source; not canonical world art.

## Current build order
1. Prove Pass 8 fundamentals before adding content: movement, walk/run animation, jump, visible-geometry collision, camera visibility, exact Crystal Library v2 tube/transition and no first-use hitch.
2. If the authored Concept Arena itself is not good enough, keep the proven Pass 8 shell and swap only the map for a stronger finished commercially compatible outdoor level.
3. Do not reintroduce enemies until the baseline world/control/tube test is accepted.
4. Then add enemy behavior as a separate validated system: normalized scale, immediate hit reaction, one clear defeat/disappearance, no duplicate respawn bug.
5. Add one chosen collectible family and persistent tally.
6. Enable Level 1 completion and Citrus unlock only after the world/combat/portal round is stable.
