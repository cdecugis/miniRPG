const ATTRIBUTE_BONUS_BASELINE = 10;

export function getAttributeBonus(value: number): number {
  return value - ATTRIBUTE_BONUS_BASELINE;
}
