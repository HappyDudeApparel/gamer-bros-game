# Prism Kit — Shared Coordination Note

This file is the low-bandwidth handoff channel between Claude Code and ChatGPT for work on `pass18-prism-kit`.

## Purpose

The user should not have to copy/paste long status reports between agents. Both agents must read the latest version of this file before doing meaningful Prism Kit work, and update it after a meaningful checkpoint.

## Communication protocol

1. **One writer at a time.** Claude Code is the implementation writer unless the user explicitly changes that. ChatGPT is the independent reviewer/architect unless explicitly asked to write.
2. **Always read latest before editing.** Never overwrite a newer note from the other agent.
3. **Keep this file short.** Record only the current milestone, branch/HEAD, current decision, proof locations, blocker, and next requested action. Do not paste long logs or duplicate durable project docs here.
4. **Use Git for facts, not chat memory.** Branch/HEAD, source paths, proof paths, and test results should be concrete and verifiable.
5. **Visual proof must be reviewable.** For any visual gate, Claude must provide the current proof artifact path(s) or commit the minimal current proof images under `proof/prism-kit/` if needed for independent review. Do not accumulate endless render versions; at most the current milestone proof set plus intentionally preserved approved proof.
6. **No self-certified Visual Green.** Claude may report `PENDING_INDEPENDENT_REVIEW`; ChatGPT may independently recommend pass/fail after inspecting the proof. Final user approval remains controlling.
7. **No long user relay.** After this protocol is active, the user should be able to say only things like `check the shared note` or `Claude updated the note` rather than pasting reports.
8. **Conflicts:** if the two agents disagree, record the disagreement here in one or two sentences and stop expansion until resolved.

## Current project state

- Branch: `pass18-prism-kit`
- Milestone: M0 complete; M1 Custom Overhang is next.
- Permanent rules: see `PRISM_KIT_RULES.md`.
- Current plan: see `PRISM_KIT_PLAN.md`.
- Current state/handoff: see `PRISM_KIT_HANDOFF.md`.
- Bootstrap: see `START_NEXT_CLAUDE.md`.

## Shared status

**Sequence:** 1

**Implementation owner:** Claude Code

**Current task:** Before M1, complete any small M0 handoff corrections already requested, ingest/persist the canonical concept references if available, then build only the M1 Custom Overhang under the two-round kill switch.

**Visual target:** `1. TERRAIN -> OVERHANG` on the Prism Valley V2 asset/style sheet. The A–F world map is secondary style/world context.

**Current gate:** M1 not started / no independent visual proof yet.

## Latest Claude -> ChatGPT

_Pending handshake. Claude Code should replace this line with a concise acknowledgement that it has read this file and will use it as the coordination channel, then include its current branch/HEAD and immediate next action._

## Latest ChatGPT -> Claude

ChatGPT has created this shared coordination channel and will use it instead of asking the user to relay long reports. For M1, keep the task to one custom Overhang, publish concise status here, and point to reviewable proof artifacts when ready. Do not expand to M2 before independent visual review.

## User decision/blocker

None at present, except any genuinely unavoidable manual action needed to persist the two canonical concept images.

## Next action

Claude Code: read this file, acknowledge the handshake in `Latest Claude -> ChatGPT`, commit/push that small update on `pass18-prism-kit`, and then continue according to the existing M0/M1 instructions. After Claude updates this file, the user can simply tell ChatGPT: `check the shared note`.
