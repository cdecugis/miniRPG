import { describe, expect, it } from 'vitest';
import { createGameStore } from '../gameStore';
import type { DiceRoller } from '../random/dice';
import { getSpawnTiles } from '../enemies/roamingEnemies';
import { TEST_MAP } from '../world/testMap';

function rolls(...values: number[]): DiceRoller {
  return (sides) => {
    const value = values.shift();
    if (value === undefined || value < 1 || value > sides) throw new Error(`Unexpected d${sides} roll: ${value}`);
    return value;
  };
}

function startEncounter(roll: DiceRoller) {
  const tiles = getSpawnTiles(TEST_MAP, { x: 15, y: 14 });
  const index = tiles.findIndex((tile) => tile.x === 29 && tile.y === 14) + 1;
  const spawnRolls = [1, index, 1];
  const store = createGameStore(roll, () => spawnRolls.shift() ?? 100);
  store.startNewGame('Rowan');
  for (let step = 0; step < 12 && !store.getSnapshot().combat; step++) store.movePlayer('east');
  return store;
}

describe('playable outdoor combat integration', () => {
  it('starts combat when a spawned Wolf reaches adjacency and preserves the return snapshot', () => {
    const store = startEncounter(rolls(18, 1));
    const state = store.getSnapshot();
    expect(state.world?.playerPosition).toEqual({ x: 22, y: 14 });
    expect(state.combat?.encounterId).toBe('roaming_1');
    expect(state.combat?.returnTo.world).toBe(state.world);
    expect(state.combat?.returnTo.locationId).toBe('world');
    expect(state.combat?.combatants[0].movementBudget).toBe(10);
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  it('does not trigger on other outdoor tiles or in Greenhaven', () => {
    const store = createGameStore(rolls(), () => 100);
    store.startNewGame('Rowan');
    for (let step = 0; step < 5; step++) store.movePlayer('north');
    store.interact('enter_greenhaven');
    expect(store.getSnapshot().currentLocationId).toBe('greenhaven');
    expect(store.getSnapshot().combat).toBeNull();
  });

  it('pauses exploration, dialogue and player combat actions during the Wolf turn', () => {
    const store = startEncounter(rolls(1, 18));
    const previous = store.getSnapshot();
    store.movePlayer('west');
    store.interact('enter_greenhaven');
    store.advanceDialogue();
    store.moveInCombat({ x: 10, y: 1 });
    store.attackEnemy();
    store.endCombatTurn();
    store.returnToExploration();
    expect(store.getSnapshot()).toBe(previous);
    store.runEnemyTurn(previous.combat!);
    expect(store.getSnapshot().combat?.activeCombatantId).toBe('player');
    const after = store.getSnapshot();
    store.runEnemyTurn(previous.combat!);
    expect(store.getSnapshot()).toBe(after);
  });

  it('plays movement, attacks, damage, victory and return without rewards or immediate re-triggering', () => {
    const store = startEncounter(rolls(18, 1, 15, 4, 12, 4, 15, 2));
    const journal = store.getSnapshot().journal;
    store.endCombatTurn();
    store.runEnemyTurn(store.getSnapshot().combat!);
    for (let y = 1; y <= 6; y++) store.moveInCombat({ x: 10, y });
    store.attackEnemy();
    expect(store.getSnapshot().combat?.combatants[1].currentHP).toBe(2);
    store.runEnemyTurn(store.getSnapshot().combat!);
    expect(store.getSnapshot().character?.currentHP).toBe(8);
    store.attackEnemy();
    expect(store.getSnapshot().combat?.status).toBe('victory');
    const finished = store.getSnapshot();
    store.endCombatTurn();
    store.movePlayer('west');
    expect(store.getSnapshot()).toBe(finished);
    store.returnToExploration();
    expect(store.getSnapshot()).toMatchObject({ combat: null, currentLocationId: 'world', completedEncounters: ['roaming_1'],
      character: { currentHP: 8, gold: 100, level: 1, equipment: ['long_sword'] } });
    expect(store.getSnapshot().world?.playerPosition).toEqual({ x: 22, y: 14 });
    expect(store.getSnapshot().journal).toBe(journal);
    store.movePlayer('west');
    store.movePlayer('east');
    expect(store.getSnapshot().combat).toBeNull();
    store.startNewGame('Ash');
    expect(store.getSnapshot().completedEncounters).toEqual([]);
  });

  it('keeps defeat as Game Over with zero HP and no return or automatic recreation', () => {
    const store = startEncounter(rolls(1, 18, 12, 4, 12, 4, 12, 4, 12, 4, 12, 4));
    store.runEnemyTurn(store.getSnapshot().combat!);
    for (let turn = 0; turn < 5; turn++) {
      store.endCombatTurn();
      store.runEnemyTurn(store.getSnapshot().combat!);
    }
    expect(store.getSnapshot().combat?.status).toBe('defeat');
    expect(store.getSnapshot().character?.currentHP).toBe(0);
    const defeated = store.getSnapshot();
    store.returnToExploration();
    store.movePlayer('north');
    store.attackEnemy();
    expect(store.getSnapshot()).toBe(defeated);
  });
});
