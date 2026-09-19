import { ENEMIES, type EnemyTypeId } from './enemies';
import type { DiceRoller } from '../random/dice';
import { rollDie } from '../random/dice';
import { DIRECTIONS, type Direction, type TilePosition, type WorldMap } from '../world/world';
import { movePlayer } from '../world/movePlayer';
import { isWalkable } from '../world/collision';
import { areAdjacent } from '../combat/movement';

export const ENEMY_SPAWN_PERCENT = 5;
export const ROAMING_ENEMY_TYPES: readonly EnemyTypeId[] = ['wolf', 'spider', 'snake', 'goblin'];

export interface RoamingEnemy {
  readonly id: string;
  readonly typeId: EnemyTypeId;
  readonly position: TilePosition;
}

export interface RoamingState {
  readonly enemies: readonly RoamingEnemy[];
  readonly nextId: number;
  readonly lastSpawn: RoamingEnemy | null;
}

export const createRoamingState = (): RoamingState => ({ enemies: [], nextId: 1, lastSpawn: null });
const key = (tile: TilePosition) => `${tile.x},${tile.y}`;
const same = (a: TilePosition, b: TilePosition) => a.x === b.x && a.y === b.y;

function neighbors(map: WorldMap, tile: TilePosition, occupied: readonly TilePosition[] = []) {
  const origin = { map, playerPosition: tile };
  return (Object.keys(DIRECTIONS) as Direction[]).flatMap((direction) => {
    const moved = movePlayer(origin, direction, occupied);
    return moved === origin ? [] : [moved.playerPosition];
  });
}

/** Shortest-path distances also exclude disconnected edge tiles from spawning. */
function distancesFrom(map: WorldMap, target: TilePosition, occupied: readonly TilePosition[] = []) {
  const distances = new Map([[key(target), 0]]);
  const queue = [target];
  for (let i = 0; i < queue.length; i++) {
    const tile = queue[i];
    for (const next of neighbors(map, tile, occupied)) {
      if (distances.has(key(next))) continue;
      distances.set(key(next), distances.get(key(tile))! + 1);
      queue.push(next);
    }
  }
  return distances;
}

export function getSpawnTiles(map: WorldMap, player: TilePosition, occupied: readonly TilePosition[] = []): TilePosition[] {
  const reachable = distancesFrom(map, player);
  const tiles: TilePosition[] = [];
  for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
    if (x !== 0 && y !== 0 && x !== map.width - 1 && y !== map.height - 1) continue;
    const tile = { x, y };
    if (isWalkable(map, tile) && reachable.has(key(tile)) && !same(tile, player)
      && !occupied.some((entry) => same(entry, tile))) tiles.push(tile);
  }
  return tiles;
}

export function pursuePlayer(map: WorldMap, player: TilePosition, enemies: readonly RoamingEnemy[]): readonly RoamingEnemy[] {
  const moved = [...enemies];
  for (let i = 0; i < moved.length; i++) {
    const enemy = moved[i];
    if (areAdjacent(enemy.position, player)) continue;
    const occupied = moved.filter((_, index) => index !== i).map((entry) => entry.position);
    const distances = distancesFrom(map, player, occupied);
    const directDistance = (tile: TilePosition) => Math.abs(tile.x - player.x) + Math.abs(tile.y - player.y);
    const choices = neighbors(map, enemy.position, [...occupied, player])
      .filter((tile) => distances.has(key(tile)))
      .sort((a, b) => distances.get(key(a))! - distances.get(key(b))!
        || directDistance(a) - directDistance(b) || a.y - b.y || a.x - b.x);
    if (choices[0]) moved[i] = { ...enemy, position: choices[0] };
  }
  return moved;
}

/** Called exactly once after a successful outdoor player step; never from rendering. */
export function advanceRoamingEnemies(state: RoamingState, map: WorldMap, player: TilePosition,
  roll: DiceRoller = rollDie): RoamingState {
  const enemies = pursuePlayer(map, player, state.enemies);
  if (roll(100) > ENEMY_SPAWN_PERCENT) return { ...state, enemies };
  const tiles = getSpawnTiles(map, player, enemies.map((enemy) => enemy.position));
  if (!tiles.length) return { ...state, enemies };
  const position = tiles[roll(tiles.length) - 1];
  const typeId = ROAMING_ENEMY_TYPES[roll(ROAMING_ENEMY_TYPES.length) - 1];
  const enemy = { id: `roaming_${state.nextId}`, typeId, position };
  return { enemies: [...enemies, enemy], nextId: state.nextId + 1, lastSpawn: enemy };
}

export function getAdjacentEnemy(enemies: readonly RoamingEnemy[], player: TilePosition) {
  return enemies.find((enemy) => areAdjacent(enemy.position, player));
}

export function getEnemyName(enemy: RoamingEnemy): string { return ENEMIES[enemy.typeId].name; }
