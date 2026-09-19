import { describe, expect, it, vi } from 'vitest';
import { createGameStore } from '../gameStore';
import { LOCATIONS } from './locations';
import { DIALOGUES } from '../dialogue/dialogue';
import { NPCS } from '../npcs/npcs';
import { getAvailableInteractions } from '../interaction/interactions';
import { movePlayer } from '../world/movePlayer';

function enterTown() {
  const store = createGameStore(undefined, () => 100);
  store.startNewGame('Rowan');
  for (let step = 0; step < 5; step++) store.movePlayer('north');
  store.interact('enter_greenhaven');
  return store;
}

function approachTraveler() {
  const store = enterTown();
  for (let step = 0; step < 6; step++) store.movePlayer('north');
  store.movePlayer('west');
  return store;
}

function finishConversation(store: ReturnType<typeof createGameStore>) {
  const dialogue = store.getSnapshot().dialogue;
  if (!dialogue) throw new Error('Expected active dialogue');
  for (const _line of DIALOGUES[dialogue.dialogueId].lines) store.advanceDialogue();
}

describe('Greenhaven transitions', () => {
  it('requires explicit activation on the entrance tile', () => {
    const store = createGameStore(undefined, () => 100);
    store.startNewGame('Rowan');
    store.interact('enter_greenhaven');
    expect(store.getSnapshot().currentLocationId).toBe('world');
    for (let step = 0; step < 5; step++) store.movePlayer('north');
    expect(store.getSnapshot().currentLocationId).toBe('world');
    store.interact('enter_greenhaven');
    expect(store.getSnapshot().currentLocationId).toBe('greenhaven');
    expect(store.getSnapshot().world?.map).toBe(LOCATIONS.greenhaven.map);
    expect(store.getSnapshot().world?.playerPosition).toEqual({ x: 8, y: 2 });
  });

  it('returns to the outdoor approach tile and preserves the character', () => {
    const store = enterTown();
    const character = store.getSnapshot().character;
    store.movePlayer('south');
    store.interact('leave_greenhaven');
    expect(store.getSnapshot().currentLocationId).toBe('world');
    expect(store.getSnapshot().world?.map).toBe(LOCATIONS.world.map);
    expect(store.getSnapshot().world?.playerPosition).toEqual({ x: 14, y: 18 });
    expect(store.getSnapshot().character).toBe(character);
    store.movePlayer('north');
    store.interact();
    expect(store.getSnapshot().currentLocationId).toBe('greenhaven');
  });

  it('ignores stale, unavailable or unknown interaction IDs', () => {
    const store = enterTown();
    const previous = store.getSnapshot();
    for (const id of ['enter_greenhaven', 'alden', 'unknown']) store.interact(id);
    expect(store.getSnapshot()).toBe(previous);
  });
});

