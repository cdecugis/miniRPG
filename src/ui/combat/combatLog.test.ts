import { expect, it } from 'vitest';
import { createCharacter } from '../../game/character/createCharacter';
import { createExploration } from '../../game/world/testMap';
import { createCombat, attackCombatant } from '../../game/combat/engine';
import { formatCombatLog } from './combatLog';

it('explains exploding rolls and hit quality from structured results', () => {
  const created = createCombat(createCharacter('Rowan'), { locationId: 'world', world: createExploration() }, 0, 'test', () => 10);
  const initial = { ...created, activeCombatantId: 'player', combatants: created.combatants.map((actor) => actor.id === 'wolf'
    ? { ...actor, position: { x: 10, y: 1 } } : actor) };
  const rolls = [20, 20, 7, 3];
  const state = attackCombatant(initial, 'player', 'wolf', () => rolls.shift()!);
  const log = formatCombatLog(state).join('\n');
  expect(log).toContain('20 + 20 + 7 + 0 = 47 against AC 10');
  expect(log).toContain('Critical Roll!');
  expect(log).toContain('Long Sword deals 4 damage');
  expect(state.combatants[1].currentHP).toBe(2);
});
