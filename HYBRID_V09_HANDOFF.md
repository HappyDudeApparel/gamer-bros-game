# Hybrid v0.9 Handoff

## Current status — 2026-08-30

Hybrid v0.9 is the active experimental line. **Do not alter the live v0.8.7 root game yet.**

- Development branch: `hybrid-v0.9`
- Isolated public preview: `https://game.happydude.ca/hybrid-v09/`
- Public preview files live under `main/hybrid-v09/` only.
- Root `index.html` / live v0.8.7 remain outside this workstream.

## Phase 1.3 — movement, controller action, portal cleanup

Device feedback exposed three remaining foundation defects after Phase 1.2:

1. Analog movement did not behave like a normal clock-face stick.
2. Controller ZAP still read as one-handed because the source character has asymmetric base arm geometry.
3. Portal disappearance still appeared to freeze and the later v0.8.7 polish hair/gear could remain visible after the dissolve.

### Phase 1.3 fixes

- Corrected camera-relative movement basis so:
  - 12 o'clock = camera-forward;
  - 3 o'clock = screen-right;
  - 9 o'clock = screen-left;
  - all intermediate angles blend continuously.
- Follow camera heading no longer drifts underneath the player while the analog stick is actively held; recenter resumes after release.
- Re-staged both arm pivots for the controller action so each fist moves toward its own controller grip instead of only rotating both shoulders with the asymmetric base pose.
- Controller beam continues to originate from `bro.controllerEmitter`, never the forehead.
- Portal conversion now hides the later `v087CharacterPolish` group before dissolve so non-dissolve hair/gear cannot float after the rest of the hero vanishes.
- Post-disappearance dissipate/afterglow delay is reduced to essentially immediate completion.
- Hero still respawns on the far plateau around `(0, 75)` and the portal remains disarmed until the player has left its trigger radius.

## Phase 2A — first enemy foundation

Phase 2A has now started rather than holding the project at another micro-gate.

Recovered source used as architectural reference:
- `sprite-3d-arena/bootstrap/performance-baseline/src/entities/EnemySystem.ts`
- Existing old enemy assets preserved in that repository include `stump.glb`, `ghost.glb`, `mushroom.glb`, `cactus.glb`, `cthulhu.glb`, `demon.glb`, `skull.glb`, and `yeti.glb`.

The old binary GLBs are preserved but are **not fetched at runtime from the private repo**. The Phase 2A preview is self-contained.

### Current Phase 2A implementation

- Three lightweight local/procedural stand-ins: stump, ghost, mushroom.
- Each has its own patrol route on a known safe Hybrid plateau.
- Local same-tier detection and chase behavior derived from the recovered EnemySystem architecture.
- Two HP per enemy.
- Controller ZAP ray can hit the enemy colliders.
- Hit pulse feedback and small defeat burst.
- Only three enemies are active in this first slice to protect performance and make behavior easy to judge.
- No Maple Leafs yet.
- No enemy ranged attacks or player health loop yet.

## Uploaded/source salvage notes

Useful uploaded files reviewed and preserved as reference:
- `Gamer-Bros-Portal-World-Slice-v0.8.2-Character-Action.html`: best source for controller model/emitter and action pose.
- `Gamer-Bros-Portal-World-Slice-v0.8.1-Quality-Preserved.html`: quality-preserved character/world baseline.
- `Gamer-Bros-Portal-Room-Visual-Test-v0.7-FINAL.html`: portal/character visual baseline.
- `Sprite-3D-Arena-Standalone-Proof-v0.1.html` and `Sprite-3D-Arena-Visual-Upgrade-v0.2.html`: old arena combat/enemy/power behavior references.
- `v10_citrus_reconstruction_lock.py`: Citrus visual reconstruction source; its body is explicitly a temporary high-poly visual source, not final game topology.

The old `sprite-3d-arena` repository also preserves authored enemy GLBs and the TypeScript enemy controller. Those should be selectively migrated in a later visual upgrade rather than linked as external runtime dependencies.

## Test focus for the current public preview

Test one combined slice:

1. Analog stick feels conventional and predictable over the full 360° circle.
2. Holding 12 moves camera-forward; 9–12 moves forward-left; 12–3 moves forward-right.
3. Both hands visibly move to opposite sides of the controller during ZAP.
4. Beam starts at the controller.
5. Portal finishes without a static pause or floating hair/glasses residue.
6. Portal completion respawns the hero across the map.
7. Stump / ghost / mushroom appear, patrol, detect nearby hero, and chase locally.
8. Controller ZAP can defeat them without a major frame-time regression.

## Next phases

### Phase 2B — combat + world integration
After Phase 2A behavior is acceptable:
- improve enemy visual fidelity, ideally migrating selected preserved GLBs locally;
- add enemy contact/ranged attacks, player hit response/health and clearer combat feedback;
- selectively replace primitive vegetation with preserved authored nature assets while measuring performance.

### Phase 3 — Happy Dude Maple Leafs
- enemy/box rewards;
- hovering/collection animation;
- score/session state;
- do not add until enemy/combat foundation is stable.

### Phase 4 — ZAP/power polish
- animated controller charge;
- richer beam core/trail;
- impact flare and particles;
- hit reactions/knockback;
- later power variants.

### Separate art track — Citrus/Dash
Do not place the high-poly Citrus reconstruction directly in the browser game. Continue the proper retopology/rigging/export pipeline separately, then integrate a game-ready GLB when it is actually ready.

## Design rule

Hybrid v0.9 remains: stronger old arena gameplay architecture + landscaped world + recovered enemies/assets, combined with the better portal/tube and Gamer Bros presentation. Preserve good prior work, migrate selectively, keep runtime assets local/self-contained, and avoid regressing the live v0.8.7 root until Hybrid is clearly superior.
