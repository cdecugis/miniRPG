import type { DiceRoller } from '../random/dice';
import { rollDie } from '../random/dice';
import type { TilePosition } from '../world/world';
import { attackCombatant, canAttack, endTurn, moveCombatant } from './engine';
import { getReachableAdjacentTiles } from './movement';
import type { CombatState } from './types';

export function runEnemyTurn(state: CombatState, roll: DiceRoller = rollDie): CombatState {
  const enemy = state.combatants.find((actor) => actor.id === state.activeCombatantId);
  if (state.status !== 'active' || enemy?.side !== 'enemy') return state;
  const player = state.combatants.find((actor) => actor.id === 'player')!;
  const distance = (position: TilePosition) => Math.max(Math.abs(position.x - player.position.x), Math.abs(position.y - player.position.y));
  const manhattan = (position: TilePosition) => Math.abs(position.x - player.position.x) + Math.abs(position.y - player.position.y);
  let next = state;
  while (!canAttack(next, enemy.id, 'player')) {
    const opponent = next.combatants.find((actor) => actor.id === enemy.id)!;
    const candidates = getReachableAdjacentTiles(next, enemy.id)
      .filter((tile) => distance(tile) < distance(opponent.position) || manhattan(tile) < manhattan(opponent.position))
      .sort((a, b) => distance(a) - distance(b) || manhattan(a) - manhattan(b) || a.x - b.x || a.y - b.y);
    if (!candidates.length) break;
    next = moveCombatant(next, enemy.id, candidates[0]);
  }
  return canAttack(next, enemy.id, 'player') ? attackCombatant(next, enemy.id, 'player', roll) : endTurn(next, enemy.id);
}

