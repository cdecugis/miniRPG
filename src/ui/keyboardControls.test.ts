import { describe, expect, it } from 'vitest';
import { getKeyboardDirection } from './keyboardControls';

describe('keyboard direction mapping', () => {
  it.each([
    ['ArrowUp', 'north'], ['ArrowDown', 'south'], ['ArrowLeft', 'west'], ['ArrowRight', 'east'],
    ['q', 'northWest'], ['e', 'northEast'], ['z', 'southWest'], ['c', 'southEast'],
    ['Q', 'northWest'], ['E', 'northEast'], ['Z', 'southWest'], ['C', 'southEast'],
    ['7', 'northWest'], ['8', 'north'], ['9', 'northEast'], ['4', 'west'],
    ['6', 'east'], ['1', 'southWest'], ['2', 'south'], ['3', 'southEast'],
  ])('maps %s to %s', (key, expected) => {
    expect(getKeyboardDirection(key)).toBe(expected);
  });

  it.each(['Tab', 'Enter', ' ', '5', 'a'])('ignores unrelated key %s', (key) => {
    expect(getKeyboardDirection(key)).toBeUndefined();
  });
});
