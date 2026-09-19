import type { TerrainId, WorldMap } from '../world/world';

const LEGEND: Record<string, TerrainId> = {
  '.': 'grass', '=': 'road', T: 'tree', H: 'house', R: 'rock', '~': 'water',
};

const ROWS = [
  'TTTTTTTTTTTTTTTTTT',
  'T.......==.......T',
  'T..H....==....H..T',
  'T..=====  =====..T',
  'T.......==.......T',
  'T..H....==....H..T',
  'T..=====  =====..T',
  'T.......==.......T',
  'T================T',
  'T================T',
  'T.......==.......T',
  'T..~~...==H..T...T',
  'T..~~.H.==...T...T',
  'T.......==.......T',
  'T..H....==....H..T',
  'T.......==.......T',
  'TTTTTTTT==TTTTTTTT',
  'TTTTTTTTTTTTTTTTTT',
];

export const GREENHAVEN_MAP: WorldMap = {
  id: 'greenhaven_map', name: 'Greenhaven', width: 18, height: 18,
  tiles: [...ROWS].reverse().map((row) => [...row.replaceAll(' ', '=')].map((symbol) => LEGEND[symbol])),
};
