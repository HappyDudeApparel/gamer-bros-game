# PASS 17 — PRISM VALLEY V2 CONCEPT-MATCH BUILD SPEC

Status: **LOCKED PRODUCTION TARGET**

Pass 17 is the first concept-match production rebuild. Pass 16 remains the safe playable baseline until Pass 17 passes all gates.

## 1. Source of truth

The user-approved Prism Valley V2 concept pack is the art, composition and map target:

- Main valley vista — continuous meadow foreground, central river/ravine, bridge, Riverworks, ruins and distant Prism Ridge.
- Asset/world-design board — terrain, Riverworks, ruins, nature, gameplay and portal-shrine visual language.
- Top-down map — A Portal Meadow → B Creek Crossing → C Riverworks → D Clover Cliffs → E Ruin Courtyard → F Prism Ridge, plus Spring Shortcut, Pipe Loop, High Mastery Route, Ruin High Route and Lower Bypass.
- Section renders — Creek/Riverworks, Clover Cliffs, Ruin Courtyard and Prism Ridge.

The intent is not merely “inspired by” these images. The playable build should reproduce their hierarchy, silhouettes, route relationships, density, palette and sense of place as closely as practical in the browser.

## 2. Truthful asset mapping

### Verified existing asset families

The repository asset catalog explicitly includes:
- Kenney Platformer Kit — preferred terrain/traversal source.
- KayKit Platformer Pack — preferred platformer dressing/gameplay source.
- KayKit Medieval Hexagon — preferred ruins/medieval structure source.
- KayKit Dungeon Remastered — preferred ruins/interior/stone source.
- KayKit City Builder Bits — preferred settlement/structure dressing source.

Verified Kenney terrain files already used or present include grass large/long/low pieces, large slopes, overhangs, corners, curves, fortified platforms, ramps, springs, trees, rocks, flowers, coins, gems, chest, hearts and hazards.

### Custom in-engine equivalents

Where the approved concept contains a visual element that is not a verified repository GLB, Pass 17 must create a lightweight Three.js equivalent and identify it as custom rather than mislabeling it as a kit asset. This specifically includes, unless a later audit finds a direct asset:
- continuous low-poly terrain masses;
- Riverworks pipe straights/elbows/junction visual kit;
- stylized flowing water planes and waterfall ribbons;
- concept-match enemy shells/eyes/spikes/rotors;
- incidental cliff-face seam masking and path ribbons;
- simple stone arch assemblies where a direct kit piece is unavailable.

No invisible cosmetic substitute may be presented as a real imported asset.

## 3. Terrain standard — mandatory

Pass 16's obvious tiled-square lower land is rejected.

Pass 17 must use broad **continuous visible terrain geometry** for the major land masses. The same visible meshes used to represent the walkable terrain participate in ground/raycast logic. There is no unrelated invisible floor under intended traversal.

Requirements:
- no repeated square-island look along the main ground plane;
- continuous meadow and cliff plateaus with irregular outlines;
- deliberately rounded/angled boundaries and height changes;
- Kenney curves/corners/slopes/overhangs used where they improve silhouette and platforming;
- cliff faces may be custom extruded geometry, but must visually join the playable tops;
- route seams must pass traversal probes rather than being hidden from the validator.

## 4. Locked world layout

### A — Portal Meadow
- broad continuous spawn meadow;
- winding dirt/path visual line rather than square tiles;
- visible central ravine ahead;
- Creek Crossing landmark readable from spawn;
- Prism Ridge/portal readable as a distant destination;
- first exploration reward on a small overlook.

### B — Creek Crossing
- terrain naturally descends to the water;
- broad fortified bridge is the primary route;
- Spring Shortcut provides an elevated optional reconnect;
- falling from the shortcut reaches recoverable land, not an arbitrary death plane.

### C — Riverworks
- a landmark complex integrated into the ravine rather than pipes scattered on grass;
- custom/verified pipe network hugs cliff walls and crosses water;
- wooden/mechanical platforms communicate function;
- Pipe Loop optional route reconnects to the main route;
- first deliberate enemy encounter;
- player can see earlier Portal Meadow/Creek Crossing from at least one vantage.

