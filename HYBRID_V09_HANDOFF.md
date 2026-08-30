# Hybrid v0.9 Handoff

## Current status — Phase 2D portal/combat correction

Hybrid v0.9 remains the active experimental line. **Do not alter the live v0.8.7 root game yet.**

- Development branch: `hybrid-v0.9`
- Isolated public preview: `https://game.happydude.ca/hybrid-v09/`
- Public preview files live under `main/hybrid-v09/` only.
- Root `main/index.html` remains the untouched v0.8.7 game.

## Architecture rule

Do not restore the old `phase1b/phase1c/phase1d` helper stack or the retired `phase2a.js`/`phase2c.js` combat modules. Replace obsolete behavior instead of stacking another visual/runtime overlay.

Hybrid now owns its runtime source under:
- `hybrid-v09/runtime/main.js`
- `hybrid-v09/src/chunks/01.txt` through `10.txt`

The runtime reads Hybrid-local chunks, not the live root runtime chunks.

## Phase 2D changes

### Portal
- Portal camera widened from the previous close inspection framing to a farther full-tube view.
- Automatic portal entry and activation remain.
- After conversion completes, the game no longer automatically respawns the hero.
- The completed portal scene remains on screen with a `PLAY AGAIN` button.
- Only the user pressing `PLAY AGAIN` / reset starts gameplay again.
- Play Again returns the hero to the distant safe plateau around `z=57`, restores follow camera, and prevents immediate portal re-entry.

### Hero
- Removed the extra Phase 2C spike/cowlick geometry.
- Returned to the smoother native hair silhouette; no new hair tubes are added in Phase 2D.
- Existing native hero materials remain the basis of the portal dissolve.
- Two-tone glasses/headphones remain.

### Controller pose
- Phase 2D creates the action-side right arm by geometry-mirroring the left authored arm rather than using a negative group scale.
- The two action hands are positioned symmetrically around the controller grips.
- Original right arm is restored when ZAP is released.

### Attack
- Prism stream removed.
- Visible attack is now a controller-button barrage fired from `bro.controllerEmitter`.
- Projectile set: `X`, `O`, triangle, square, `L1`, `R1`, `L2`, `R2`.
- Projectiles are bright coloured button sprites with slight directional variation and controller/impact sparkles.
- Legacy thin laser is hidden.

### Enemies / arena
- Three-enemy encounter retained: Stump, Ghost, Mushroom.
- 3 HP, hit reaction, knockback, defeat animation/particles, delayed respawn retained.
- Large circular arena pads, rune rings and crystal dressing retained without adding route-blocking collision.

## Next phase

After rendered-device validation of Phase 2D, proceed to **Phase 3 — Happy Dude Maple Leafs** unless a serious foundation defect remains.

Phase 3 target:
- large readable floating Happy Dude Leaf characters/collectibles;
- Base / Gold / Galaxy / Gummy / Holofoil / Gem visual variants;
- enemy defeat rewards;
- collection / score loop;
- visual direction should move closer to the supplied bright polished concept while staying performant in the browser.
