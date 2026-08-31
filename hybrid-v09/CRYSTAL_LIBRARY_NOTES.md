# Crystal Library v2 — implementation notes

The previous Hybrid M4A radial arena is rejected. This pass treats the supplied Crystal Library reference as a hard composition target.

## Useful material incorporated from the Claude review

- Cruciform authored room layout instead of the former 86-unit radial ring network.
- Bridges are trimmed to actual platform/room edges rather than drawn centre-to-centre.
- Three major walkable elevation bands, with explicit stair routes between them.
- Dense vaulted shell, repeated arched bookshelf bays, overhead crystal field, warm sconces, central stasis chamber and deep violet void as the dominant visual read.
- Mobile budgets: DPR cap, one shadow-casting light, instancing/batching for repeated architecture and crystals.
- Portal animation should remain prewarmed and `dt`-driven; no new runtime compilation/disposal during activation.

## Deliberately NOT adopted from the Claude draft

The supplied `room.js` still builds its primary walkable spaces as circular `CylinderGeometry` platforms and bridges as plain `BoxGeometry`. That directly conflicts with the user's rejected-build feedback. Those pieces are reference logic only, not the final visible architecture.

## v2 visual rule

Visible walkable areas must read as rooms, galleries, balconies and catwalks inside an enclosed library—not freestanding circles in a void. Simple geometry may remain only for collision and hidden support.
