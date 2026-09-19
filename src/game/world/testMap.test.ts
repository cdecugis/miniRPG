import { describe, expect, it } from 'vitest';
import { createExploration, TEST_MAP } from './testMap';
import { TERRAIN } from './world';

describe('fixed test map', () => {
  it('contains exactly 30 by 30 known terrain tiles and all six terrain types', () => {
    expect(TEST_MAP.width).toBe(30);
    expect(TEST_MAP.height).toBe(30);
    expect(TEST_MAP.tiles).toHaveLength(30);
    TEST_MAP.tiles.forEach((row) => expect(row).toHaveLength(30));
    expect([...new Set(TEST_MAP.tiles.flat())].sort()).toEqual(Object.keys(TERRAIN).sort());
  });

  it('spawns on a walkable tile with independent integer coordinates', () => {
    const first = createExploration();
    const second = createExploration();
    const { x, y } = first.playerPosition;
    expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
    expect(TERRAIN[first.map.tiles[y][x]].walkable).toBe(true);
    expect(first.playerPosition).not.toBe(second.playerPosition);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
  });
});
