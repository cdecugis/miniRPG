import type { AttackId, CombatAttributes } from '../combat/attacks';

export interface EnemyDefinition extends CombatAttributes {
  readonly id: string;
  readonly name: string;
  readonly maxHP: number;
  readonly armorClass: number;
  readonly attackId: AttackId;
  readonly level: number;
}

export const ENEMIES = {
  wolf: { id: 'wolf', name: 'Wolf', level: 1, strength: 8, agility: 12, willpower: 8,
    intelligence: 3, charisma: 3, maxHP: 6, armorClass: 10, attackId: 'wolf_bite' },
  // User-authorized provisional level-one balancing. No special abilities.
  spider: { id: 'spider', name: 'Spider', level: 1, strength: 7, agility: 9, willpower: 7,
    intelligence: 2, charisma: 2, maxHP: 4, armorClass: 10, attackId: 'spider_bite' },
  snake: { id: 'snake', name: 'Snake', level: 1, strength: 8, agility: 10, willpower: 7,
    intelligence: 2, charisma: 2, maxHP: 5, armorClass: 10, attackId: 'snake_bite' },
  goblin: { id: 'goblin', name: 'Goblin', level: 1, strength: 9, agility: 9, willpower: 8,
    intelligence: 8, charisma: 7, maxHP: 7, armorClass: 10, attackId: 'goblin_club' },
} as const satisfies Record<string, EnemyDefinition>;

export type EnemyTypeId = keyof typeof ENEMIES;
