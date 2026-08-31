# Crystal Library v2

The rejected M4A radial arena is replaced by a compact, enclosed library complex based on the supplied Crystal Library reference images.

## Hard visual rules
- Read immediately as an interior library, not an open arena.
- Dense arched bookcase bays and tall perimeter masonry.
- Vault ribs and a suspended purple/cyan/pink crystal field overhead.
- Central stasis chamber as the focal space.
- Authored entrance, atrium, west puzzle, east observatory, sanctuary, archive, overlook and summit spaces.
- Bridges and stairs use the same exact endpoints as their analytic collision surfaces.
- Primary visible architectural dressing uses vendored Kenney CC0 GLB assets: dungeon gateways/arches and stairs plus Furniture Kit bookcases and wall lamps.
- The Kenney GLBs now live inside `hybrid-v09/assets/kenney/`; runtime rendering no longer depends on the public source mirror that supplied them.
- Fallback geometry exists only so startup never blocks if an asset request fails.
- No runtime string patching is used by the shipped page. Repository build/test workflows are development-only.

## Performance and validation rules
- Asset loading does not block the initial canvas/UI.
- Overhead crystals are instanced and scaled by mobile/quality tier.
- Only two additional non-shadow fill lights are introduced by the library module.
- Existing PMREM/CubeCamera startup bake remains disabled.
- `game.js` and `crystal-library-v2.js` must pass Node syntax checks.
- The browser smoke gate runs real headless Chromium at a 390x844 mobile viewport, requires a visible initialized WebGL canvas, hidden boot overlay, no fatal startup state, keyboard traversal input, and successful loading of the five Kenney environment GLBs before this preview is promoted.
