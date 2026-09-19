import type { Character } from '../game/character/character';

export function CharacterStats({ character }: { character: Character }) {
  return <dl className="character-stats" aria-label="Character stats">
    <div className="stats-name"><dt>Character</dt><dd>{character.name}</dd></div>
    <div><dt>HP</dt><dd>{character.currentHP} / {character.maxHP}</dd></div>
    {Object.entries({ Level: character.level, Gold: character.gold, Strength: character.strength,
      Agility: character.agility, Willpower: character.willpower, Intelligence: character.intelligence,
      Charisma: character.charisma }).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}
  </dl>;
}
