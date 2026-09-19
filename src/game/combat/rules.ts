export const COMBAT_GRID_SIZE = 20;
export const DEFAULT_ARMOR_CLASS = 10;
export const ORTHOGONAL_COST = 1;
export const DIAGONAL_COST = 1.4;
// Exact bookkeeping: integer hundredths accommodate 1.4 costs and quarter carry penalties.
// No movement rounding is performed.
export const MOVEMENT_UNITS_PER_POINT = 100;
export const VERY_GOOD_MULTIPLIER = 1.5;

// Provisional rules explicitly requested for this milestone; final design is unresolved.
export const PROVISIONAL_CRITICAL_MULTIPLIER = 1.5;
export const PROVISIONAL_MINIMUM_DAMAGE = 1;
export const roundProvisionalDamage = Math.floor;
// User-approved unencumbered starting-load input, not an item weight definition.
export const PROVISIONAL_UNENCUMBERED_LOAD = 0;
