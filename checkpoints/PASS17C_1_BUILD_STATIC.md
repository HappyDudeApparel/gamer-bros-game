# PASS 17C-1 — Build / Static Checkpoint

Status: **GREEN**

Certified runtime/source head: `901818feacb15e4e37a19c25d593f5dad8864faa`
Branch: `pass17-concept-match`
Workflow run: `34672613836` — Build + Validate Pass 17C Production Gate

## Scope of this checkpoint

This checkpoint certifies only the rebuild/static layer. It does **not** certify the combined browser/end-to-end step, portal sequence, combat behavior, title layout, or production promotion.

## Passed checks on the certified head

- Repository checkout: PASS
- Rebuild locked Pass 17B production foundation: PASS
- Apply Pass 17C portal/combat/diagnostics patch: PASS
- JavaScript syntax + locked production marker validation: PASS
- Browser dependency setup: PASS

The later combined desktop/Android end-to-end browser step failed/timed out after these checks. That later failure does not invalidate this static checkpoint; it is intentionally deferred into smaller controlled checkpoints.

## Frozen rebuild sequence

1. `python scripts/build_pass17a.py`
2. `python scripts/fix_pass17a_bridge.py`
3. `python scripts/fix_pass17a_clover.py`
4. `python scripts/build_pass17b.py`
5. `python scripts/patch_pass17_concept_hero.py`
6. `python scripts/patch_pass17_camera.py`
7. `python scripts/patch_pass17_meadow.py`
8. `python scripts/patch_pass17c.py`

## Portal scope decision

The canonical Crystal Library v2 portal is not a blocker for the concept-match production pass. For now the large Prism Ridge / Portal Court shrine from the approved concept pack is the visual finish target. Canonical portal transmission can be reintroduced or swapped later after the world/title/gameplay presentation is locked.

## Next controlled checkpoint

**PASS 17C-2 — Title / Startup**

Limit scope to:
- Android portrait title layout
- Android landscape title layout
- visible GB1 / GB2 hero cards and selection state
- PLAY button inside viewport / thumb-friendly
- title → game startup for both heroes
- no fatal boot errors
- startup timing sanity
- proof screenshots

Do not combine 17C-2 with world traversal, combat, or portal testing.
