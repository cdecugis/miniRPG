import { describe, expect, it, vi } from 'vitest';
import { advanceRoamingEnemies, createRoamingState, getAdjacentEnemy, getSpawnTiles, pursuePlayer, type RoamingEnemy } from './roamingEnemies';
import { ENEMIES } from './enemies';
import { ATTACKS } from '../combat/attacks';
import { createGameStore } from '../gameStore';
import { canAttack, createCombat } from '../combat/engine';
import { runEnemyTurn } from '../combat/enemyAI';
import { createCharacter } from '../character/createCharacter';
import { createExploration, TEST_MAP } from '../world/testMap';
import type { WorldMap } from '../world/world';

const openMap: WorldMap = { id: 'test', name: 'Test', width: 7, height: 7,
  tiles: Array.from({ length: 7 }, () => Array.from({ length: 7 }, () => 'grass' as const)) };
const player = { x: 3, y: 3 };
const enemy = (id: string, x: number, y: number): RoamingEnemy => ({ id, typeId: 'spider', position: { x, y } });

describe('roaming enemies', () => {
  it.each([1, 2, 3, 4, 5, 6, 50, 100])('spawns exactly on d100 results 1–5: %i', (chance) => {
    const rolls = [chance, 1, 2];
    const next = advanceRoamingEnemies(createRoamingState(), openMap, player, () => rolls.shift()!);
    expect(next.enemies.length).toBe(chance <= 5 ? 1 : 0);
    if (chance <= 5) expect(next.enemies[0]).toMatchObject({ id: 'roaming_1', typeId: 'spider' });
  });
  it('offers only reachable, free, walkable outer edge tiles with no duplicate corners', () => {
    const occupied = [{ x: 14, y: 0 }];
    const tiles = getSpawnTiles(TEST_MAP, player, occupied);
    expect(tiles.length).toBeGreaterThan(0);
    expect(new Set(tiles.map((tile) => `${tile.x},${tile.y}`)).size).toBe(tiles.length);
    for (const tile of tiles) {
      expect(tile.x === 0 || tile.y === 0 || tile.x === 29 || tile.y === 29).toBe(true);
      expect(['grass', 'road']).toContain(TEST_MAP.tiles[tile.y][tile.x]);
      expect(tile).not.toEqual(occupied[0]);
    }
  });
  it('does not spawn through a sealed border or onto an isolated edge', () => {
    const sealed: WorldMap = { ...openMap, tiles: openMap.tiles.map((row, y) => row.map((tile, x) =>
      x === 0 || y === 0 || x === 6 || y === 6 ? 'tree' : tile)) };
    expect(advanceRoamingEnemies(createRoamingState(), sealed, player, () => 1).enemies).toEqual([]);
    const isolated: WorldMap = { ...sealed, tiles: sealed.tiles.map((row, y) => row.map((tile, x) =>
      x === 0 && y === 0 ? 'grass' : tile)) };
    expect(getSpawnTiles(isolated, player)).toEqual([]);
  });
  it('moves each existing enemy at most one tile, while a new spawn waits for the next step', () => {
    const before = { ...createRoamingState(), enemies: [enemy('existing', 0, 3)] };
    const next = advanceRoamingEnemies(before, openMap, player, () => 1);
    expect(next.enemies[0].position).toEqual({ x: 1, y: 3 });
    expect(next.enemies[1].position).toEqual({ x: 0, y: 0 });
    expect(before.enemies[0].position).toEqual({ x: 0, y: 3 });
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });
  it('routes around obstacles without diagonal corner cutting', () => {
    const map: WorldMap = { ...openMap, tiles: openMap.tiles.map((row, y) => row.map((tile, x) =>
      x === 2 && y <= 4 ? 'water' : tile)) };
    let enemies: readonly RoamingEnemy[] = [enemy('one', 1, 1)];
    let previous = enemies[0].position;
    for (let step = 0; step < 20 && !getAdjacentEnemy(enemies, { x: 4, y: 1 }); step++) {
      enemies = pursuePlayer(map, { x: 4, y: 1 }, enemies);
      const next = enemies[0].position;
      expect(map.tiles[next.y][next.x]).toBe('grass');
      if (next.x !== previous.x && next.y !== previous.y) {
        expect(map.tiles[previous.y][next.x]).toBe('grass');
        expect(map.tiles[next.y][previous.x]).toBe('grass');
      }
      previous = next;
    }
    expect(getAdjacentEnemy(enemies, { x: 4, y: 1 })?.id).toBe('one');
  });
  it('prevents overlapping enemies and keeps adjacent enemies ready to engage', () => {
    const enemies = [enemy('one', 2, 2), enemy('two', 1, 2), enemy('three', 1, 3)];
    const next = pursuePlayer(openMap, player, enemies);
    expect(next[0].position).toEqual({ x: 2, y: 2 });
    expect(new Set(next.map((entry) => `${entry.position.x},${entry.position.y}`)).size).toBe(3);
    expect(next.some((entry) => entry.position.x === 3 && entry.position.y === 3)).toBe(false);
  });
  it.each([[2, 3, true], [2, 2, true], [1, 1, false]])('engages at orthogonal and diagonal adjacency only: %i,%i', (x, y, expected) => {
    expect(!!getAdjacentEnemy([enemy('one', x, y)], player)).toBe(expected);
  });
  it('assigns unique IDs across successive spawn rolls', () => {
    const first = advanceRoamingEnemies(createRoamingState(), openMap, player, () => 1);
    const second = advanceRoamingEnemies(first, openMap, player, () => 1);
    expect(second.enemies.map((entry) => entry.id)).toEqual(['roaming_1', 'roaming_2']);
    expect(second.nextId).toBe(3);
  });
});

