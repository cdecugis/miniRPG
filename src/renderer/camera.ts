import type { TilePosition, WorldMap } from '../game/world/world';

export const TILE_SIZE = 48;

export const getTileSize = (viewportWidth: number) => viewportWidth < 760 ? 32 : TILE_SIZE;

export function getCamera(map: Pick<WorldMap, 'width' | 'height'>, player: TilePosition, width: number, height: number, tileSize = TILE_SIZE) {
  const columns = Math.min(map.width, Math.max(1, Math.floor(width / tileSize)));
  const rows = Math.min(map.height, Math.max(1, Math.floor(height / tileSize)));
  return {
    x: Math.max(0, Math.min(map.width - columns, player.x - Math.floor(columns / 2))),
    y: Math.max(0, Math.min(map.height - rows, player.y - Math.floor(rows / 2))),
    columns,
    rows,
    offsetX: Math.floor((width - columns * tileSize) / 2),
    offsetY: Math.floor((height - rows * tileSize) / 2),
  };
}
