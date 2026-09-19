import { DIRECTIONS } from '../world/world';
import type { TilePosition } from '../world/world';
import { COMBAT_GRID_SIZE, DIAGONAL_COST, MOVEMENT_UNITS_PER_POINT, ORTHOGONAL_COST } from './rules';
import type { Combatant, CombatState } from './types';

export function calculateCarryPenalty(strength: number, carriedWeight: number): number {
  if (carriedWeight <= strength * 2) return 0;
  if (carriedWeight <= strength * 3) return 0.25;
  if (carriedWeight <= strength * 4) return 0.5;
  return 1;
}

export function calculateMovementPoints(agility: number, strength: number, carriedWeight: number): number {
  return agility * (1 - calculateCarryPenalty(strength, carriedWeight));
}

export function getRemainingMovement(combatant: Combatant): number {
  return (combatant.movementBudget * MOVEMENT_UNITS_PER_POINT - combatant.movementSpentUnits) / MOVEMENT_UNITS_PER_POINT;
}

export function movementCost(from: TilePosition, to: TilePosition): number {
  return from.x !== to.x && from.y !== to.y ? DIAGONAL_COST : ORTHOGONAL_COST;
}

export function isCombatTile(position: TilePosition): boolean {
  return Number.isInteger(position.x) && Number.isInteger(position.y)
    && position.x >= 0 && position.y >= 0 && position.x < COMBAT_GRID_SIZE && position.y < COMBAT_GRID_SIZE;
}

export function areAdjacent(a: TilePosition, b: TilePosition): boolean {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) === 1;
}

export function canMoveCombatant(state: CombatState, actorId: string, destination: TilePosition): boolean {
  const actor = state.combatants.find((entry) => entry.id === actorId);
  return state.status === 'active' && state.activeCombatantId === actorId && !!actor && actor.currentHP > 0
    && isCombatTile(destination) && areAdjacent(actor.position, destination)
    && !state.combatants.some((entry) => entry.currentHP > 0 && entry.position.x === destination.x && entry.position.y === destination.y)
    && actor.movementBudget * MOVEMENT_UNITS_PER_POINT - actor.movementSpentUnits >= movementCost(actor.position, destination) * MOVEMENT_UNITS_PER_POINT;
}

export function getReachableAdjacentTiles(state: CombatState, actorId: string): TilePosition[] {
  const actor = state.combatants.find((entry) => entry.id === actorId);
  if (!actor) return [];
  return Object.values(DIRECTIONS).map((delta) => ({ x: actor.position.x + delta.x, y: actor.position.y + delta.y }))
    .filter((destination) => canMoveCombatant(state, actorId, destination));
}
