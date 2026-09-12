# PASS 18-0A — REAL ASSET ACQUISITION + KIT AUDIT

Status: **COMPLETE / GREEN**

Production baseline remains untouched:
- `main`: `97834f6d21e0d4e6af0d9d36ad355215126ceda0`

Active rebuild branch:
- `pass18-rebuild`

## Certified import

GitHub Actions workflow:
- Name: `Import reusable world assets`
- Run: `34679720690`
- Trigger head: `250fb2fe052bec869a5e664584d4fea8e1e61eb8`
- Conclusion: **SUCCESS**
- Generated asset commit: `c9cab92b0ff6c85c3248d92eaee316e89c2437d8`

The workflow committed to `pass18-rebuild` only. It did not modify `main`.

## Verified permanent library

Workflow counted **2,523 files / 84 MB** in `assets/world-kit` after import.

Verified usable 3D-file counts:
- Kenney Nature Kit: **329**
- Kenney Fantasy Town Kit: **167**
- Kenney Castle Kit: **76**
- Kenney Platformer Kit: **153**
- KayKit Platformer Pack: **370**
- KayKit Medieval Hexagon: **221**
- KayKit Dungeon Remastered: **203**

The workflow also hard-verified concept-critical files including:
- `kenney/nature-kit/bridge_stone.glb`
- `kenney/nature-kit/cliff_waterfall_rock.glb`
- `kenney/fantasy-town-kit/wall-arch.glb`
- `kenney/castle-kit/bridge-straight-pillar.glb`

Observed imported Nature vocabulary includes real modular cliff blocks/slopes/caves/corners/steps/tops/waterfall housings, stone/wood bridges, path and river tiles, fences, flowers, grass, rocks, bushes and extensive tree variants.

Observed Fantasy Town vocabulary includes real walls/arches/broken walls, stone and wood stairs, fences, planks/poles, lanterns, watermills and other support architecture.

Observed Castle vocabulary includes bridge/gate structures, banners/flags, stone stairs, towers and modular walls.

## Source/reproducibility decision

Kenney's official asset pages remain the canonical source/license references. Their page HTML did not expose stable ZIP links suitable for CI, so the Pass 18 workflow uses the independently verified public CC0 `shorepine/kenney` mirror as the reproducible delivery path for Nature, Fantasy Town and Castle. The already-vendored Kenney Platformer and KayKit Platformer packs are preserved and verified rather than destructively replaced through unstable download endpoints.

`assets/world-kit/SOURCES.md` and `catalog.json` were updated accordingly.

## No-bandaid / asset-mining gate

`ASSET_DECISIONS.md` is now controlling for Pass 18 asset decisions. No custom geometry may be committed without a documented search of the approved packs and a reason no real asset fits.

Known correction carried forward: Pass 17's custom Riverworks pipe kit is not the Pass 18 source. KayKit Platformer already contains the real pipe family and supporting structures.

## Exit condition

18-0A is GREEN because the approved asset sources are no longer hypothetical: the required kits are committed on the isolated rebuild branch, reproducibly importable, counted, and spot-checked for the specific terrain/bridge/ruin vocabulary needed by the approved Prism Valley concepts.

## Next checkpoint

**18-0B — Look Calibration**

Do not begin 18-0B until the user explicitly says GO.
