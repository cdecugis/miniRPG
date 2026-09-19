import { isInsideMap, isWalkable } from './collision';
import { DIRECTIONS } from './world';
import type { Direction, ExplorationState, TilePosition } from './world';

export function movePlayer(world: ExplorationState, direction: Direction, occupiedTiles: readonly TilePosition[] = []): ExplorationState {
  const canEnter = (tile: TilePosition) => isWalkable(world.map, tile)
    && !occupiedTiles.some((occupied) => occupied.x === tile.x && occupied.y === tile.y);
  const delta = DIRECTIONS[direction];
  const position = world.playerPosition;
  if (!isInsideMap(world.map, position)) return world;
  const destination = { x: position.x + delta.x, y: position.y + delta.y };
  if (!canEnter(destination)) return world;

  if (delta.x !== 0 && delta.y !== 0) {
    const horizontal = { x: destination.x, y: position.y };
    const vertical = { x: position.x, y: destination.y };
    if (!canEnter(horizontal) || !canEnter(vertical)) return world;
  }

  return { ...world, playerPosition: destination };
}
