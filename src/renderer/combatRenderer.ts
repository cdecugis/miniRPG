import type { EnemyTypeId } from '../game/enemies/enemies';
import type { CombatState } from '../game/combat/types';
import { COMBAT_GRID_SIZE } from '../game/combat/rules';
import type { TilePosition } from '../game/world/world';
import { getCamera, TILE_SIZE } from './camera';
import { createSpriteAtlas } from './pixelArt';

export const BATTLEFIELD = { width: COMBAT_GRID_SIZE, height: COMBAT_GRID_SIZE };

export interface CombatScene {
  readonly combat: CombatState;
  readonly focus: TilePosition;
  readonly reachable: readonly TilePosition[];
  readonly selected: TilePosition | null;
}

export function screenToCombatTile(x: number, y: number, width: number, height: number, focus: TilePosition, tileSize = TILE_SIZE): TilePosition | null {
  const camera = getCamera(BATTLEFIELD, focus, width, height, tileSize);
  const column = Math.floor((x - camera.offsetX) / tileSize);
  const row = Math.floor((y - camera.offsetY) / tileSize);
  if (column < 0 || row < 0 || column >= camera.columns || row >= camera.rows) return null;
  return { x: camera.x + column, y: camera.y + camera.rows - 1 - row };
}

export function createCombatRenderer(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable.');
  const sprites = createSpriteAtlas();
  return ({ combat, focus, reachable, selected }: CombatScene, width: number, height: number, pixelRatio: number, tileSize = TILE_SIZE) => {
    const rasterWidth = Math.round(width * pixelRatio);
    const rasterHeight = Math.round(height * pixelRatio);
    if (canvas.width !== rasterWidth) canvas.width = rasterWidth;
    if (canvas.height !== rasterHeight) canvas.height = rasterHeight;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = false;
    context.fillStyle = '#263f35';
    context.fillRect(0, 0, width, height);
    const camera = getCamera(BATTLEFIELD, focus, width, height, tileSize);
    for (let row = 0; row < camera.rows; row++) {
      for (let column = 0; column < camera.columns; column++) {
        const x = camera.x + column;
        const y = camera.y + camera.rows - 1 - row;
        const left = camera.offsetX + column * tileSize;
        const top = camera.offsetY + row * tileSize;
        context.drawImage(sprites.grass, left, top, tileSize, tileSize);
        if (reachable.some((tile) => tile.x === x && tile.y === y)) {
          context.fillStyle = '#e7dfa84d';
          context.fillRect(left, top, tileSize, tileSize);
          context.fillStyle = '#e7dfa8';
          context.fillRect(left + tileSize / 2 - 3, top + tileSize / 2 - 3, 6, 6);
        }
        context.strokeStyle = '#233d3999';
        context.lineWidth = 1;
        context.strokeRect(left + 0.5, top + 0.5, tileSize - 1, tileSize - 1);
        const actor = combat.combatants.find((entry) => entry.position.x === x && entry.position.y === y && entry.currentHP > 0);
        if (actor) {
          context.drawImage(sprites[actor.side === 'player' ? 'player' : actor.id as EnemyTypeId], left, top, tileSize, tileSize);
          if (actor.id === combat.activeCombatantId && combat.status === 'active') {
            context.strokeStyle = '#ffda73';
            context.lineWidth = 3;
            context.strokeRect(left + 3, top + 3, tileSize - 6, tileSize - 6);
          }
        }
        if (selected?.x === x && selected.y === y) {
          context.strokeStyle = '#faf1ce';
          context.lineWidth = 3;
          context.strokeRect(left + 6, top + 6, tileSize - 12, tileSize - 12);
        }
      }
    }
    context.font = '12px system-ui';
    context.fillStyle = '#fff4d5';
    context.fillText(`x ${camera.x}–${camera.x + camera.columns - 1} · y ${camera.y}–${camera.y + camera.rows - 1}`, 8, height - 6);
  };
}
