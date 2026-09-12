# PASS 18 STATUS

Active branch: `pass18-rebuild`
Production branch: `main` (DO NOT MODIFY during rebuild)

## Current checkpoint

**18-0A — Real asset acquisition + kit audit**

Status: **IN PROGRESS**

Started from production baseline:
- `main` / Pass 17C: `97834f6d21e0d4e6af0d9d36ad355215126ceda0`

Pass 18 branch created from that baseline.

### Work completed so far

- Created isolated `pass18-rebuild` branch.
- Hardened `.github/workflows/import-world-assets.yml` so Pass 18 asset imports commit back only to the active branch instead of pushing to `main`.
- Added concurrency/cancel protection for stale asset-import runs.
- Added approved Pass 18 imports:
  - Kenney Nature Kit (CC0)
  - Kenney Fantasy Town Kit (CC0)
  - Kenney Castle Kit (CC0)
- Preserved existing Kenney/KayKit permanent asset sources.
- Added hard workflow checks that the required 3D packs actually contain GLB/GLTF content before the import is considered successful.
- Seeded durable recovery instructions in `PASS18_START_HERE.md`.

### Current branch commits of note

- `b5762bee61b3aecdac9bfeb1f549fc45c2c9a69a` — Pass 18-0A asset import workflow expansion.
- `8b5725d654564c2df66b7334b6323180c232f615` — durable Pass 18 recovery/control instructions.

### What is NOT yet certified

18-0A is not green until the asset-import workflow has actually run successfully and the new kits are committed/verified on `pass18-rebuild`.

## NEXT TASK

**Finish 18-0A only:**
1. Add/verify `ASSET_DECISIONS.md`.
2. Observe the Pass 18 asset import workflow triggered by the workflow change.
3. Repair import logic if any official source download fails.
4. Verify the actual committed Nature/Fantasy Town/Castle files and source metadata on `pass18-rebuild`.
5. Update this file to `18-0A COMPLETE / GREEN` with the exact final branch SHA and verified file/model counts.
6. Stop. Do NOT begin 18-0B without the user's next GO.

## Exact recovery command

> Resume Gamer Bros Pass 18 from `PASS18_START_HERE.md` and `PASS18_STATUS.md` on branch `pass18-rebuild`. Do not touch `main`. Execute only the NEXT TASK recorded in `PASS18_STATUS.md`, preserve the no-bandaid rules, update the status/checkpoint files before stopping, and report the exact branch SHA.
