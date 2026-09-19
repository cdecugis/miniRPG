import { getAttributeBonus } from '../character/getAttributeBonus';
import { rollD20, rollDie } from '../random/dice';
import type { DiceRoller } from '../random/dice';
import type { Combatant, InitiativeResult } from './types';

export function rollInitiative(agility: number, roll: DiceRoller = rollDie): InitiativeResult {
  const naturalRoll = rollD20(roll);
  const agilityBonus = getAttributeBonus(agility);
  return { naturalRoll, agilityBonus, total: naturalRoll + agilityBonus };
}

export function orderInitiative(combatants: readonly Combatant[]): string[] {
  return [...combatants].sort((a, b) => b.initiative.total - a.initiative.total
    || b.agility - a.agility || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map((combatant) => combatant.id);
}
