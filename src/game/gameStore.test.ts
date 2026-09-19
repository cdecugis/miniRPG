import { describe, expect, it, vi } from 'vitest';
import { createCharacter } from './character/createCharacter';
import { createGameStore } from './gameStore';

describe('game store', () => {
  it('starts without a character and keeps its snapshot stable between changes', () => {
    const store = createGameStore(undefined, () => 100);
    expect(store.getSnapshot()).toEqual({ character: null, world: null, currentLocationId: null, dialogue: null, journal: { clues: [] }, combat: null, completedEncounters: [], roaming: { enemies: [], nextId: 1, lastSpawn: null } });
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it('creates a character through domain logic and notifies subscribers', () => {
    const store = createGameStore(undefined, () => 100);
    const initialSnapshot = store.getSnapshot();
    const listener = vi.fn();
    store.subscribe(listener);
    store.startNewGame('Rowan');
    expect(store.getSnapshot()).toMatchObject({ character: createCharacter('Rowan') });
    expect(store.getSnapshot().world?.playerPosition).toEqual({ x: 14, y: 14 });
    expect(store.getSnapshot()).not.toBe(initialSnapshot);
    expect(initialSnapshot.character).toBeNull();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('leaves state unchanged and sends no notification when creation fails', () => {
    const store = createGameStore(undefined, () => 100);
    store.startNewGame('Rowan');
    const previous = store.getSnapshot();
    const listener = vi.fn();
    store.subscribe(listener);
    expect(() => store.startNewGame('  ')).toThrow();
    expect(store.getSnapshot()).toBe(previous);
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying unsubscribed listeners', () => {
    const store = createGameStore(undefined, () => 100);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.startNewGame('Rowan');
    expect(listener).not.toHaveBeenCalled();
  });

  it('keeps sessions independent with serializable snapshots', () => {
    const first = createGameStore(undefined, () => 100);
    const second = createGameStore(undefined, () => 100);
    first.startNewGame('Rowan');
    expect(second.getSnapshot().character).toBeNull();
    expect(JSON.parse(JSON.stringify(first.getSnapshot()))).toEqual(first.getSnapshot());
  });

  it('ignores movement before starting a game', () => {
    const store = createGameStore(undefined, () => 100);
    const before = store.getSnapshot();
    store.movePlayer('north');
    expect(store.getSnapshot()).toBe(before);
  });

  it('updates the authoritative position and notifies once per successful move', () => {
    const store = createGameStore(undefined, () => 100);
    store.startNewGame('Rowan');
    const previous = store.getSnapshot();
    const listener = vi.fn();
    store.subscribe(listener);
    store.movePlayer('north');
    expect(store.getSnapshot().world?.playerPosition).toEqual({ x: 14, y: 15 });
    expect(previous.world?.playerPosition).toEqual({ x: 14, y: 14 });
    expect(store.getSnapshot().character).toBe(previous.character);
    expect(listener).toHaveBeenCalledOnce();
  });

  it('keeps blocked moves from changing the snapshot or notifying subscribers', () => {
    const store = createGameStore(undefined, () => 100);
    store.startNewGame('Rowan');
    for (let step = 0; step < 14; step++) store.movePlayer('south');
    expect(store.getSnapshot().world?.playerPosition).toEqual({ x: 14, y: 0 });
    const previous = store.getSnapshot();
    const listener = vi.fn();
    store.subscribe(listener);
    store.movePlayer('south');
    expect(store.getSnapshot()).toBe(previous);
    expect(listener).not.toHaveBeenCalled();
  });

  it('starts a fresh exploration position for a new character', () => {
    const store = createGameStore(undefined, () => 100);
    store.startNewGame('Rowan');
    store.movePlayer('north');
    store.startNewGame('Ash');
    expect(store.getSnapshot().world?.playerPosition).toEqual({ x: 14, y: 14 });
  });
});
