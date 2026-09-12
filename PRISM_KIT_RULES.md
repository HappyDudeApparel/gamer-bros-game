# Prism Kit — Durable Rules

These rules govern every future Prism Kit session (this one and all that
follow). They are load-bearing, not advisory. If a rule below and a
request in conversation conflict, stop and say so rather than silently
picking one.

## 1. Never build a bigger thing to find out whether a smaller thing works

Progression is strictly:

```
one asset -> one compatible family -> one tiny diorama -> one world section -> whole world
```

Never skip a rung. Never build the next rung "to see how it looks" before
the current rung has passed its own visual gate. This is the single
biggest lesson of Pass 17 (a giant procedural hillside built before anyone
confirmed the terrain language worked at all) and Pass 18's Nature Kit
ceiling (a full Golden Slice recomposed repeatedly before anyone confirmed
the *asset library itself* could ever reach the target style — it
couldn't, topping out at 62/100 across two full calibration rounds).

## 2. Technical green never substitutes for visual green

A pipeline stage passing (glTF valid, render didn't crash, CI green) is a
technical fact. It says nothing about whether the result looks like it
belongs in the same finished game as the Prism Valley concept art. Never
report an asset or scene as "done" on technical grounds alone. The
`VISUAL-REVIEW-STOP` pipeline stage exists specifically so this can never
be skipped by accident — it structurally returns `PENDING_HUMAN_REVIEW`
and nothing in the pipeline can override that.

## 3. No self-certified visual approval

Claude (this session or any future one) never marks a `VISUAL_APPROVALS.md`
entry, or any equivalent gate, green by itself. Visual approval requires an
actual side-by-side comparison against `references/prism-valley/`,
reviewed by a human or by an independent audit turn that is explicitly
tasked with skepticism — never the same turn that built the asset.

## 4. Two-round kill switch per major visual family

For any single visual technique or asset family (a palette treatment, a
lighting rig, a modeling approach for a class of asset), at most **two**
bounded, serious prototype rounds are allowed before a kill switch: stop,
report the ceiling honestly, and either change approach or escalate to the
user. This is what stopped the Nature Kit calibration at two rounds
(45 -> 62/100) instead of grinding a third and fourth round on a library
that was never going to get there. It applies equally to the custom kit —
if an Overhang modeling approach doesn't work in two rounds, don't try a
third variation of the same idea; change the idea.

## 5. Default visual acceptance targets (decision aids, not proof)

- Silhouette resemblance >= ~80/100 where silhouette is the asset's main
  gameplay/readability function (terrain tiles, the Overhang, bridges).
- Color/material resemblance >= ~75/100.
- Overall: the result must plausibly belong to the **same finished game**
  as the concept art — a holistic human judgment call, not a weighted sum
  of the two numbers above.

These numbers exist so "is this good enough" has a shared vocabulary. They
are never a substitute for actually looking at the image next to the
reference. A 90/90 score on a scene that "feels wrong" is a fail; a 70/70
scene that unmistakably reads as the same game may be a conditional pass.

## 6. Failure taxonomy (used by `tools/prism-kit/lib/pipeline.mjs`)

| Class | Meaning | Allowed action |
|---|---|---|
| 1 | Safe mechanical (missing project-local dir, etc.) | Auto-repair, retry (max 2) |
| 2 | Code/build (assertion, validator, schema failure in code just written) | Claude Code inspects the diagnosed error, makes **one bounded targeted source fix**, then resumes/re-runs. Never a blind identical rerun, never weakening or suppressing the failing validator/test to get green. |
| 3 | Tool/environment (missing dependency, version mismatch) | Safe project-local or user-local repair may be automated (e.g. downloading a matched chromedriver into `.prism-cache/`); anything system-wide, destructive, or ambiguous **stops and asks once** |
| 4 | Visual failure | A bounded visual correction **within the current prototype round** is allowed — fix it, render again. It never auto-declares success, and each such round counts toward the two-round kill switch in Rule 4. |
| 5 | Architectural/unknown | **Stop immediately.** Write a failure capsule. Never improvise a new architecture silently. Escalate. |

Retries are capped at 2 per stage and must be gated on a *diagnosed*
change — never a blind identical rerun. `classifyFailure()` in
`pipeline.mjs` is the single source of truth for this classification;
extend it there, not ad hoc in a stage script.

**What the pipeline/checkpoint system is for, and what it is not for:**
the checkpoint (`.prism-cache/<asset>/state.json`) preserves *state* —
which stages already succeeded, so a resume doesn't redo finished work.
It does not, and cannot, perform diagnosis or repair by itself. For every
Class 1-4 failure, Claude Code is the one that reads the actual error,
decides what changed, and edits the actual source (a generator script, a
validator, a material treatment) before the next attempt — the pipeline
only enforces the retry cap, the skip-on-resume boundaries (Rule 7), and
the capsule-on-give-up. A rerun with no source change between attempts is
never a valid use of the retry budget.

## 7. Checkpoints and resume never bypass validation

`GENERATE`, `EXPORT`, `RENDER-DESKTOP`, and `RENDER-ANDROID` are the only
stages a checkpoint can mark skippable on resume. `VALIDATE-ASSET` and
`VISUAL-REVIEW-STOP` always re-run (or in the latter case, always
re-report `PENDING_HUMAN_REVIEW`) — resume must never let a stale
checkpoint fake a validation pass or a visual approval.

## 8. Disk hygiene

One canonical repo. Canonical directories only:
`tools/prism-kit/`, `assets/prism-kit/`, `src/prism-preview/`,
`references/prism-valley/`, `proof/prism-kit/`. Disposable state lives
*only* in `.prism-cache/` (gitignored — checkpoints, failure capsules, the
downloaded chromedriver). Never create `_v2`, `_final`, `_REAL_backup`,
`_fix3`-style duplicate directories or files — if something needs
revising, revise it in place under version control, or delete the
abandoned attempt outright (`npm run prism:clean` removes `.prism-cache/`
specifically for this reason).

## 9. Branch discipline

`main` is never touched by Prism Kit work. `pass18-rebuild` is preserved
as the historical/calibration branch (Golden Slice terrain rebuild +
calibration diorama rounds 1-2) — do not delete it, do not add new Prism
Kit commits to it. All Prism Kit work happens on `pass18-prism-kit`.

## 10. Commit discipline

Commit scripts, durable docs, and necessary config. Never commit
disposable renders, caches, downloaded driver archives, failed generated
assets, or debug output — those belong in `.prism-cache/` (gitignored) or
should simply not be committed at all.
