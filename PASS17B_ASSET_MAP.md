# Pass 17B — Approved Concept → Real Asset Map

Purpose: prevent silent downgrades. Every major visible element in the approved Prism Valley V2 concept pack must resolve to an existing repository asset, deliberately authored production geometry, or a new approved production asset.

## A. Terrain / Clover Cliffs
Status: AVAILABLE + authored continuous terrain.

Verified Kenney Platformer assets include:
- `block-grass-corner-low.glb`
- `block-grass-corner-overhang-low.glb`
- `block-grass-corner-overhang.glb`
- `block-grass-corner.glb`
- `block-grass-curve-half.glb`
- `block-grass-curve-low.glb`
- `block-grass-curve.glb`
- `block-grass-large.glb`
- `block-grass-long.glb`
- `block-grass-large-slope.glb`
- `block-grass-overhang-large.glb`
- `platform-ramp.glb`
- `spring.glb`

Production use:
- broad landmass = Pass 17 authored continuous visible/raycast terrain mesh
- cliff lips / overhang silhouettes / mastery shelves = Kenney grass assets
- no broad field of separate square recovery tiles

## B. Creek Crossing
Status: AVAILABLE.

- Kenney `platform-fortified.glb` for the fortified bridge silhouette
- authored visible sloped stone bridge deck for exact bank-to-bank traversal
- Kenney `spring.glb` for the approved shortcut
- Kenney trees / rocks / flowers for banks

Rule: the visible bridge deck is the collision surface. No transparent helper floor.

## C. Riverworks
Status: PARTLY AVAILABLE; signature pipe kit is deliberately authored production geometry.

Verified supporting KayKit Dungeon assets include:
- `floor_wood_large.gltf.glb`
- `floor_wood_small.gltf.glb`
- `wall_scaffold.gltf.glb`
- `wall_open_scaffold.gltf.glb`
- `wall_corner_scaffold.gltf.glb`
- `barrier.gltf.glb`
- `barrier_corner.gltf.glb`
- `barrel_large.gltf.glb`
- `barrel_small.gltf.glb`
- `crates_stacked.gltf.glb`
- `torch_lit.gltf.glb`

Missing as an existing verified pack family:
- the large blue-gray straight / elbow / junction pipes shown in the approved Riverworks concept.

Production decision:
- use `src/pass17-riverworks-kit.js` to create actual visible reusable straight pipes, elbows, T-junctions, collars, supports and walkways;
- pipe geometry uses a coherent blue-gray material language;
- it is production geometry, not an invisible or temporary collision proxy;
- the optional pipe loop uses visible walkable scaffold/deck geometry where a round pipe top would be poor traversal.

## D. Ruin Courtyard
Status: STRONGLY AVAILABLE from the verified KayKit Dungeon Remastered GLB directory.

Verified exact repo assets include:
- `wall.gltf.glb`
- `wall_arched.gltf.glb`
- `wall_archedwindow_open.gltf.glb`
- `wall_broken.gltf.glb`
- `wall_cracked.gltf.glb`
- `wall_corner.gltf.glb`
- `wall_crossing.gltf.glb`
- `wall_pillar.gltf.glb`
- `wall_doorway.glb`
- `wall_half.gltf.glb`
- `wall_sloped.gltf.glb`
- `column.gltf.glb`
- `pillar.gltf.glb`
- `pillar_decorated.gltf.glb`
- `stairs.gltf.glb`
- `stairs_narrow.gltf.glb`
- `stairs_wide.gltf.glb`
- `stairs_walled.gltf.glb`
- `rubble_half.gltf.glb`
- `rubble_large.gltf.glb`
- blue/red/green/yellow/white banner and patterned-banner variants
- `torch.gltf.glb`, `torch_lit.gltf.glb`, `torch_mounted.gltf.glb`
- `chest.glb`, `chest_gold.glb`

Important correction: do not reference unverified literal `arch.glb` or `bridge_8w.glb` names in this pack. The approved arch silhouettes will be composed from the verified arched-wall / doorway / pillar families above, while Creek Crossing retains the Kenney fortified bridge structure.

Production composition:
- central main gate / courtyard
- lower bypass under/around the center
- elevated broken-arch route
- high gold-chest reward
- torch/banner landmark language

## E. Prism Ridge
Status: AVAILABLE for terrain/ceremonial framing; canonical portal preserved.

- authored continuous high ridge
- verified KayKit walls / arched walls / pillars / stairs
- KayKit banners + torches
- Kenney vegetation / grass edge pieces
- crystal accents may use existing jewel geometry and deliberately authored emissive crystal clusters
- **canonical Crystal Library v2 portal/tube behavior and portal object remain unchanged**

## F. Nature / World Dressing
Status: AVAILABLE.

Kenney Platformer/Nature and KayKit Dungeon provide trees, bushes, grass, plants, flowers, rocks, trunks, rubble, barriers and signs.

Placement rule: dressing reinforces geography and route readability; it does not create fake walkability.

## G. Collectibles / Rewards
Status: AVAILABLE.

Verified examples:
- Kenney coins / jewels / chest
- KayKit Dungeon `coin.gltf.glb`
- `coin_stack_small.gltf.glb`
- `coin_stack_medium.gltf.glb`
- `coin_stack_large.gltf.glb`
- `chest.glb`
- `chest_gold.glb`

Concept-match rule:
- coins guide flow
- gems identify optional/mastery paths
- chests reward committed exploration

## H. Hero visual target
Status: CURRENT HERO FUNCTIONAL; concept visual match still requires production work.

Current GB1/GB2 systems remain the movement/animation foundation. Pass 17B target:
- more compact chibi silhouette
- stronger blond hair/headphones read
- brighter GB garment/colorway
- improved toy-like material finish
- preserve movement/camera/action integration

Do not claim the current hero exactly matches the approved concept until a side-by-side visual gate passes.

## I. Enemy visual target
Status: CURRENT ANIMATED ENEMIES FUNCTIONAL; concept visual family still requires production work.

Current real animated fallback models:
- `character-oobi.glb`
- `character-oodi.glb`
- `character-oozi.glb`

Approved target requires a rounded expressive family with readable roles. Pass 17B must either build real production enemy meshes/rigs that match the concept closely or explicitly present a side-by-side candidate for approval before substituting an existing model.

No invented enemy model names.

## J. Loader
`src/pass17-asset-library.js` is the pack-qualified loader. It keeps Kenney, KayKit Dungeon and KayKit Platformer roots distinct and cache keys pack-qualified.

## Acceptance rule
A concept landmark may be marked COMPLETE only when:
- its major visible pieces correspond to this verified list or an approved new production asset;
- the in-game screenshot reads recognizably like its approved concept view;
- its visible gameplay surfaces are the surfaces used by traversal/collision.
