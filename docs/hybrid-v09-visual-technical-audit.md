# Gamer Bros — Hybrid v0.9: Technical + Visual-Direction Audit

**Date:** 2026-08-30
**Scope:** deployed `hybrid-v09/` build (branch `main` @ `2773f5e`) and branch `hybrid-v0.9` @ `eb16f58`
**Preview audited:** https://game.happydude.ca/hybrid-v09/
**Live root v0.8.7 game:** untouched throughout this audit
**Repository changes made:** none (working tree clean; this document is the only addition)

---

## Reading key

| Tag | Meaning |
|---|---|
| **CONFIRMED** | Verified by reading the actual code in this repository; line references given |
| **RECOMMENDATION** | My technical judgement; not present in the code |
| **DCC** | Requires a Blender / asset-production step; cannot be done in code |

Line references of the form *chunks NNNN* refer to the ten chunk files concatenated in order
(`hybrid-v09/src/chunks/01.txt` … `10.txt`, 1,911 lines, byte-identical to the root `src/chunks/*.txt`).
Line references of the form *runtime/main.js:NN* and *phase2d.js:NN* refer to the deployed Hybrid files.

## Limitations of this audit (stated up front)

1. **The two concept images were not available to me.** No image files were present in the workspace and I cannot
   process image content. Everything about the *look* in §2 and §4 derives from the written brief plus the code.
   If the top-left arena panel contains specific geometry to honour (tower arrangement, bridge count, spiral vs.
   linear), re-attach and §4.2 will be revised.
2. **No GLB pipeline exists anywhere in this project.** `grep -ri "glb|GLTFLoader|KTX2|Draco|Meshopt"` across every
   `.js/.html/.txt/.md` returns **zero hits**. The repository is 53 files / 189 KB; the only external URL in the
   entire project is the three.js r180 CDN import. The recovered Gamer Bro / Sprite / Citrus / `concept_arena.glb`
   work is **not in this repo and not deployed**. That is a hard dependency for §2, §5 and milestones M3/M4.
3. **I could not execute the WebGL build** in this sandbox (no browser, no GPU). The portal diagnosis in §3 is
   derived from source with exact line references; §3.2 includes a 30-minute instrumentation check to confirm it
   on device. Draw-call and triangle figures in §1.4 and §7 are static estimates; verify against the existing
   on-screen `FPS · CALLS · TRIS` readout.

---

# 1. CURRENT BUILD DIAGNOSIS

## 1.1 The structural defect: the game is a patch stack, not a game

**CONFIRMED.** `hybrid-v09/runtime/main.js` is not a game — it is a **string-replacement engine**. It fetches the
frozen v0.8.7 source as ten `.txt` "chunks", concatenates them, applies **40 `rep(find, replace, label)` string
substitutions**, then `import()`s the result as a Blob URL (`runtime/main.js:3–12`, `83–87`). Every patch throws if
its target substring is missing:

```js
if(!source.includes(find)){
  console.warn('[hybrid 2D miss]',label);
  if(critical) throw new Error(`Hybrid Phase 2D rebuild missing: ${label}`);
}
```

Every visual decision about the Hybrid therefore lives inside a **quoted substring of another build's code**:

| What the patch does | Mechanism |
|---|---|
| Removes the room | `wallInst.visible=false`, `openCeiling.visible=false`, `cornice.visible=false`, arches / buttresses / torches / lanterns `.visible=false` (lines 14–20) |
| Movement | Replaces a 12-line block with a new analog/joystick implementation (line 33) |
| Camera | Replaces the camera-state declaration plus three event handlers (lines 36–42) |
| Character colour | Rewrites `MeshPhysicalMaterial` string literals: `color: 0x0b0c14 …` → `color: 0x18345a …` (lines 24–30) |
| World | Injects ~5 KB of new code *before* a comment marker located by string match (lines 55–64) |
| Portal ending | Replaces the `p>=1` completion lines of two phases (lines 73–74) |

A **second, independent patch layer** runs after load. `hybrid-v09/phase2d.js` polls `window.__bro` for up to 12.5 s
(`for(i<500) await sleep2D(25)`) and then mutates the live scene graph: hides meshes found by **material identity**
(`o.material===M.lens` → hide its parent), deletes nodes **by name** (`HybridHeroFaceGear2C`, `HybridHeroHair2C`),
clones and negative-scales the left arm, and wraps `bro.update` with a per-frame transform override.

There is also a **third, dead patcher**: `hybrid-v09/main.js` on branch `hybrid-v0.9` — 39 `rep()` calls labelled
`[hybrid clean miss]` / "Hybrid clean rebuild". No HTML references it (`hybrid-v09/index.html` loads
`./runtime/main.js`), so it is a parallel universe whose values already disagree with the deployed build:

| Property | Deployed (`runtime/main.js`) | Dead branch file (`main.js`) |
|---|---|---|
| Glasses frame | `0x18345a` | `0x18233d` |
| Lenses | `0x55dcff` (cyan) | `0xff45c2` (magenta) |
| Portal camera | distance `10.40` | *not patched* (stays `6.15`) |
| Hair | untouched | replaces the `LOCKS` array |

### Why regressions keep happening

This is not bad luck. It is four compounding structural facts:

1. **No asset exists.** Gamer Bro is ~1,000 lines of procedural lathe/sweep code with dozens of hand-tuned magic
   numbers (17-element `LOCKS` hair array, `wrapShell` parameter blocks, per-limb pose arrays). There is nothing to
   *compare against* the concept, so every phase tunes numbers blind.
2. **Patches can only add, never replace.** You cannot delete a procedural hair strand with `String.replace` — only
   hide it and bolt on another. Hence "procedural pieces layered on top of previous procedural pieces".
3. **Patches bind to unstable identities** — string literals, material object identity, node names. Change anything
   upstream and a patch either throws (`Hybrid Phase 2D rebuild missing`) or silently attaches to the wrong object.
   That is precisely the "portal occasionally revealing different character geometry" symptom.
4. **Nobody can reason about the result any more.** Whether the character dissolves correctly now depends on whether
   `Material.copy()` preserves `onBeforeCompile`. **It does not** — verified in three r180
   (`src/materials/Material.js`; `copy()` copies ~50 named properties; `onBeforeCompile` and `customProgramCacheKey`
   are not among them). The mirrored arm created at `phase2d.js:40` (`o.material=o.material.clone()`) is therefore
   **excluded from the portal dissolve shader** while every other part dissolves. Confirmed code-level mechanism for
   the "different geometry during the portal" report.

## 1.2 Specific confirmed regressions

- **Glasses downgraded (CONFIRMED, `phase2d.js:18–32`).** The build locates the existing curved `wrapShell` lenses
  (which hug the skull, with thickness and a rim) and sets their parent `visible=false`, then adds a *replacement*
  built from `ExtrudeGeometry(roundedShape(...))` — flat extruded plates at `z=.765/.836`. Phase 2D replaced curved
  shells with flat plates. Worse: `fm(lensGeo, M.cup, [-.305,…])` and `fm(lensGeo.clone(), M.lens, [.305,…])` — the
  new left lens uses the *headphone-cup* teal and the right lens uses the *lens* cyan. "Two-tone" is implemented as
  **left/right colour asymmetry**, not frame/lens two-tone.
- **Hair (CONFIRMED).** Base has 17 swept ribbon locks (`LOCKS`, chunks 1140–1161) — spiky by construction. The dead
  branch patcher swaps in a *different* `LOCKS` array; Phase 2D's predecessor added `HybridHeroHair2C` spike
  geometry that Phase 2D deletes by name. Three generations of hair in one build.
