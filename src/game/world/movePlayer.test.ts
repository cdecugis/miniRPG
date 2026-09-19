import { describe, expect, it } from 'vitest';
import { movePlayer } from './movePlayer';
import { DIRECTIONS } from './world';
import type { Direction, ExplorationState, TerrainId, TilePosition, WorldMap } from './world';

function createWorld(position: TilePosition = { x: 1, y: 1 }, obstacles: { x: number; y: number; terrain: TerrainId }[] = []): ExplorationState {
  const tiles: TerrainId[][] = Array.from({ length: 3 }, () => Array<TerrainId>(3).fill('grass'));
  for (const obstacle of obstacles) tiles[obstacle.y][obstacle.x] = obstacle.terrain;
  const map: WorldMap = { id: 'test', name: 'Test', width: 3, height: 3, tiles };
  return { map, playerPosition: position };
}

describe('renderer-independent exploration movement', () => {
  it.each([
    ['north', { x: 1, y: 2 }], ['south', { x: 1, y: 0 }],
    ['east', { x: 2, y: 1 }], ['west', { x: 0, y: 1 }],
    ['northEast', { x: 2, y: 2 }], ['northWest', { x: 0, y: 2 }],
    ['southEast', { x: 2, y: 0 }], ['southWest', { x: 0, y: 0 }],
  ] as [Direction, TilePosition][])('moves exactly one tile %s', (direction, expected) => {
    const world = createWorld();
    const moved = movePlayer(world, direction);
    expect(moved.playerPosition).toEqual(expected);
    expect(world.playerPosition).toEqual({ x: 1, y: 1 });
    expect(moved.map).toBe(world.map);
  });

  it('walks onto roads', () => {
    const world = createWorld(undefined, [{ x: 2, y: 1, terrain: 'road' }]);
    expect(movePlayer(world, 'east').playerPosition).toEqual({ x: 2, y: 1 });
  });

  it.each(['tree', 'water', 'house', 'rock'] as TerrainId[])('blocks %s destinations in every direction', (terrain) => {
    for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
      const delta = DIRECTIONS[direction];
      const world = createWorld(undefined, [{ x: 1 + delta.x, y: 1 + delta.y, terrain }]);
      expect(movePlayer(world, direction)).toBe(world);
    }
  });

  it.each(['northEast', 'northWest', 'southEast', 'southWest'] as Direction[])('blocks %s if either or both adjacent tiles are blocked', (direction) => {
    const delta = DIRECTIONS[direction];
    const horizontal = { x: 1 + delta.x, y: 1, terrain: 'tree' as const };
    const vertical = { x: 1, y: 1 + delta.y, terrain: 'rock' as const };
    for (const obstacles of [[horizontal], [vertical], [horizontal, vertical]]) {
      const world = createWorld(undefined, obstacles);
      expect(movePlayer(world, direction)).toBe(world);
    }
  });

  it('blocks every step that would cross any map edge, including diagonals', () => {
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
          const delta = DIRECTIONS[direction];
          const destination = { x: x + delta.x, y: y + delta.y };
          if (destination.x >= 0 && destination.x < 3 && destination.y >= 0 && destination.y < 3) continue;
          const world = createWorld({ x, y });
          expect(movePlayer(world, direction)).toBe(world);
        }
      }
    }
  });

  it('updates from the latest position over successive moves and remains serializable', () => {
    const first = movePlayer(createWorld(), 'north');
    const second = movePlayer(first, 'east');
    expect(second.playerPosition).toEqual({ x: 2, y: 2 });
    expect(first.playerPosition).toEqual({ x: 1, y: 2 });
    expect(JSON.parse(JSON.stringify(second))).toEqual(second);
  });

  it('rejects a malformed fractional starting position', () => {
    const world = createWorld({ x: 1.5, y: 1 });
    expect(movePlayer(world, 'north')).toBe(world);
  });
});
