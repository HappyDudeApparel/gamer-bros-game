# PASS 18 — ASSET DECISIONS

Purpose: prevent Pass 18 from repeating Pass 17's asset/architecture mistakes.

## Mandatory rule

> No custom geometry may be committed without a recorded search of the approved real asset packs and a specific reason why no kit asset fits the required visual/gameplay role.

For every new custom mesh/shader family, add a dated decision below naming:
- the visual requirement;
- packs searched;
- relevant candidate assets found;
- why a real asset is insufficient;
- the narrow custom solution approved instead.

## Approved permanent pack family

### Existing / retained

- Kenney Platformer Kit — CC0 — terrain/traversal vocabulary.
- Kenney Starter Kit City Builder — included assets CC0 — support/settlement vocabulary.
- Kenney Starter Kit Basic Scene — support/ruin vocabulary.
- KayKit Platformer Pack FREE — CC0 — pipes, arches, railings, bracing, structures, slopes, springs, flags and gameplay props.
- KayKit City Builder Bits — CC0 — support props/buildings.
- KayKit Medieval Hexagon — CC0 — nature, river, distant ridge and medieval support.
- KayKit Dungeon Remastered — CC0 — ruins, walls, stairs, pillars, banners, torches, chests and scaffolds.

### Pass 18 required additions

- **Kenney Nature Kit — CC0 — REQUIRED.** Primary source for modular cliffs, cave/overhang vocabulary, bridges, path/river pieces, fences, vegetation, rocks and waterfall housings.
- **Kenney Fantasy Town Kit — CC0 — APPROVED.** Ruin Courtyard and Riverworks wood/stone support; use selectively to preserve one coherent palette.
- **Kenney Castle Kit — CC0 — APPROVED.** Bridge gatehouse, ceremonial banners/walls and Prism Ridge structural support; use selectively.

### Explicitly not imported now

- **Quaternius Stylized Nature MegaKit — NOT APPROVED for current art direction.** It is a good CC0 pack but its textured/normal-mapped soft style would fragment the Kenney/KayKit flat low-poly language. Reconsider only if the entire game art direction changes, not as a local patch.
- **Kenney Pirate Kit — DEFERRED.** Only import if the Fantasy Town/KayKit woodwork demonstrably cannot satisfy Riverworks after the gallery/Golden Slice stage.
- **Complete donor worlds — NOT APPROVED as a base.** Composition is the deliverable; use donor/sample scenes only for density/spacing reference, never as the map foundation.

## Known Pass 17 correction

Pass 17 claimed the Riverworks pipe family was missing and authored custom cylinders. This was wrong. KayKit Platformer already contains the real `pipe_*` family (straight, 90-degree, 180-degree, end variants) plus bracing, railings, structures and slope/platform pieces.

**Pass 18 decision:** delete/ignore the custom Pass 17 pipe kit for new world construction. Mine the real KayKit pipe family first.

## Narrow custom production work currently allowed

These are allowed because the audited kit search found no suitable complete equivalent. Their implementation still needs its own Pass 18 stage and visual/performance validation.

1. **Stylized creek/water surface shader**
   - Kits searched: Kenney Platformer, Nature, Fantasy Town, Castle; KayKit Platformer, Medieval Hexagon, Dungeon, City Builder; Kenney support packs.
   - Reason: static environment kits do not provide the required animated continuous creek surface/shore treatment.
   - Rule: one lightweight shared material/system, no reflection camera.

2. **Waterfall shader/effect**
   - Kits searched: same family above.
   - Candidate: Kenney Nature waterfall cliff housings are real assets and should be used for rock geometry.
   - Reason for custom effect: animated falling water/foam itself requires a runtime visual effect.
   - Rule: shared/instanced waterfall cards/material, not unique heavy simulations.

3. **Concept enemy visual family**
   - Existing gameplay state machine is retained.
   - Existing Oobi/Oodi/Oozi visuals are not the approved silhouette.
   - Rule: author a tiny reusable rounded family only after Golden Slice/world language is locked; instanced/shared geometry where practical.

4. **Prism crystal/glow treatment**
   - Structural ruin/shrine assets must come from real kits first.
   - Crystal/glow geometry/material may be custom because the exact concept language is not supplied by the environment kits.

5. **Far-atmosphere material/LOD treatment**
   - Required to preserve 4–6 readable depth planes without expensive depth-of-field.
   - Must remain a rendering/material concern, not fake geometry layered over broken terrain.

## Asset use discipline

- Prefer one coherent Kenney/KayKit visual family over importing more packs.
- New external packs require a recorded problem they solve, source, license, style-fit review and performance impact.
- Real visible gameplay surfaces are the collision/traversal surfaces whenever possible; no invisible helper floors used to disguise incorrect art geometry.
- Repetition is solved with composition, variation, instancing/batching and palette control — not by pulling in unrelated art styles.