describe('outdoor movement integration', () => {
  it('freezes other enemies during battle and removes only the defeated instance', () => {
    const first = getSpawnTiles(TEST_MAP, { x: 15, y: 14 });
    let step = 0;
    let selection = 0;
    const spawn = (sides: number) => {
      if (sides === 100) { step++; selection = 0; return step <= 2 ? 1 : 100; }
      selection++;
      if (selection === 2) return 1;
      // First enemy starts to the east; second occupies another free border tile.
      return step === 1 ? first.findIndex((tile) => tile.x === 29 && tile.y === 14) + 1 : 1;
    };
    const store = createGameStore((sides) => sides === 20 ? 15 : sides, spawn);
    store.startNewGame('Rowan');
    for (let i = 0; i < 12 && !store.getSnapshot().combat; i++) store.movePlayer('east');
    const roaming = store.getSnapshot().roaming;
    expect(roaming.enemies).toHaveLength(2);
    expect(store.getSnapshot().combat?.encounterId).toBe('roaming_1');
    for (let i = 0; i < 8 && store.getSnapshot().combat?.status === 'active'; i++) {
      const combat = store.getSnapshot().combat!;
      if (combat.activeCombatantId !== 'player') store.runEnemyTurn(combat);
      else if (canAttack(combat, 'player', 'wolf')) store.attackEnemy();
      else store.endCombatTurn();
    }
    expect(store.getSnapshot().combat?.status).toBe('victory');
    expect(store.getSnapshot().roaming).toBe(roaming);
    store.returnToExploration();
    expect(store.getSnapshot().roaming.enemies).toEqual([roaming.enemies[1]]);
    expect(store.getSnapshot().roaming.nextId).toBe(3);
  });
  it('rolls only for successful outdoor steps, never blocked steps or movement in town', () => {
    const roll = vi.fn(() => 100);
    const store = createGameStore(undefined, roll);
    store.startNewGame('Rowan');
    for (let i = 0; i < 14; i++) store.movePlayer('south');
    expect(roll).toHaveBeenCalledTimes(14);
    store.movePlayer('south');
    expect(roll).toHaveBeenCalledTimes(14);
    for (let i = 0; i < 19; i++) store.movePlayer('north');
    store.interact('enter_greenhaven');
    expect(store.getSnapshot().currentLocationId).toBe('greenhaven');
    roll.mockClear();
    store.movePlayer('north');
    store.movePlayer('west');
    expect(roll).not.toHaveBeenCalled();
  });
  it('retains outdoor enemies during a town visit and clears them for a new game', () => {
    const rolls = [1, 1, 2];
    const store = createGameStore(undefined, () => rolls.shift() ?? 100);
    store.startNewGame('Rowan');
    for (let i = 0; i < 5; i++) store.movePlayer('north');
    const roaming = store.getSnapshot().roaming;
    expect(roaming.enemies.length).toBe(1);
    store.interact('enter_greenhaven');
    store.movePlayer('south');
    store.interact('leave_greenhaven');
    expect(store.getSnapshot().roaming).toBe(roaming);
    store.startNewGame('Ash');
    expect(store.getSnapshot().roaming).toEqual(createRoamingState());
  });
});

describe('new level-one enemies', () => {
  it.each(['spider', 'snake', 'goblin'] as const)('%s has weaker provisional stats and uses the generic battle engine', (type) => {
    const definition = ENEMIES[type];
    expect(definition.level).toBe(1);
    expect(definition.maxHP).toBeLessThan(10);
    expect(ATTACKS[definition.attackId].damageMax).toBeLessThan(8);
    expect(definition.armorClass).toBe(10);
    const combat = createCombat(createCharacter('Rowan'), { locationId: 'world', world: createExploration() }, 0, 'enemy_test', () => 10, definition);
    const turn = { ...combat, activeCombatantId: type };
    const next = runEnemyTurn(turn, () => 1);
    expect(next.activeCombatantId).toBe('player');
    expect(next.combatants[1].name).toBe(definition.name);
  });
});