- **Arms (CONFIRMED, `phase2d.js:34–55`).** The right arm is a `clone(true)` of the left with
  `geometry.scale(-1,1,1)` (negative determinant → inverted winding *and* inverted normals), forced `DoubleSide`,
  with its transform hard-set every frame inside a wrapped `bro.update` — fighting the base animation rather than
  replacing it. This can never produce a natural two-hand grip; it produces a mirrored left hand.
- **Layer/lighting mismatch (CONFIRMED).** Character meshes are created with `m.layers.set(1)` (chunks 1060,
  comment: "lit only by the character rig"), but chunks 1547 then runs
  `bro.all.forEach(m=>{m.layers.enable(0);m.layers.enable(1);})`, and `phase2d.js:26` does the same. The hero is on
  **both** layers, so every material in the scene is lit by the full light array.
- **Light count (CONFIRMED).** The scene contains **14 light objects**: 1 `AmbientLight`, 2 `HemisphereLight`,
  4 `DirectionalLight` (room key, rim, 3 character lights), 5 `PointLight` (2 roaming torches + 3 portal). three.js
  compiles every lit material for **4 directional + 5 point + 2 hemisphere** and evaluates all of them per pixel —
  on `MeshPhysicalMaterial` with clearcoat, sheen and anisotropy. Top-3 mobile cost.
- **Global colour-write hack (CONFIRMED, `phase2d.js:57`).** `scene.traverse(...)` sets `colorWrite=false` on any
  material whose colour is exactly `0xe8fbff` or `0x8d5dff`. Those are the legacy laser materials (chunks
  1709–1710). It works today; any future material with those hex values silently vanishes while still rasterising.
- **Two render loops (CONFIRMED).** Base uses `renderer.setAnimationLoop(animate)` (chunks 1905); `phase2d.js:118`
  runs its own `requestAnimationFrame(tick)` with an independent `dt`. Two clocks, no shared pause.
- **Per-frame allocation (CONFIRMED, `phase2d.js:104,107`).** `impact()` and `spawnButton()` construct
  `new THREE.Mesh(...)` per spark: 4 per shot at 7.4 shots/s, plus 8–20 per hit → 30–200 mesh allocations/second.
  Textbook GC sawtooth, and the most likely contributor to the historic "freezing" on phones.
- **Infinite flight (CONFIRMED, chunks 1690).**
  `if(moveKeys.jump&&!player.grounded){ … player.vy=Math.max(player.vy,HOLD_BOOST_V); … player.jumpCount++ }` with
  **no cap**. Holding jump = unlimited altitude. No elevation design is meaningful until this is fixed.
- **Step height (CONFIRMED).** Patched `STEP_HEIGHT=.52` → `.90`. The hero is 2.62 units tall with legs ~1.0 unit;
  a 0.90 step is a knee-to-hip obstacle being silently teleported over — a band-aid over un-authored ledge heights.

## 1.3 What the world actually is

**CONFIRMED.** The Hybrid world is a **linear corridor**, not an arena. From the injected landscape
(`runtime/main.js:59–62`) plus the v0.8.1 extension (chunks 372–417):

```
room r=9.55 (z 0) → causeway (z 12.5) → landing (z 17.25) → stairs → upper deck (z 24.55)
→ big plateau r=16.5 @ z=34, y≈0.39 → side pads x=±18 @ z=33, y≈0.86
→ plateau r=11.8 @ z=57, y=1.29 → side pads x=±21 @ z=67, y=1.90 → plateau @ z=78, y=2.14
```

Footprint ≈ **50 × 100 units**, extending to z≈90. Total elevation range: **0 → 2.14 units.** Gamer Bro is
**2.62 units tall**.

> **The entire traversable map climbs less than one Gamer Bro.** The concept's "clear elevation differences /
> layered circular platforms" is currently impossible — the map is flat in the only metric that matters
> (hero-heights).

Construction is literal: 8 `plateau90()` calls, each two `CylinderGeometry` meshes (48-segment drum + 20 cm grass
cap); 6 `bridge90()` calls, each three boxes; 3 ramps. Trees are 44 instances of `IcosahedronGeometry(1,2)` on a
cylinder; rocks are 28 `DodecahedronGeometry(.62,1)`; mountains are 20 seven-sided cones; the ground texture is a
`Math.random()` speckle canvas at 384² (`terrainTex90`).

The patch also **hid the good architecture**. The v0.8.7 room had voussoir arches, relief panels, alcoves,
buttresses, a cornice and torches (chunks 267–305) — the nearest thing in the project to the "ruins / library /
dungeon" language the concept wants. `runtime/main.js:14–20` switched all of it off and bolted on cylinders.

## 1.4 Estimated current frame cost

Static analysis; verify against the on-screen `FPS · CALLS · TRIS` readout (chunks 1902).

| Bucket | Est. draw calls | Est. triangles |
|---|---|---|
| Room env (instanced + one-off) | ~28 | ~15 K |
| Exterior landscape (81 separate `extMesh` calls incl. stairs/lantern loops) | ~81 | ~10 K |
| Trees / rocks / mountains (instanced) | 6 | ~25 K |
| Portal tube (21 `tmesh` + 8 rings + panels + discs + 7 rising rings + points + lines + 3 sprites) | ~50 | ~25 K |
| Character (post-`mergeByMaterial`) | ~47 | **~40–45 K** |
| Phase 2D arena (9 pads/rings + 18 crystal meshes) | ~27 | ~5 K |
| Phase 2D enemies (3 × ~9 meshes) | ~27 | ~12 K |
| Phase 2D projectiles/sparks (unpooled meshes) | 10–80 | — |
| **Total (excl. shadow pass)** | **≈ 280–350** | **≈ 130–150 K** |

The character alone is ~47 draw calls and ~45 K triangles, rendered twice per frame (its `charKey` shadow map has
`autoUpdate=true`, chunks 1397). Draw calls — not triangles — are the binding constraint on mobile.

---

# 2. CHARACTER RECOMMENDATION

## Verdict: **B — authored GLB. Decisively.**

**RECOMMENDATION.** Stop procedural character work. No more hair arrays, no more `wrapShell` parameter blocks, no
more lens swaps. Build Gamer Bro in Blender as a rigged GLB with authored materials and animation clips; keep
three.js responsible only for **FX** (dissolve shader, portal energy, particles, controller attachment), **LOD**,
**instancing** and **playback**.

### Why A (continue procedural) is wrong — four independent reasons

1. **The concept's requirements are modelling tasks, not code tasks.** Smooth rounded cartoon body; clean
   silhouette; styled but not spiky hair; attractive two-tone glasses; headphones with material separation; hands
   naturally holding the controller; cohesive materials. Every one is decided by an artist moving vertices and
   painting weights. None is reachable by tuning `taper`, `domeY` and `segV`.
2. **Lathe/sweep geometry has no usable UVs.** `LatheGeometry` and the custom `swept()` builder emit procedural UVs.
   You can paint a face and shirt onto them (the current build does, via canvas) but you can never **bake a normal
   map, an AO map or a curvature map** from a high-poly sculpt onto them. So the hero can never carry the surface
   detail that separates "polished mascot" from "primitive".
3. **The controller grip is a rig problem.** A procedural arm is a single `pivot` group with baked geometry; there is
   no hand bone to parent a controller to, so "holding the controller" can only be faked by hard-coding
   `armL.position.set(...)` every frame — exactly what `phase2d.js:49–51` does. With a rig, the controller is a bone
   child, the grip is solved once in the DCC, and the pose lives *in the clip*.
