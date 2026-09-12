# Prism Kit — Plan

## Why this pivot happened

Two full calibration rounds against the downloaded Kenney Nature Kit
(documented on `pass18-rebuild`, see `src/pass18/calibration-diorama.js`)
took the material/lighting recipe from ~45/100 to ~62/100 resemblance to
the Prism Valley concept art and then hit a hard ceiling. Root cause,
verified directly from the real glTF JSON rather than assumed: the entire
Nature Kit ships flat `metallicFactor:1, roughnessFactor:1`, no textures,
no per-asset material identity. No amount of engine-side lighting,
tone-mapping, or hue tuning can put back detail the source asset never
had. KayKit assets (already in the catalog for barriers/castle pieces) by
contrast ship real textures and correct PBR values and look right
immediately — proving the *engine and pipeline* were never the bottleneck,
the *asset library* was.

The pivot is therefore: stop tuning around a capped library, and build a
small custom "Prism Kit" of modular assets purpose-made for the target
style, produced procedurally/via script (not hand-modeled, not one giant
procedural landscape — see Rule 1 in `PRISM_KIT_RULES.md`).

## Pipeline correction made in this session: skip Blender

The original framing assumed a Blender + Python asset pipeline. This was
corrected during the M0 toolchain audit:

- Blender is **not installed** in this (or any known future) container and
  is not on this project's dependency list — installing and maintaining a
  Blender+Python toolchain is a heavier, harder-to-automate, harder-to-
  headless-verify dependency than the alternative below.
- The game itself is pure Three.js (r123, vendored, no bundler). A
  Node/Three.js-based (or headless-browser-based) generation pipeline that
  builds geometry directly in the same library the game already uses, and
  exports it with the now-vendored `vendor/three/addons/exporters/GLTFExporter.js`,
  is strictly simpler: one language, one geometry library, one set of
  conventions, and every render/validation stage (Selenium + the existing
  Chromium) already works against exactly this stack.
- **Correction:** generate Prism Kit assets as Node scripts building
  `THREE.BufferGeometry` (procedural construction, CSG-style boolean ops if
  needed via a small pure-JS library, or straightforward vertex/face
  authoring) and export via `GLTFExporter`, rather than scripting Blender.
  Blender remains an option to revisit only if a specific asset turns out
  to need modeling operations that are genuinely impractical in pure
  Three.js/JS — not a default.

## What Pass 18 infrastructure survives vs. is reference-only

**Survives and is reused directly:**
- `vendor/three/` (r123, including the newly-vendored `GLTFExporter.js`).
- The Selenium + matched-chromedriver desktop/Android proof-rendering
  method (now automated in `tools/prism-kit/lib/doctor.mjs`).
- The general discipline of "decode real geometry before trusting an
  assumption about it" (bbox/triangle inspection scripts) — reuse the
  *method*, write fresh small scripts per asset as needed.
- The general discipline of visual-gate-before-scale-up (formalized here
  as Rule 1).

**Reference-only (informs decisions, is not code to extend):**
- `src/pass18/asset-registry.js`, `asset-placement.js`, `golden-slice.js`,
  `asset-catalog.js` — these are Golden-Slice-specific (Nature Kit asset
  ids, that scene's manifest schema). The *patterns* they use (real
  multi-primitive `InstancedMesh` batching via `parts()`/
  `createInstancedGroup()`, `kind:'tile'` vs. normalized-prop placement)
  are worth re-reading before designing the Prism Kit's own placement code,
  but Prism Kit assets get their own catalog/registry once there's more
  than one of them — do not silently extend the Nature Kit catalog with
  custom-kit entries.
- `src/pass18/calibration-diorama.js` — the *lighting rig and family-based
  material-treatment values* tuned there are a reasonable starting point
  for the Prism Kit preview scene, but they were tuned to compensate for
  Nature Kit's flat PBR values. A custom kit that ships correct
  metalness/roughness/albedo from the start should need much lighter
  correction, if any — re-measure, don't just copy the constants over.

## Milestone ladder (do not skip forward)

- **M0 — Local factory pipeline.** (This session.) Doctor/toolchain check,
  stage runner with checkpoint/resume/failure-capsule, canonical
  directories, durable docs. No asset content yet.
- **M1 — Custom Overhang asset, proven visually.** First target,
  deliberately not something easier: the Overhang is a load-bearing
  silhouette element in the concept art and a good test of whether the
  custom-kit approach can hit target style at all. Full GENERATE -> EXPORT
  -> VALIDATE-ASSET -> RENDER-DESKTOP -> RENDER-ANDROID -> COLLECT-METRICS
  -> VISUAL-REVIEW-STOP for exactly this one asset. Kill switch after 2
  serious rounds if it doesn't reach the Rule 5 targets.
- **M2 — 4-6 compatible terrain modules.** Only after M1 passes its visual
  gate. Modules sized/pitched to compose with each other and with the
  Overhang (learn the real module pitch from M1, don't guess it in
  advance).
- **M3 — Terrain diorama.** A tiny isolated scene (same spirit as the
  Nature Kit calibration diorama) proving the M2 family reads correctly
  together before touching anything world-sized.
- **M4 — Full A-F world greybox.** Coarse placement of the whole map using
  M2/M3 modules, correctness of layout only, not final dressing.
- **M5 — Creek Crossing production slice.** The specific scene that was
  the Golden Slice's subject, rebuilt with the custom kit to full
  production quality — this is the direct successor to `pass18-rebuild`'s
  Golden Slice, done right.
- **M6 — Additional kit families.** Whatever else the full world needs
  beyond terrain/Overhang (foliage, structures, props) as their own
  bounded asset-family cycles, each following the same one-asset ->
  one-family -> one-diorama progression.
- **M7 — Full world dressing + gameplay.** Final pass once every family
  exists and has passed its own visual gate.

Each milestone's exit criterion is a visual gate (Rule 2/3), never a
technical one alone.

## First asset: why the Overhang

Chosen deliberately, not for ease. It's a distinctive silhouette element
visible in the concept art, meaning its visual gate is a real test of
whether procedural custom modeling can hit the target style — a flat
ground tile could pass a lenient visual check without proving anything
about the harder cases M2-M7 will need.
