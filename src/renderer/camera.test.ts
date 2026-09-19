import { describe, expect, it } from 'vitest';
import { getCamera, getTileSize, TILE_SIZE } from './camera';
import { TEST_MAP } from '../game/world/testMap';

describe('camera', () => {
  it('shows more tiles on phones while preserving position and map boundaries', () => {
    const position = Object.freeze({ x: 29, y: 29 });
    expect(getTileSize(390)).toBe(32);
    expect(getTileSize(1440)).toBe(48);
    expect(getCamera(TEST_MAP, position, 320, 320, getTileSize(390)))
      .toMatchObject({ x: 20, y: 20, columns: 10, rows: 10 });
    expect(position).toEqual({ x: 29, y: 29 });
  });
  it('centers on the player without shrinking the map to the viewport', () => {
    expect(getCamera(TEST_MAP, { x: 14, y: 14 }, 336, 432)).toMatchObject({
      x: 11, y: 10, columns: 7, rows: 9,
    });
  });

  it.each([
    [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    [{ x: 29, y: 29 }, { x: 23, y: 21 }],
    [{ x: 0, y: 29 }, { x: 0, y: 21 }],
    [{ x: 29, y: 0 }, { x: 23, y: 0 }],
  ])('stays inside the map at %j', (position, expected) => {
    expect(getCamera(TEST_MAP, position, 336, 432)).toMatchObject(expected);
  });

  it('recalculates the visible area on resize without mutating world coordinates', () => {
    const position = Object.freeze({ x: 14, y: 14 });
    const small = getCamera(TEST_MAP, position, 288, 336);
    const large = getCamera(TEST_MAP, position, 960, 576);
    expect(small.columns).toBe(6);
    expect(large.columns).toBe(20);
    expect(position).toEqual({ x: 14, y: 14 });
  });

  it('handles maps smaller than the viewport with nonnegative camera coordinates', () => {
    const camera = getCamera({ ...TEST_MAP, width: 3, height: 3 }, { x: 0, y: 0 }, 500, 500);
    expect(camera).toMatchObject({ x: 0, y: 0, columns: 3, rows: 3 });
    expect(camera.offsetX).toBe(Math.floor((500 - 3 * TILE_SIZE) / 2));
  });
});
