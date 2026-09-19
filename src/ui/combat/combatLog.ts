import { ATTACKS } from '../../game/combat/attacks';
import type { CombatState } from '../../game/combat/types';

export function formatCombatLog(state: CombatState): string[] {
  const name = (id: string) => state.combatants.find((actor) => actor.id === id)?.name ?? id;
  const signed = (value: number) => value < 0 ? `- ${Math.abs(value)}` : `+ ${value}`;
  const lines: string[] = [];
  for (let index = 0; index < state.events.length; index++) {
    const event = state.events[index];
    if (event.type === 'move') {
      let count = 1;
      while (state.events[index + 1]?.type === 'move' && (state.events[index + 1] as typeof event).actorId === event.actorId) { count++; index++; }
      lines.push(`${name(event.actorId)} moves ${count} ${count === 1 ? 'tile' : 'tiles'}.`);
    } else if (event.type === 'initiative') {
      lines.push(`${name(event.actorId)} initiative: ${event.result.naturalRoll} ${signed(event.result.agilityBonus)} = ${event.result.total}.`);
    } else if (event.type === 'turn') {
      lines.push(`${name(event.actorId)}'s turn.`);
    } else if (event.type === 'finished') {
      lines.push(event.status === 'victory' ? `Victory! The ${state.combatants.find((actor) => actor.side === 'enemy')?.name ?? 'enemy'} is defeated.` : 'Game Over.');
    } else {
      const result = event.result;
      lines.push(`${name(event.actorId)} rolls ${result.naturalRolls.join(' + ')} ${signed(result.attackBonus)} = ${result.finalAttackRoll} against AC ${result.targetArmorClass}.`);
      if (!result.hit) { lines.push(`${name(event.actorId)} misses ${name(event.targetId)}.`); continue; }
      const quality = result.hitQuality === 'critical' ? 'Critical Roll! ' : result.hitQuality === 'very_good' ? 'Very Good Roll! ' : '';
      lines.push(`${quality}${name(event.actorId)} hits ${name(event.targetId)}. ${ATTACKS[event.attackId].name} deals ${result.finalDamage} damage (${result.baseDamage} ${signed(result.damageBonus)}${result.multiplier !== 1 ? `, ×${result.multiplier}` : ''}).`);
    }
  }
  return lines;
}
