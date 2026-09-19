export interface WeaponDefinition {
  readonly id: string;
  readonly name: string;
  readonly damageMin: number;
  readonly damageMax: number;
  readonly weightKg?: number;
}

export const ITEMS = {
  long_sword: {
    id: 'long_sword',
    name: 'Long Sword',
    damageMin: 1,
    damageMax: 8,
  },
} as const satisfies Record<string, WeaponDefinition>;

export type ItemId = keyof typeof ITEMS;
