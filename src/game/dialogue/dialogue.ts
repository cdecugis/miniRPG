import type { JournalState } from '../journal/journal';
import { discoverClue } from '../journal/journal';
import type { NpcDefinition } from '../npcs/npcs';

export interface DialogueDefinition {
  readonly id: string;
  readonly lines: readonly string[];
  readonly completionClueId?: string;
}

export const DIALOGUES: Record<string, DialogueDefinition> = {
  alden_lights: {
    id: 'alden_lights',
    lines: [
      'Rest your feet a moment, traveler. I have walked the eastern road more times than I can count.',
      'Lately, pale lights have appeared beyond the eastern hills at night. I saw them myself, where there should be neither a road nor a village.',
      'Others have seen them too. Keep that rumor in mind if your travels take you east.',
    ],
    completionClueId: 'eastern_hills_strange_lights',
  },
  mara_welcome: { id: 'mara_welcome', lines: [
    'Welcome to Greenhaven. The streets are quiet today.',
    'Follow the main path to the square. Alden, the old traveler, is usually there with a story to tell.',
  ] },
  nell_town: { id: 'nell_town', lines: [
    'I like the trees here. Even on a windy day, the square feels sheltered.',
    'When you are ready to leave, the southern gate leads back to the Greenway.',
  ] },
};

export interface DialogueState {
  readonly dialogueId: string;
  readonly speakerId: string;
  readonly speakerName: string;
  readonly lineIndex: number;
}

export function startDialogue(npc: NpcDefinition): DialogueState {
  return { dialogueId: npc.dialogueId, speakerId: npc.id, speakerName: npc.name, lineIndex: 0 };
}

export function getDialogueView(dialogue: DialogueState) {
  const definition = DIALOGUES[dialogue.dialogueId];
  return { speakerName: dialogue.speakerName, text: definition.lines[dialogue.lineIndex],
    isLastLine: dialogue.lineIndex === definition.lines.length - 1 };
}

export function advanceDialogue(dialogue: DialogueState, journal: JournalState): { dialogue: DialogueState | null; journal: JournalState } {
  const definition = DIALOGUES[dialogue.dialogueId];
  if (dialogue.lineIndex < definition.lines.length - 1) {
    return { dialogue: { ...dialogue, lineIndex: dialogue.lineIndex + 1 }, journal };
  }
  return { dialogue: null, journal: definition.completionClueId
    ? discoverClue(journal, definition.completionClueId, dialogue.speakerId, dialogue.speakerName) : journal };
}
