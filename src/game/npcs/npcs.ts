import type { LocationId } from '../locations/locations';
import type { TilePosition } from '../world/world';

export interface NpcDefinition {
  readonly id: string;
  readonly name: string;
  readonly locationId: LocationId;
  readonly position: TilePosition;
  readonly dialogueId: string;
  readonly appearance: 'traveler' | 'guard' | 'villager';
}

export const NPCS: readonly NpcDefinition[] = [
  { id: 'alden', name: 'Alden, the old traveler', locationId: 'greenhaven',
    position: { x: 6, y: 8 }, dialogueId: 'alden_lights', appearance: 'traveler' },
  { id: 'mara', name: 'Mara, the gate guard', locationId: 'greenhaven',
    position: { x: 10, y: 3 }, dialogueId: 'mara_welcome', appearance: 'guard' },
  { id: 'nell', name: 'Nell, a villager', locationId: 'greenhaven',
    position: { x: 12, y: 11 }, dialogueId: 'nell_town', appearance: 'villager' },
];

export function getLocationNpcs(locationId: LocationId): readonly NpcDefinition[] {
  return NPCS.filter((npc) => npc.locationId === locationId);
}
