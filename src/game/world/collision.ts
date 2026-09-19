import { TERRAIN } from './world';
import type { TilePosition, WorldMap } from './world';

export function isInsideMap(map: WorldMap, position: TilePosition): boolean {
  return Number.isInteger(position.x) && Number.isInteger(position.y)
    && position.x >= 0 && position.y >= 0
    && position.x < map.width && position.y < map.height;
}

export function isWalkable(map: WorldMap, position: TilePosition): boolean {
  if (!isInsideMap(map, position)) return false;
  const terrain = map.tiles[position.y]?.[position.x];
  return terrain !== undefined && TERRAIN[terrain].walkable;
}
