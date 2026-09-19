export interface ClueDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export const CLUES: Record<string, ClueDefinition> = {
  eastern_hills_strange_lights: {
    id: 'eastern_hills_strange_lights',
    title: 'Strange lights beyond the eastern hills',
    description: 'Alden has seen pale lights beyond the eastern hills at night. Other travelers have reported them too, far from any road or settlement.',
  },
};

export interface DiscoveredClue extends ClueDefinition {
  readonly sourceNpcId: string;
  readonly sourceNpcName: string;
  readonly discovered: true;
}

export interface JournalState {
  readonly clues: readonly DiscoveredClue[];
}

export function discoverClue(journal: JournalState, clueId: string, sourceNpcId: string, sourceNpcName: string): JournalState {
  const clue = CLUES[clueId];
  if (!clue || journal.clues.some((entry) => entry.id === clueId)) return journal;
  return { ...journal, clues: [...journal.clues, { ...clue, sourceNpcId, sourceNpcName, discovered: true }] };
}