4. **The cost model is inverted.** The procedural character costs ~45 K triangles and ~47 draw calls, recompiles its
   materials, cannot be LOD'd, cannot be instanced, and breaks every time someone touches it. An authored GLB costs
   **6–12 K triangles in 2–4 draw calls**, ships with LODs, and can be re-exported without touching engine code.

### Why not pure C

Because "hybrid" as practised here (procedural body + procedural add-ons) *is* the failure mode. The only hybrid
element worth keeping is procedural **FX on an authored body**.

## Production pipeline — DCC

| Step | Deliverable | Target |
|---|---|---|
| 1. Blockout | Body / head / hair / headphones / glasses / controller as simple volumes matched to the concept silhouette | Height **2.62 world units** (current `cfg.height`) — or rescale the game to 1 u = 1 m and set hero to 1.8. Pick one; do not fudge |
| 2. Sculpt | High-poly pass: hair flow, cloth folds, headphone panel lines, controller detail | No limit (never ships) |
| 3. Retopo | Game mesh, clean quad topology, one continuous silhouette | **6–10 K tris** (mobile), ≤ 15 K high |
| 4. UVs | **One** 2048² atlas (or 2×1024²). Hair as a solid volume, not 17 strands | 1–2 UV sets (set 2 = lightmap/AO if needed) |
| 5. Bake | Normal + AO + curvature from high-poly; **two-tone authored in the texture**, not by material swapping | 2048² desktop / 1024² mobile |
| 6. Rig | Humanoid, **18–24 bones** (spine 3, arms 3×2, legs 3×2, head 1, plus `hand.L`, `hand.R`, `prop`/`controller`) | Skin weights ≤ 4 per vertex |
| 7. Clips | `idle`, `walk`, `run`, `jump_start`, `fall`, `land`, `zap_hold` (loop), `portal_enter`, `hit` | 30 fps, ≤ 30 s total, **no root motion** |
| 8. Controller | Separate mesh parented to `hand.R`, with an empty at the muzzle | Name it `controllerEmitter` (see bridge below) |
| 9. Export | `gltfpack -cc` (Meshopt) + KTX2 via `gltf-transform` | Hero GLB ≤ 1.5 MB, textures ≤ 4 MB |
| 10. Load | `GLTFLoader` + `MeshoptDecoder` + `KTX2Loader`; `AnimationMixer` with crossfades | 2–4 draw calls |

### Compatibility bridges (RECOMMENDATION)

These make the swap small and safe:

- **Preserve the existing API surface:** `bro.root`, `bro.body`, `bro.all`, `bro.materials`,
  `setMotion / setHome / setVisible / setAction`, `controllerGroup`, `controllerEmitter`, `update(t,dt,fx)`.
  Portal, camera, movement and UI code then keep working unchanged.
- **`seedHeroParticles()`** (chunks 1612–1629) samples vertices + vertex colours from `bro.all`. It is **already
  asset-agnostic** and works on a GLB with zero changes. Keep it.
- **The dissolve shader** is applied via `onBeforeCompile` over `Object.values(bro.materials)` (chunks 1554–1590).
  Keep the *technique*, but after loading the GLB **traverse the loaded materials and patch them at load time**
  instead of patching a hard-coded dictionary. Same for `customProgramCacheKey`.
- **Interim option (expires at M3b):** if rigging/animation is the blocking skill, ship an authored *static* GLB
  (body + hair + headgear + controller as separate named nodes), keep the current procedural `update()` driving node
  rotations for one milestone, then replace with clips. This is the only hybrid I would endorse.

**Do not re-model the character per phase.** One file, one owner, versioned:
`assets/hero/gamer_bro.v001.glb`. Regressions stop when there is one artefact whose history is visible.

---

# 3. PORTAL ANIMATION DIAGNOSIS

## 3.1 Why the ending freezes — mechanism

The base build has a four-phase tail (chunks 1730):

```js
const phaseDur={charge:2.60,convert:2.65,dissipate:2.25,afterglow:.85};
```

The tail's job is split. `dissipate` (chunks 1870–1875) animates the **energy drain**: `uDissolve` 0→1, the hero
particle vortex spreading outward (`updateHeroDissolveParticles(1.0+p*.42, t, true)`, whose `dissipating` branch
does `radius*=1+.30*life` at chunks 1635), arcs sputtering, lights falling. `afterglow` (chunks 1876–1878) is a
0.85 s **cool-down** that then calls `resetTest()` (auto-respawn).

Two patches rewrote this (`runtime/main.js`):

```js
// line 73 — replaces the convert→dissipate transition
"if(p>=1){heroPortalState='gone';gamerRoot.visible=false;heroGhost.visible=false;
 heroParticlePoints.visible=false;setPhase('afterglow');phaseT=0;…}"

// line 74 — replaces afterglow's completion
"if(p>=1){phaseT=phaseDur.afterglow;heroParticleMat.opacity=0;}"   // was: if(p>=1)resetTest();
```

Four separate things go wrong, and together they produce exactly the reported behaviour:

### (a) The `dissipate` phase is deleted from the timeline

`convert` now transitions straight to `afterglow`. The 2.25 s drain — the only place `uDissolve` is ever animated,
and the only place the character-derived particle vortex gets its outward drift — **is now unreachable code**. It is
written, it exists, and it never runs. That is the "no attractive energy dissipation/cool-down transition": the
transition was deleted.

### (b) The hero's particle vortex is hard-killed at the moment of disappearance

`heroParticlePoints.visible=false` in the line-73 patch. The vortex the audience should watch swirl away is switched
off in the same frame the hero vanishes.

### (c) The envelope snaps — this is the "energy abruptly disappears"

At the end of `convert` the driving scalars are `fx=1, fill=1, disc≈1.55, pl=36, ph=24, pw≈6` (chunks 1865, after
the flash terms decay). One frame later, `afterglow` with `p=0, g=1` gives `fx=.16, fill=.10, disc=.40, pl=14,
ph=8.7, pw=0`. That is a **single-frame collapse of ~85% of the column's brightness and 100% of its fill height**.
Four more systems pop in the same frame:

| System | End of `convert` | First frame of `afterglow` |
|---|---|---|
| Energy column `uFill` / `uIntensity` | 1.0 / 1.42 | **0.10 / 0.30** |
| Particle count | `particleBudget` (140–360) | `max(18, 30%)` (chunks 1822) |
| Particle rise / ceiling | `.12+.44·i` / 4.02 | **`.055` / 1.55** (chunks 1823) |
| Rising rings | visible (chunks 1892) | `opacity=0` (chunks 1891) |
| Arcs | `arcFx=.82` | `setDrawRange(0,0)` (chunks 1828) |
| Lights `pl` / `ph` / `pw` | 36 / 24 / 6 | 14 / 8.7 / **0** |

### (d) The "freeze" is two different things, both real

- *The frozen moment:* in the last ~0.6 s of `convert` the envelope is pinned (`fx=1, fill=1, disc=1.55`) once
  `flash`/`s1`/`s2` decay; the hero is invisible from `p≥.975` (chunks 1868) and its vortex is cut at `p=1`. What
  keeps moving is only the shader's internal `uTime` noise — which reads as *static*, because everything with
  structure has just been removed.
- *The frozen state:* `afterglow`'s envelope is `g=exp(-3.4p)` over 0.85 s applied to an already-collapsed signal —
  `fx` moves .16 → .10, `disc` .40 → .28. Imperceptible. Then line 74 **clamps `phaseT=phaseDur.afterglow`**, so `p`
  is pinned at 1 forever. A state whose animation is a function of `phaseT`, with `phaseT` frozen, is **by
  definition a frozen state**. That is not a workaround for auto-respawn; it *is* the freeze.

