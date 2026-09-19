import { describe, expect, it } from 'vitest';
import { screenToCombatTile } from './combatRenderer';

describe('combat Canvas input coordinates', () => {
  it('maps phone-sized tiles to the same authoritative combat coordinates', () => {
    expect(screenToCombatTile(176, 304, 320, 320, { x: 10, y: 0 }, 32)).toEqual({ x: 10, y: 0 });
    expect(screenToCombatTile(208, 272, 320, 320, { x: 10, y: 0 }, 32)).toEqual({ x: 11, y: 1 });
  });
  it('converts top-left screen tiles to north-increasing world coordinates', () => {
    expect(screenToCombatTile(24, 24, 240, 240, { x: 10, y: 0 })).toEqual({ x: 8, y: 4 });
    expect(screenToCombatTile(120, 216, 240, 240, { x: 10, y: 0 })).toEqual({ x: 10, y: 0 });
  });
  it('supports camera inspection at the far edge of the battlefield', () => {
    expect(screenToCombatTile(120, 24, 240, 240, { x: 10, y: 19 })).toEqual({ x: 10, y: 19 });
  });
  it('rejects Canvas padding and points outside the visible area', () => {
    expect(screenToCombatTile(2, 24, 260, 260, { x: 10, y: 0 })).toBeNull();
    expect(screenToCombatTile(259, 24, 260, 260, { x: 10, y: 0 })).toBeNull();
    expect(screenToCombatTile(-1, 24, 240, 240, { x: 10, y: 0 })).toBeNull();
  });
});
