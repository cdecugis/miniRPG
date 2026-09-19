import type { ExplorationState, TerrainId, WorldMap } from './world';

const LEGEND: Record<string, TerrainId> = {
  '.': 'grass', '=': 'road', 'T': 'tree', '~': 'water', 'H': 'house', 'R': 'rock',
};

// Hand-authored rows, shown north to south for easy editing. No generation.
const MAP_ROWS = [
  'TTT...........==...........TTT',
  'TT..TT........==........TT..TT',
  'T...TT........==........TT...T',
  '....T.........==..........T...',
  '..TT..........==...RR.........',
  '..TT....R.....==...RR....TT...',
  '..............==........TTT...',
  '.....H........==....H....TT...',
  '.....================.......TT',
  '..............==............TT',
  '...TT.........==......~~~~....',
  '...TT.........==.....~~~~~~...',
  '.........H..H.==.....~~~~~~...',
  '.........=======TT....~~~~....',
  '==============================',
  '==============================',
  '..............==..............',
  '..H...........==R~~..H........',
  '..====================........',
  '............R.==..............',
  '....TT........==........TT....',
  '....TT........==........TT....',
  '..............==...RR.........',
  '...~~~~.......==...RR.........',
  '..~~~~~~......==..............',
  '..~~~~~~......==......H.......',
  '...~~~~.......=========.......',
  '..............==..........TT..',
  'TT...RR.......==.........TTTT.',
  'TTT...........==..........TTT.',
];

export const TEST_MAP: WorldMap = {
  id: 'exploration_test',
  name: 'The Greenway',
  width: 30,
  height: 30,
  tiles: [...MAP_ROWS].reverse().map((row) => [...row].map((symbol) => {
    const terrain = LEGEND[symbol];
    if (!terrain) throw new Error(`Unknown test-map symbol: ${symbol}`);
    return terrain;
  })),
};

export function createExploration(): ExplorationState {
  return { map: TEST_MAP, playerPosition: { x: 14, y: 14 } };
}
