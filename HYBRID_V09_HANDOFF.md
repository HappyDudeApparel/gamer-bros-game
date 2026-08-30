# Hybrid v0.9 Handoff

## Current status — Phase 2C

Hybrid v0.9 is the active experimental line. **Do not alter the live v0.8.7 root game yet.**

- Development branch: `hybrid-v0.9`
- Isolated public preview: `https://game.happydude.ca/hybrid-v09/`
- Public preview files live under `main/hybrid-v09/` only.
- Root `main/index.html` remains `Gamer Bros Portal World v0.8.7`, blob `9f22093aa75c7ddd4a8259618e7e299f0a71ad43`.
- Phase 2C public commit: `10c0d51104d9d271c85ccd618d37ae9a7f5ab057`.
- GitHub Pages run `33338358604` completed successfully.

## Architecture rule

Do not return to the Phase-1 helper-stack approach. `phase1b.js`, `phase1c.js`, `phase1d.js`, the old preview `main.js`, and `phase2a.js` have been removed from the active public Hybrid folder.

Hybrid now loads:
1. `hybrid-v09/runtime/main.js`
2. `hybrid-v09/phase2c.js`

The runtime now executes isolated Hybrid copies of the ten source chunks under:
- `hybrid-v09/src/chunks/01.txt` ... `10.txt`

This is important: Hybrid no longer has to fetch the live v0.8.7 root chunks at runtime. Future runtime edits should be made against these isolated Hybrid copies and obsolete behavior should be deleted/rebuilt rather than stacked through more helper files.

## Movement / camera / traversal retained from Phase 2B

- Circular analog stick.
- Stick up = forward in the current camera view.
- Right/left/diagonal input remains camera-relative.
- Camera can be dragged while the joystick is held.
- Soft follow recenter only resumes after input/drag stops.
- Connected route from portal to central/side enemy areas.
- Step allowance increased to avoid small stair barriers.
- Portal auto-entry, auto-activation, distant respawn and re-arm logic retained.

## Phase 2C hero presentation

Rendered-device feedback after Phase 2B said the playable hero still read as the older glasses/sprite version and the off-hand controller pose was not naturally mirrored.

Phase 2C therefore consolidates presentation changes inside the single active `phase2c.js` module:

- Finds and hides the old visible native lens group once.
- Builds one replacement face-gear treatment using the hero's **existing dissolve-compatible materials**, so the new glasses participate in portal conversion instead of remaining behind.
- New glasses use navy frame + cyan/pink lens treatment + orange hinge/bridge accents rather than an all-black slab.
- Adds a stronger cowlick/hair silhouette using the hero's existing hair materials.
- Uses the left authored arm as the action master and mirrors it for the right side during ZAP, because the source left/right arms are asymmetrical.
- Original right arm returns outside the action state.
- Controller is slightly enlarged/repositioned for a clearer two-hand grip.

## Phase 2C prism attack

The old thin laser look was rejected.

Phase 2C disables rendering of the old thin beam materials and replaces the visible attack with a controller-fired prism stream:

- five luminous crystal/shard projectiles per burst;
- cyan, magenta, gold and violet additive colours;
- small spread/fan instead of a rigid straight beam;
- emitter particles at the controller;
- projectile collision against enemies;
- impact sparkle/shard bursts.

The controller remains the attack source.

## Phase 2C enemies

The old `phase2a.js` module was deleted and replaced by the consolidated Phase 2C encounter.

Current enemies:
- Stump
- Ghost
- Mushroom

Current behavior:
- patrol;
- detection/chase;
- 3 HP;
- hit pulse/recoil and knockback;
- visible shatter/defeat animation instead of instant disappearance;
- delayed respawn after defeat.

The procedural enemies remain temporary stand-ins. Preserved authored enemy GLBs and `EnemySystem.ts` remain available in `HappyDudeApparel/sprite-3d-arena`, branch `bootstrap/performance-baseline`, for a later visual upgrade.

## Arena presentation

Phase 2C adds non-blocking combat dressing inspired by the supplied concept image:

- larger circular combat pads;
- glowing rune rings;
- purple/cyan/magenta crystal clusters around arena edges;
- no new collision barriers on the main traversal route.

The target direction is a compact, layered crystal/portal arena rather than a flat stitched test field.

## Immediate rendered-device test

At `https://game.happydude.ca/hybrid-v09/`, verify:
1. Phase badge says `HYBRID v0.9 · PHASE 2C`.
2. New two-tone glasses/hair treatment reads as a meaningful hero upgrade.
3. Both hands appear to hold opposite controller sides during ZAP.
4. Old thin laser is no longer visibly dominating the attack.
5. Prism shard stream is clearly visible from the controller.
6. Enemies visibly react to hits and shatter/animate before disappearing/respawning.
7. Portal still uses the same visible hero treatment and does not leave face/hair residue.
8. Movement/camera/traversal remain intact.

## Next phase — Phase 3 Happy Dude Maple Leafs

If Phase 2C has no serious foundation regression, move next to the Happy Dude Maple Leaf reward loop.

Planned Phase 3:
- large high-readability maple-leaf creatures/collectibles inspired by the supplied concept;
- BASE / GOLD / GALAXY / GUMMY / HOLOFOIL / GEM visual variants;
- enemy defeat can release Leafs;
- hovering/bobbing collectible behavior;
- session score / collection state;
- later use Leafs for charge/power progression and reward boxes.

The existing v0.8.7 `src/v087.js` contains useful prior Maple Leaf silhouette/variant work that can be selectively reused as source reference, but Phase 3 should be integrated into the isolated Hybrid runtime rather than reactivating v0.8.7 as another overlay.

## Later

- Enemy attacks/player damage, hit response and temporary invulnerability can be layered into the consolidated Phase-2C combat system after basic presentation is accepted.
- Reward boxes / jump-hit boxes after Leafs.
- Authored Citrus/Dash character pipeline remains a separate retopology/rigging/optimized-GLB art track; do not ship the heavy Blender sculpt directly in-browser.

## Design direction

Hybrid v0.9 should continue toward the supplied crystal-arena concept: large readable platforms, glowing portal/crystal landmarks, expressive enemies, controller-powered prism combat, and large stylized Happy Dude Maple Leafs. Keep the codebase self-contained and remove obsolete paths instead of accumulating compatibility layers.
