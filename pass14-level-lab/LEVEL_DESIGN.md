# Pass 14 — Level Lab / Hero Slice

## Slice name: Springline Terrace

Goal: prove one genuinely authored 60–90 second 3D platforming slice before expanding World 1 again.

### Design rule
The visible gameplay assets ARE the gameplay geometry. Kenney Platformer Kit grass blocks, slopes, ramps and platforms are raycast directly for traversal. We do not place an unrelated invisible route underneath them.

### Core concept
A readable uphill flow built around ramps and springs:

1. **Read** — broad meadow approach and one obvious grass ramp.
2. **Learn** — a safe spring launches GB onto an oversized landing terrace.
3. **Develop** — linked raised grass blocks + platform ramp + first animated enemy.
4. **Choose** — main route remains forgiving; an optional spring launches to a high overhang mastery loop with a gem chest.
5. **Test** — a compact combat terrace combines elevation, one hazard edge and two animated enemies.
6. **Payoff** — final ramp/fortified platform frames the Crystal Library v2 tube.

### Main route
Spawn meadow → grass ramp → Spring 1 → landing terrace → mechanical ramp → enemy terrace → lower connector → combat terrace → portal ascent.

The main route never requires double jump. Every mandatory landing is intentionally generous.

### Optional mastery loop
At the split, Spring 2 launches to a high overhang route using real Kenney overhang/platform pieces. It contains a jewel + chest reward and reconnects before the combat terrace. Missing the route drops the player onto visible recovery ground rather than into a trap.

### Asset discipline
Primary playable kit: **Kenney Platformer Kit only** for this slice, to keep shape language coherent.

Playable architecture:
- block-grass-large / long / curves
- block-grass-large-slope
- platform-ramp / platform / platform-fortified / platform-overhang
- spring

Gameplay/support:
- character-oobi / character-oodi / character-oozi as animated enemy candidates
- coin-gold / jewel / chest / heart
- saw / spike-block only where visually explicit
- arrow / sign for route language

Environment dressing:
- tree / tree-pine / flowers / grass / rocks / fence-rope

### Enemy language
Enemies are real animated character GLBs, not primitive placeholder shapes.

State loop:
patrol → alert → telegraph → short lunge → recover.

A contact/lunge hit costs one of five hearts with invulnerability time. Two distinct power hits destroy an enemy. Hit/death animation clips are used when the GLB provides them, with motion/flash fallback otherwise.

### Hero power: Prism Breaker
One polished signature power for the slice.

- Hold Action: GB visibly enters the existing two-hand Action pose while a prism charge forms at the controller emitter.
- Release: a focused cyan/magenta projectile/lance fires in the facing direction.
- Longer hold: larger projectile, faster travel, stronger knockback and up to three-enemy pierce, but still only one HP removed from any one enemy per release.
- Impact: enemy hit reaction, prism shard burst, restrained camera kick, short hit-stop, synthesized impact sound.

This pass intentionally removes the old FX-cycling menu. Quality of one power comes before quantity.

### Readability
Coins trace the safe route and jump/landing arcs. Gems/chests signal optional mastery space. Trees/rocks frame routes but do not block them. Signs/arrows are only used at the split and spring launch where the geometry alone may not be enough.

### Acceptance gate
Before promotion:
- production modules pass syntax checks;
- all essential GLBs resolve locally;
- desktop and Android browser smoke tests boot with no fatal screen;
- the main route raycast probe confirms no missing walkable surface samples;
- the optional route probe confirms its landing/rejoin surfaces exist;
- at least one real enemy model and its animation list load;
- no Pass 13 files are modified.
