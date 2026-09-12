# PASS 16 — WORLD 1 PRODUCTION BRIEF

## Purpose
Pass 16 is the transition from Level Lab to the first production-quality Gamer Bros World level.

Pass 14 remains the proven movement/camera/portal testbed. Pass 16 must not become another linear test strip.

---

# 1. TITLE SCREEN — LOCKED DIRECTION

Use the approved neon Gamer Bros World portal-lab theme as the visual language for all non-game screens.

## Layout
- Large GB GAMER BROS WORLD logo centered high.
- Hero artwork/portal-lab background remains the dominant presentation.
- Two SMALL hero-select windows integrated directly below the logo / above PLAY:
  - GB1
  - GB2
- Hero cards show a portrait/render, hero name, and accent color.
- Selected hero receives a bright cyan/magenta outline and glow.
- No separate character-selection page.
- One large central PLAY button.
- PLAY launches directly into World 1 using the currently selected hero.
- SETTINGS and CREDITS remain secondary and visually subordinate.
- No Byte Bro unless a real production-ready asset is later added to the project.

## Mobile target
- Hero cards must remain visible without scrolling.
- PLAY remains the largest interactive element.
- No live 3D preview if it harms startup speed; static hero portraits are acceptable and preferred for the production title.

---

# 2. GAMEPLAY HUD — CLEAR THE VIEW

The center of the screen is gameplay space. Permanent UI must not occupy the upper-middle sightline.

## Always visible
### Top left
Compact single panel:
- GB1 / GB2 small badge
- hearts
- coin count
- gem count

### Top right
- small pause/title/menu button
- small camera button group directly beneath or beside it:
  - ZOOM 1/3, 2/3, 3/3
  - CENTER

### Bottom left
- movement joystick

### Bottom right
- JUMP
- RUN
- ACTION / POWER

## Contextual only
- Objective banner appears briefly when a new section begins, then fades away.
- Checkpoint notice appears briefly, then fades.
- Tutorial prompts appear once and disappear after successful use.
- Power charge meter is only visible while charging or immediately after activation.
- No permanent giant HOLD ACTION / objective panels in the center-top area.

## Camera controls
Mobile:
- left thumb: movement joystick
- right-side/open-screen drag: orbit camera left/right + tilt up/down
- 3 fixed zoom distances: STANDARD / WIDE / FAR
- CENTER button resets behind hero
- camera drag must not activate from joystick/buttons
- manual camera input delays auto-recenter

Desktop:
- WASD / arrows movement
- mouse drag orbit/tilt
- mouse wheel custom zoom
- Z cycles zoom presets
- V centers camera

Future controller layer:
- left stick movement
- right stick camera
- south face button jump
- east/west face button power
- shoulder/trigger run

---

# 3. WORLD 1-1 — PRISM VALLEY

## Core concept
A bright nature-meets-arcade valley built around one large central ravine/stream and three elevation bands.

It should feel like a real place the player can understand spatially, not a sequence of pads placed along the Z axis.

The canonical Crystal Library v2 tube is the final destination and must not be visually redesigned.

## Map footprint
Approximate playable footprint: 150 x 180 world units.

Three elevation bands:
- LOW: valley floor / waterline / meadow
- MID: terraces, bridges, ruined structures, machinery
- HIGH: cliffs, ridge routes, lookout/mastery path

The map forms a broad horseshoe/loop around a central ravine. The player repeatedly sees earlier and later areas from different elevations.

The final portal court is visible from at least two earlier viewpoints so the player understands the destination.

---

# 4. WORLD STRUCTURE

## A. PORTAL MEADOW — INTRODUCTION
Purpose: establish movement, visual identity, and destination.

- broad continuous grass terrain
- curved grass blocks and low slopes rather than square pads
- first collectible trail bends naturally toward the valley
- distant sightline to final portal ridge
- one optional small overlook with a chest
- no enemy in the first 15–20 seconds

## B. CREEK CROSSING — FIRST TRAVERSAL IDEA
Purpose: introduce layered paths without precision frustration.

Main route:
- broad grass descent
- low creek/ravine crossing
- fortified bridge/platform structure
- forgiving ramp back to mid elevation

Optional route:
- spring launches to grass overhang ledge
- short elevated coin/gem line
- reconnects before next combat area

Falls should land on recoverable lower terrain whenever possible instead of instant reset.

## C. RIVERWORKS — MECHANICAL LANDMARK
Purpose: make the world memorable and give platform assets a believable job.

- pipes, rails, fortified platforms, conveyor/moving block if stable
- one large arch / industrial silhouette visible from the meadow
- water/ravine passes underneath
- first real animated enemy encounter
- route crosses above a location the player previously walked through
- optional pipe/rail side route gives a gem cache

