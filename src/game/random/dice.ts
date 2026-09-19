export type DiceRoller = (sides: number) => number;

export function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const rollDie: DiceRoller = (sides) => randomInteger(1, sides);

export function rollD20(roll: DiceRoller = rollDie): number {
  return roll(20);
}
