import type { CombatEvent, CombatState } from '../../game/combat/types';
import { ATTACKS } from '../../game/combat/attacks';
import { PROVISIONAL_MINIMUM_DAMAGE } from '../../game/combat/rules';

/** Tracks event identities, so rendering or replaying a snapshot does not repeat feedback. */
export function createCombatFeedback(emit: (event: CombatEvent, combat: CombatState) => void) {
  const seen = new WeakSet<CombatEvent>();
  return (combat: CombatState) => {
    for (const event of combat.events) {
      if (seen.has(event)) continue;
      seen.add(event);
      if (event.type === 'initiative' || event.type === 'attack') emit(event, combat);
    }
  };
}

export function logCombatRoll(event: CombatEvent, combat: CombatState) {
  if (event.type !== 'initiative' && event.type !== 'attack') return;
  const actor = combat.combatants.find((entry) => entry.id === event.actorId)!;
  console.info(`[Combat] ${actor.name}: ${event.type}`, event.type === 'initiative'
    ? { actor: actor.id, die: 'd20', ...event.result }
    : { actor: actor.id, target: event.targetId, weapon: ATTACKS[event.attackId].name,
      damageDie: `${ATTACKS[event.attackId].damageMin}–${ATTACKS[event.attackId].damageMax}`,
      damageDieRolled: event.result.hit,
      hitRule: 'finalAttackRoll > targetArmorClass', rounding: 'floor', minimumHitDamage: PROVISIONAL_MINIMUM_DAMAGE,
      ...event.result });
}