### Already correct

**CONFIRMED:** there is no auto-respawn (line 74 removed `resetTest()`), `RESET` becomes `PLAY AGAIN` and routes to
`playAgainFromPortal()` (lines 70–72), which respawns at `z=57` with the camera restored. That part of the spec
already works. Only the animation between "hero gone" and "PLAY AGAIN" is broken.

## 3.2 How to restructure it (not mask it)

**RECOMMENDATION.** Replace the `if(phase==='x'){…} else if(phase==='y'){…}` envelope chain (chunks 1852–1879) —
28 lines of hand-tuned piecewise branches that cannot be tuned without code edits — with a **data-driven timeline of
keyframed tracks**, obeying three structural rules:

1. **A hold state must be driven by `clock.elapsedTime`, never by `phaseT`.** Clamping `phaseT` is what freezes it.
   The completed state should be an *idle animation* (breathing shader, drifting embers, slow disc rotation)
   sampled from wall-clock time.
2. **Every visual channel is a track.** `fx, fill, disc, dissolve, arcFx, pl, ph, pw, particleCount, particleRise,
   ringOpacity, cameraDistance, cameraYaw` — each an array of `[time, value, easing]`. An artist tunes the tail by
   editing numbers, not `if` branches.
3. **Continuity by construction.** Where a discontinuity is unavoidable, cross-fade the *value* over 0.15–0.25 s in
   the sampler. Never hide a system mid-flight (`visible=false`, `setDrawRange(0,0)`); always fade opacity/count to
   zero first.

### Recommended 8-beat score

Durations are a starting point. The previous tail was 3.1 s; this is ~4.0 s of authored cadence.

| # | Beat | Dur | What the audience sees |
|---|---|---|---|
| 1 | `enter` | 1.45 s | existing walk-in arc — **unchanged** |
| 2 | `charge` | 2.60 s | existing — **unchanged** |
| 3 | `convert` | 2.65 s | existing dissolve; hero fully gone by ~p .93 (tighten from .975) |
| 4 | **`sustain`** | **0.45 s** | **NEW.** Energy holds at *full* after the hero is gone; one brighter pulse travels up the column. This is the missing beat — it lets the audience register "he's gone, the machine is still running". Without it the cut reads as a bug |
| 5 | **`drain`** | **1.55 s** | `uFill` falls on an ease-out; `uDissolve` 0→1 — **the shader feature that has never once played**; hero particles pulled inward and up then released (`updateHeroDissolveParticles(..., true)`); arcs sputter with dropouts; rising rings fall; `pl`/`ph` decay to idle |
| 6 | **`settle`** | **0.90 s** | Embers: ~40 particles drift down and fade; one slow pulse descends the tube; discs return to `.28`; a power-down ring sweep; glow sprites fade to base |
| 7 | **`complete`** | **∞** | Wall-clock idle: breathing shader at low intensity, 18–30 embers, slowly rotating rune disc at low opacity, camera very slow dolly-in + 2° drift. **No respawn** |
| 8 | `reset` | 0.4 s | Only on PLAY AGAIN: fade, respawn at `z=57`, camera restore |

Implementation shape:

```js
const PORTAL_SCORE = [
  { name:'charge',   dur:2.60, next:'convert',  tracks:{ fx:[[0,.10],[.35,.60],[1,1]], fill:[[0,.10],[1,1]] } },
  { name:'convert',  dur:2.65, next:'sustain',  tracks:{ /* … */ } },
  { name:'sustain',  dur:0.45, next:'drain',    tracks:{ /* … */ } },
  { name:'drain',    dur:1.55, next:'settle',   tracks:{ /* … */ } },
  { name:'settle',   dur:0.90, next:'complete', tracks:{ /* … */ } },
  { name:'complete', hold:true, tracks:{ /* sampled from clock.elapsedTime */ } },
];
```
with `sample(track, t)`, `onEnter(state)`, `onExit(state)` and one `advance()` per frame. Camera becomes a track too
(it is currently a static lerp to `views.portal`, patched to distance 10.40).

### Verify before rebuilding (30 minutes)

Add a temporary log inside `animate()`:

```js
console.log(phase, phaseT.toFixed(2), fx.toFixed(2), fill.toFixed(2), dissolve.toFixed(2));
```

If at the transition you see `convert 2.65 1.00 1.00 0.00` → `afterglow 0.00 0.16 0.10 0.00`, the diagnosis is
confirmed and the branch chain can be deleted with confidence.

---

# 4. WORLD / LEVEL DESIGN PLAN

*Derived from the written brief for the top-left arena panel. All dimensions in world units.
**Gamer Bro = 2.62 u tall, 0.68 u wide, runs 6.35 u/s, jump apex 1.55 u** (once the hold-boost cap is fixed).*

## 4.1 Scale rules

| Element | Recommendation | In hero units |
|---|---|---|
| Portal hub radius | 9 u (keep — the existing dais/tube fits) | 6.9 h |
| Combat arena radius | **7–9 u** | 5.4–6.9 h across |
| Small satellite pad radius | 5–6 u | 3.8–4.6 h |
| Bridge width | **4.5 u** (1.3× the current 3.45 causeway) | 6.6 body-widths |
| Ramp width / slope | 4 u / ≤ 22° | — |
| Tier height | **2.4–3.0 u** | **0.9–1.15 h** |
| Jump gap between platforms | 2.6–3.2 u (clearable: 1.55 u up, ~4.5 u forward at run speed) | 1.0–1.2 h |
| Step / ledge height | ≤ 0.45 u (then restore `STEP_HEIGHT` to ~0.5) | 0.17 h |
| Total climb, floor → summit | **11–12 u** | **4.2–4.6 h** |
| Traversable footprint | ~85 × 85 u | 32 × 32 h |
| Backdrop ring | r = 48–80 u, **non-traversable** | — |

Crossing corner-to-corner at run speed ≈ 19 s; a full loop ≈ 45 s. That is the "compact but substantial" target.

## 4.2 Layout — five tiers, hub at centre

```
                        ┌─────────────┐
                        │  T4 SUMMIT  │  y = +10.6, r = 6      crystal crown / boss
                        └──────┬──────┘
                     6 floating steps (spiral, 2.9 u gaps)
              ┌───────────────┴───────────────┐
        ┌─────┴─────┐                   ┌─────┴─────┐
        │ T3 W BALC │                   │ T3 E BALC │  y = +7.6, r = 5.5   (jump-only)
        └─────┬─────┘                   └─────┬─────┘
              └────────────┬──────────────────┘
     ┌─────────────────────┼─────────────────────┐
┌────┴────┐          ┌─────┴─────┐          ┌────┴────┐
│ T2 WEST │──────────│ T2 NORTH  │──────────│ T2 EAST │  y = +5.0
│ crystal │  bridge  │   ruins   │  bridge  │ library │  r = 7 / 9 / 7
│  grove  │          │  arena    │          │  arena  │  +1.2 inner podium
└────┬────┘          └─────┬─────┘          └────┬────┘
     └──────────┬──────────┴──────────┬──────────┘
          ┌─────┴─────┐          ┌─────┴─────┐
          │ T1 SW pad │══════════│ T1 SE pad │        y = +2.4, r = 7.5
          └─────┬─────┘ ring br. └─────┬─────┘        (+ NE / NW mirrored)
                └───────────┬──────────┘
                     4 ramps (w 4)
                 ┌──────────┴──────────┐
                 │    T0 PORTAL HUB    │   y = 0, r = 9
                 │  portal tube @ 0,0  │   4 arch gateways N/E/S/W
                 └─────────────────────┘
      backdrop: ruin/library towers r 48–80, y −6 → +34, FOGGED, NO COLLISION
```