### D — Clover Cliffs
- layered continuous grassy terraces, overhangs and broad ramps;
- normal route remains forgiving;
- spring opens a high mastery route;
- high lookout reveals the valley behind/below;
- no disconnected generic floating-platform chain.

### E — Ruin Courtyard
- central architectural encounter space;
- main route through center;
- safer/slower lower bypass;
- harder high route across broken arches/ledges;
- high route contains best reward/chest;
- enemy positions never create blind unavoidable landing hits.

### F — Prism Ridge
- environment opens into a broad ceremonial approach;
- stronger, fewer landmarks: flags, ruin framing, crystals and final stairs/ridge;
- player can look back across most of Prism Valley;
- canonical Crystal Library v2 tube/portal behavior remains unchanged;
- no enemy attacks in activation zone.

## 5. Player visual target

GB1/GB2 remain the only playable roster.

Pass 17 player target:
- compact chibi proportions;
- oversized rounded head;
- blond toy-like swept/spiky hair;
- oversized cyan/orange gamer headphones;
- strong pink (GB1) / cyan (GB2) top with readable GB mark;
- chunky two-tone sneakers;
- short limbs and clean toy-like silhouette;
- high material readability at phone scale.

The player module must preserve the gameplay API required by the proven controller and Prism Breaker:
- `root`, `body`, `all`;
- `setMotion()`;
- `setHome()`;
- `setAction()`;
- `setRoomLight()`;
- `controllerGroup` and `controllerEmitter`;
- `update()`.

## 6. Enemy visual target

Replace the mismatched animated-character look with a cohesive concept enemy family:
- Patrol: rounded dark body, bright yellow expressive eyes, small feet/cap accents.
- Spiker: rounded shell with obvious pale spikes; slower defensive threat.
- Flyer: rounded body with rotor/wing silhouette and readable hover motion.

Gameplay state language remains:
patrol → alert → telegraph → attack/lunge → recover → hit → dead.

Enemies should be cute-but-hostile, readable from a phone camera, and visually related to one another.

## 7. Water/Riverworks target

- central continuous blue creek through the valley;
- waterfall ribbons at authored elevation drops;
- foam/mist may be lightweight particles/sprites;
- pipe geometry uses clean cylindrical straights, elbows and junctions with dark-blue/steel material and bright collars;
- pipes connect to real structures/terrain rather than terminate randomly;
- Riverworks must read as a functional landmark from a distance.

## 8. UI/title

Gameplay keeps Pass 16's cleaned HUD and camera controls.

Title/mobile rebuild requirements:
- remove portrait dead-space problem;
- GB1/GB2 character images must actually be visible inside cards;
- cards sit close to the logo/play flow rather than at bottom after a large void;
- landscape selection label cannot overlap the logo;
- use robust static/pre-rendered concept-bro portraits if dual live WebGL canvases remain unreliable;
- selecting GB1/GB2 + PLAY must launch Pass 17 only after promotion.

## 9. Systems retained from Pass 16

- movement speeds and jump foundation;
- mobile joystick/action controls;
- touch drag orbit/tilt;
- 3 zoom levels + center camera;
- layer-aware ground-selection principle;
- Prism Breaker gameplay contract;
- checkpoint/recovery philosophy;
- canonical Crystal Library v2 tube.

## 10. Acceptance gates

Pass 17 cannot replace the root/live PLAY target until all are green:

1. JS syntax for all Pass 17 modules.
2. Desktop Chrome actual browser boot.
3. Android-UA Chrome actual browser boot.
4. mandatory main-route probe has zero holes/illegal steps;
5. each optional route probe has zero unintended holes/illegal steps;
6. upper/lower overlap regression test proves correct surface selection;
7. GB1 and GB2 both boot and render;
8. Patrol, Spiker and Flyer families render and can be defeated;
9. Prism Breaker charge/release/damage works;
10. three camera zoom levels + touch tilt/orbit work;
11. canonical portal can complete the full transition without freeze/dark lock;
12. title portrait and landscape dimension/layout smoke tests pass;
13. GitHub Pages deployment succeeds;
14. manual phone traversal remains the final experiential approval gate.

## 11. Promotion rule

`/pass17-world1/` is an isolated production candidate. The current Pass 16 live root remains untouched until Pass 17 satisfies the automated gates. Promotion is a separate explicit commit after validation.
