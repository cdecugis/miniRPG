import { LOCATIONS } from '../locations/locations';
import type { LocationId, Portal } from '../locations/locations';
import { getLocationNpcs } from '../npcs/npcs';
import type { NpcDefinition } from '../npcs/npcs';
import type { TilePosition } from '../world/world';

export interface Interaction {
  readonly id: string;
  readonly label: string;
  readonly action: { readonly type: 'travel'; readonly portal: Portal }
    | { readonly type: 'talk'; readonly npc: NpcDefinition };
}

export function tileDistance(first: TilePosition, second: TilePosition): number {
  return Math.max(Math.abs(first.x - second.x), Math.abs(first.y - second.y));
}

export function getAvailableInteractions(locationId: LocationId, position: TilePosition): readonly Interaction[] {
  const portals: Interaction[] = LOCATIONS[locationId].portals
    .filter((portal) => tileDistance(position, portal.position) === 0)
    .map((portal) => ({ id: portal.id, label: `Enter ${portal.name}`, action: { type: 'travel', portal } }));
  const npcs: Interaction[] = getLocationNpcs(locationId)
    .filter((npc) => tileDistance(position, npc.position) === 1)
    .map((npc) => ({ id: npc.id, label: `Talk to ${npc.name}`, action: { type: 'talk', npc } }));
  return [...portals, ...npcs];
}
