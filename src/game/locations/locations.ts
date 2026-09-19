import type { TilePosition, WorldMap } from '../world/world';
import { TEST_MAP } from '../world/testMap';
import { GREENHAVEN_MAP } from './greenhaven';

export type LocationId = 'world' | 'greenhaven';

export interface Portal {
  readonly id: string;
  readonly name: string;
  readonly position: TilePosition;
  readonly destinationId: LocationId;
  readonly arrivalPosition: TilePosition;
}

export interface LocationDefinition {
  readonly id: LocationId;
  readonly type: 'world' | 'town';
  readonly name: string;
  readonly map: WorldMap;
  readonly portals: readonly Portal[];
}

export const LOCATIONS: Record<LocationId, LocationDefinition> = {
  world: {
    id: 'world', type: 'world', name: 'The Greenway', map: TEST_MAP,
    portals: [{ id: 'enter_greenhaven', name: 'Greenhaven', position: { x: 14, y: 19 },
      destinationId: 'greenhaven', arrivalPosition: { x: 8, y: 2 } }],
  },
  greenhaven: {
    id: 'greenhaven', type: 'town', name: 'Greenhaven', map: GREENHAVEN_MAP,
    portals: [{ id: 'leave_greenhaven', name: 'The Greenway', position: { x: 8, y: 1 },
      destinationId: 'world', arrivalPosition: { x: 14, y: 18 } }],
  },
};
