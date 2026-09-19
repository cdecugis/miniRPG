import { describe, expect, it } from 'vitest';
import { createCharacter } from './createCharacter';

describe('createCharacter', () => {
  it('uses the player name and trims surrounding whitespace', () => {
    expect(createCharacter('  Rowan  ').name).toBe('Rowan');
  });

  it.each(['', '   ', '\t\n'])('rejects an empty or whitespace-only name: %j', (name) => {
    expect(() => createCharacter(name)).toThrow('Enter a character name.');
  });

  it('starts all five attributes at 10', () => {
    expect(createCharacter('Rowan')).toMatchObject({
      strength: 10,
      agility: 10,
      willpower: 10,
      intelligence: 10,
      charisma: 10,
    });
  });

  it('starts at level 1', () => {
    expect(createCharacter('Rowan').level).toBe(1);
  });

  it('starts with 10 current and maximum HP', () => {
    expect(createCharacter('Rowan')).toMatchObject({ maxHP: 10, currentHP: 10 });
  });

  it('starts with 100 gold', () => {
    expect(createCharacter('Rowan').gold).toBe(100);
  });

  it('starts with exactly one Long Sword, referenced by stable ID', () => {
    expect(createCharacter('Rowan').equipment).toEqual(['long_sword']);
  });

  it('creates independent character and equipment instances', () => {
    const first = createCharacter('Rowan');
    const second = createCharacter('Ash');
    expect(first).not.toBe(second);
    expect(first.equipment).not.toBe(second.equipment);
  });

  it('round-trips through JSON without losing character data', () => {
    const character = createCharacter('Rowan');
    expect(JSON.parse(JSON.stringify(character))).toEqual(character);
  });
});
