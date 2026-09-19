import { describe, expect, it, vi } from 'vitest';
import { createCharacter } from '../character/createCharacter';
import { createExploration } from '../world/testMap';
import type { DiceRoller } from '../random/dice';
import { ATTACKS } from './attacks';
import { attackCombatant, canAttack, createCombat, endTurn, moveCombatant } from './engine';
import { calculateCarryPenalty, calculateMovementPoints, getRemainingMovement, getReachableAdjacentTiles } from './movement';
import { orderInitiative, rollInitiative } from './initiative';
import { calculateAttackRoll, calculateDamage, getHitQuality, resolveAttack } from './resolveAttack';
import { runEnemyTurn } from './enemyAI';
import type { CombatState } from './types';

function sequence(...values: number[]): DiceRoller {
  return (sides) => {
    const value = values.shift();
    if (value === undefined || value < 1 || value > sides) throw new Error(`Invalid test roll ${value} for d${sides}`);
    return value;
  };
}

function battle(roll: DiceRoller = sequence(18, 1)): CombatState {
  return createCombat(createCharacter('Rowan'), { locationId: 'world', world: createExploration() }, 0, 'test_wolf', roll);
}

function adjacentBattle(): CombatState {
  const state = battle();
  return { ...state, combatants: state.combatants.map((actor) => actor.id === 'wolf' ? { ...actor, position: { x: 11, y: 1 } } : actor) };
}

