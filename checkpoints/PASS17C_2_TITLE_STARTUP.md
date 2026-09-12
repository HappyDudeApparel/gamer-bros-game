# Pass 17C-2 — Title / Startup Checkpoint

Status: GREEN

Certified source head: `d3254e225b3728faa8279cb0ae6d8acd00466b39`
Workflow: `Validate Pass 17C-2 Title + Startup`
Workflow run: `34673458473`
Workflow conclusion: SUCCESS

## Scope

This checkpoint intentionally covers only title-screen composition and startup. It does not certify world traversal, combat, or portal behavior.

## Certified checks

- Android portrait title layout: PASS
- Android landscape title layout: PASS
- GB1 card visible and selectable: PASS
- GB2 card visible and selectable: PASS
- Exactly one selected hero state: PASS
- PLAY button fully visible/usable in both phone orientations: PASS
- Title -> gameplay navigation: PASS
- GB1 gameplay startup: PASS
- GB2 gameplay startup: PASS
- Correct selected hero reaches runtime: PASS
- Fatal startup screen absent: PASS
- Gameplay HUD present and boot overlay dismissed: PASS
- Static title/runtime syntax and marker checks: PASS
- Proof screenshots uploaded as workflow artifact: `pass17c2-title-startup-proof`

## Measurements from green run

- Android portrait effective viewport: 412 x 772
- Android landscape effective viewport: 915 x 269
- GB1 title-to-ready wall time: 4.08 s
- GB1 runtime startup marker: 1058 ms
- GB2 title-to-ready wall time: 4.13 s
- GB2 runtime startup marker: 1048 ms

## Test repair note

The first narrow 17C-2 run failed only because the test looked for a nonexistent `#hud` id. The actual runtime uses `.hud`. The assertion was corrected to require the real HUD plus a dismissed `#boot` overlay. The corrected run then passed the full 17C-2 checkpoint.

## Portal scope decision

The canonical Crystal Library portal is not a blocker for the current concept-match rebuild. For now, the large Prism Ridge / Portal Court structure from the approved concept art is the visual finish target. Portal implementation can be revisited after the visual/world checkpoints are locked.

## Next checkpoint

Pass 17C-3 — World / Camera / Streaming

Planned scope:
- continuous terrain and main/optional route validation
- Portal Meadow dressing
- Riverworks and ruin concept landmarks
- streamed decor and enemy family readiness
- scenic gameplay camera
- three zoom modes
- CENTER camera behavior
- desktop + Android proof screenshots

Do not promote to `main` on the basis of this checkpoint alone.
