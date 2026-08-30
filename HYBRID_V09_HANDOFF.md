# Hybrid v0.9 Handoff

## Current status — M1 clean source + M2 portal rebuild

Hybrid v0.9 remains the active experimental line. **Do not alter the live v0.8.7 root game yet.**

- Development branch: `hybrid-v0.9`
- Isolated public preview: `https://game.happydude.ca/hybrid-v09/`
- Public preview files live under `main/hybrid-v09/` only.
- Root `main/index.html` remains untouched v0.8.7.
- Technical/visual audit: `docs/hybrid-v09-visual-technical-audit.md` on Claude's `arena/01a054db-gamer-bros-game` branch.

## M1 is complete — runtime patch stack removed

The old Hybrid architecture has been physically removed from the active Hybrid build.

Deleted from `hybrid-v09/`:
- `runtime/main.js` string-replacement runtime;
- `main.js` dead parallel patcher;
- `phase2d.js` post-load scene monkey patch;
- Hybrid duplicate `src/chunks/01.txt` through `10.txt`.

The active Hybrid preview now loads one normal editable source file:

- `hybrid-v09/src/game.js`

`hybrid-v09/index.html` loads that file directly. There is no runtime source concatenation, Blob import, `window.__bro` polling overlay, or Phase 2D second animation loop.

### Architecture rule from here forward

Edit `hybrid-v09/src/game.js` directly or split it into real ES modules. **Never reintroduce runtime string replacement, chunk concatenation, or post-load monkey patches.**

The live v0.8.7 root remains frozen separately and may keep its old files because it is the protected production baseline.

## M2 — portal ending rebuilt

The audit identified the exact portal failure: Phase 2D skipped the real `dissipate` stage, killed the hero vortex at disappearance, collapsed the energy envelope in one frame, then froze `phaseT` in afterglow.

M2 restores a continuous sequence:

1. `charge` — existing charge remains;
2. `convert` — hero dissolves/disappears;
3. `sustain` — 0.45 s full-energy hold after the hero is gone;
4. `dissipate` — 1.55 s energy drain using the existing `uDissolve` path and hero-particle dissipation;
5. `afterglow` / settle — 0.90 s residual cooling;
6. `complete` — indefinite low-energy breathing portal state;
7. user presses `PLAY AGAIN` to resume gameplay.

The completed state is animated from wall-clock `t`; it does not clamp/freeze `phaseT`.

Portal camera is farther back than Phase 2D (`distance 12.20`) to keep the whole tube readable during transmission.

`PLAY AGAIN` still returns the player to the distant safe gameplay area and prevents immediate re-entry.

## Movement cleanup included with M1

- Camera-relative analog movement retained.
- Drag-look while moving retained.
- `STEP_HEIGHT` restored from the Phase 2 band-aid `0.90` to `0.50`.
- Uncapped hold-jump boost is capped so vertical level design can be meaningful.

## Deliberate temporary removals

The Phase 2D combat/hero overlay was deleted rather than carried forward.

That means the following Phase 2D-specific visual experiments are intentionally not part of the clean M1/M2 source:
- controller-button sprite barrage;
- Phase 2D procedural enemy/arena overlay;
- Phase 2D glasses replacement;
- mirrored action-arm clone;
- by-name cleanup of older hero overlays.

Do not recreate those as overlays. Reintroduce only the good gameplay ideas as clean source/asset systems after the art pipeline is fixed.

## Character direction — stop procedural cosmetic iteration

Per the audit and owner feedback, do not keep tuning procedural hair/glasses/arms phase by phase.

Target production path:
- authored Blender Gamer Bro;
- 6–12K tris mobile target, <= 15K desktop high;
- 2–4 draw calls;
- proper UVs + baked normal/AO/curvature;
- 18–24 bone rig;
- real `hand.L`, `hand.R`, controller/prop attachment;
- authored clips: idle, walk, run, jump/fall/land, zap_hold, portal_enter, hit;
- named `controllerEmitter` node;
- optimized GLB with Meshopt/KTX2 when pipeline is ready.

Keep the existing public API concept (`bro.root`, action/motion/home methods) where useful so portal/input systems can bridge cleanly to the authored asset.

## World direction — rebuild toward supplied arena concept

Do not keep extending the linear cylinder/box landscape as the final environment.

Target map principles from the audit + supplied concept image:
- compact roughly 85 x 85 world footprint;
- central portal hub;
- 4–5 major elevation tiers;
- roughly 11–12 world units total climb instead of the current near-flat world;
- large circular combat platforms;
- wide bridges and a small number of readable routes/shortcuts;
- optional upper platforming path and summit;
- non-traversable fogged ruin/library towers and mountains for scale;
- crystals, arches, vines, stone skirts/undersides and architectural dressing off the walkable path;
- authored modular GLB environment kit rather than final cylinder/box primitives.

Preserve the analytic `walkSurfaces` / `surfaceHeight` collision idea and eventually drive both visuals and collision from one `arena.layout.json`.

## Performance targets

Use these as design constraints, not cleanup after the fact:
- mobile draw calls <= 120, stretch 150;
- visible triangles <= 120K mobile;
- one shadow-casting light;
- total lights <= 5 mobile;
- active enemies <= 6 mobile;
- hero <= 12K tris / <= 4 draw calls;
- pooled particles, zero per-shot mesh allocation;
- environment dressing <= 20 draw calls through instancing/batching;
- keep adaptive DPR and on-screen FPS/CALLS/TRIS readout.

## Next development milestones

### M2 device validation
Test the clean-source portal sequence first. Specifically verify:
- no freeze immediately after hero disappearance;
- full-energy sustain is readable;
- energy drains instead of snapping off;
- particles dissipate naturally;
- completed portal continues gently animating;
- no automatic respawn;
- PLAY AGAIN works;
- camera framing is not too close.

### M3 — Gamer Bro authored asset track
Begin/finish the proper Gamer Bro GLB pipeline. Do not spend more time procedurally redesigning hair/glasses.

### M4 — arena kit + layout
Build/recover the modular arena assets and replace the current linear procedural landscape with the vertically layered concept-driven arena.

### M5 — material/lighting/performance pass
Baked AO/lightmaps or vertex lighting, KTX2/atlases, emissive crystals, fog/height-fog cheats, limited lights, LOD/culling, pooled FX and measured device budgets.

### Combat after art direction is stable
The controller-button idea can be revisited later with real extruded glyph geometry or properly readable non-additive sprites. Do not spend another phase on projectile visuals before the hero/camera/arena art direction is locked.
