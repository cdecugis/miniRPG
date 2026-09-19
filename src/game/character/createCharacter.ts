import type { Character } from './character';

export const STARTING_CHARACTER = {
  level: 1,
  strength: 10,
  agility: 10,
  willpower: 10,
  intelligence: 10,
  charisma: 10,
  maxHP: 10,
  currentHP: 10,
  gold: 100,
  equipment: ['long_sword'],
  backpack: [],
} as const satisfies Omit<Character, 'name'>;

export function createCharacter(name: string): Character {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    throw new Error('Enter a character name.');
  }

  return {
    ...STARTING_CHARACTER,
    name: trimmedName,
    equipment: [...STARTING_CHARACTER.equipment],
    backpack: [],
  };
}
