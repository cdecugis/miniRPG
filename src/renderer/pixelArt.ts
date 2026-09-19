import type { TerrainId } from '../game/world/world';

export const SPRITE_SIZE = 16;
type SpriteId = TerrainId | 'player' | 'traveler' | 'guard' | 'villager' | 'gate' | 'wolf' | 'spider' | 'snake' | 'goblin';
type Paint = (color: string, x: number, y: number, width: number, height: number) => void;

function grass(paint: Paint) {
  paint('#6c8847', 0, 0, 16, 16);
  paint('#78944f', 2, 3, 2, 1);
  paint('#58763e', 3, 2, 1, 2);
  paint('#78944f', 11, 11, 3, 1);
  paint('#58763e', 12, 10, 1, 2);
}

const SPRITES: Record<SpriteId, (paint: Paint) => void> = {
  spider(paint) {
    paint('#35293c', 5, 5, 6, 7);
    paint('#765078', 6, 5, 4, 4);
    for (const y of [3, 6, 9, 12]) {
      paint('#35293c', 2, y, 3, 2);
      paint('#35293c', 11, y, 3, 2);
      paint('#35293c', 1, y + 1, 2, 2);
      paint('#35293c', 13, y + 1, 2, 2);
    }
    paint('#efb76b', 6, 10, 1, 1);
    paint('#efb76b', 9, 10, 1, 1);
  },
  snake(paint) {
    paint('#344e2c', 3, 10, 10, 4);
    paint('#c0ae56', 4, 9, 7, 3);
    paint('#c0ae56', 9, 5, 3, 6);
    paint('#e1c877', 6, 3, 7, 4);
    paint('#3b382b', 7, 4, 1, 1);
    paint('#b75642', 4, 5, 3, 1);
    paint('#718548', 4, 11, 5, 1);
  },
  goblin(paint) {
    paint('#39452c', 3, 13, 10, 2);
    paint('#514133', 5, 10, 2, 5);
    paint('#514133', 9, 10, 2, 5);
    paint('#987343', 4, 7, 8, 5);
    paint('#9bae62', 4, 2, 8, 5);
    paint('#9bae62', 2, 2, 12, 2);
    paint('#373a2b', 5, 4, 1, 1);
    paint('#373a2b', 10, 4, 1, 1);
    paint('#d0c8a1', 6, 6, 4, 1);
    paint('#684934', 13, 7, 2, 7);
    paint('#84603a', 12, 6, 4, 4);
  },
  wolf(paint) {
    paint('#354334', 2, 12, 12, 3);
    paint('#929b97', 3, 6, 10, 6);
    paint('#bdc4b7', 4, 5, 7, 5);
    paint('#687875', 3, 11, 2, 4);
    paint('#687875', 10, 11, 2, 4);
    paint('#bbc4bc', 10, 4, 5, 5);
    paint('#a5b1a5', 10, 1, 2, 4);
    paint('#a5b1a5', 13, 2, 2, 3);
    paint('#272e30', 14, 6, 2, 2);
    paint('#dfbd63', 12, 5, 1, 1);
    paint('#929b97', 1, 4, 3, 4);
  },
  gate(paint) {
    paint('#4b5143', 0, 2, 4, 14);
    paint('#4b5143', 12, 2, 4, 14);
    paint('#bbb794', 1, 1, 2, 14);
    paint('#bbb794', 13, 1, 2, 14);
    paint('#675038', 0, 0, 16, 3);
    paint('#d9bb74', 5, 0, 6, 2);
    paint('#b45d46', 2, 4, 3, 5);
    paint('#b45d46', 11, 4, 3, 5);
  },
  traveler(paint) {
    drawNpc(paint, '#8a7196', '#d3ccae');
    paint('#e6dabb', 6, 6, 4, 3);
    paint('#69543b', 12, 6, 1, 9);
  },
  guard(paint) {
    drawNpc(paint, '#648399', '#a9b7b3');
    paint('#d4d7c2', 4, 2, 8, 2);
    paint('#3f5968', 2, 8, 3, 5);
    paint('#d8ba72', 3, 9, 1, 3);
  },
  villager(paint) {
    drawNpc(paint, '#c4a457', '#694b38');
    paint('#e5d1a0', 5, 10, 6, 3);
  },
  grass,
  road(paint) {
    paint('#baa071', 0, 0, 16, 16);
    paint('#c8ae7e', 1, 2, 5, 2);
    paint('#a88c61', 9, 8, 3, 1);
    paint('#c8ae7e', 5, 12, 5, 2);
    paint('#ad9266', 13, 3, 2, 1);
  },
  tree(paint) {
    grass(paint);
    paint('#526c39', 3, 12, 11, 3);
    paint('#664933', 7, 9, 3, 6);
    paint('#263f35', 2, 5, 12, 6);
    paint('#345b3c', 1, 4, 13, 5);
    paint('#345b3c', 4, 1, 7, 11);
    paint('#477348', 3, 3, 8, 5);
    paint('#5a8550', 5, 2, 5, 3);
    paint('#273f32', 9, 8, 4, 3);
  },
  water(paint) {
    paint('#3b7284', 0, 0, 16, 16);
    paint('#447f90', 0, 1, 16, 5);
    paint('#6299a3', 2, 3, 5, 1);
    paint('#82b4b5', 3, 4, 2, 1);
    paint('#6299a3', 9, 11, 5, 1);
    paint('#305f76', 0, 14, 7, 2);
  },
  house(paint) {
    grass(paint);
    paint('#4d5637', 2, 13, 13, 3);
    paint('#dac899', 3, 6, 10, 8);
    paint('#ac9068', 3, 12, 10, 2);
    paint('#553f33', 1, 5, 14, 3);
    paint('#894d3d', 2, 3, 12, 4);
    paint('#a56246', 4, 1, 8, 4);
    paint('#c18154', 4, 2, 8, 1);
    paint('#5d4432', 7, 10, 3, 4);
    paint('#547783', 4, 9, 2, 2);
    paint('#eccb80', 11, 9, 1, 2);
  },
  rock(paint) {
    grass(paint);
    paint('#4f613e', 2, 12, 13, 3);
    paint('#555c58', 2, 6, 12, 7);
    paint('#7d8374', 4, 3, 8, 10);
    paint('#969b86', 4, 4, 6, 3);
    paint('#666e64', 10, 7, 3, 5);
    paint('#b0ad90', 5, 3, 5, 1);
  },
  player(paint) {
    paint('#414d37', 4, 13, 9, 2);
    paint('#2e3540', 5, 11, 2, 4);
    paint('#2e3540', 9, 11, 2, 4);
    paint('#553f39', 4, 14, 3, 1);
    paint('#553f39', 9, 14, 3, 1);
    paint('#773f42', 3, 7, 10, 5);
    paint('#b35d49', 5, 7, 6, 5);
    paint('#e0b780', 3, 9, 2, 2);
    paint('#e0b780', 11, 9, 2, 2);
    paint('#f0cf95', 5, 3, 6, 4);
    paint('#443b35', 4, 2, 8, 2);
    paint('#443b35', 5, 1, 6, 2);
    paint('#443b35', 9, 5, 1, 1);
    paint('#e9c56f', 5, 8, 2, 2);
    paint('#543b35', 5, 11, 6, 1);
  },
};

function drawNpc(paint: Paint, clothing: string, hair: string) {
  paint('#414d37', 3, 13, 10, 2);
  paint('#343a3b', 5, 12, 2, 3);
  paint('#343a3b', 9, 12, 2, 3);
  paint(clothing, 4, 7, 8, 6);
  paint('#edc58c', 3, 8, 2, 3);
  paint('#edc58c', 11, 8, 2, 3);
  paint('#edc58c', 5, 3, 6, 4);
  paint(hair, 4, 1, 8, 3);
  paint('#373d37', 6, 5, 1, 1);
  paint('#373d37', 9, 5, 1, 1);
}

export function createSpriteAtlas(): Record<SpriteId, HTMLCanvasElement> {
  return Object.fromEntries(Object.entries(SPRITES).map(([id, draw]) => {
    const sprite = document.createElement('canvas');
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const context = sprite.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable.');
    draw((color, x, y, width, height) => {
      context.fillStyle = color;
      context.fillRect(x, y, width, height);
    });
    return [id, sprite];
  })) as Record<SpriteId, HTMLCanvasElement>;
}
