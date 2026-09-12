# PASS 17C-4 — COMBAT / PRISM BREAKER

**Status:** COMPLETE / GREEN  
**Branch:** `pass17-concept-match`  
**Certified candidate head:** `813acec3ea149951697d2cf36554219f98dd500f`  
**Certified:** 2026-09-12  
**Promotion to `main`:** NOT YET — Pass 17 remains isolated until the remaining 17C production gates are complete.

## What this checkpoint certifies

Pass 17C-4 certifies the current concept enemy combat loop and the primary **Prism Breaker** power on both desktop and Android. The browser gate exercises the production enemy state machine and production Prism Breaker update/projectile/collision functions, while deterministic CI stepping removes software-WebGL wall-clock stalls from the verdict.

## Successful validation

Source workflow run: `34675487226` — **Validate Pass 17C-4 Combat + Prism Breaker** — **SUCCESS**.

Both target gates passed:

- Desktop hostile + Prism Breaker gate: **GREEN**
- Android hostile + Prism Breaker gate: **GREEN**
- Main route remained **334 samples / PASS**
- Optional/mastery routes remained **441 samples / PASS**
- Five enemies were available at combat startup.

## Hostile enemy sequence

The first concept enemy was staged at real contact range and the production enemy `update()` state machine was advanced in fixed 40 ms slices.

Both desktop and Android observed the full sequence:

`patrol -> alert -> windup -> lunge`

The windup telegraph became visible before the lunge. Contact damage then changed the player from **5 hearts to 4 hearts**, and the HUD changed from `♥♥♥♥♥` to `♥♥♥♥♡`.

This certifies that the rounded concept enemy family is not merely decorative: alert, attack telegraph, lunge and contact damage remain functional.

## Prism Breaker sequence

The same live enemy began with **2 HP**.

The first shot was charged to **1.0 / full charge** and hit through the production Prism Breaker projectile/collision path:

- Enemy HP: **2 -> 1**
- Enemy state after hit: **hit**

After cooldown and restaging, a second lower-charge shot was fired:

- Second charge: approximately **0.324**
- Enemy HP: **1 -> 0**
- Enemy state: **dead**
- Living enemies: **5 -> 4**

The production kill callback awarded:

- Coins: **0 -> 2**
- Gems: **0 -> 1**
- Coin HUD: **2**
- Gem HUD: **1**

The player remained at **5 hearts** during the isolated Prism Breaker kill test after the hostile-contact subtest was reset.

## Visual proof

Artifact:

- Name: `pass17c4-combat-proof`
- Artifact ID: `10292795495`
- SHA-256: `89b1fc1ad2e6acc262b96960f8abaa5a9ee626f6a408b3eb657088dd353ef659`
- Files: `desktop-combat.png`, `android-combat.png`

Both screenshots were downloaded and visually inspected. They are real, nonblank rendered game frames showing GB2, the concept enemy, mobile/game controls and the post-kill HUD state of **2 coins / 1 gem**. The Android proof also visibly shows the `ENEMY DOWN · +2 COINS · +1 GEM` feedback toast.

## Harness correction discovered during validation

The first real-time hostile probe reached `windup` with its telegraph visible but remained there long enough for the GitHub-hosted software-WebGL runner to hit a wall-clock timeout. That was a renderer timing artifact, not a missing state transition.

The gate was corrected to advance the same production `enemies.update()` and `power.update()` functions in deterministic 40 ms slices. No enemy transition, damage calculation, projectile collision, HP rule, reward callback or production control was replaced. This makes the checkpoint deterministic while still testing the actual gameplay code.

## Locked 17C-4 guarantees

Do not regress the following without deliberate re-approval:

- Concept enemies retain alert -> windup/telegraph -> lunge -> contact-damage behavior.
- A successful enemy contact removes one heart under the tested clean-cooldown condition.
- Standard concept enemies remain **2 HP** unless deliberately rebalanced.
- Prism Breaker retains charge/release behavior and can reach full charge.
- A direct Prism Breaker hit reduces enemy HP through the production collision path.
- Enemy death reduces the living enemy count and awards **+2 coins / +1 gem** through the production kill callback.
- Coin and gem HUD values update with the reward.
- Desktop and Android both retain the combat loop.
- Main and optional route validation remain green at the current **334 / 441** sample coverage.

## Next checkpoint

**PASS 17C-5 — CANONICAL CRYSTAL LIBRARY PORTAL / TRANSMISSION**

The next checkpoint should certify the untouched canonical tube/portal path end-to-end: warmup, readiness, entry conditions, transition/transmission behavior, failure handling, and desktop/Android proof. After that, the remaining work should be the final integrated performance/mobile/production promotion gate before `main` is touched.
