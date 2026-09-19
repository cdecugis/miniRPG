import type { ItemId } from '../items/items';

export interface Character {
  readonly name: string;
  readonly level: number;
  readonly strength: number;
  readonly agility: number;
  readonly willpower: number;
  readonly intelligence: number;
  readonly charisma: number;
  readonly maxHP: number;
  readonly currentHP: number;
  readonly gold: number;
  readonly equipment: readonly ItemId[];
  readonly backpack: readonly ItemId[];
}
