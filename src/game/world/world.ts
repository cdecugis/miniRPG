export const TERRAIN = {
  grass: { walkable: true },
  road: { walkable: true },
  tree: { walkable: false },
  water: { walkable: false },
  house: { walkable: false },
  rock: { walkable: false },
} as const;

export type TerrainId = keyof typeof TERRAIN;

export interface TilePosition {
  readonly x: number;
  readonly y: number;
}

export interface WorldMap {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  // Indexed by [y][x], with y = 0 at the southern edge.
  readonly tiles: readonly (readonly TerrainId[])[];
}

export interface ExplorationState {
  readonly map: WorldMap;
  readonly playerPosition: TilePosition;
}

export const DIRECTIONS = {
  north: { x: 0, y: 1 },
  northEast: { x: 1, y: 1 },
  east: { x: 1, y: 0 },
  southEast: { x: 1, y: -1 },
  south: { x: 0, y: -1 },
  southWest: { x: -1, y: -1 },
  west: { x: -1, y: 0 },
  northWest: { x: -1, y: 1 },
} as const;

export type Direction = keyof typeof DIRECTIONS;
