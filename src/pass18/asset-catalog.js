export const PASS18_PACKS = Object.freeze({
  kenneyNature: '../../assets/world-kit/kenney/nature-kit/',
  kenneyFantasyTown: '../../assets/world-kit/kenney/fantasy-town-kit/',
  kenneyCastle: '../../assets/world-kit/kenney/castle-kit/',
  kenneyPlatformer: '../../assets/world-kit/kenney/platformer-kit/Models/GLB format/',
  kenneyCityBuilder: '../../assets/world-kit/kenney/starter-kit-city-builder/',
  kenneyBasicScene: '../../assets/world-kit/kenney/starter-kit-basic-scene/',
  kaykitPlatformer: '../../assets/world-kit/kaykit/platformer-pack/KayKit_Platformer_Pack_1.0_FREE/Assets/gltf/green/',
  kaykitDungeon: '../../assets/world-kit/kaykit/dungeon-remastered/',
  kaykitMedieval: '../../assets/world-kit/kaykit/medieval-hexagon/',
  kaykitCityBits: '../../assets/world-kit/kaykit/city-builder-bits/'
});

function item(id, pack, file, category, label, options = {}) {
  return Object.freeze({ id, pack, file, category, label, ...options });
}

// Curated browser palette. This is deliberately small: the registry can resolve every approved
// pack root, while the gallery exercises representative real assets without loading 2,500 files.
export const PASS18_ASSETS = Object.freeze([
  item('nature.ground.grass', 'kenneyNature', 'ground_grass.glb', 'Terrain', 'Grass Ground', { repeatable: true }),
  item('nature.path.bend', 'kenneyNature', 'ground_pathBend.glb', 'Terrain', 'Path Bend'),
  item('nature.river.straight', 'kenneyNature', 'ground_riverStraight.glb', 'Water/River', 'River Straight'),
  item('nature.river.bend', 'kenneyNature', 'ground_riverBend.glb', 'Water/River', 'River Bend'),
  item('nature.platform.grass', 'kenneyNature', 'platform_grass.glb', 'Terrain', 'Grass Platform'),
  item('nature.cliff.large', 'kenneyNature', 'cliff_large_rock.glb', 'Cliffs', 'Large Rock Cliff'),
  item('nature.cliff.corner', 'kenneyNature', 'cliff_cornerLarge_rock.glb', 'Cliffs', 'Large Cliff Corner'),
  item('nature.cliff.steps', 'kenneyNature', 'cliff_steps_rock.glb', 'Cliffs', 'Rock Cliff Steps'),
  item('nature.cliff.waterfall', 'kenneyNature', 'cliff_waterfall_rock.glb', 'Cliffs', 'Waterfall Cliff'),
  item('nature.cliff.waterfallTop', 'kenneyNature', 'cliff_waterfallTop_rock.glb', 'Cliffs', 'Waterfall Top'),
  item('nature.bridge.stone', 'kenneyNature', 'bridge_stone.glb', 'Structures', 'Stone Bridge'),
  item('nature.tree.default', 'kenneyNature', 'tree_default.glb', 'Nature', 'Tree', { repeatable: true }),
  item('nature.tree.tall', 'kenneyNature', 'tree_tall.glb', 'Nature', 'Tall Tree', { repeatable: true }),
  item('nature.tree.oak', 'kenneyNature', 'tree_oak.glb', 'Nature', 'Oak Tree', { repeatable: true }),
  item('nature.rock.largeA', 'kenneyNature', 'rock_largeA.glb', 'Nature', 'Large Rock', { repeatable: true }),
  item('nature.rock.largeC', 'kenneyNature', 'rock_largeC.glb', 'Nature', 'Large Rock C', { repeatable: true }),
  item('nature.bush.detailed', 'kenneyNature', 'plant_bushDetailed.glb', 'Nature', 'Detailed Bush', { repeatable: true }),
  item('nature.flower.purpleA', 'kenneyNature', 'flower_purpleA.glb', 'Nature', 'Purple Flower', { repeatable: true }),
  item('nature.flower.yellowB', 'kenneyNature', 'flower_yellowB.glb', 'Nature', 'Yellow Flower', { repeatable: true }),
  item('nature.grass', 'kenneyNature', 'grass.glb', 'Nature', 'Grass Clump', { repeatable: true }),
  item('nature.grass.large', 'kenneyNature', 'grass_large.glb', 'Nature', 'Large Grass Clump', { repeatable: true }),
  item('fantasy.wall.arch', 'kenneyFantasyTown', 'wall-arch.glb', 'Ruins', 'Fantasy Stone Arch'),
  item('fantasy.wall.corner', 'kenneyFantasyTown', 'wall-corner.glb', 'Ruins', 'Fantasy Wall Corner'),
  item('fantasy.wall', 'kenneyFantasyTown', 'wall.glb', 'Ruins', 'Fantasy Wall'),
  item('castle.bridge.pillar', 'kenneyCastle', 'bridge-straight-pillar.glb', 'Structures', 'Castle Bridge Pillar'),
  item('castle.bridge.straight', 'kenneyCastle', 'bridge-straight.glb', 'Structures', 'Castle Bridge Straight'),
  item('castle.bridge.draw', 'kenneyCastle', 'bridge-draw.glb', 'Structures', 'Castle Drawbridge'),
  item('castle.gate', 'kenneyCastle', 'gate.glb', 'Structures', 'Castle Gate'),
  item('castle.stairs.stone', 'kenneyCastle', 'stairs-stone.glb', 'Ruins', 'Stone Stairs'),
  item('castle.flag', 'kenneyCastle', 'flag.glb', 'Decor', 'Castle Flag'),
  item('kenney.platform.slope', 'kenneyPlatformer', 'block-grass-large-slope.glb', 'Terrain', 'Large Grass Slope'),
  item('kaykit.arch.green', 'kaykitPlatformer', 'arch_green.gltf', 'Structures', 'KayKit Arch'),
  item('kaykit.barrier.green', 'kaykitPlatformer', 'barrier_1x1x4_green.gltf', 'Structures', 'KayKit Barrier'),
  item('kaykit.chest.green', 'kaykitPlatformer', 'chest_green.gltf', 'Gameplay', 'KayKit Chest'),
  item('dungeon.banner.blue', 'kaykitDungeon', 'addons/kaykit_dungeon_remastered/Assets/gltf/banner_blue.gltf.glb', 'Decor', 'Dungeon Banner')
]);

const BY_ID = new Map(PASS18_ASSETS.map(asset => [asset.id, asset]));

export function getPass18Asset(id) {
  const asset = BY_ID.get(id);
  if (!asset) throw new Error(`Unknown Pass 18 asset: ${id}`);
  return asset;
}

export function pass18AssetUrl(id, moduleUrl = import.meta.url) {
  const asset = getPass18Asset(id);
  const root = PASS18_PACKS[asset.pack];
  if (!root) throw new Error(`Unknown Pass 18 pack root: ${asset.pack}`);
  return new URL(root + asset.file, moduleUrl).href;
}

export function pass18Categories() {
  return [...new Set(PASS18_ASSETS.map(asset => asset.category))];
}
