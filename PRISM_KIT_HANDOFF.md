# Prism Kit — Handoff (current state)

Read this file first in any new session. It is kept current — if it
disagrees with something in `PRISM_KIT_PLAN.md` or a stale comment
somewhere, this file wins for "what's the state right now."

## Branch / environment facts

- Branch: `pass18-prism-kit`, created from `pass18-rebuild` @ `af450c406ed027bb7ada68124599a10ccc55bae3`.
- `pass18-rebuild` is preserved untouched as the historical/calibration
  branch (Golden Slice terrain rebuild + Nature Kit calibration rounds
  1-2, capped at ~62/100 resemblance — see that branch's
  `src/pass18/calibration-diorama.js` if you need the numbers again, but
  you should not need to re-derive them).
- `main` has not been touched by any of this work.
- **This runs in an ephemeral remote cloud container, not a local Windows
  PC.** There is no `D:` drive. All paths are repo-relative. Every future
  session may run in a *different* fresh container — nothing outside this
  git repository persists between sessions. If a past instruction assumed
  a persistent local machine, that assumption was wrong and has been
  corrected in this handoff.

## Local toolchain (verified working, this session)

- Node v22.22.2, Python 3.11.15, Git 2.43.0 — all present.
- Chromium 141.0.7390.37 at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
  (pre-installed in this container image; a future container should have
  the same or a documented equivalent — `npm run prism:doctor` checks
  this and a `PRISM_CHROME_BINARY` env var can override the path).
- chromedriver: **not** pre-matched to Chromium. `npm run prism:doctor`
  auto-downloads a matching version into `.prism-cache/tools/chromedriver`
  from `storage.googleapis.com/chrome-for-testing-public/...` and caches
  it by version — this is now fully automated, do not redo it by hand.
- selenium 4.49.0 (Python) — present.
- Blender — **not installed, not required.** See the "skip Blender"
  correction in `PRISM_KIT_PLAN.md`. Do not spend time installing it
  unless a specific, already-attempted-in-pure-Three.js asset genuinely
  requires it.
- `vendor/three/addons/exporters/GLTFExporter.js` — vendored this session
  (r123, import rewritten to `from 'three'` to match `GLTFLoader.js`'s
  existing convention). Use this for exporting any procedurally generated
  Three.js geometry to `.glb`.
- Reachable hosts from this container's egress proxy:
  `storage.googleapis.com`, `registry.npmjs.org`, `raw.githubusercontent.com`.
  Blocked: `unpkg.com`, `cdn.jsdelivr.net`, `googlechromelabs.github.io`
  (403 / connect_rejected). If a future fetch needs a CDN asset, try the
  reachable hosts first.

## M0 status: COMPLETE and verified working

Ran in this session, actually executed (not just written):

- `npm run prism:doctor` — full pass, wrote `.prism-cache/doctor-report.json`.
- `npm run prism:build -- overhang` — correctly stopped at `GENERATE`
  with an honest "not yet implemented" message, Class 5
  (`ARCHITECTURAL_UNKNOWN`), and wrote a failure capsule. This proves the
  pipeline's core promise — it never fakes success — works end to end.
- `npm run prism:clean` — removed `.prism-cache/` only, left
  `assets/prism-kit/`, `proof/prism-kit/`, `references/prism-valley/`
  untouched.

Files: `tools/prism-kit/cli.mjs`, `tools/prism-kit/lib/{paths,doctor,pipeline,stages}.mjs`.
See `PRISM_KIT_RULES.md` section 6 for the failure-class table these
implement.

## What does NOT exist yet (this is the actual next task)

- No `tools/prism-kit/assets/overhang/` directory and no
  `generate.mjs` / `export.mjs` / `validate.mjs` / `render.mjs` /
  `metrics.mjs` for it. **This is M1 and is reserved for the next
  session** — it was explicitly and repeatedly excluded from this one.
- No Prism Kit asset catalog/registry code yet (M2+, once there's more
  than one asset to place).
- No `src/prism-preview/` scene yet — this is where M1's Overhang (and
  later M2's terrain family) should be viewed in isolation, mirroring the
  calibration-diorama pattern on `pass18-rebuild` but as a *fresh* file
  for the custom kit, not a copy-paste of that one.

## Canonical visual references: ONE MANUAL STEP STILL NEEDED

`references/prism-valley/` exists but is empty except for a README
explaining exactly what's missing. Verified directly (filesystem search,
this session): no copy of the Prism Valley / Creek Crossing concept
images exists anywhere in this container or repo, and there is no
mechanism for this tooling to pull image bytes out of a previous chat
turn. See `references/prism-valley/README.md` for the exact two filenames
needed. **Do not fabricate these images or proceed with a visual approval
without them** — M1's `VISUAL-REVIEW-STOP` gate needs something concrete
to compare against.

## Current milestone: M0 done, M1 not started

Next task for whoever (human or Claude) picks this up: M1 — author
`tools/prism-kit/assets/overhang/generate.mjs` (build the Overhang
geometry procedurally in Three.js) through the full stage chain, then
stop at `VISUAL-REVIEW-STOP` for a real human comparison against
`references/prism-valley/`. See `PRISM_KIT_PLAN.md`'s M1 section and
`PRISM_KIT_RULES.md` rules 1-5 before starting.
