# Hybrid v0.9 Handoff

## Current status

Phase 1 has started and is intentionally isolated from the existing live v0.8.7 game.

### Preserved
- `main` root still serves the existing v0.8.7 game at `game.happydude.ca`.
- The high-quality v0.5 portal/tube runtime remains the visual baseline.
- Existing old arena repository remains untouched.

### New development branch
- Branch: `hybrid-v0.9`
- Preview path: `/hybrid-v09/`

### Phase 1 work already implemented on `hybrid-v0.9`
- New analog thumb-stick control shell.
- Conventional third-person camera-relative movement patch based on the older arena relationship: input -> camera heading -> velocity -> facing.
- Farther/higher follow camera by default.
- Drag-look independent from movement with soft recenter behind hero.
- Pinch/scroll persistent follow zoom.
- Portal enclosure walls/ceiling/arches hidden while preserving portal/tube/floor/crystal foundation.
- New open landscaped world prototype using plateaus, stone bridges, ramps, trees, rocks and distant mountain silhouettes.
- Developer UI hidden in the Phase 1 preview.
- Safer press-and-hold ZAP path retained for Phase 1.
- Automatic portal-entry helper added on the development branch: entering the portal trigger should load/activate the portal sequence without manual dev buttons.

### Important deployment state
A first Phase 1 preview snapshot was copied to `main/hybrid-v09/` so GitHub Pages can serve it without replacing the live root game. That public preview snapshot predates the latest automatic-portal helper (`phase1b.js`). Before testing Phase 1 publicly, sync the latest `hybrid-v09/index.html` plus `hybrid-v09/phase1b.js` from `hybrid-v0.9` into `main/hybrid-v09/`.

## Next actions
1. Sync the latest Phase 1 preview files from `hybrid-v0.9` into `main/hybrid-v09/`.
2. Let GitHub Pages deploy.
3. Test only Phase 1 fundamentals first: joystick feel, camera feel, drag-look, pinch zoom, landscape readability, portal landmark preservation, automatic portal entry.
4. Fix Phase 1 issues before Phase 2.
5. Phase 2: import/restore the visually stronger old enemy set and its patrol/chase architecture.
6. Phase 3: convert Happy Dude Leafs into hovering collectibles/power-up rewards and add score/session state.
7. Phase 4: reward boxes / jump-hit boxes that release Leafs.
8. Later: replace procedural Gamer Bro with a proper authored/rigged GLB using the older Citrus character pipeline.

## Design rule
Do not continue patching v0.8.x as the main direction. Hybrid v0.9 is the new experimental line: old arena game architecture + landscaped world + old enemies, combined with the better v0.5 portal/tube and Gamer Bros concept.
