# Gamer Bros reusable world asset library

This directory is the permanent reusable environment/model pool for Gamer Bros worlds and levels.

## Approved sources

- Kenney Platformer Kit — https://kenney.nl/assets/platformer-kit — CC0. Previously vendored and retained.
- Kenney Nature Kit — https://kenney.nl/assets/nature-kit — CC0. Pass 18 primary terrain/nature/bridge/fence kit. CI delivery mirror: https://github.com/shorepine/kenney/tree/main/3d/nature
- Kenney Fantasy Town Kit — https://kenney.nl/assets/fantasy-town-kit — CC0. Pass 18 ruins/woodwork/Riverworks support. CI delivery mirror: https://github.com/shorepine/kenney/tree/main/3d/fantasy-town
- Kenney Castle Kit — https://kenney.nl/assets/castle-kit — CC0. Pass 18 ceremonial/bridge-gate/Prism Ridge support. CI delivery mirror: https://github.com/shorepine/kenney/tree/main/3d/castle
- Kenney Starter Kit City Builder — https://github.com/KenneyNL/Starter-Kit-City-Builder — code MIT; included assets CC0.
- Kenney Starter Kit Basic Scene — https://github.com/KenneyNL/Starter-Kit-Basic-Scene — support/reference scene assets.
- KayKit Platformer Pack FREE — https://kaylousberg.itch.io/kaykit-platformer — CC0. Previously vendored and retained.
- KayKit City Builder Bits — https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0 — CC0.
- KayKit Medieval Hexagon Pack — https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0 — CC0.
- KayKit Dungeon Remastered — https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0 — CC0.

The `shorepine/kenney` mirror is used only as a reproducible CI delivery path for the three Pass 18 Kenney packs. Kenney's official pages remain the canonical source/license references.

Only browser-useful runtime files are vendored here. Godot import caches/editor metadata are intentionally excluded.

Pass 18 rules:
- Real kit assets are searched before custom geometry is authored.
- World content is composed from real modular terrain/structure assets plus narrowly justified custom shaders/geometry.
- Do not revert to a single smooth heightfield as the visible Prism Valley terrain.
- Main remains untouched until Pass 18 visual and performance gates are approved.
