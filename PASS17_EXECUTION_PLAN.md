# Pass 17 — Prism Valley V2 Concept-Match Rebuild

Status: ACTIVE on `pass17-concept-match`. Pass 16 remains the live fallback until Pass 17C passes.

## Source of truth
The approved Prism Valley V2 concept pack controls the production target:
- world-design palette
- top-down A→F map
- valley vista
- Creek Crossing / Riverworks
- Clover Cliffs
- Ruin Courtyard
- Prism Ridge / portal approach

The concept pack is a target, not permission to invent unavailable gameplay assets. Every shipped landmark must be built from: current GB systems, current Kenney/KayKit assets, a deliberately authored terrain mesh, or a separately approved new production asset.

## Pass 17A — Foundation / Exact Map Blockout
Goal: make the approved world spatially real before decorating it.

### Deliverables
- Fix title-screen portrait and landscape phone composition.
- GB1 / GB2 remain the only selectable heroes.
- Replace square recovery-tile presentation with a continuous visible low-poly terrain foundation.
- Keep actual raycast collision on the visible terrain surface.
- Block the approved map in the exact zone order:
  A. Portal Meadow
  B. Creek Crossing
  C. Riverworks
  D. Clover Cliffs
  E. Ruin Courtyard
  F. Prism Ridge
- Preserve the approved route families:
  - main route
  - Creek Crossing spring shortcut
  - Riverworks pipe loop
  - Clover Cliffs high mastery route
  - Ruin Courtyard high route
  - Ruin Courtyard lower bypass
- Keep broad recoverable lower terrain.
- Establish sightlines so Prism Ridge is visible early and earlier zones are visible from later elevations.

### Gate
- desktop boot
- Android boot
- title GB1/GB2 selection
- main route validator = 0 failures
- optional route validator = 0 failures
- no square gaps visible on the broad low terrain

## Pass 17B — Concept Match / Art and Gameplay Placement
Goal: make the blockout look and play like the approved concept pack.

### Deliverables
- Portal Meadow landscaping and opening vista.
- Creek Crossing fortified bridge landmark.
- Riverworks pipes, scaffolds, railings, waterfalls/water language, spring trajectory, pipe-loop reward.
- Clover Cliffs terraces, curves, overhangs, lookout, mastery climb.
- Ruin Courtyard stone-arch composition with main / lower / upper route choice.
- Prism Ridge ceremonial approach while keeping the canonical Crystal Library v2 portal behavior.
- Place trees, rocks, flowers, fences, banners, signs, crates, coins, gems, chests intentionally.
- Hero presentation moves toward the approved chibi/toy-like silhouette without breaking movement.
- Enemy presentation moves toward the approved rounded expressive family using only assets we can actually ship or newly approved production models.
- 5–8 enemies maximum, grouped into authored encounters.

### Gate
- side-by-side screenshots against each approved concept view
- all major concept landmarks represented
- no decorative asset creates fake traversal
- encounter spacing and rewards manually reviewed

## Pass 17C — Production Gate / Promotion
Goal: make the rebuilt world safe to replace Pass 16.

### Deliverables
- portal sequence completes without dark freeze
- Prism Breaker anticipation/release/hit feedback polished
- camera Standard / Wide / Far
- touch orbit + tilt and CENTER
- compact HUD / no center-screen clutter
- startup streaming/performance pass
- desktop + Android automated validation
- full manual phone traversal
- root title points to Pass 17 only after all gates pass

### Promotion rule
Do not change the live root PLAY target to Pass 17 until 17C is green. Pass 16 remains available as rollback.
