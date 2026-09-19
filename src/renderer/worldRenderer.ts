import type { RoamingEnemy } from '../game/enemies/roamingEnemies';
import { ENEMIES } from '../game/enemies/enemies';
import type { ExplorationState } from '../game/world/world';
import { getCamera, TILE_SIZE } from './camera';
import { createSpriteAtlas } from './pixelArt';
import type { NpcDefinition } from '../game/npcs/npcs';
import type { Portal } from '../game/locations/locations';

export interface WorldScene {
  readonly world: ExplorationState;
  readonly npcs: readonly NpcDefinition[];
  readonly portals: readonly Portal[];
  readonly enemies?: readonly RoamingEnemy[];
}

export function createWorldRenderer(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable.');
  const sprites = createSpriteAtlas();

  return ({ world, npcs, portals, enemies = [] }: WorldScene, width: number, height: number, pixelRatio: number, tileSize = TILE_SIZE) => {
    // Rounding affects raster dimensions only, never tile coordinates.
    const rasterWidth = Math.round(width * pixelRatio);
    const rasterHeight = Math.round(height * pixelRatio);
    if (canvas.width !== rasterWidth) canvas.width = rasterWidth;
    if (canvas.height !== rasterHeight) canvas.height = rasterHeight;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = false;
    context.fillStyle = '#263f35';
    context.fillRect(0, 0, width, height);

    const camera = getCamera(world.map, world.playerPosition, width, height, tileSize);
    for (let row = 0; row < camera.rows; row++) {
      const y = camera.y + camera.rows - 1 - row;
      for (let column = 0; column < camera.columns; column++) {
        const x = camera.x + column;
        const terrain = world.map.tiles[y][x];
        const screenX = camera.offsetX + column * tileSize;
        const screenY = camera.offsetY + row * tileSize;
        context.drawImage(sprites[terrain], screenX, screenY, tileSize, tileSize);
        const enemy = enemies.find((entry) => entry.position.x === x && entry.position.y === y);
        if (enemy) {
          context.drawImage(sprites[enemy.typeId], screenX, screenY, tileSize, tileSize);
          context.strokeStyle = '#e6a56b';
          context.lineWidth = 2;
          context.strokeRect(screenX + 1, screenY + 1, tileSize - 2, tileSize - 2);
          context.font = 'bold 10px system-ui';
          const label = ENEMIES[enemy.typeId].name;
          const labelWidth = context.measureText(label).width + 4;
          const labelX = Math.max(0, Math.min(width - labelWidth, screenX + (tileSize - labelWidth) / 2));
          context.fillStyle = '#263f35';
          context.fillRect(labelX, Math.max(0, screenY - 12), labelWidth, 12);
          context.fillStyle = '#fff0c6';
          context.fillText(label, labelX + 2, Math.max(10, screenY - 2));
        }
        const portal = portals.find((entry) => entry.position.x === x && entry.position.y === y);
        if (portal) context.drawImage(sprites.gate, screenX, screenY, tileSize, tileSize);
        const npc = npcs.find((entry) => entry.position.x === x && entry.position.y === y);
        if (npc) {
          context.drawImage(sprites[npc.appearance], screenX, screenY, tileSize, tileSize);
          context.fillStyle = '#fff0c6';
          context.fillRect(screenX + tileSize / 2 - 6, screenY, 12, 3);
        }
        if (x === world.playerPosition.x && y === world.playerPosition.y) {
          context.drawImage(sprites.player, screenX, screenY, tileSize, tileSize);
        }
      }
    }
    for (const portal of portals) {
      const column = portal.position.x - camera.x;
      const row = camera.y + camera.rows - 1 - portal.position.y;
      if (column < 0 || column >= camera.columns || row < 0 || row >= camera.rows) continue;
      const labelX = camera.offsetX + column * tileSize + TILE_SIZE / 2;
      const labelY = camera.offsetY + row * tileSize;
      context.font = 'bold 12px system-ui';
      const labelWidth = context.measureText(portal.name).width + 12;
      const left = Math.max(0, Math.min(width - labelWidth, labelX - labelWidth / 2));
      const top = Math.max(0, labelY - 20);
      context.fillStyle = '#263f35';
      context.fillRect(left, top, labelWidth, 18);
      context.fillStyle = '#fff0c6';
      context.fillText(portal.name, left + 6, top + 13);
    }
  };
}
