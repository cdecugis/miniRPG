import { getAttributeBonus } from '../character/getAttributeBonus';
import { rollD20, rollDie } from '../random/dice';
import type { DiceRoller } from '../random/dice';
import type { AttackDefinition, CombatAttributes } from './attacks';
import type { AttackResult, HitQuality } from './types';
import { PROVISIONAL_CRITICAL_MULTIPLIER, PROVISIONAL_MINIMUM_DAMAGE, roundProvisionalDamage, VERY_GOOD_MULTIPLIER } from './rules';

export function getHitQuality(margin: number): HitQuality {
  if (margin <= 0) return 'miss';
  if (margin > 20) return 'critical';
  if (margin > 10) return 'very_good';
  return 'normal';
}

export function calculateAttackRoll(bonus: number, roll: DiceRoller = rollDie) {
  const naturalRolls: number[] = [];
  let naturalRoll: number;
  do {
    naturalRoll = rollD20(roll);
    naturalRolls.push(naturalRoll);
  } while (naturalRoll === 20);
  const rawRollTotal = naturalRolls.reduce((total, value) => total + value, 0);
  return { naturalRolls, rawRollTotal, attackBonus: bonus, finalAttackRoll: rawRollTotal + bonus };
}

export function calculateDamage(baseDamage: number, damageBonus: number, quality: HitQuality) {
  const damageBeforeQuality = baseDamage + damageBonus;
  const multiplier = quality === 'critical' ? PROVISIONAL_CRITICAL_MULTIPLIER : quality === 'very_good' ? VERY_GOOD_MULTIPLIER : 1;
  const finalDamage = quality === 'miss' ? 0 : Math.max(PROVISIONAL_MINIMUM_DAMAGE, roundProvisionalDamage(damageBeforeQuality * multiplier));
  return { baseDamage, damageBonus, damageBeforeQuality, multiplier, finalDamage };
}

export function resolveAttack(attacker: CombatAttributes, targetArmorClass: number, targetHP: number,
  attack: AttackDefinition, roll: DiceRoller = rollDie): AttackResult {
  const attackRoll = calculateAttackRoll(getAttributeBonus(attacker[attack.attackAttribute]), roll);
  const margin = attackRoll.finalAttackRoll - targetArmorClass;
  const hitQuality = getHitQuality(margin);
  const hit = hitQuality !== 'miss';
  const baseDamage = hit ? attack.damageMin - 1 + roll(attack.damageMax - attack.damageMin + 1) : 0;
  const damage = calculateDamage(baseDamage, getAttributeBonus(attacker[attack.damageAttribute]), hitQuality);
  return { ...attackRoll, targetArmorClass, margin, hit, hitQuality, ...damage,
    remainingHP: Math.max(0, targetHP - damage.finalDamage) };
}
