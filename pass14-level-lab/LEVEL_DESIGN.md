# Pass 14 — Level Lab / Hero Slice

## Slice name: Springline Terrace

Goal: prove one genuinely authored 60–90 second 3D platforming slice before expanding World 1 again.

## Design rule
The visible gameplay assets ARE the gameplay geometry. Kenney Platformer Kit grass blocks, slopes, overhangs and platforms are raycast directly for traversal. There is no unrelated invisible route underneath the art.

A lower recovery floor also uses visible Kenney grass pieces. It exists only to catch ordinary misses and return the player to readable terrain; it is not the main route.

## Core concept
One readable uphill flow built around ramps and springs:

1. **Read** — broad meadow approach and one obvious real grass slope.
2. **Learn** — Spring 1 launches GB onto an oversized landing terrace.
3. **Develop** — connected grass terraces climb toward the first animated enemy.
4. **Choose** — the safe main route continues forward while Spring 2 launches to an optional high mastery loop.
5. **Test** — a compact combat terrace combines elevation, two visible side saws and two animated enemies.
6. **Payoff** — a final broad grass ascent reaches the portal court and Crystal Library v2 tube.

## Main route
Spawn meadow → real grass slope → Spring 1 → landing terrace → broad grass climb → first enemy terrace → fortified connector with overlapping grass handoff → hillside grass slope → combat terrace → final grass slope → portal court.

The main route does not require double jump. Mandatory landings are deliberately generous. The fortified platform is used as a readable structural bridge, with real grass overlap at its exit so its visual and walkable transition agree.

`platform-ramp.glb` is deliberately **not** used as a mandatory connector after validation showed that its mesh was a poor fit for a long main-route handoff at our target scale. It remains a safe side interaction/reward surface where a miss falls to visible recovery terrain.

## Optional mastery loop
At the route split, Spring 2 launches to a high route made from the kit's dedicated `block-grass-overhang-large.glb` family.

The mastery route:
- uses four broad overhang platforms;
- carries jewels and a chest reward;
- visually stays above the main combat route;
- ends with an intentional readable drop onto the broad combat terrace;
- never depends on a hidden return ramp.

Missing the spring or a high-route landing drops the player onto visible recovery terrain rather than trapping them.

## Asset discipline
Primary playable kit: **Kenney Platformer Kit only** for this slice, keeping one coherent shape language.

### Playable architecture
- `block-grass-low-large.glb` — visible recovery terrain
- `block-grass-large.glb` — main terraces and portal court
- `block-grass-long.glb` — meadow connector
- `block-grass-large-slope.glb` — mandatory climbs
- `block-grass-overhang-large.glb` — optional mastery route
- `platform-fortified.glb` — structural bridge / portal framing
- `platform-ramp.glb` — optional side toy only
- `spring.glb` — main launch and mastery launch

### Gameplay/support
- `character-oobi.glb`, `character-oodi.glb`, `character-oozi.glb` — real animated enemies
- `coin-gold.glb`, `jewel.glb`, `chest.glb`, `heart.glb`
- `saw.glb` only where visually explicit
- `arrow.glb`, `sign.glb` used sparingly for route language

### Environment dressing
- `tree.glb`, `tree-pine.glb`, `flowers.glb`, `rocks.glb`

Dressing is non-colliding and streams only after traversal and enemy gameplay are ready.

## Enemy language
Enemies are real animated Kenney character GLBs, not primitive placeholder shapes.

State loop:

`patrol → alert → visible telegraph → short lunge → recover`

A contact/lunge hit costs one of five hearts with invulnerability time. Two distinct Prism Breaker releases destroy an enemy. The imported characters expose full animation sets including idle, walk, sprint, jump/fall, die, shooting poses and multiple melee attacks; Pass 14 uses the applicable clips through the enemy state machine.

Startup is gameplay-prioritized: the first real animated enemy is required before the loader clears, while the other two stream immediately afterward. Decorative dressing waits until all three enemies are ready.

## Hero power: Prism Breaker
One polished signature power for the slice.

- **Hold Action:** GB visibly enters the existing two-hand Action pose while a prism charge forms at the controller emitter.
- **Release:** a focused cyan/magenta lance-projectile fires in the facing direction.
- **Longer hold:** larger projectile, faster travel, stronger knockback and up to three-enemy pierce, while each release can remove only one HP from any individual enemy.
- **Impact:** enemy hit reaction, prism shard burst, restrained camera kick, short hit-stop and synthesized impact sound.

The old FX-cycling menu is intentionally absent. Quality and mechanical identity of one power come before adding a second.

## Readability
Coins trace the safe route and landing arcs. Gems/chests identify the mastery route. Trees and rocks frame movement space without blocking it. Signs/arrows are used only where the spring split or route shape could otherwise be ambiguous.

## Validation gate
Pass 14 is not promoted unless all of the following remain green:

- every production JS module passes syntax validation;
- all required runtime files and GLBs resolve locally;
- no external CDN is needed for the slice;
- the main route raycast probe reports zero holes / invalid steps;
- the mastery route probe reports zero holes / invalid steps;
- a real desktop Chrome session becomes playable with no fatal screen;
- an Android-user-agent Chrome session becomes playable with no fatal screen;
- all three animated enemy GLBs finish loading;
- imported enemy animation clips are present;
- streamed scenery / collectible dressing completes;
- Pass 13 remains untouched.

Validated baseline before promotion: 279 main-route probe samples and 54 mastery-route probe samples with zero failures on both desktop and Android browser runs.
