import { describe, expect, it } from 'vitest';
import { LOCATIONS } from './locations';
import { NPCS } from '../npcs/npcs';
import { DIALOGUES } from '../dialogue/dialogue';
import { CLUES } from '../journal/journal';
import { isWalkable } from '../world/collision';
import { TERRAIN } from '../world/world';

describe('location and conversation content integrity', () => {
  it('has consistent rectangular maps with only known terrain IDs', () => {
    for (const location of Object.values(LOCATIONS)) {
      expect(location.map.tiles).toHaveLength(location.map.height);
      for (const row of location.map.tiles) {
        expect(row).toHaveLength(location.map.width);
        for (const terrain of row) expect(TERRAIN[terrain]).toBeDefined();
      }
    }
  });

  it('places portals and arrivals on unoccupied walkable tiles', () => {
    for (const location of Object.values(LOCATIONS)) {
      for (const portal of location.portals) {
        expect(isWalkable(location.map, portal.position)).toBe(true);
        expect(isWalkable(LOCATIONS[portal.destinationId].map, portal.arrivalPosition)).toBe(true);
        expect(NPCS.some((npc) => npc.locationId === portal.destinationId
          && npc.position.x === portal.arrivalPosition.x && npc.position.y === portal.arrivalPosition.y)).toBe(false);
      }
    }
  });

  it('uses unique NPC IDs and unoccupied map positions with valid dialogues', () => {
    expect(new Set(NPCS.map((npc) => npc.id)).size).toBe(NPCS.length);
    expect(new Set(NPCS.map((npc) => `${npc.locationId}:${npc.position.x},${npc.position.y}`)).size).toBe(NPCS.length);
    for (const npc of NPCS) {
      expect(isWalkable(LOCATIONS[npc.locationId].map, npc.position)).toBe(true);
      expect(DIALOGUES[npc.dialogueId].lines.length).toBeGreaterThan(0);
    }
    for (const dialogue of Object.values(DIALOGUES)) {
      if (dialogue.completionClueId) expect(CLUES[dialogue.completionClueId]).toBeDefined();
    }
  });
});