describe('initiative and combat setup', () => {
  it('adds the Agility bonus to a single d20 without exploding initiative', () => {
    expect(rollInitiative(12, sequence(20))).toEqual({ naturalRoll: 20, agilityBonus: 2, total: 22 });
  });
  it('uses the specified grid start positions and a serializable return snapshot', () => {
    const state = battle();
    expect(state.combatants.map((actor) => actor.position)).toEqual([{ x: 10, y: 0 }, { x: 10, y: 19 }]);
    expect(state.combatants[1]).toMatchObject({ strength: 8, agility: 12, willpower: 8, intelligence: 3, charisma: 3, currentHP: 6, armorClass: 10 });
    expect(state.turnOrder).toEqual(['player', 'wolf']);
    expect(state.activeCombatantId).toBe('player');
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
  it('orders by total, then Agility, then stable ID regardless of input ordering', () => {
    const state = battle(sequence(14, 12));
    expect(state.turnOrder).toEqual(['wolf', 'player']);
    const tied = state.combatants.map((actor) => ({ ...actor, agility: 10 }));
    expect(orderInitiative([...tied].reverse())).toEqual(['player', 'wolf']);
    expect(battle(sequence(2, 18)).turnOrder).toEqual(['wolf', 'player']);
  });
  it('resets movement at each turn and retains HP between rounds', () => {
    let state = moveCombatant(battle(), 'player', { x: 10, y: 1 });
    expect(getRemainingMovement(state.combatants[0])).toBe(9);
    state = endTurn(state, 'player');
    expect(state.activeCombatantId).toBe('wolf');
    expect(getRemainingMovement(state.combatants[1])).toBe(12);
    state = endTurn(state, 'wolf');
    expect(getRemainingMovement(state.combatants[0])).toBe(10);
  });
});

describe('carrying and movement', () => {
  it.each([[0, 0], [20, 0], [20.1, 0.25], [30, 0.25], [30.1, 0.5], [40, 0.5], [40.1, 1]])('applies carrying tier at %s kg', (weight, penalty) => {
    expect(calculateCarryPenalty(10, weight)).toBe(penalty);
    expect(calculateMovementPoints(10, 10, weight)).toBe(10 * (1 - penalty));
  });
  it('preserves fractional carrying budgets', () => {
    expect(calculateMovementPoints(11, 10, 25)).toBe(8.25);
  });
  it('charges 1 orthogonally and 1.4 diagonally', () => {
    let state = moveCombatant(battle(), 'player', { x: 10, y: 1 });
    expect(getRemainingMovement(state.combatants[0])).toBe(9);
    state = moveCombatant(state, 'player', { x: 11, y: 2 });
    expect(getRemainingMovement(state.combatants[0])).toBe(7.6);
  });
  it('spends the full budget with mixed movement without rounding or floating drift', () => {
    let state = battle();
    for (let step = 1; step <= 5; step++) state = moveCombatant(state, 'player', { x: 10 + step, y: step });
    for (let step = 6; step <= 8; step++) state = moveCombatant(state, 'player', { x: 15, y: step });
    expect(getRemainingMovement(state.combatants[0])).toBe(0);
    expect(moveCombatant(state, 'player', { x: 15, y: 9 })).toBe(state);
  });
  it('prevents a diagonal if only 1 MP remains but still allows an orthogonal step', () => {
    let state = battle();
    for (let y = 1; y <= 9; y++) state = moveCombatant(state, 'player', { x: 10, y });
    expect(moveCombatant(state, 'player', { x: 11, y: 10 })).toBe(state);
    expect(moveCombatant(state, 'player', { x: 10, y: 10 })).not.toBe(state);
  });
  it.each([{ x: -1, y: 0 }, { x: 20, y: 0 }, { x: 10, y: -1 }, { x: 10, y: 20 }, { x: 10.5, y: 1 }, { x: NaN, y: 1 }, { x: 10, y: 0 }, { x: 10, y: 2 }])('rejects invalid destination %j', (tile) => {
    const state = battle();
    expect(moveCombatant(state, 'player', tile)).toBe(state);
  });
  it('blocks occupied destinations, inactive actors and movement after combat', () => {
    const state = adjacentBattle();
    expect(moveCombatant(state, 'player', { x: 11, y: 1 })).toBe(state);
    expect(moveCombatant(state, 'wolf', { x: 12, y: 1 })).toBe(state);
    const won = { ...state, status: 'victory' as const };
    expect(moveCombatant(won, 'player', { x: 10, y: 1 })).toBe(won);
    expect(getReachableAdjacentTiles(won, 'player')).toEqual([]);
  });
  it('applies actual supplied load at the start of the player turn', () => {
    const character = createCharacter('Rowan');
    const state = createCombat(character, { locationId: 'world', world: createExploration() }, 41, 'test', sequence(18, 1));
    expect(getRemainingMovement(state.combatants[0])).toBe(0);
    expect(getReachableAdjacentTiles(state, 'player')).toEqual([]);
  });
});

describe('attack resolution', () => {
  const attacker = { ...createCharacter('Rowan'), strength: 13, agility: 8 };
  it('uses the Long Sword Strength bonus for attacks and 1d8 damage', () => {
    const roll = vi.fn(sequence(14, 6));
    const result = resolveAttack(attacker, 10, 30, ATTACKS.long_sword, roll);
    expect(result).toMatchObject({ attackBonus: 3, finalAttackRoll: 17, baseDamage: 6, damageBonus: 3, finalDamage: 9, remainingHP: 21 });
    expect(roll.mock.calls).toEqual([[20], [8]]);
  });
  it('uses the Wolf Bite configured Agility attack and Strength damage bonuses', () => {
    const wolf = battle().combatants[1];
    const roll = vi.fn(sequence(12, 4));
    expect(resolveAttack(wolf, 10, 10, ATTACKS.wolf_bite, roll)).toMatchObject({ attackBonus: 2, finalAttackRoll: 14, damageBonus: -2, finalDamage: 2, remainingHP: 8 });
    expect(roll.mock.calls).toEqual([[20], [4]]);
  });
  it('misses at equality and does not roll damage', () => {
    expect(resolveAttack(attacker, 10, 10, ATTACKS.long_sword, sequence(7))).toMatchObject({ hit: false, hitQuality: 'miss', finalDamage: 0, remainingHP: 10 });
  });
  it('hits only above AC', () => {
    expect(resolveAttack(attacker, 10, 10, ATTACKS.long_sword, sequence(8, 1))).toMatchObject({ hit: true, finalAttackRoll: 11 });
  });
  it('explodes a natural 20 and preserves every roll', () => {
    expect(calculateAttackRoll(3, sequence(20, 14))).toEqual({ naturalRolls: [20, 14], rawRollTotal: 34, attackBonus: 3, finalAttackRoll: 37 });
    expect(calculateAttackRoll(0, sequence(20, 20, 7))).toEqual({ naturalRolls: [20, 20, 7], rawRollTotal: 47, attackBonus: 0, finalAttackRoll: 47 });
  });
  it.each([[-1, 'miss'], [0, 'miss'], [1, 'normal'], [10, 'normal'], [11, 'very_good'], [20, 'very_good'], [21, 'critical']])('classifies margin %s as %s', (margin, expected) => {
    expect(getHitQuality(Number(margin))).toBe(expected);
  });
  it('uses provisional floor rounding and the provisional critical multiplier', () => {
    expect(calculateDamage(3, 0, 'very_good').finalDamage).toBe(4);
    expect(calculateDamage(3, 0, 'critical').finalDamage).toBe(4);
  });
  it('enforces minimum successful damage after attribute penalties', () => {
    expect(calculateDamage(1, -2, 'normal').finalDamage).toBe(1);
    expect(calculateDamage(1, -2, 'critical').finalDamage).toBe(1);
    expect(calculateDamage(1, -2, 'miss').finalDamage).toBe(0);
  });
  it('clamps HP to zero', () => {
    expect(resolveAttack(attacker, 10, 2, ATTACKS.long_sword, sequence(14, 8)).remainingHP).toBe(0);
  });
});

describe('turn attacks and Wolf AI', () => {
  it('requires adjacency including diagonals and does not spend a turn on invalid attacks', () => {
    const state = battle();
    expect(attackCombatant(state, 'player', 'wolf', sequence())).toBe(state);
    expect(canAttack(adjacentBattle(), 'player', 'wolf')).toBe(true);
    expect(canAttack(adjacentBattle(), 'wolf', 'player')).toBe(false);
  });
  it('ends a player turn after an attack, including a miss', () => {
    const state = attackCombatant(adjacentBattle(), 'player', 'wolf', sequence(10));
    expect(state.activeCombatantId).toBe('wolf');
    expect(attackCombatant(state, 'player', 'wolf', sequence())).toBe(state);
  });
  it('ends combat immediately on victory without awarding an enemy turn', () => {
    const state = attackCombatant(adjacentBattle(), 'player', 'wolf', sequence(15, 8));
    expect(state.status).toBe('victory');
    expect(state.combatants[1].currentHP).toBe(0);
    expect(runEnemyTurn(state, sequence())).toBe(state);
    expect(endTurn(state, 'player')).toBe(state);
  });
  it('moves the Wolf toward the player until its movement is used', () => {
    const initial = battle(sequence(1, 18));
    const state = runEnemyTurn(initial, sequence());
    expect(state.combatants[1].position).toEqual({ x: 10, y: 7 });
    expect(getRemainingMovement(state.combatants[1])).toBe(0);
    expect(state.activeCombatantId).toBe('player');
    expect(initial.combatants[1].position).toEqual({ x: 10, y: 19 });
  });
  it('supports diagonal pursuit and attacks as soon as adjacent', () => {
    const initial = endTurn(adjacentBattle(), 'player');
    const far = { ...initial, combatants: initial.combatants.map((actor) => actor.id === 'wolf' ? { ...actor, position: { x: 14, y: 4 } } : actor) };
    const state = runEnemyTurn(far, sequence(12, 4));
    expect(state.combatants[1].position).toEqual({ x: 11, y: 1 });
    expect(getRemainingMovement(state.combatants[1])).toBe(7.8);
    expect(state.combatants[0].currentHP).toBe(8);
    expect(state.activeCombatantId).toBe('player');
  });
  it('attacks without moving when already adjacent, and defeat ends combat', () => {
    const initial = endTurn(adjacentBattle(), 'player');
    const fragile = { ...initial, combatants: initial.combatants.map((actor) => actor.id === 'player' ? { ...actor, currentHP: 1 } : actor) };
    const state = runEnemyTurn(fragile, sequence(12, 4));
    expect(state.status).toBe('defeat');
    expect(state.combatants[0].currentHP).toBe(0);
    expect(state.events.filter((event) => event.type === 'move')).toEqual([]);
    expect(attackCombatant(state, 'wolf', 'player', sequence())).toBe(state);
  });
});
