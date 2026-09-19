import { getSpawnTiles } from '../enemies/roamingEnemies';
import { TEST_MAP } from '../world/testMap';
import { describe, expect, it } from 'vitest';
import { createCharacter } from '../character/createCharacter';
import { createGameStore } from '../gameStore';
import { createCombat, canAttack, attackCombatant } from '../combat/engine';
import { createExploration } from '../world/testMap';
import { equipItem, getCarriedItemWeight, getCarryCapacity, unequipItem } from './inventory';

describe('inventory', () => {
  it.each([[10, 50], [13, 65], [20, 100]])('Strength %i provides %i kg capacity', (strength, capacity) => {
    expect(getCarryCapacity(strength)).toBe(capacity);
  });
  it('keeps undefined weights distinct from a weight of zero', () => {
    expect(getCarriedItemWeight(createCharacter('Rowan'))).toBeNull();
  });
  it('moves the existing sword to the backpack and back without duplication or changing gold', () => {
    const original = createCharacter('Rowan');
    const unequipped = unequipItem(original, 'long_sword');
    expect(unequipped.equipment).toEqual([]);
    expect(unequipped.backpack).toEqual(['long_sword']);
    expect(unequipItem(unequipped, 'long_sword')).toBe(unequipped);
    const equipped = equipItem(unequipped, 'long_sword');
    expect(equipped).toEqual(original);
    expect(equipItem(equipped, 'long_sword')).toBe(equipped);
    expect(original.equipment).toEqual(['long_sword']);
  });
  it('stores inventory in serializable game state and rejects equipment changes during combat', () => {
    const tiles = getSpawnTiles(TEST_MAP, { x: 15, y: 14 });
    const spawn = [1, tiles.findIndex((tile) => tile.x === 29 && tile.y === 14) + 1, 1];
    const store = createGameStore(() => 12, () => spawn.shift() ?? 100);
    store.startNewGame('Rowan');
    store.unequipItem('long_sword');
    expect(store.getSnapshot().character?.backpack).toEqual(['long_sword']);
    expect(JSON.parse(JSON.stringify(store.getSnapshot()))).toEqual(store.getSnapshot());
    for (let i = 0; i < 12 && !store.getSnapshot().combat; i++) store.movePlayer('east');
    const before = store.getSnapshot();
    expect(before.combat).not.toBeNull();
    store.equipItem('long_sword');
    expect(store.getSnapshot()).toBe(before);
  });
  it('does not allow sword attacks when the sword is in the backpack', () => {
    const character = unequipItem(createCharacter('Rowan'), 'long_sword');
    const combat = createCombat(character, { locationId: 'world', world: createExploration() }, 0, 'test', () => 12);
    const adjacent = { ...combat, activeCombatantId: 'player', combatants: combat.combatants.map((actor) =>
      actor.id === 'wolf' ? { ...actor, position: { x: 10, y: 1 } } : actor) };
    expect(canAttack(adjacent, 'player', 'wolf')).toBe(false);
    expect(attackCombatant(adjacent, 'player', 'wolf')).toBe(adjacent);
  });
});
