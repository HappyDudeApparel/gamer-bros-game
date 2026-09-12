# Start here — new Claude Code window bootstrap

If you are a fresh Claude Code session picking up this project: **do not
reread the full Pass 17/18 conversation history, do not rebuild or
recompose the Golden Slice, and do not restart asset-kit research from
scratch.** All of that has already happened and its conclusions are
captured in the durable files below. Re-deriving it wastes a long context
window on facts that are already settled.

Read, in this order:

1. **`PRISM_KIT_COORDINATION.md`** — live low-bandwidth handoff channel
   between Claude Code and ChatGPT. Read the latest status before doing
   meaningful work and update it after a meaningful checkpoint so the
   user does not have to relay long reports between agents.
2. **`PRISM_KIT_HANDOFF.md`** — current branch, current toolchain state,
   what's actually built vs. not, the one manual step still open
   (canonical reference images), and the immediate next task.
3. **`PRISM_KIT_RULES.md`** — the rules you must not violate (never build
   a bigger thing to test a smaller one; technical green is not visual
   green; no self-certified visual approval; two-round kill switch; the
   failure-class table your pipeline already implements).
4. **`PRISM_KIT_PLAN.md`** — why the pivot away from the Nature Kit
   happened, why Blender was ruled out in favor of pure Node/Three.js,
   what Pass 18 code survives as reusable vs. reference-only, and the
   M0-M7 milestone ladder.

You are almost certainly resuming at **M1: build the Overhang asset.**
`PRISM_KIT_HANDOFF.md`'s "What does NOT exist yet" section says exactly
what M1 needs to create. Run `npm run prism:doctor` first to confirm the
toolchain in *your* container still checks out (it should auto-repair
anything project-local, like a chromedriver-version mismatch, on its own).

Do not skip to M2+ before M1 has passed an actual visual comparison
against `references/prism-valley/` (if those reference images still
aren't there, that is the actual first blocker — say so, don't improvise
around it).

Before stopping or handing back to the user, update
`PRISM_KIT_COORDINATION.md` with the concise current state, proof paths,
blocker/decision, and next action. Keep it short; do not paste logs.

`PRISM_KIT_COORDINATION.md`, `PRISM_KIT_HANDOFF.md`,
`PRISM_KIT_RULES.md`, and `PRISM_KIT_PLAN.md` are the authoritative state.
If anything in an old chat transcript or a code comment contradicts them,
these files win.
