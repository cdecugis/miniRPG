import type { Character } from '../character/character';
import { ENEMIES, type EnemyDefinition } from '../enemies/enemies';
import type { DiceRoller } from '../random/dice';
import { rollDie } from '../random/dice';
import type { TilePosition } from '../world/world';
import { ATTACKS } from './attacks';
import { orderInitiative, rollInitiative } from './initiative';
import { areAdjacent, calculateMovementPoints, canMoveCombatant, movementCost } from './movement';
import { DEFAULT_ARMOR_CLASS, MOVEMENT_UNITS_PER_POINT } from './rules';
import { resolveAttack } from './resolveAttack';
import type { Combatant, CombatEvent, CombatState } from './types';

const MAX_RECENT_EVENTS = 100;

export function recordEvents(state: CombatState, ...events: CombatEvent[]): CombatState {
  return { ...state, events: [...state.events, ...events].slice(-MAX_RECENT_EVENTS) };
}

function prepareTurn(combatant: Combatant): Combatant {
  return { ...combatant, movementSpentUnits: 0, movementBudget: combatant.side === 'enemy'
    ? combatant.agility : calculateMovementPoints(combatant.agility, combatant.strength, combatant.carriedWeight) };
}

export function createCombat(character: Character, returnTo: CombatState['returnTo'], carriedWeight: number,
  encounterId: string, roll: DiceRoller = rollDie, enemy: EnemyDefinition = ENEMIES.wolf): CombatState {
  if (character.currentHP <= 0) throw new Error('A defeated character cannot enter combat.');
  const { name, strength, agility, willpower, intelligence, charisma, currentHP, maxHP } = character;
  const player: Combatant = { id: 'player', side: 'player', name, strength, agility, willpower, intelligence, charisma,
    currentHP, maxHP, armorClass: DEFAULT_ARMOR_CLASS, attackId: character.equipment.includes('long_sword') ? 'long_sword' : null, position: { x: 10, y: 0 },
    carriedWeight, initiative: rollInitiative(agility, roll), movementBudget: 0, movementSpentUnits: 0 };
  const opponent: Combatant = { ...enemy, side: 'enemy', currentHP: enemy.maxHP,
    position: { x: 10, y: 19 }, carriedWeight: 0, initiative: rollInitiative(enemy.agility, roll),
    movementBudget: 0, movementSpentUnits: 0 };
  const turnOrder = orderInitiative([player, opponent]);
  return { encounterId, combatants: [player, opponent].map((actor) => actor.id === turnOrder[0] ? prepareTurn(actor) : actor),
    turnOrder, activeCombatantId: turnOrder[0], status: 'active', returnTo,
    events: [{ type: 'initiative', actorId: player.id, result: player.initiative },
      { type: 'initiative', actorId: opponent.id, result: opponent.initiative }, { type: 'turn', actorId: turnOrder[0] }] };
}

export function endTurn(state: CombatState, actorId: string): CombatState {
  if (state.status !== 'active' || state.activeCombatantId !== actorId) return state;
  const livingOrder = state.turnOrder.filter((id) => state.combatants.some((actor) => actor.id === id && actor.currentHP > 0));
  const nextId = livingOrder[(livingOrder.indexOf(actorId) + 1) % livingOrder.length];
  return recordEvents({ ...state, activeCombatantId: nextId,
    combatants: state.combatants.map((actor) => actor.id === nextId ? prepareTurn(actor) : actor) }, { type: 'turn', actorId: nextId });
}

export function moveCombatant(state: CombatState, actorId: string, destination: TilePosition): CombatState {
  if (!canMoveCombatant(state, actorId, destination)) return state;
  const actor = state.combatants.find((entry) => entry.id === actorId)!;
  const cost = movementCost(actor.position, destination);
  const moved = { ...actor, position: { ...destination }, movementSpentUnits: actor.movementSpentUnits + cost * MOVEMENT_UNITS_PER_POINT };
  return recordEvents({ ...state, combatants: state.combatants.map((entry) => entry.id === actorId ? moved : entry) },
    { type: 'move', actorId, from: actor.position, to: moved.position, cost });
}

export function canAttack(state: CombatState, actorId: string, targetId: string): boolean {
  const actor = state.combatants.find((entry) => entry.id === actorId);
  const target = state.combatants.find((entry) => entry.id === targetId);
  return state.status === 'active' && state.activeCombatantId === actorId && !!actor && !!target
    && actor.attackId !== null && actor.side !== target.side && actor.currentHP > 0 && target.currentHP > 0
    && areAdjacent(actor.position, target.position)
    && Math.max(Math.abs(actor.position.x - target.position.x), Math.abs(actor.position.y - target.position.y)) <= ATTACKS[actor.attackId].meleeRange;
}

export function attackCombatant(state: CombatState, actorId: string, targetId: string, roll: DiceRoller = rollDie): CombatState {
  if (!canAttack(state, actorId, targetId)) return state;
  const actor = state.combatants.find((entry) => entry.id === actorId)!;
  const target = state.combatants.find((entry) => entry.id === targetId)!;
  if (!actor.attackId) return state;
  const result = resolveAttack(actor, target.armorClass, target.currentHP, ATTACKS[actor.attackId], roll);
  let updated = recordEvents({ ...state, combatants: state.combatants.map((entry) => entry.id === targetId
    ? { ...entry, currentHP: result.remainingHP } : entry) }, { type: 'attack', actorId, targetId, attackId: actor.attackId, result });
  if (result.remainingHP === 0) {
    const status = target.side === 'player' ? 'defeat' : 'victory';
    updated = recordEvents({ ...updated, status }, { type: 'finished', status });
    return updated;
  }
  return endTurn(updated, actorId);
}
