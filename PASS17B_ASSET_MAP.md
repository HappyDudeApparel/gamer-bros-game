# Pass 17B — Approved Concept → Real Asset Map

Purpose: prevent silent downgrades. Every major visible element in the approved Prism Valley V2 concept pack must resolve to an existing repository asset, deliberately authored production geometry, or a new approved production asset.

## A. Terrain / Clover Cliffs
Status: AVAILABLE + authored continuous terrain.

Existing Kenney Platformer assets:
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

- `platform-fortified.glb` for the recognizable fortified bridge silhouette
- authored visible sloped stone bridge deck for exact bank-to-bank traversal
- `spring.glb` for the approved shortcut
- Kenney trees / rocks / flowers for banks

Rule: the visible bridge deck is the collision surface. No transparent helper floor.

## C. Riverworks
Status: PARTLY AVAILABLE; signature pipe kit must be deliberately authored.

Available supporting assets:
- Kenney `platform-fortified.glb`
- KayKit Dungeon `floor_wood_large.gltf.glb`
- KayKit Dungeon `floor_wood_small.gltf.glb`
- KayKit Dungeon `wall_scaffold.gltf.glb`
- KayKit Dungeon `wall_open_scaffold.gltf.glb`
- KayKit Dungeon `wall_corner_scaffold.gltf.glb`
- KayKit Dungeon barriers for rail-like edge treatment
- crates / barrels / torch assets
- Kenney `spring.glb`

Missing as an existing verified pack family:
- the large blue-gray straight / elbow / junction pipes shown in the approved Riverworks concept.

Production decision:
- create an actual reusable Three.js pipe kit as visible production geometry: straight pipe, elbow, vertical riser, T-junction, collar/ring, support foot.
- use cylindrical/torus geometry with one coherent material language.
- these are real visible meshes, not placeholders or invisible collision.
- optional pipe-loop traversal uses the actual pipe meshes or a clearly visible walkable scaffold alongside them.

## D. Ruin Courtyard
Status: STRONGLY AVAILABLE from KayKit Dungeon Remastered.

Exact repo assets include:
- `arch.glb`
- `arch_road.glb`
- `bridge_8w.glb`
- `bridge_16w.glb`
- `bridge_large_8w.glb`
- `bridge_large_16w.glb`
- `bridge_entrance.glb`
- `bridge_entrance_large.glb`
- `column.gltf.glb`
- `pillar.gltf.glb`
- `pillar_decorated.gltf.glb`
- `stairs.gltf.glb`
- `stairs_narrow.gltf.glb`
- `stairs_wide.gltf.glb`
- `stairs_walled.gltf.glb`
- `wall.gltf.glb`
- `wall_arched.gltf.glb`
- `wall_broken.gltf.glb`
- `wall_cracked.gltf.glb`
- `wall_corner.gltf.glb`
- `wall_crossing.gltf.glb`
- `wall_pillar.gltf.glb`
- `rubble_half.gltf.glb`
- `rubble_large.gltf.glb`
- multiple blue/red/green/yellow/white banner variants
- `torch.gltf.glb`, `torch_lit.gltf.glb`, `torch_mounted.gltf.glb`
- `chest.glb`, `chest_gold.glb`

Production composition:
- central main gate / courtyard
- lower bypass under/around the center
- elevated broken-arch route
- high chest reward
- torch/banner landmark language

## E. Prism Ridge
Status: AVAILABLE for terrain/ceremonial framing; canonical portal preserved.

- authored continuous high ridge
- KayKit stone walls / arches / pillars / stairs
- KayKit banners + torches
- Kenney vegetation / grass edge pieces
- crystal accents may use existing jewel/crystal geometry and deliberately authored emissive crystal clusters if needed
- **canonical Crystal Library v2 portal/tube behavior and portal object remain unchanged**

## F. Nature / World Dressing
Status: AVAILABLE.

Kenney Platformer/Nature and KayKit Dungeon provide:
- pine / round / large tree families
- bushes / grass / plants / flowers
- large/medium/small rocks
- trunks / rubble
- fences/barriers and signs

Placement rule: dressing reinforces geography and route readability; it does not create fake walkability.

## G. Collectibles / Rewards
Status: AVAILABLE.

- Kenney coins / jewels / chest
- KayKit Dungeon `coin.gltf.glb`
- `coin_stack_small/medium/large.gltf.glb`
- `chest.glb`
- `chest_gold.glb`
- KayKit Platformer star/heart/key pickups

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

Approved target requires a rounded expressive family with readable roles. Pass 17B must either:
1. build real production enemy meshes/rigs that match the concept closely, or
2. explicitly present a side-by-side candidate for approval before substituting an existing model.

No invented enemy model names.

## J. Loader work required for 17B
The current world asset library is Kenney-rooted. 17B must add an explicit multi-pack loader rather than pretending KayKit files live under the Kenney root.

Required roots:
- Kenney Platformer GLB root
- KayKit Dungeon Remastered `Assets/gltf/`
- KayKit Platformer `Assets/gltf/` or its actual verified model root

The loader must accept pack + filename and keep cache keys pack-qualified.

## Acceptance rule
A concept landmark may be marked COMPLETE only when:
- its major visible pieces correspond to the list above or an approved new production asset;
- the in-game screenshot reads recognizably like its approved concept view;
- its visible gameplay surfaces are the surfaces used by traversal/collision.
