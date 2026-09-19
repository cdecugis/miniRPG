import { ITEMS } from '../items/items';

export type AttributeName = 'strength' | 'agility' | 'willpower' | 'intelligence' | 'charisma';
export type CombatAttributes = Readonly<Record<AttributeName, number>>;

export interface AttackDefinition {
  readonly id: string;
  readonly name: string;
  readonly damageMin: number;
  readonly damageMax: number;
  readonly attackAttribute: AttributeName;
  readonly damageAttribute: AttributeName;
  readonly meleeRange: number;
}

export const ATTACKS = {
  long_sword: { ...ITEMS.long_sword, attackAttribute: 'strength', damageAttribute: 'strength', meleeRange: 1 },
  wolf_bite: { id: 'wolf_bite', name: 'Wolf Bite', damageMin: 1, damageMax: 4,
    attackAttribute: 'agility', damageAttribute: 'strength', meleeRange: 1 },
  spider_bite: { id: 'spider_bite', name: 'Spider Bite', damageMin: 1, damageMax: 4,
    attackAttribute: 'agility', damageAttribute: 'strength', meleeRange: 1 },
  snake_bite: { id: 'snake_bite', name: 'Snake Bite', damageMin: 1, damageMax: 4,
    attackAttribute: 'agility', damageAttribute: 'strength', meleeRange: 1 },
  goblin_club: { id: 'goblin_club', name: 'Goblin Club', damageMin: 1, damageMax: 6,
    attackAttribute: 'strength', damageAttribute: 'strength', meleeRange: 1 },
} as const satisfies Record<string, AttackDefinition>;

export type AttackId = keyof typeof ATTACKS;