describe('NPC collision and interaction', () => {
  it('does not start dialogue just by approaching an NPC', () => {
    const store = approachTraveler();
    expect(store.getSnapshot().world?.playerPosition).toEqual({ x: 7, y: 8 });
    expect(store.getSnapshot().dialogue).toBeNull();
    store.interact('alden');
    expect(store.getSnapshot().dialogue).toMatchObject({ speakerId: 'alden', lineIndex: 0 });
  });

  it('blocks movement onto an NPC tile through the store', () => {
    const store = approachTraveler();
    const before = store.getSnapshot();
    store.movePlayer('west');
    expect(store.getSnapshot()).toBe(before);
  });

  it('includes NPC occupancy in the existing diagonal corner rule', () => {
    const world = { map: LOCATIONS.greenhaven.map, playerPosition: { x: 9, y: 3 } };
    expect(movePlayer(world, 'northEast', [{ x: 10, y: 3 }])).toBe(world);
  });

  it.each([
    [-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1],
  ])('permits interaction from adjacent offset %s,%s', (x, y) => {
    expect(getAvailableInteractions('greenhaven', { x: 6 + x, y: 8 + y }).map((target) => target.id)).toContain('alden');
  });

  it('starts dialogue from a diagonally adjacent tile', () => {
    const store = enterTown();
    store.movePlayer('east');
    store.interact('mara');
    expect(store.getSnapshot().dialogue?.speakerId).toBe('mara');
  });

  it('does not interact across distance or location boundaries', () => {
    expect(getAvailableInteractions('greenhaven', { x: 6, y: 6 })).toEqual([]);
    expect(getAvailableInteractions('world', { x: 6, y: 7 })).toEqual([]);
    const store = enterTown();
    store.interact('alden');
    expect(store.getSnapshot().dialogue).toBeNull();
  });

  it('blocks all player movement and further interactions during dialogue', () => {
    const store = approachTraveler();
    store.interact('alden');
    const before = store.getSnapshot();
    const listener = vi.fn();
    store.subscribe(listener);
    store.movePlayer('east');
    store.movePlayer('southWest');
    store.interact('leave_greenhaven');
    store.interact('alden');
    expect(store.getSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('dialogue and Journal integration', () => {
  it('awards the clue only when the final line is completed', () => {
    const store = approachTraveler();
    store.interact('alden');
    expect(store.getSnapshot().journal.clues).toEqual([]);
    store.advanceDialogue();
    expect(store.getSnapshot().dialogue?.lineIndex).toBe(1);
    expect(store.getSnapshot().journal.clues).toEqual([]);
    store.advanceDialogue();
    expect(store.getSnapshot().dialogue?.lineIndex).toBe(2);
    expect(store.getSnapshot().journal.clues).toEqual([]);
    store.advanceDialogue();
    expect(store.getSnapshot().dialogue).toBeNull();
    expect(store.getSnapshot().journal.clues).toEqual([expect.objectContaining({
      id: 'eastern_hills_strange_lights', title: 'Strange lights beyond the eastern hills',
      sourceNpcId: 'alden', sourceNpcName: 'Alden, the old traveler', discovered: true,
    })]);
    store.movePlayer('east');
    expect(store.getSnapshot().world?.playerPosition).toEqual({ x: 8, y: 8 });
  });

  it('does not duplicate clues when repeating a conversation', () => {
    const store = approachTraveler();
    store.interact('alden');
    finishConversation(store);
    const journal = store.getSnapshot().journal;
    store.interact('alden');
    finishConversation(store);
    expect(store.getSnapshot().journal).toBe(journal);
    expect(journal.clues).toHaveLength(1);
  });

  it('preserves discovered clues through location transitions', () => {
    const store = approachTraveler();
    store.interact('alden');
    finishConversation(store);
    store.movePlayer('east');
    for (let step = 0; step < 7; step++) store.movePlayer('south');
    store.interact('leave_greenhaven');
    expect(store.getSnapshot().currentLocationId).toBe('world');
    expect(store.getSnapshot().journal.clues).toHaveLength(1);
  });

  it('does not give the clue for unrelated conversations', () => {
    const store = enterTown();
    store.movePlayer('east');
    store.interact('mara');
    finishConversation(store);
    expect(store.getSnapshot().journal.clues).toEqual([]);
  });

  it('serializes location, position, current dialogue and discovered clues', () => {
    const store = approachTraveler();
    store.interact('alden');
    finishConversation(store);
    store.interact('alden');
    store.advanceDialogue();
    expect(JSON.parse(JSON.stringify(store.getSnapshot()))).toEqual(store.getSnapshot());
  });

  it('resets location, dialogue and Journal for a new game', () => {
    const store = approachTraveler();
    store.interact('alden');
    finishConversation(store);
    store.startNewGame('Ash');
    expect(store.getSnapshot()).toMatchObject({ currentLocationId: 'world', dialogue: null, journal: { clues: [] } });
  });

  it('does nothing when advancing without dialogue', () => {
    const store = enterTown();
    const before = store.getSnapshot();
    store.advanceDialogue();
    expect(store.getSnapshot()).toBe(before);
  });

  it('defines the three named townspeople', () => {
    expect(NPCS.map((npc) => npc.id)).toEqual(['alden', 'mara', 'nell']);
  });
});