- **Portal / start area → T0 centre.** The tube stays at the origin; the existing dais and crystal ring become the
  hub floor. Four arch gateways — recover the voussoir/relief/alcove language from chunks 267–305; it is the right
  style and it is already written — frame the four exits. This makes the portal the *axis* of the composition, as in
  the concept.
- **Combat arenas → T2**, three of them, each with a raised inner podium (+1.2 u) for a ranged enemy and a broken
  stair for vertical play. T1 pads hold 2 enemies each; T4 summit holds the boss. **Total 14 enemies, max 6 active.**
- **Bridges:** 2 ring bridges on T1 (arc geometry, r=22), 2 straight T2↔T2 bridges, 1 long "spine" T0→T2 north as
  the hero route. **Five bridges, not twelve.** Add 0.35 u rails/kerbs so edges read; keep the analytic
  `addRectSurface` collider.
- **Platforming:** T3 balconies reachable *only* via 3 floating discs with 2.9 u gaps; summit via a 6-step spiral.
  Both are optional routes that reward mastery and frame the arena from above.
- **Readability:** one main loop (T0 → T1 → T2 → T1′ → T0), two shortcuts (T1 ring bridge; T0→T2 spine), one
  vertical route (spiral). Three routes, not a mesh.

## 4.3 Depth without size — the three-layer composition rule

This is the answer to "large scenic scale, contained arena":

1. **Walkable layer (0 to +1 u around routes):** sparse, generous, ≥ 4.5 u wide. Nothing collidable within 1 u of a
   path edge except intentional rails.
2. **Dressing layer (1–6 u off-path, non-collidable):** crystal clusters, braziers, rubble, broken columns, vines,
   roots, knee-walls. This is what makes a platform read as *a place* instead of a puck. The current plateaus are
   naked two-mesh cylinders — no thickness, no under-structure, no edge. Give every platform a **1.5–2.5 u skirt
   with buttresses and hanging vines** and it immediately gains ~5× the perceived mass for ~300 triangles.
3. **Backdrop layer (r 48–80, non-collidable, fogged):** 6–9 ruin/library towers (stacked modules, 8–14 u wide, up
   to +34), 3 broken arches, a distant mountain silhouette ring. Fog (`FogExp2`, density 0.010 → tune to 0.014)
   at 60–90% opacity does the rest. **This is where the "enormous" feeling comes from, and it costs ~8 draw calls
   if instanced.**

Add **2–3 foreground occluders** (a broken arch and a pillar the camera passes behind on the main loop). Parallax
occlusion is the cheapest "authored" feeling in level design.

## 4.4 Author vs procedural

