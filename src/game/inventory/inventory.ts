import type { Character } from '../character/character';
import { ITEMS, type ItemId, type WeaponDefinition } from '../items/items';

export const CARRY_KG_PER_STRENGTH = 5;

export function getCarryCapacity(strength: number): number {
  return strength * CARRY_KG_PER_STRENGTH;
}

/** Unknown item weights must not be silently counted as zero. */
export function getCarriedItemWeight(character: Character): number | null {
  let total = 0;
  for (const id of [...character.equipment, ...character.backpack]) {
    const item: WeaponDefinition = ITEMS[id];
    if (item.weightKg === undefined) return null;
    total += item.weightKg;
  }
  return total;
}

export function equipItem(character: Character, id: ItemId): Character {
  const index = character.backpack.indexOf(id);
  if (index < 0 || character.equipment.length > 0) return character;
  return { ...character, equipment: [id], backpack: character.backpack.filter((_, i) => i !== index) };
}

export function unequipItem(character: Character, id: ItemId): Character {
  const index = character.equipment.indexOf(id);
  if (index < 0) return character;
  return { ...character, equipment: character.equipment.filter((_, i) => i !== index), backpack: [...character.backpack, id] };
}
