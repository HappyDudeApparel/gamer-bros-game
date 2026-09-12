# PASS 17C-3 — WORLD / CAMERA / STREAMING

**Status:** COMPLETE / GREEN  
**Branch:** `pass17-concept-match`  
**Certified candidate head:** `71456f39590156553f5ad3a885a3f5faf45fc5fa`  
**Certified:** 2026-09-12  
**Promotion to `main`:** NOT YET — Pass 17 remains isolated until the full 17C production gate is complete.

## What this checkpoint certifies

Pass 17C-3 certifies that the current deterministic Prism Valley candidate preserves the approved continuous-world traversal contract, completes real desktop and Android production streaming without stream errors, and exposes the intended three-level camera / CENTER behavior on both desktop and Android.

This checkpoint intentionally separates expensive production streaming from camera proof. The production scene is certified by the streaming subchecks; the camera controls are certified by a lightweight real-render browser proof. This avoids allowing software-WebGL CI stalls to masquerade as product failures.

## Production streaming certification

Source workflow run: `34674352120` — **Validate Pass 17C-3 World + Camera + Streaming**.

The bounded production-stream subchecks both passed before the older combined visual step timed out:

- **Desktop production stream:** GREEN in **89.41 s**
- **Android production stream:** GREEN in **34.15 s**
- Main route: **334 samples / PASS**
- Optional + mastery routes: **441 samples / PASS**
- Streamed enemies: **5**
- Concept hero ready: **true**
- Continuous terrain ready: **true**
- Concept landmarks ready: **true**
- Portal Meadow dressing ready: **true**
- General decor ready: **true**
- Enemy stream error: **none**
- Decor stream error: **none**

The earlier workflow-level failure is not carried forward as a product failure. It occurred after both production-stream subchecks had passed, inside the old monolithic visual-camera stage. That stage was subsequently separated and replaced by the bounded camera proof below.

## Camera certification

Source workflow run: `34675109137` — **Validate Pass 17C-3 Camera Proof** — **SUCCESS**.

### Desktop

- Runtime reached ready state: PASS
- Route validation remained green: **334 main / 441 optional**
- CENTER yaw: **π (3.141592653589793)**
- CENTER pitch: **0.18**
- Zoom 1: **12.8**
- Zoom 2: **16.2**
- Zoom 3: **20.0**
- Touch-camera contract exposed: **true**
- Rendered screenshot: **PASS**
- Severe browser errors excluding favicon noise: **none**

### Android

- Runtime reached ready state: PASS
- Route validation remained green: **334 main / 441 optional**
- CENTER yaw: **π (3.141592653589793)**
- CENTER pitch: **0.18**
- Zoom 1: **12.8**
- Zoom 2: **16.2**
- Zoom 3: **20.0**
- Touch-camera contract exposed: **true**
- Rendered screenshot: **PASS**
- Severe browser errors excluding favicon noise: **none**

Camera proof artifact:

- Artifact name: `pass17c3-camera-proof`
- Artifact ID: `10292350854`
- SHA-256: `4f828e0691667d8294dd72b437d6534ac6d5ddb752ec29afec7b7897f8da4cc7`
- Files: `desktop-camera.png`, `android-camera.png`
- Both screenshots were visually inspected after download and are real, nonblank rendered game frames with the GB2 hero and camera HUD visible.

## Harness corrections made during 17C-3

The first combined world/decor/camera proof was too expensive under the GitHub-hosted software-WebGL runner. The harness was therefore corrected rather than weakening the product checks:

1. Desktop and Android production streaming were split into separately bounded tests.
2. Production decor readiness remained a real wait on the actual delayed stream.
3. Camera validation was moved to a separate real-browser proof so it no longer competes with the full decoration stream.
4. Direct CI-only `cameraCenter()` and `cameraCycle()` hooks were added to avoid Selenium DOM-click stalls while exercising the same production camera functions.
5. Camera proof now requires one real rendered screenshot per target rather than restaging multiple heavy views already covered by the streaming/landmark gate.

These are validation-harness changes; they do not change the production camera distances, CENTER behavior, terrain routes, or production streaming contract.

## Locked 17C-3 guarantees

Do not regress the following in later Pass 17 work:

- Camera zoom distances remain **12.8 / 16.2 / 20.0** unless deliberately re-approved.
- CENTER restores pitch **0.18** and returns behind the player.
- Desktop and Android both retain camera controls.
- Main route remains at least the current **334-sample** validated coverage with zero failures.
- Optional/mastery routes remain at least the current **441-sample** validated coverage with zero failures.
- Production scene streaming must reach 5 enemies plus terrain, concept landmarks, Portal Meadow and decor with no stream error.
- The canonical Crystal Library portal remains separate from this checkpoint and is not declared fully certified here.

## Next checkpoint

**PASS 17C-4 — COMBAT / PRISM BREAKER**

Next work should certify the primary power loop and combat feedback without reopening the now-green world/camera/streaming work except where a later change genuinely touches those systems.
