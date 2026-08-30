# Hybrid v0.9 Handoff

## Current status

Phase 1 is deployed to the isolated public preview and code-level testing is complete. Do **not** begin Phase 2 until the remaining rendered-device feel check is accepted.

### Preserved
- `main` root still serves the existing v0.8.7 game at `game.happydude.ca`.
- Root `index.html` remains the v0.8.7 entrypoint (blob `9f22093aa75c7ddd4a8259618e7e299f0a71ad43`).
- The high-quality v0.5 portal/tube runtime remains the visual baseline.
- Existing old arena repository remains untouched.

### New development branch
- Branch: `hybrid-v0.9`
- Preview path: `/hybrid-v09/`
- Public preview: `https://game.happydude.ca/hybrid-v09/`

### Phase 1 implementation
- New analog thumb-stick control shell.
- Conventional third-person camera-relative movement patch based on the older arena relationship: input -> camera heading -> velocity -> facing.
- Farther/higher follow camera by default.
- Drag-look independent from movement with soft recenter behind hero.
- Pinch/scroll persistent follow zoom.
- Portal enclosure walls/ceiling/arches hidden while preserving portal/tube/floor/crystal foundation.
- New open landscaped world prototype using plateaus, stone bridges, ramps, trees, rocks and distant mountain silhouettes.
- Developer UI hidden in the Phase 1 preview.
- Safer press-and-hold ZAP path retained for Phase 1.
- Automatic portal entry: entering the portal trigger loads the hero into the tube and then automatically starts the preserved portal sequence.

## Phase 1 deployment/test result — 2026-08-30

### Deployment
- Latest development helper fix committed on `hybrid-v0.9`.
- Latest isolated preview synced to `main/hybrid-v09/` only.
- Preview cache key bumped to `090p1c` so devices do not retain the earlier broken helper.
- GitHub Pages build/deploy for main commit `c3d85cf879377274ee70fd9244006ebad7fa968c` completed successfully (run `33332146619`).
- No root v0.8.7 game file was changed.

### Portal helper defect found and fixed during testing
The first `phase1b.js` used an automatic-entry insertion target from a different runtime shape:
- `gamerRoot.position.set(player.x,player.y,player.z)` / `speed01...`

That target does not exist in the current v0.5-based playable runtime, so public auto-entry would have silently failed.

The helper now patches the current `updatePlayer()` loop immediately after:
- `if(player.y<-6.25)resetPlayerToPavement();`

When the playable hero reaches the portal centre (`Math.hypot(player.x,player.z) < 2.15`, below `y < 1.35`), it calls `loadHero()` automatically.

The existing load-complete target was verified against the current portal state machine and remains valid. It now schedules `activatePortal()` automatically after the hero finishes entering the tube.

### Code-level Phase 1 checks passed
- `hybrid-v09/index.html` loads `phase1b.js` before `main.js`.
- `phase1b.js` parses successfully.
- Automatic-entry insertion target matches the current playable runtime.
- Automatic-activation insertion target matches the current portal state machine.
- Portal camera handoff target matches the current runtime.
- Analog joystick binding exists and feeds camera-relative movement.
- Drag-look and soft recenter patch exists.
- Persistent wheel/pinch follow zoom patch exists.
- Open-world landscape insertion exists.
- Room boundary removal exists while portal foundation code is preserved.
- `.devOnly` is hidden in Phase 1 CSS.
- Public GitHub Pages build/deploy succeeded.
- Root `index.html` is still titled `Gamer Bros Portal World v0.8.7`.

### Remaining Phase 1 gate — rendered-device feel
Before Phase 2, visually/play-test the public preview on the target devices for:
1. joystick feel and dead-zone;
2. camera-relative direction/facing;
3. drag-look sensitivity and recenter speed;
4. pinch/scroll zoom range and persistence;
5. landscape readability, traversal and obvious bad gaps/falls;
6. portal/tube/crystal landmark visual preservation;
7. walking into the portal automatically loads and activates the full sequence;
8. no obvious freezes or catastrophic frame-time spikes.

Do not start Phase 2 until these are accepted or any Phase 1 defects are corrected.

## Next actions
1. Complete the rendered-device Phase 1 feel check at `https://game.happydude.ca/hybrid-v09/`.
2. Fix any Phase 1 interaction/rendering defects found there.
3. Only after Phase 1 acceptance: Phase 2 — import/restore the visually stronger old enemy set and its patrol/chase architecture.
4. Phase 3: convert Happy Dude Leafs into hovering collectibles/power-up rewards and add score/session state.
5. Phase 4: reward boxes / jump-hit boxes that release Leafs.
6. Later: replace procedural Gamer Bro with a proper authored/rigged GLB using the older Citrus character pipeline.

## Design rule
Do not continue patching v0.8.x as the main direction. Hybrid v0.9 is the new experimental line: old arena game architecture + landscaped world + old enemies, combined with the better v0.5 portal/tube and Gamer Bros concept.
