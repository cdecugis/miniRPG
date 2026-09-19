import type { LocationId } from '../locations/locations';
import type { ExplorationState, TilePosition } from '../world/world';
import type { AttackId, CombatAttributes } from './attacks';

export interface InitiativeResult {
  readonly naturalRoll: number;
  readonly agilityBonus: number;
  readonly total: number;
}

export interface Combatant extends CombatAttributes {
  readonly id: string;
  readonly name: string;
  readonly side: 'player' | 'enemy';
  readonly maxHP: number;
  readonly currentHP: number;
  readonly armorClass: number;
  readonly attackId: AttackId | null;
  readonly position: TilePosition;
  readonly initiative: InitiativeResult;
  readonly carriedWeight: number;
  readonly movementBudget: number;
  readonly movementSpentUnits: number;
}

export type HitQuality = 'miss' | 'normal' | 'very_good' | 'critical';

export interface AttackResult {
  readonly naturalRolls: readonly number[];
  readonly rawRollTotal: number;
  readonly attackBonus: number;
  readonly finalAttackRoll: number;
  readonly targetArmorClass: number;
  readonly margin: number;
  readonly hit: boolean;
  readonly hitQuality: HitQuality;
  readonly baseDamage: number;
  readonly damageBonus: number;
  readonly damageBeforeQuality: number;
  readonly multiplier: number;
  readonly finalDamage: number;
  readonly remainingHP: number;
}

export type CombatEvent =
  | { readonly type: 'initiative'; readonly actorId: string; readonly result: InitiativeResult }
  | { readonly type: 'turn'; readonly actorId: string }
  | { readonly type: 'move'; readonly actorId: string; readonly from: TilePosition; readonly to: TilePosition; readonly cost: number }
  | { readonly type: 'attack'; readonly actorId: string; readonly targetId: string; readonly attackId: AttackId; readonly result: AttackResult }
  | { readonly type: 'finished'; readonly status: 'victory' | 'defeat' };

export interface CombatState {
  readonly encounterId: string;
  readonly combatants: readonly Combatant[];
  readonly turnOrder: readonly string[];
  readonly activeCombatantId: string;
  readonly status: 'active' | 'victory' | 'defeat';
  readonly returnTo: { readonly locationId: LocationId; readonly world: ExplorationState };
  // Result history for presentation only. Rules never read this to determine outcomes.
  readonly events: readonly CombatEvent[];
}