## D. CLOVER CLIFFS — VERTICAL DEVELOPMENT
Purpose: climb to high elevation using readable terrain rather than floating pads.

- grass slopes, curves, corners and overhang blocks create the cliff body
- main route is walkable/runnable with only easy deliberate jumps
- high mastery route uses springs + overhangs
- player can look down over Meadow and Riverworks
- one checkpoint at the top

## E. RUIN COURTYARD — COMBAT + ROUTE CHOICE
Purpose: combine traversal and enemies in a space that feels authored.

- ruined arch landmarks
- two enemy patrols with enough room to read attacks
- central courtyard at mid/high elevation
- one lower safe route around combat
- one high shortcut/mastery route through broken ledges
- chest/reward at the high-route end
- no enemy placed on blind landings

## F. PRISM RIDGE — PAYOFF
Purpose: final scenic climb and portal arrival.

- broad ridge path with flags/rails/landmark framing
- short final traversal sequence using the best mechanic learned earlier
- portal court is spacious and readable
- enemies stop before the final tube activation zone
- canonical Crystal Library v2 tube performs the full transition

---

# 5. LEVEL-DESIGN GRAMMAR

## Mandatory route rules
- minimum comfortable path width: ~5 world units where practical
- visible surface = valid collision surface
- no invisible walls on intended path
- no decorative prop collisions unless obvious
- avoid mandatory precision jumps
- ordinary movement must complete the route
- double jump is for recovery, shortcuts, and mastery routes—not basic progression
- required springs must have generous, visible landing zones
- every blind corner must have safe landing/read space

## Optional mastery rules
- visually telegraphed from the main path
- must reconnect naturally
- gives worthwhile gems/chest/shortcut
- uses higher elevation, overhangs, springs, moving platforms, or tighter jumps
- missing the route should normally drop the player to recoverable terrain rather than kill/reset

## Traversal validation
Every mandatory and optional route receives automated ground/step probes.
Do not weaken probes to make a route pass; rebuild geometry when a seam is found.

---

# 6. ASSET DISCIPLINE

Use real kit assets as gameplay architecture, not decoration pasted over unrelated collision boxes.

Primary Kenney platformer terrain vocabulary:
- block-grass large / long / tall
- grass slopes
- grass curves and corners
- grass overhang variants
- platform-ramp
- fortified platforms
- springs
- ladders where readable
- fences / ropes / rails as edge language
- chests / coins / jewels / hearts for rewards and signposting

KayKit vocabulary:
- arches
- flags
- railings
- pipes
- structural pieces that support the level theme

Buildings are landmarks only. Do not fill the world with buildings.

---

# 7. ENCOUNTER RULES

- use actual animated enemy characters only
- patrol area must be readable before engagement
- attack telegraph must be visible
- no enemy directly on spawn, checkpoints, spring landing targets, or portal activation area
- two distinct Power/Action activations remain the standard defeat rule unless a future enemy class intentionally differs
- combat spaces must allow camera movement and dodging

Suggested World 1-1 count: 5–7 enemies total, grouped into 3 encounters rather than scattered everywhere.

---

# 8. POWER RULES

Pass 16 should not add many weak powers.

Keep Prism Breaker as the first production power and polish:
- anticipation pose
- visible charge
- release recoil
- clear projectile/beam path
- enemy hit reaction
- hit stop/camera impulse kept restrained
- strong sound/visual confirmation

Only introduce a second power if it changes traversal or combat strategy rather than merely changing particle color.

---

# 9. WORLD READABILITY

The player should be able to answer these questions without UI arrows:
1. Where am I?
2. Where am I generally going?
3. What is the optional interesting thing over there?
4. Where is the final destination?

Use:
- large silhouettes
- terrain height
- flags/arches
- light/color contrast
- collectible lines
- sightlines
- route convergence

Do not use permanent objective UI to compensate for unclear level design.

---

# 10. PASS 16 ACCEPTANCE GATE

Pass 16 is not considered complete unless:
- title screen uses approved neon theme
- GB1 and GB2 are selectable on the title screen
- PLAY launches selected hero into World 1
- gameplay HUD leaves center view clear
- three zoom presets work
- touch drag camera works without conflicting with movement/buttons
- main route is continuous and probe-clean
- optional route is probe-clean
- no mandatory invisible surfaces/blockers
- real enemy models/animations load
- portal transition completes without freeze/dark lock
- desktop browser smoke passes
- Android browser smoke passes
- actual manual phone test is playable without getting stuck on geometry

---

# Production rule
Do not expand World 1 until PRISM VALLEY itself feels like a real, memorable level. Quality and spatial coherence take priority over map length.