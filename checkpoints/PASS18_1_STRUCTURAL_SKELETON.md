# PASS 18-1 — WHOLE-MAP STRUCTURAL SKELETON

Status: **COMPLETE / GREEN**

This checkpoint certifies the low-detail structural geography for Prism Valley V2. It does **not** certify final art density or full concept resemblance; those remain later visual gates.

## Branch safety

- Active rebuild branch: `pass18-rebuild`
- Production/live branch: `main`
- Production baseline remains Pass 17C at `97834f6d21e0d4e6af0d9d36ad355215126ceda0`.
- `main` was not modified during 18-1.

## Validated implementation head

- `d01a65cf082c9b3fca94d70ad6f9e9e28632f620` — strengthened Prism Ridge structural silhouette and final spawn sightline framing.

## Controlling authored files

- `data/pass18/world-skeleton.json` — A→F structural map manifest, routes, river, sightlines and fixed review cameras.
- `src/pass18/world-skeleton.js` — clean manifest-driven structural runtime using the Pass 18 AssetRegistry and spatial index.
- `pass18-skeleton/index.html` — browser proof surface with fixed structural review views.
- `scripts/test_pass18_1_skeleton.py` — desktop + Android-landscape structural validation.
- `.github/workflows/validate-pass18-1-skeleton.yml` — read-only CI gate.

There is no generated-world JavaScript and no Pass 18 patch-script stack.

## A→F geography locked at structural level

1. **A — Portal Meadow** at approximately elevation 1.6.
2. **B — Creek Crossing** at approximately elevation 0.7.
3. **C — Riverworks** at approximately elevation 1.8.
4. **D — Clover Cliffs** at approximately elevation 6.5.
5. **E — Ruin Courtyard** at approximately elevation 10.5.
6. **F — Prism Ridge** at approximately elevation 17.0.

The resulting map establishes the intended valley progression: open spawn meadow → creek crossing → ravine-side Riverworks → climbing Clover shelves → elevated ruins → ceremonial Prism Ridge destination.

## Structural content

- **35** real terrain-module placements.
- **12** real structural landmark placements.
- **20** unique real asset sources loaded in the browser proof.
- **47** visible-asset collision records derived from the placed visible assets; no unrelated invisible helper floor was introduced.
- River/gorge course: **13 points / 12 rendered segments** with five designated drop/waterfall transitions.
- Structural route network: **6 routes**.

The low-detail river ribbon is a deliberate structural representation of the already-approved custom water family. It is not the later final water/waterfall art pass.

## Route validation

### Main route

- Length: **98.87 world units**.
- Longest authored segment: **6.44 units**.
- Maximum grade: **0.4767**.
- Allowed structural maximum: **0.48**.
- Result: **PASS**.

The first validation correctly rejected a 0.50 final-ridge grade. The ridge ascent was redistributed rather than weakening the test, and the final route now passes below the frozen limit.

### Optional routes

- Spring Shortcut: 24.43u, max grade 0.291, reconnect distances 2.84u / 5.10u within 6u tolerance.
- Pipe Loop: 23.79u, max grade 0.080, reconnects directly to the main route.
- Clover High Mastery Route: 25.76u, max grade 0.4366, reconnect distances 2.02u / 1.17u within 5u tolerance.
- Ruin Lower Bypass: 22.33u, max grade 0.3395, reconnects directly.
- Ruin High Route: 23.11u, max grade 0.506, reconnect distances 0u / 0.08u within 5u tolerance and below its intentionally steeper 0.72 mastery allowance.

All six route contracts passed in both browser targets.

## Sightline validation

Three structural sightline contracts are authored in the manifest:

- Portal Meadow → Prism Ridge destination read.
- Clover high route → lookback over earlier valley.
- Prism Ridge → lookback across most of the valley.

Final Portal Meadow → Prism Ridge contract:
- distance: **77.49u**;
- budget: **90u**;
- desktop and Android: **inside the fixed spawn-camera frustum**.

Final Prism Ridge lookback contract:
- distance: **65.03u**;
- budget: **75u**;
- desktop and Android: **inside the fixed ridge-camera frustum**.

The first green proof was not accepted merely because the target point was mathematically in-frustum. Screenshot review showed oversized near labels and a weak distant ridge read. The proof presentation was then corrected by reducing/hiding near debug labels in section views, centering the spawn sightline, and strengthening the real Prism Ridge gate/platform silhouette. The final screenshots were inspected again before this checkpoint was certified.

## Final automated proof

Workflow: `Validate Pass 18-1 Structural Skeleton`

- Run: `34686731568`
- Job: `103534922403`
- Head: `d01a65cf082c9b3fca94d70ad6f9e9e28632f620`
- Conclusion: **SUCCESS**
- Proof artifact: `10295114583`
- Artifact digest: `sha256:263685f061b5b79e4babd4650763cbcd98ff3914457b52be4e90179c2647ea19`

Desktop proof:
- A→F: PASS
- 35 terrain / 12 landmarks / 12 river segments
- main route 98.9u / max grade 0.477
- 20 unique asset sources
- 96 render calls / 5,833 triangles in overview
- zero registry failures / zero severe browser errors

Android-landscape proof:
- A→F: PASS
- same route/geography contracts
- 96 render calls / 5,833 triangles in overview
- fixed spawn-to-ridge and ridge-lookback sightlines pass
- zero registry failures / zero severe browser errors

SwiftShader/browser proof numbers are regression instrumentation, not claims about physical-phone frame rate.

## Visual review verdict

**Accepted for structural fidelity only.**

The final overview clearly establishes the long A→F valley progression and rising elevation hierarchy. The final spawn view no longer has the near-section debug labels obscuring the valley; Riverworks/Clover/Ruins step upward through the middle distance and the enlarged real gate/platform mass at Prism Ridge produces a distinct high destination silhouette. Android landscape preserves the same structural read despite the debug panels.

This checkpoint deliberately remains sparse and blockout-like. It is not permission to call the finished world visually matched to the concept pack.

## Explicitly deferred

18-1 did not:
- perform the art-density/decor pass;
- build the Golden Slice;
- add final Riverworks pipe composition;
- add final water/waterfall shaders;
- integrate the player/controller into this structural proof;
- build the in-browser placement tool;
- alter production `main`.

## Next checkpoint

**18-1B — In-browser placement tool**

Next work should provide a filterable real-asset palette; place/move/rotate/scale/delete; grid and vertical snapping; scatter tools for vegetation/rocks; fence/path polyline authoring; chunk JSON export; and approved-camera capture, all on top of the clean Pass 18 registry + manifest architecture.

Do not begin 18-1B until the user gives the next GO.
