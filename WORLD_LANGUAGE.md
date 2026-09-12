# PASS 18 — PRISM VALLEY WORLD LANGUAGE

Status: **18-0B LOOK CALIBRATION ACCEPTED / GREEN**
Runtime constants: `src/pass18/world-language.js` version `18-0B.2`

This file freezes the visual-language decisions proven by the Pass 18-0B calibration scene. It is an engineering/art-direction baseline for later world construction. It is **not** a claim that the calibration scene itself matches the approved Prism Valley V2 concept pack; concept resemblance must be proven in situ at the 18-2 Golden Slice gate.

## 1. Renderer and output

- Renderer: Three.js r180.
- Output color space: sRGB.
- Tone mapping: ACES Filmic.
- Exposure: **1.14**.
- Antialiasing: enabled.
- Desktop device-pixel-ratio cap: **1.5**.
- Mobile device-pixel-ratio cap: **1.25**.
- Desktop primary shadow map: **2048**.
- Mobile primary shadow map: **1024**.

The mobile DPR cap is deliberate. Pass 18 should spend mobile GPU budget on world density, silhouettes, atmosphere and stable frame pacing rather than rendering unnecessary native-resolution pixels.

## 2. Palette and lighting

Base atmosphere:
- sky: `#a9def2` family, with the calibration surface using a brighter cyan-to-pale-horizon gradient;
- fog: `#c9edf5`;
- warm sun: `#ffefd0`;
- hemisphere sky: `#f2fcff`;
- hemisphere ground: `#70875b`.

Lighting constants:
- hemisphere intensity: **1.78**;
- sun intensity: **2.35**;
- fill intensity: **0.52**;
- sun position: **[13, 24, 9]**;
- shadow bias: **-0.00028**;
- shadow normal bias: **0.032**;
- desktop shadow radius: **2.5**;
- mobile shadow radius: **1.25**.

The accepted direction is bright, readable and toy-like rather than high-contrast or moody. Shadows define forms but should not turn cliff faces or foliage into black masses.

## 3. Atmosphere and depth

- Fog near: **38**.
- Fog far: **105**.
- Target readable depth planes: **5**.

Use depth as composition, not post-processing blur:
1. foreground detail;
2. playable terrain/path/river;
3. landmark midground;
4. ridge/background structure;
5. atmospheric far plane.

The far world should remain readable enough to advertise where the player is going while becoming progressively lighter and lower-contrast with distance.

## 4. Camera language

Calibration proof cameras are stored in `data/pass18/cameras.json`.

Accepted calibration values:
- desktop FOV: **46°**;
- Android landscape FOV: **50°**;
- scenic pitch design target: approximately **0.17 radians**;
- near plane: **0.08**;
- far plane: **180**.

Camera rule: show terrain layers and destination silhouettes. Avoid the steep top-down framing that made earlier Prism Valley builds read like test geometry rather than a place.

The calibration camera values are not automatically the final gameplay camera settings. Later gameplay integration may tune distance and follow behavior, but the resulting composition must preserve the same horizon/world-readability intent.

## 5. Real-asset material policy

Preserve authored Kenney/KayKit materials by default. Do **not** globally recolor every imported asset in an attempt to force consistency.

Unification comes primarily from:
- common lighting;
- atmosphere;
- asset-family discipline;
- composition;
- scale and spacing;
- selective accent materials only where the approved concept requires them.

Texture anisotropy may be capped at **8**.

## 6. Terrain composition rules

The calibration established an important correction from Pass 17 and the rejected first 18-0B proof:

- Do not use one smooth heightfield as the visible Prism Valley world.
- Do not use giant rectangular cliff modules as a skyline/backdrop wall.
- Build the valley from multiple smaller real terrain modules with offsets, shelves, corners, steps, caves, river/path pieces, vegetation and overlapping silhouettes.
- Grass-over-rock layering should be visible from the gameplay camera.
- Paths and waterways should help explain traversal at a glance.
- Repetition is handled by rotation, scale discipline, modular variation, vegetation, landmarks, instancing/batching and depth—not by hiding the kit with proxy geometry.

The 18-0B.1 proof was rejected despite passing automation because giant rear cliff blocks and sparse staging produced a test-strip appearance. The 18-0B.2 proof replaced that composition with smaller path/river/terrain modules and layered vegetation. That correction is now part of the frozen language.

## 7. Density and performance rule

Visual density is required. Performance may not be obtained by stripping the world bare.

Later stages must use:
- shared geometry/materials;
- `InstancedMesh` or batching for repeated props;
- merged static geometry where appropriate;
- chunked visibility/streaming;
- LOD or cheap far shells;
- controlled shadow casters;
- lightweight atmosphere.

The accepted 18-0B calibration proof uses 25 unique real-asset placements and demonstrates that the visual family can remain inexpensive enough to build upon. Final world budgets will be established in 18-0C and then exercised by the Golden Slice.

## 8. What remains deliberately unfrozen

18-0B does **not** approve or freeze:
- final A→F map placement;
- final path widths or traversal distances;
- final creek/water shader;
- waterfall animation;
- Riverworks composition;
- Ruin Courtyard composition;
- Prism Ridge shrine/crystal treatment;
- final gameplay-camera distances;
- final enemy art;
- final full-world performance budgets.

Those belong to later checkpoints. The first true concept-resemblance gate is **18-2 — Golden Slice, Creek Crossing**, followed by **18-2B — hard visual freeze**.