| Author in Blender (GLB) — DCC | Procedural in three.js |
|---|---|
| Platform module (round, rimmed, skirted) ×2 sizes | Instanced placement from `arena.layout.json` |
| Arena podium + rune ring inset | Crystal emissive pulse / shimmer shader |
| Bridge module with rails | Portal energy column (**keep — it's good**) |
| Ramp / stair module | Particle systems (pooled, `Points`) |
| Floating stepping disc | Fog (exp2 + height fog) |
| Broken arch / gateway ×2 | God-ray cones (additive, animated UV) |
| Ruin wall panel ×3 | Rune-ring decals (additive, `depthWrite:false`) |
| Tower module ×3 (stackable) | Vertex-shader wind sway on trees/vines |
| Balustrade / colonnade | Contact-shadow decals (**keep — it's good**) |
| Rock formation ×3, tree ×2, vine ×2 | LOD swap + distance cull |
| Crystal cluster ×3 (LOD 0/1) | Light baking via `instanceColor` (**keep the technique**) |
| Brazier / statue / banner ×2 | Collision surfaces (analytic disc/rect/ramp — **keep**) |
| Hero + controller; 3 enemies | Dissolve shader, trails, impacts |

**Keep the collision system exactly as is** (`walkSurfaces` + `surfaceHeight`, chunks 1652–1665): 14 lines, robust,
no physics engine, and it already supports disc/rect/ramp. The only change: **generate the surfaces from the same
JSON that places the visuals**, so art and collision can never drift.

---

# 5. ART ASSET PIPELINE

*Everything in this section requires a Blender/DCC step. None of it exists in the repo today.*

## Repository layout (RECOMMENDATION)

```
assets/
  hero/gamer_bro.v001.glb            (mesh+rig+clips, Meshopt+KTX2)
  hero/gamer_bro_LOD1.glb
  enemies/{stump,ghost,mushroom}.glb
  kit/arena_kit.glb                  (14 modules, shared atlas)
  kit/props.glb                      (crystals, rocks, trees, vines, braziers)
  kit/backdrop.glb                   (towers, arches, mountains — LOD-only)
  tex/arena_atlas_2048.ktx2          (albedo/ORM)
  tex/arena_normal_2048.ktx2
  tex/arena_lightmap_1024.ktx2
  tex/fx_atlas_512.ktx2
  tex/env_arena_256.ktx2
  arena.layout.json                  (platforms, bridges, ramps, props, spawns, walkSurfaces)
```

Conventions: one Blender file per kit; Y-up; metres; `1 unit = 1 unit`; origin at the module's floor centre; +Z
forward; applied transforms; triangulated on export; named materials matching atlas slots. Then a single
`gltfpack`/`gltf-transform` command in `package.json` produces the shipped files. **The build step is not optional**
— hand-exported GLBs drift, and you will be back to patching.

## `arena.layout.json` — the most important new file in this plan

It turns level design into data:

```json
{
  "tiers":     [{"id":"T0","y":0}, {"id":"T1","y":2.4}],
  "platforms": [{"type":"hub","x":0,"z":0,"r":9,"tier":0}],
  "bridges":   [{"x1":0,"z1":-12,"x2":-16,"z2":-22,"w":4.5,"tier":1}],
  "props":     [{"id":"crystal_a","x":0,"z":0,"scale":1,"rot":0,"tier":2}],
  "spawns":    [{"enemy":"stump","x":0,"z":0,"route":[[0,0]]}]
}
```

One loader turns it into `InstancedMesh` batches (grouped by module + material) **and** into `walkSurfaces`.
Authoring becomes editing JSON (or a tiny three.js editor view); nothing in the runtime hard-codes geometry.

## Textures and compression

- **Budget:** one 2048² KTX2 albedo/ORM atlas + one 2048² normal (ETC1S for albedo; UASTC or ETC1S-with-normal-fix
  for normals) ≈ 3–5 MB; one 512² FX atlas; one 256² PMREM env.
  **Total ≤ 12 MB VRAM mobile / ≤ 32 MB desktop.**
- **Meshopt (RECOMMENDATION)** — `EXT_meshopt_compression` via `gltfpack -cc` — over Draco: faster decode, and it
  compresses animation tracks too. Draco only if you hit a size wall.
- **KTX2 always.** PNG/JPG decode to RGBA in VRAM and cost 4–8× the memory; Basis transcodes to the device's native
  GPU format.

---

# 6. MATERIAL / LIGHTING PLAN

Ordered by value per millisecond.

## 6.1 Baked lighting — the single biggest win

The arena is static. Bake it.

- **Instanced kit → bake to vertex colours.** In Blender/Cycles, bake diffuse + AO + indirect to vertex colours on
  each module (needs moderately dense meshes — ~200–600 verts per module, which you want anyway for smooth
  silhouettes). Instances can then be rotated, scaled and tinted freely with **zero** extra texture memory, and you
  get the soft occlusion and bounce that make the concept's purple/blue key read. The build already uses this idea
  for the room's instanced masonry (`bakedLightAt` → `instanceColor`, chunks 230–260) — reuse it.
- **Hero pieces (hub, three arenas, summit) → real lightmap** on UV set 2 into one 1024² KTX2. In three.js:
  `material.lightMap = tex` with `geometry.setAttribute('uv1', …)` (r152+ uses `uv1` for lightMap). One texture, one
  UV set, enormous quality gain.
- **Do not** bake *and* use dynamic shadows on the same surfaces — pick one or you double-darken.

## 6.2 Materials: fewer, cheaper, correct

- **Kill `transmission` everywhere.** `crystalMat` (chunks 176) uses `transmission:.90, thickness:.36, ior:1.72`;
  `glassMat` (chunks 179) uses `transmission:.94`. Transmission in three.js triggers **a separate scene render into
  a transmission render target every frame** — one of the most expensive features available — and it is on your
  crystals *and* the portal chamber. Replace with: opaque crystal, `emissive` + `emissiveIntensity` 1.5–3,
  `roughness .1`, `envMapIntensity 1.5`, plus an additive inner-core mesh and a rotating glow sprite. Reads better in
  a dark arena and costs 1 draw call instead of a full extra pass.
- **Drop `MeshPhysicalMaterial` for everything except the hero and crystals.** `clearcoat`, `sheen` and `anisotropy`
  each add shader branches. Arena stone: `MeshStandardMaterial` with map + normal + packed ORM. Save the physical
  shader budget for Gamer Bro's glasses and headphones, where clearcoat actually sells "polished".
- **Trim to ~8 materials total:** arena stone, arena trim/metal, crystal (3 emissive variants sharing one shader),
  rune/additive, FX, hero skin, hero cloth, hero plastic.

## 6.3 Environment and shadows

- **Environment:** keep the one-time PMREM bake (`bakeEnvironment`, chunks 421–424 — good pattern), raise the cube
  target from 128 to 256, re-bake when the arena changes. Better still: author a small equirect gradient (purple sky
  / violet ground bounce) and PMREM that, instead of rendering a cube camera — deterministic, no dependency on scene
  state at bake time.
- **Shadows — one light, tightly bounded.** 1 shadow-casting directional light, frustum fitted to a **30 × 30 u box
  that follows the hero** (update `shadow.camera` when the hero moves > 1 u), 2048 desktop / 1024 mobile,
  `PCFSoftShadowMap`. Static arena shadows come from the lightmap/vertex bake. Characters keep the blob contact
  decal (chunks 1066–1069, `contactInst`) — it reads better than a real shadow at this scale and costs nothing.
  **Delete `charKey`** (the always-updating character shadow map, chunks 1390–1397) once the hero is a GLB.

## 6.4 Fog, volumetric cheats, instancing, LOD

- **Fog:** `FogExp2` density 0.010–0.014 with a colour matched to the sky; add **height fog** as a ~10-line
  `onBeforeCompile` injection (fade toward fog colour by world Y below y=+1). This is what creates the "platforms
  floating over an abyss" read in the concept, and it is free.
- **God rays:** 3–5 additive cones (open-ended cone geometry, radial-gradient texture, `depthWrite:false`,
  `AdditiveBlending`, `side:DoubleSide`, animated UV scroll) hanging from backdrop towers and over crystal clusters.
- **No post-processing bloom.** `UnrealBloomPass` costs 5+ fullscreen passes and two render targets; at this art
  direction, additive sprites + emissive get you ~80% of it for ~2% of the cost.
- **Instancing / batching:** every repeated piece via `InstancedMesh` with `instanceColor`; use `THREE.BatchedMesh`
  (r160+) where you need per-instance transforms *and* multiple geometries under one material. **Target: all arena
  dressing in ≤ 20 draw calls.**
- **LOD + culling:** two LODs for trees/rocks/towers/crystals (100% / 45%), swap at 25 u and 50 u; hard-cull small
  props beyond 55 u; backdrop towers never LOD below 40%.
- **Wind / shimmer:** vertex-shader sway on trees and vines (a `sin(time + worldPos.x)` offset scaled by vertex
  height) — zero CPU, zero extra draw calls. Crystal shimmer = emissive pulse + rotating additive sprite.

## 6.5 Realistic fidelity

With authored assets + baked AO/lightmaps + one shadow light + the additive cheat sheet: **~60–70% of the concept's
visual quality at 60 fps on a 2021+ phone, ~80% on desktop.** The remaining gap is true GI, real volumetrics, SSAO,
DoF and film bloom — all of which have fakes that close most of the perceptual distance. **What you cannot fake is
authored modelling and composition.** That is the actual bottleneck, and it is not a renderer problem.

---

# 7. PERFORMANCE BUDGET

Mobile = iPhone 12 / Snapdragon 7-series class. Desktop = integrated-GPU laptop.

| Metric | Mobile target | Desktop target | Current (est.) |
|---|---|---|---|
| Draw calls / frame | **≤ 120** (stretch 150) | ≤ 200 | ~280–350 |
| Shadow passes | **1** | 1 (+1 cascade high) | 1 static + 1 per-frame |
| Visible triangles | **≤ 120 K** | ≤ 300 K | ~130–150 K |
| Texture memory | **≤ 24 MB** | ≤ 64 MB | uncompressed canvases (unmeasured) |
| Total lights in scene | **≤ 5** | ≤ 8 | **14** |
| Shadow-casting lights | **1** | 1 | 2 |
| Point lights | **≤ 2** | ≤ 3 | 5 |
| Particles (all systems, pooled) | **≤ 250** | ≤ 600 | 400 + 360 + unpooled meshes |
| Particle draw calls | **≤ 3** | ≤ 5 | 3 + N (unpooled spark meshes) |
| Enemies total / active | 10 / **6** | 14 / 8 | 3 / 3 |
| Enemy draw calls each | **≤ 2** | ≤ 4 | ~9 |
| Environment instances | **≤ 20 draw calls** | ≤ 30 | ~6 instanced + ~81 loose meshes |
| Hero triangles / draw calls | **8–12 K / 2–4** | 15 K / 4 | ~45 K / ~47 |
| Per-frame JS allocations | **0** | ~0 | 30–200 objects/s |
| FPS floor | **30** | 60 | unknown (measure) |

## Where the current build blows the budget, ranked

1. **~81 loose `extMesh` calls** in the exterior (each plateau/bridge/stair/lantern is its own `Mesh`) → instance
   them: −70 draw calls.
2. **14 lights → 5:** −9 light evaluations per pixel on every physical material, plus a much smaller shader
   permutation set.
3. **`transmission` on crystals and glass** → removes a full extra scene render per frame.
4. **Character ~45 K tris / ~47 draws, shadow pass re-rendered every frame** → 10 K / 3 draws + blob shadow.
5. **Per-particle `new THREE.Mesh`** in `phase2d.js` → pool into one `InstancedMesh`; removes the GC sawtooth that
   most likely produced the historic freezing.
6. **45 K triangles of instanced trees** (`IcosahedronGeometry(1,2)` = 320 tris × 44) → 80-tris LOD, 28 instances.

## Keep and extend the adaptive-DPR controller

chunks 1900–1901 (`fps<47` → DPR −0.10; `fps>57` → +0.05; clamped 0.62–1.0) is the right idea. Add shadow-map size,
particle count and god-ray count tiers to the same controller, and keep the on-screen `FPS · CALLS · TRIS` readout
— it is your only reliable measurement loop and it already exists.

## Cheap fakes worth their cost

Additive sprite "bloom" (~free) · vertex-colour AO (~free) · blob contact shadows (~free) · god-ray cones (~1 draw
each) · height fog (~free) · vertex wind (~free) · scrolling-UV energy shaders (~free) · parallax backdrop
silhouettes (~2 draws).

**Not worth it:** post-process bloom, SSAO, real refraction, real-time GI, per-object reflection probes, MSAA on
mobile (use DPR instead).

---

# 8. WHAT TO DELETE / STOP DOING

Every item below is a **CONFIRMED** line reference, not a preference.

## Delete the patch architecture (highest priority)

1. **`hybrid-v09/runtime/main.js`** — 40 string `rep()` calls. Fork the chunks into real ES modules under
   `hybrid-v09/src/` and delete this file. The *values* it patches (movement, camera, colourway, world, portal) are
   good; the delivery mechanism is what is killing you. Copy the patched output once as the new source, then never
   patch again.
2. **`hybrid-v09/phase2d.js`** — the runtime monkey-patch. Delete: the material-identity glasses swap (18–32), the
   mirrored-arm clone (34–55), the `bro.update` wrapper (43–55), the `scene.traverse` colour-write hack (57), the
   by-name node cleanup (21–22). Keep only the *intent* of each, implemented in source.
3. **`hybrid-v09/main.js` on branch `hybrid-v0.9`** — the 39-patch "clean rebuild". Referenced by no HTML; its values
   already conflict with the deployed build; it will rot silently. Delete it or promote it. Do not leave both.
4. **Stop `window.__bro` + polling** (`for(i<500) await sleep2D(25)`). Pass dependencies explicitly; modules import
   each other.

## Delete the character patch systems

5. **The 17-lock hair system** (`LOCKS`, chunks 1140–1174). Replaced by authored hair.
6. **The mirrored right arm.** Replaced by an authored arm + `hand.R` / `prop` bone.
7. **The glasses replacement path** — both the old `wrapShell` pair and the extruded-plate replacement. One authored
   head, glasses modelled in.
8. **The `HybridHeroFaceGear2C` / `HybridHeroHair2C` by-name cleanup.** A symptom, not a fix; it dies with the patch
   layer.
9. **The hard-coded two-tone colour patches** (`runtime/main.js:24–30`). Authored textures carry the colourway;
   `setColorway` becomes a texture swap, or disappears.

## Delete the world patch systems

10. **`plateau90` / `bridge90` / `ramp90` and the injected landscape** (`runtime/main.js:55–63`): 8 cylinders, 6
    box-bridges, 3 ramps, 44 icosahedron trees, 28 dodecahedron rocks, 20 cone mountains, `terrainTex90`
    random-speckle canvas. All of it. Replaced by the authored kit + `arena.layout.json`.
11. **The `visible=false` hiding of the room** (lines 14–20). Either keep the room as the T0 hub (recommended — reuse
    the arches/voussoirs/reliefs) or delete that geometry from the source. Do not ship a build whose architecture is
    switched off.
12. **`STEP_HEIGHT=.90`** — author ledges at ≤ 0.45 and restore ~0.5.

## Delete the perf/quality hazards

13. **The second render loop** (`phase2d.js:118`). One loop, one `dt`.
14. **Per-particle `new THREE.Mesh`** (lines 104, 107). Pool.
15. **`transmission` on `crystalMat` and `glassMat`.**
16. **9 of the 14 lights** — the 2 roaming torch points, `portalWash`, and the 3-light character rig. (Keep the
    character *rim* concept as 1 light; let the hero receive world ambient + env.)
17. **The legacy laser**, currently hidden by `colorWrite=false`; delete the meshes properly (chunks 1709–1712).
18. **The uncapped hold-jump boost** (chunks 1690) — before any vertical design work.
19. **Dead version files:** `src/v084.js`, `v085.js`, `v086.js`, `src/main-v085.js`, `main-v086.js`,
    `src/overlay-v085.js`, `v084.css`, `v085.css`. Also the **byte-identical duplicate chunk set**:
    `src/chunks/01–10.txt` and `hybrid-v09/src/chunks/01–10.txt` are the same 130 KB in two places (`diff` →
    identical). Keep the v0.8.7 root game as one frozen, pinned file set — untouched, as required — but the Hybrid
    must stop reading from it.

## Stop doing (process)

20. **Stop shipping phases as patches.** "Phase 2D", "Phase 2C", "clean rebuild" are the same anti-pattern. One
    source tree, one branch strategy, semantic versions.
21. **Stop three parallel phase directories** (`phase1b/1c/1d`, `phase2a/2c/2d`) — `HYBRID_V09_HANDOFF.md` already
    says this; enforce it.

---

# 9. WHAT TO PRESERVE

Genuinely good work in this codebase. Keep all of it.

1. **The analytic collision system** — `walkSurfaces` + `surfaceHeight` (chunks 1652–1665, 1668–1696): 14 lines,
   disc/rect/ramp, no physics engine, robust. Keep verbatim; drive it from JSON.
2. **The portal energy shader** (`energyMat`, chunks 466–489): fill height, filaments, wisps, braid, grain, and —
   crucially — a **`uDissolve` drain** that has never been used. The best-looking thing in the build. Keep, and wire
   up the drain.
3. **The hero dissolve shader** (`onBeforeCompile` + `customProgramCacheKey`, chunks 1554–1590): PBR-preserving,
   bottom-up, noise-perturbed, with an emissive edge. Excellent. Apply generically to GLB materials at load time.
4. **`seedHeroParticles()`** (chunks 1612–1629): samples vertices + colours from live character meshes to build the
   dissolve vortex. Asset-agnostic — works unchanged on a GLB. One of the cleverest things in the file.
5. **`updateHeroDissolveParticles(..., dissipating=true)`** (chunks 1630–1641, esp. line 1635
   `radius*=1+.30*life`): the outward-drift dissipation already exists. It is unreachable because of §3.1(a).
6. **The one-time PMREM environment bake** (chunks 421–424): `CubeCamera` → `PMREMGenerator`, then dispose. Correct
   pattern, no per-frame cost.
7. **The procedural PBR canvas texture set** (chunks 70–165): `stoneAlbedo`, `stoneHeightCanvas`,
   **`normalFromHeight`** (Sobel height→normal), `floorRoughness`, `runeTexture`, `radialTexture`. Keep as the
   fallback / detail-texture path and for placeholder builds — it means the game always renders even before art
   lands.
8. **Vertex-baked instanced lighting** (`bakedLightAt` → `instanceColor`, chunks 230–260): the exact technique to
   reuse for the new arena kit.
9. **Instanced contact-shadow decals** (`contactInst`, chunks 312–318): cheap, effective, keep.
10. **`mergeByMaterial`** (chunks 1319–1360): cuts per-object draw calls ~4× at load. Keep; it will matter for enemy
    GLBs too.
11. **The adaptive-DPR quality controller + on-screen stats readout** (chunks 1797–1803, 1900–1902): keep and extend.
12. **The Phase 2D camera-relative analog movement** (`runtime/main.js:33–34`): genuinely good code — joystick with
    `smoothstep` magnitude, exponential yaw damping, `THREE.MathUtils.damp`. Promote it into the source.
13. **The portal tube's hard-surface model** (chunks 432–461): stacked metal rings, pylons, bronze accents, glass
    chamber. Reads well. Keep the silhouette; restyle to the crystal/ruin palette.
14. **The additive glow-sprite "bloom" cheat** (chunks 458–461): keep.
15. **The blob shadow and rune-ring decals**: keep.

---

# 10. NEXT 5 DEVELOPMENT MILESTONES

Ordered so each is shippable and none depends on work that comes later.

## M1 — De-patch (prerequisite for everything)

Fork the ten chunk files into real ES modules (`hybrid-v09/src/renderer.js`, `world.js`, `hero.js`, `portal.js`,
`input.js`, `camera.js`, `combat.js`). Apply the *values* from the patches as the new source; delete
`runtime/main.js`, `phase2d.js`, and the dead `main.js`. One render loop. Fix the hold-jump cap. Restore
`STEP_HEIGHT` to ~0.5 and re-author the three ledges that need it.

*Exit criteria:* same visuals as today, verified on device, with zero string patches in the repo. **No visual change
is the goal** — this milestone buys the ability to change anything afterwards.

## M2 — Portal sequence rebuild

Implement the `PORTAL_SCORE` timeline (§3.2) with keyframed tracks; add `sustain → drain → settle → complete`; make
the hold state wall-clock animated; camera as a track; PLAY AGAIN only. Re-enable the `uDissolve` drain and the
`dissipating=true` particle branch that already exist.

*Exit criteria:* the eight beats read as one continuous shot; the completed state visibly breathes; no respawn
without input. Fastest visible win in the project — ~2–3 days once M1 lands.

## M3 — Hero GLB (DCC)

Blender blockout → sculpt → retopo ≤ 12 K → one-atlas UVs → normal/AO/curvature bake → 18–24-bone rig → 8 clips →
controller on `hand.R` with a `controllerEmitter` empty → `gltfpack -cc` + KTX2 → loader + `AnimationMixer` +
dissolve re-applied at load. Delete the procedural character, the LOCKS hair, the mirrored arm and every character
patch.

*Exit criteria:* hero ≤ 4 draw calls / ≤ 12 K tris, holding the controller naturally in the ZAP clip, dissolving
correctly in the portal, 60 fps on a mid phone. **This is the milestone that decides whether the project reaches the
concept.** Budget real DCC time.

## M4 — Arena kit + layout data (DCC)

Author the ~14-module kit, props, crystals and backdrop (§4.4). Write `arena.layout.json` and the loader that builds
`InstancedMesh` / `BatchedMesh` batches *and* `walkSurfaces` from it. Build the five-tier layout (§4.2) with the
three-layer composition rule (§4.3). Port the 14 enemies to 3 instanced GLB types at ≤ 2 draw calls each. Delete the
cylinder landscape.

*Exit criteria:* ≤ 20 environment draw calls; routes = 1 loop + 2 shortcuts + 1 vertical; 4.2–4.6 hero-heights of
climb; no flat sight-line longer than 25 u.

## M5 — Lighting/material pass + measured performance

Bake vertex AO/lightmaps; KTX2 atlases; cut to 5 lights and 1 shadow-casting light with a hero-following frustum;
replace transmission crystals with emissive + additive core; add god-ray cones and height fog; LOD + distance
culling; pool all particles; eliminate per-frame allocation. Then **measure on a real low-end Android, an iPhone and
an integrated-GPU laptop**, and lock the adaptive-DPR thresholds to measured data.

*Exit criteria:* the §7 table met or beaten on all three devices; frame time flat (no GC sawtooth) over a 5-minute
session including continuous combat.

## Combat FX slots after M5

See §11.

---

# 11. COMBAT — can "controller fires recognisable gaming buttons" look polished?

**Yes — but not as implemented, and not before the art direction is solved.** Current problems, all CONFIRMED in
`phase2d.js`:

1. **`blending: THREE.AdditiveBlending` on the button sprites** (line 91) with a white glyph, a white 8 px stroke,
   `shadowBlur:24` and a saturated fill. Additive over a bright arena saturates to white — **literally why they look
   like white balls.**
2. **The sprite material is shared per button type** (`new THREE.Sprite(buttonMats[idx])`, line 99), but line 109
   does `s.sprite.material.rotation += s.spin*dt`. That rotates **every live sprite of that type** — the "spin" is
   not per-projectile and is non-deterministic. Clone per instance, or do not rotate billboards.
3. **Too small, too fast:** scale 0.48 u (≈2.5% of screen height at the 13.4 u follow distance — ~27 px at 1080p),
   speed 12.8 u/s, life 1.55 s → 20 u of travel. The glyph is sub-perceptual and motion-blurred.
   **Readability rule: ≥ 3–4% of screen height (0.7–1.0 u) and ≤ 12 u/s.**
4. **7.4 shots/s** is too fast to read anything. Cadence, not rate, sells a barrage.
5. No trails, no spawn pop, no impact light, no pooling.

## Correct implementation, when you build it

- **Real geometry, not sprites:** 4 extruded glyph meshes (X, O, △, □) from bevelled shapes, ~40–120 tris each, with
  an emissive-cored material; L1/R1/L2/R2 as small rounded plates with the label baked into the atlas. This gives
  correct depth sorting, shading and rim light — the thing that makes it read as a *physical object* rather than a UI
  sticker.
- **Or the cheap version:** keep sprites but use **`NormalBlending`, `depthWrite:false`, `depthTest:true`**, size
  **0.9–1.2 u**, speed **10–12 u/s**, life **0.6 s**, **per-instance material clones** (or no rotation at all —
  scale-pulse instead), plus a 3-quad additive trail behind each.
- **Billboard the glyph** (camera-facing) — correct for readability. Roll it slightly; never tumble it in 3D.
- **Spawn pop:** scale 0 → 1.15 → 1.0 over 0.08 s. **Death:** fade + shrink over 0.12 s. Without these two it always
  looks like a UI element stuck to the screen.
- **Cadence:** 4–5 shots/s in 2-shot bursts with a 0.25 s gap. Reads as a barrage, stays legible.
- **Impacts:** 1 additive flash sprite (0.12 s), 6–10 particles from a **pooled** `InstancedMesh`, a ground ring
  decal, and a 0.08 s emissive flash on the enemy material. **No point lights on impact** — you do not have the
  light budget.
- **Pool everything:** 32 projectiles max, zero allocations per shot.

**Verdict:** do a 2-hour placeholder now (NormalBlending sprites, 2× bigger, 30% slower, fixed cadence) so combat
feels finished during M3/M4, then build the real thing in M5 — because projectile readability depends entirely on the
final camera distance, arena scale and lighting contrast, none of which are settled yet. Delete the forehead laser,
the controller laser and the prism stream outright; `HYBRID_V09_HANDOFF.md` says the prism is already gone — make
sure the geometry goes with it.

---

# Open questions for the owner

1. **Where are the recovered assets?** (`concept_arena.glb`, trees, rocks, ruins, stairs, arches, vines, enemy GLBs,
   the older Blender / Gamer Bro / Sprite / Citrus sources.) They are not in this repo, not on the preview domain,
   and there is no loader in the codebase. M3 and M4 cannot start without them — or without a decision to author
   fresh.
2. **Re-attach the two concept images** if the arena panel has specific geometry to honour. This audit worked from
   the written brief; if the top-left panel shows, say, a particular tower arrangement or bridge count, §4.2 will be
   revised to match.
3. **Confirm the intended world scale convention** — keep Gamer Bro at 2.62 units, or rescale to 1 unit = 1 metre
   with a ~1.8 m hero. Every dimension in §4 assumes the former.
