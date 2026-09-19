import { describe, expect, it } from 'vitest';
import { getAttributeBonus } from './getAttributeBonus';

describe('getAttributeBonus', () => {
  it.each([
    [8, -2],
    [10, 0],
    [11, 1],
    [13, 3],
    [20, 10],
    [10.5, 0.5],
  ])('returns bonus %s - 10 = %s without rounding', (value, expected) => {
    expect(getAttributeBonus(value)).toBe(expected);
  });
});
