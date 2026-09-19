import { expect, it } from 'vitest';
import { ITEMS } from './items';

it('defines the Long Sword independently with its specified damage range', () => {
  expect(ITEMS.long_sword).toEqual({
    id: 'long_sword',
    name: 'Long Sword',
    damageMin: 1,
    damageMax: 8,
  });
});
