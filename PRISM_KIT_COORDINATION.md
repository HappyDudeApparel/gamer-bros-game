# Prism Kit — Shared Coordination Note

This file is the low-bandwidth handoff channel between Claude Code and ChatGPT for work on the Prism Kit.

## Purpose

The user should not have to copy/paste long status reports between agents. Both agents must read the latest version of this file before doing meaningful Prism Kit work, and update it after a meaningful checkpoint.

## Communication protocol

1. **One writer at a time.** Claude Code is the implementation writer unless the user explicitly changes that. ChatGPT is the independent reviewer/architect unless explicitly asked to write.
2. **Always read latest before editing.** Never overwrite a newer note from the other agent.
3. **Keep this file short.** Record only the current milestone, branch/HEAD, current decision, proof locations, blocker, and next requested action. Do not paste long logs or duplicate durable project docs here.
4. **Use Git for facts, not chat memory.** Branch/HEAD, source paths, proof paths, and test results should be concrete and verifiable.
5. **Visual proof must be reviewable.** For any visual gate, Claude must provide the current proof artifact path(s). In the private dev repo, minimal current proof images may be committed when needed for independent review. Do not accumulate endless render versions.
6. **No self-certified Visual Green.** Claude may report `PENDING_INDEPENDENT_REVIEW`; ChatGPT may independently recommend pass/fail after inspecting the proof. Final user approval remains controlling.
7. **No long user relay.** After this protocol is active, the user should be able to say only things like `check the shared note` or `Claude updated the note` rather than pasting reports.
8. **Conflicts:** if the two agents disagree, record the disagreement here in one or two sentences and stop expansion until resolved.

## Current project state

- Current public repo: `HappyDudeApparel/gamer-bros-game`.
- Current branch: `pass18-prism-kit`.
- Milestone: M0 complete; M1 Custom Overhang not started.
- **New permanent repo policy:** private-dev + public-release split.
- The existing public repo is now treated as release/public-output only.
- Proprietary concept art, internal proofs, generators, working notes, and ongoing Prism Kit development must move to a private development repo before M1 continues.

## Shared status

**Sequence:** 2

**Implementation owner:** Claude Code

**Current task:** PAUSED for private-dev migration. Do not start M1 and do not commit concept art to the current public repo.

**Visual target:** `1. TERRAIN -> OVERHANG` on the Prism Valley V2 asset/style sheet. The A–F world map is secondary context.

**Current gate:** M1 blocked only by private-dev migration / reference ingest.

## Latest Claude -> ChatGPT

_Pending handshake. Claude Code should acknowledge this file after the private-dev repo exists, include the private repo name, branch/HEAD, and confirm that the two concept images are visible there or in-session._

## Latest ChatGPT -> Claude

User approved the private-dev + public-release split. Pause M1. Do not commit the concept images or further proprietary working assets to the current public repo. Once the user creates an empty private development repo, migrate the current `pass18-prism-kit` development state there, establish this coordination note there, and continue M1 only from the private repo.

## User decision/blocker

User approved the private-dev + public-release architecture. One minimal manual action remains: create an empty PRIVATE GitHub repository (recommended name: `HappyDudeApparel/gamer-bros-game-dev`).

## Next action

User: create the empty private repo. Then tell Claude Code to migrate `pass18-prism-kit` development state into it and attach the two concept images in-session. Claude should update the PRIVATE repo's coordination note and stop using this public copy for internal handoffs.
