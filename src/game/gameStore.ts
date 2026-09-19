import { equipItem, unequipItem } from './inventory/inventory';
import type { ItemId } from './items/items';
import type { Character } from './character/character';
import { createCharacter } from './character/createCharacter';
import { createExploration } from './world/testMap';
import type { Direction, ExplorationState, TilePosition } from './world/world';
import { movePlayer } from './world/movePlayer';
import { LOCATIONS } from './locations/locations';
import type { LocationId } from './locations/locations';
import { getLocationNpcs } from './npcs/npcs';
import { getAvailableInteractions } from './interaction/interactions';
import { startDialogue, advanceDialogue } from './dialogue/dialogue';
import type { DialogueState } from './dialogue/dialogue';
import type { JournalState } from './journal/journal';
import type { CombatState } from './combat/types';
import type { DiceRoller } from './random/dice';
import { rollDie } from './random/dice';
import { attackCombatant, createCombat, endTurn, moveCombatant } from './combat/engine';
import { runEnemyTurn as resolveEnemyTurn } from './combat/enemyAI';
import { ENEMIES } from './enemies/enemies';
import { advanceRoamingEnemies, createRoamingState, getAdjacentEnemy, type RoamingState } from './enemies/roamingEnemies';
import { PROVISIONAL_UNENCUMBERED_LOAD } from './combat/rules';

export interface GameState {
  readonly character: Character | null;
  readonly world: ExplorationState | null;
  readonly currentLocationId: LocationId | null;
  readonly dialogue: DialogueState | null;
  readonly journal: JournalState;
  readonly combat: CombatState | null;
  readonly roaming: RoamingState;
  readonly completedEncounters: readonly string[];
}

// The serializable snapshot is separate from subscriptions and UI lifecycle.
export function createGameStore(roll: DiceRoller = rollDie, explorationRoll: DiceRoller = rollDie) {
  let state: GameState = { character: null, world: null, currentLocationId: null, dialogue: null, journal: { clues: [] }, combat: null, completedEncounters: [], roaming: createRoamingState() };
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const commitCombat = (combat: CombatState) => {
    if (combat === state.combat) return;
    const player = combat.combatants.find((actor) => actor.id === 'player')!;
    state = { ...state, combat, character: state.character && { ...state.character, currentHP: player.currentHP } };
    notify();
  };

  return {
    getSnapshot: (): GameState => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    startNewGame(name: string) {
      const character = createCharacter(name);
      state = { character, world: createExploration(), currentLocationId: 'world', dialogue: null, journal: { clues: [] }, combat: null, completedEncounters: [], roaming: createRoamingState() };
      notify();
    },
    equipItem(id: ItemId) {
      if (!state.character || state.combat || state.dialogue) return;
      const character = equipItem(state.character, id);
      if (character === state.character) return;
      state = { ...state, character }; notify();
    },
    unequipItem(id: ItemId) {
      if (!state.character || state.combat || state.dialogue) return;
      const character = unequipItem(state.character, id);
      if (character === state.character) return;
      state = { ...state, character }; notify();
    },
    movePlayer(direction: Direction) {
      if (!state.world || !state.currentLocationId || state.dialogue || state.combat) return;
      const world = movePlayer(state.world, direction, [...getLocationNpcs(state.currentLocationId).map((npc) => npc.position),
        ...(state.currentLocationId === 'world' ? state.roaming.enemies.map((enemy) => enemy.position) : [])]);
      if (world === state.world) return;
      state = { ...state, world };
      if (state.character && state.currentLocationId === 'world') {
        const roaming = advanceRoamingEnemies(state.roaming, world.map, world.playerPosition, explorationRoll);
        const enemy = getAdjacentEnemy(roaming.enemies, world.playerPosition);
        state = { ...state, roaming };
        if (enemy) state = { ...state, combat: createCombat(state.character!, { locationId: 'world', world },
          PROVISIONAL_UNENCUMBERED_LOAD, enemy.id, roll, ENEMIES[enemy.typeId]) };
      }
      notify();
    },
    interact(targetId?: string) {
      if (!state.world || !state.currentLocationId || state.dialogue || state.combat) return;
      const available = getAvailableInteractions(state.currentLocationId, state.world.playerPosition);
      const interaction = targetId ? available.find((entry) => entry.id === targetId) : available[0];
      if (!interaction) return;
      const { action } = interaction;
      if (action.type === 'travel') {
        const { destinationId, arrivalPosition } = action.portal;
        state = { ...state, currentLocationId: destinationId,
          world: { map: LOCATIONS[destinationId].map, playerPosition: { ...arrivalPosition } } };
      } else {
        state = { ...state, dialogue: startDialogue(action.npc) };
      }
      notify();
    },
    advanceDialogue() {
      if (!state.dialogue || state.combat) return;
      state = { ...state, ...advanceDialogue(state.dialogue, state.journal) };
      notify();
    },
    moveInCombat(destination: TilePosition) {
      if (state.combat) commitCombat(moveCombatant(state.combat, 'player', destination));
    },
    attackEnemy() {
      const enemy = state.combat?.combatants.find((actor) => actor.side === 'enemy');
      if (state.combat && enemy) commitCombat(attackCombatant(state.combat, 'player', enemy.id, roll));
    },
    endCombatTurn() {
      if (state.combat) commitCombat(endTurn(state.combat, 'player'));
    },
    runEnemyTurn(expected: CombatState) {
      if (state.combat && state.combat === expected) commitCombat(resolveEnemyTurn(state.combat, roll));
    },
    returnToExploration() {
      if (state.combat?.status !== 'victory') return;
      const { returnTo, encounterId } = state.combat;
      state = { ...state, combat: null, world: returnTo.world, currentLocationId: returnTo.locationId,
        roaming: { ...state.roaming, enemies: state.roaming.enemies.filter((enemy) => enemy.id !== encounterId) },
        completedEncounters: [...new Set([...state.completedEncounters, encounterId])] };
      notify();
    },
  };
}

export type GameStore = ReturnType<typeof createGameStore>;
