import { describe, expect, it } from 'vitest';
import { isInsideMap, isWalkable } from './collision';
import { TEST_MAP } from './testMap';
import type { TerrainId, WorldMap } from './world';

describe('terrain collision without a renderer', () => {
  it.each(['grass', 'road'] as TerrainId[])('allows %s', (terrain) => {
    const map: WorldMap = { id: 'test', name: 'Test', width: 1, height: 1, tiles: [[terrain]] };
    expect(isWalkable(map, { x: 0, y: 0 })).toBe(true);
  });

  it.each(['tree', 'water', 'house', 'rock'] as TerrainId[])('blocks %s', (terrain) => {
    const map: WorldMap = { id: 'test', name: 'Test', width: 1, height: 1, tiles: [[terrain]] };
    expect(isWalkable(map, { x: 0, y: 0 })).toBe(false);
  });

  it.each([
    { x: -1, y: 14 }, { x: 30, y: 14 }, { x: 14, y: -1 }, { x: 14, y: 30 },
    { x: 0.5, y: 14 }, { x: 14, y: 0.5 }, { x: NaN, y: 14 }, { x: Infinity, y: 14 },
  ])('rejects out-of-bounds or noninteger position %j', (position) => {
    expect(isInsideMap(TEST_MAP, position)).toBe(false);
    expect(isWalkable(TEST_MAP, position)).toBe(false);
  });
});
