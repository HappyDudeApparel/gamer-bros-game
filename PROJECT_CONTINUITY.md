# GAMER BROS — PROJECT CONTINUITY

This file is the universal recovery entry point for this repository. It is intentionally not tied to Pass 18, Pass 19, or any future numbered stage.

## Natural-language recovery rule

If a future chat/window opens and the user says anything materially equivalent to:
- "continue"
- "where did we leave off?"
- "the last window crashed"
- "check where we were and proceed"
- "resume the game work"
- "keep going"

then do **not** require a magic phrase or ask the user to reconstruct prior work.

Instead:
1. Read `PROJECT_CONTINUITY.md`.
2. Read `CURRENT_WORK.md`.
3. Follow the branch, checkpoint and NEXT TASK recorded there.
4. Read any files listed under `Required context` in `CURRENT_WORK.md`.
5. Preserve the no-bandaid/no-regression rules.
6. Do not modify `main` unless `CURRENT_WORK.md` explicitly says promotion/deployment is authorized.
7. At the end of every completed checkpoint, overwrite `CURRENT_WORK.md` so this recovery path stays current even if the project later moves to Pass 19, 20, or a different naming system.

## Permanent engineering rules

- **No bandaid architecture.** If the underlying implementation is wrong, replace the module cleanly rather than stacking corrective patch scripts.
- **Keep proven systems, delete bad world architecture.** Existing good controller/camera/touch/combat/portal behavior may be retained; rejected terrain/world implementations are not sacred.
- **World content is data.** Runtime modules remain authored code; placements/routes/chunks live in JSON/manifests rather than Python-generated JavaScript.
- **Real assets first.** Search the approved vendored kits before authoring custom geometry. Record justified exceptions in `ASSET_DECISIONS.md`.
- **Visual claims require visual proof.** A browser boot, route test, marker name or green CI job cannot by itself prove concept resemblance.
- **Performance is architectural.** Use shared resources, instancing/batching, spatial chunking, LOD/far shells, culling and cheap atmospheric depth instead of making the world empty.
- **Durable checkpoints.** Each major step records what was really validated, exact commit/workflow evidence, known limitations and one next task.

## Universal status files

- `CURRENT_WORK.md` — always the authoritative current stage/branch/next task.
- `ASSET_DECISIONS.md` — asset/custom-geometry decisions.
- `VISUAL_APPROVALS.md` — approved/rejected visual baselines.
- `RECOVERY_MAP.md` — historical system lineage and rollback references; useful background, but `CURRENT_WORK.md` controls current work.
- `checkpoints/` — durable completed-stage records.

## Branch discipline

The active development branch can change over time. Never assume a branch name from an old chat. Read `CURRENT_WORK.md` first.

Production/live should remain isolated until the current project stage's promotion gate is explicitly satisfied.
