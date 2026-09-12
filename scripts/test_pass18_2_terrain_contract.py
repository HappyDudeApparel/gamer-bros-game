"""Static (browser-free) contract checks for the Pass 18-2 Golden Slice manifest.

These catch structural mistakes in the authored manifest itself — a missing
route link, a tile record that still carries a prop-style targetMax, a bank
description with no rows — before the browser proof ever runs. They do NOT
attempt to judge composition, proportion, or void/gap by eye: that stays a
manual desktop + Android screenshot review, on purpose. See CURRENT_WORK.md.
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'data' / 'pass18' / 'golden-slice-creek.json'


def load():
    return json.loads(MANIFEST.read_text())


def interp_creek_x(z, water_points):
    for i in range(len(water_points) - 1):
        z0, x0 = water_points[i][2], water_points[i][0]
        z1, x1 = water_points[i + 1][2], water_points[i + 1][0]
        if z1 <= z <= z0:
            t = (z0 - z) / (z0 - z1)
            return x0 + t * (x1 - x0)
    return water_points[0][0]


def expand_bank(bank, water_points):
    """Mirrors expandPass18CreekBank/expandPass18CreekBankCorners in
    src/pass18/asset-placement.js closely enough to catch data-level bugs
    (degenerate rows, wall/path collisions) without a browser."""
    fill, west_edge, east_edge = [], [], []
    for z in range(bank['fromZ'], bank['toZ'] + 1):
        cx = interp_creek_x(z, water_points)
        inner_w = max(round(cx - bank['halfWidth'] - 1), bank['outerW'] + 1)
        inner_e = min(round(cx + bank['halfWidth'] + 1), bank['outerE'] - 1)
        for x in range(bank['outerW'], inner_w):
            fill.append((x, z))
        for x in range(inner_e + 1, bank['outerE'] + 1):
            fill.append((x, z))
        west_edge.append((z, inner_w))
        east_edge.append((z, inner_e))
    return fill, west_edge, east_edge


def detect_corners(edge):
    corners = []
    for i in range(1, len(edge)):
        prev_z, prev_x = edge[i - 1]
        cur_z, cur_x = edge[i]
        if abs(cur_x - prev_x) == 1:
            corners.append((prev_x, cur_z))
    return corners


def assert_manifest_contract(d):
    assert d['version'] == '18-2.1', d['version']
    assert d['worldLanguage'] == '18-0B.2'
    assert d['reviewStatus'] == 'PENDING_USER'
    assert d['anchorSection'] == 'B'
    assert len(d['creekBanks']) >= 1, 'no creekBanks authored'
    for bank in d['creekBanks']:
        assert bank['toZ'] > bank['fromZ'], f'degenerate bank z-range {bank}'
        assert bank['outerE'] > bank['outerW']

    tiles = [p for p in d['placements'] if p.get('kind') == 'tile']
    props = [p for p in d['placements'] if p.get('kind') != 'tile']
    assert tiles, 'no authored tile placements'
    assert all('targetMax' not in p for p in tiles), \
        'tile placements must not carry a prop-style targetMax'
    assert all('targetMax' in p or p['id'] == 'bridge' for p in props), \
        'every non-tile placement needs a targetMax (the bridge supplies its own explicit scale instead)'

    bridge = next(p for p in d['placements'] if p['id'] == 'bridge')
    assert bridge['asset'] == d['acceptance']['bridgeAsset']
    assert 'entry' in bridge and 'exit' in bridge, \
        'bridge must declare explicit entry/exit points, not rely on an inferred AABB touch'

    path_count = sum(1 for p in d['placements'] if p['role'] == 'path')
    assert path_count >= d['acceptance']['minPathPieces'], path_count
    veg_count = sum(1 for p in d['placements'] if p['role'] == 'vegetation')
    assert veg_count >= d['acceptance']['minVegetation'], veg_count
    fence_count = sum(1 for p in d['placements'] if p['role'] == 'fence')
    assert fence_count >= d['acceptance']['minFences'], fence_count
    assert len(d['placements']) >= 120


def assert_terrain_and_route_contract(d):
    by_id = {p['id']: p for p in d['placements']}
    water_points = d['water']['points']

    total_cliff_role = 0
    for bank in d['creekBanks']:
        fill, west_edge, east_edge = expand_bank(bank, water_points)
        assert fill, 'creek bank produced no fill tiles'
        west_corners = detect_corners(west_edge)
        east_corners = detect_corners(east_edge)
        total_cliff_role += len(west_edge) + len(east_edge) + len(west_corners) + len(east_corners)

        # No row may be zero-width on either bank (the exact "unexplained
        # void" failure mode the terrain rebuild exists to prevent).
        for z, inner_w in west_edge:
            assert inner_w > bank['outerW'], f'west bank degenerate at z={z}'
        for z, inner_e in east_edge:
            assert inner_e < bank['outerE'], f'east bank degenerate at z={z}'

        # Path/tile placements must never land on a retaining-wall cell —
        # the exact class of bug found and fixed while authoring this route.
        wall_cells = {(x, z) for z, x in west_edge} | {(x, z) for z, x in east_edge}
        for p in d['placements']:
            if p['role'] != 'path':
                continue
            x, _, z = p['position']
            assert (round(x), round(z)) not in wall_cells, \
                f'path placement {p["id"]} collides with a retaining-wall cell'

    total_cliff_role += sum(1 for p in d['placements'] if p['role'] == 'cliff')
    assert total_cliff_role >= d['acceptance']['minCliffs'], total_cliff_role

    # Route: an explicit node list, not an inferred coordinate sort. The
    # bridge is a declared traversable structure with its own entry/exit —
    # its span is checked against its authored footprint, not against the
    # generic node-to-node gap ceiling.
    nodes = d['route']['nodes']
    assert nodes, 'no route authored'
    expanded = []
    for node_id in nodes:
        rec = by_id[node_id]
        if rec['id'] == 'bridge':
            expanded.append(('bridge-entry', rec['entry']))
            expanded.append(('bridge-exit', rec['exit']))
        else:
            expanded.append((node_id, rec['position']))

    max_gap = d['acceptance']['maxRouteNodeGap']
    for (a_id, a_pos), (b_id, b_pos) in zip(expanded, expanded[1:]):
        if {a_id, b_id} == {'bridge-entry', 'bridge-exit'}:
            continue  # checked against the bridge's own footprint below, not the generic gap ceiling
        gap = math.dist((a_pos[0], a_pos[2]), (b_pos[0], b_pos[2]))
        assert gap <= max_gap, f'route gap too large between {a_id} and {b_id}: {gap:.3f}u (max {max_gap})'

    bridge = by_id['bridge']
    entry_span = abs(bridge['entry'][0] - bridge['exit'][0])
    scale_span = bridge['targetMax'] * bridge['scale'][0]
    assert abs(entry_span - scale_span) <= 0.3, \
        f'bridge entry/exit span {entry_span:.2f} does not match its authored footprint {scale_span:.2f}'


if __name__ == '__main__':
    manifest = load()
    assert_manifest_contract(manifest)
    assert_terrain_and_route_contract(manifest)
    print('Pass 18-2 terrain/route contract: PASS')
