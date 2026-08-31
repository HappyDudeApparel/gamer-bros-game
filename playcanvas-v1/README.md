# Crystal Library Vertical Slice — PlayCanvas v1

This branch deliberately freezes the old Hybrid v0.9 room as a prototype and starts a new browser-first gameplay line.

## Design target

The portal is a destination, not the opening interaction. The player must explore three distinct wings and earn three Maple Crests before the central portal becomes reachable.

The first slice includes:

- elevated entrance and broken descent into the library;
- central locked portal visible from the start;
- western broken-library climb with melee enemies;
- eastern moving-platform route with ranged enemies;
- lower sanctuary with narrow ledges, crumble platforms, a launch pad and a Crystal Guardian;
- 30+ Maple Leaf pickups plus enemy leaf rewards;
- three Maple Crest progression keys;
- an Overcharge power-up that buffs movement and zap radius/damage;
- jump, dash and zap actions;
- checkpoints on crest collection and void/fall recovery;
- immediate portal completion transition instead of the old multi-second empty-tube state;
- mobile joystick/action controls plus keyboard controls;
- local Kenney library GLBs used as environment dressing when available.

## Controls

Desktop: WASD/arrows move, Space jumps, Shift dashes, F zaps, drag the world to orbit the camera.

Mobile: left stick moves; ZAP, JUMP and DASH buttons handle actions; drag the world to rotate the camera.

## Current status

This is a gameplay-first vertical slice and not the final art pass. The purpose is to prove that the project can feel like a real game before building the remaining world. The next art milestone is a custom Blender-authored Crystal Library modular kit rather than attempting to make generic public assets match the concept images.

The existing live root and Hybrid v0.9 build are not modified by work on this branch.
