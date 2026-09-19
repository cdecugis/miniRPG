import { describe, expect, it, vi } from 'vitest';
import { createCharacter } from '../../game/character/createCharacter';
import { createExploration } from '../../game/world/testMap';
import { createCombat, attackCombatant } from '../../game/combat/engine';
import { createCombatFeedback, logCombatRoll } from './combatFeedback';

describe('combat feedback', () => {
  const initial = () => createCombat(createCharacter('Rowan'), { locationId: 'world', world: createExploration() }, 0, 'test', () => 12);
  it('emits every initiative and attack once, even when a snapshot is rendered again', () => {
    const emit = vi.fn();
    const consume = createCombatFeedback(emit);
    const combat = initial();
    consume(combat);
    consume(combat);
    expect(emit).toHaveBeenCalledTimes(2);
    const adjacent = { ...combat, activeCombatantId: 'player', combatants: combat.combatants.map((actor) =>
      actor.id === 'wolf' ? { ...actor, position: { x: 10, y: 1 } } : actor) };
    const attacked = attackCombatant(adjacent, 'player', 'wolf', () => 1);
    consume(attacked);
    consume({ ...attacked });
    expect(emit).toHaveBeenCalledTimes(3);
    expect(emit.mock.calls[2][0]).toMatchObject({ type: 'attack', result: { hit: false, naturalRolls: [1] } });
  });
  it('prints complete structured roll details without mutating combat', () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    try {
      const combat = initial();
      const before = JSON.stringify(combat);
      logCombatRoll(combat.events[0], combat);
      expect(log).toHaveBeenCalledWith('[Combat] Rowan: initiative', expect.objectContaining({ naturalRoll: 12, agilityBonus: 0, total: 12 }));
      expect(JSON.stringify(combat)).toBe(before);
    } finally { log.mockRestore(); }
  });
  it('logs chained attack dice, damage die, bonuses and final damage for auditing', () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    try {
      const combat = initial();
      const adjacent = { ...combat, activeCombatantId: 'player', combatants: combat.combatants.map((actor) =>
        actor.id === 'wolf' ? { ...actor, position: { x: 10, y: 1 } } : actor) };
      const dice = [20, 20, 5, 3];
      const attacked = attackCombatant(adjacent, 'player', 'wolf', () => dice.shift()!);
      const attack = attacked.events.find((event) => event.type === 'attack')!;
      logCombatRoll(attack, attacked);
      expect(log).toHaveBeenCalledWith('[Combat] Rowan: attack', expect.objectContaining({
        naturalRolls: [20, 20, 5], rawRollTotal: 45, attackBonus: 0, finalAttackRoll: 45,
        targetArmorClass: 10, hitQuality: 'critical', damageDieRolled: true,
        baseDamage: 3, damageBonus: 0, multiplier: 1.5, finalDamage: 4, rounding: 'floor',
      }));
    } finally { log.mockRestore(); }
  });
});
