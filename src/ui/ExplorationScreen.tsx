import { InventoryScreen } from './InventoryScreen';
import { CharacterStats } from './CharacterStats';
import { useEffect, useRef, useState } from 'react';
import type { GameState, GameStore } from '../game/gameStore';
import { LOCATIONS } from '../game/locations/locations';
import { getLocationNpcs } from '../game/npcs/npcs';
import { getAvailableInteractions } from '../game/interaction/interactions';
import { DirectionPad } from './DirectionPad';
import { GameCanvas } from './GameCanvas';
import { bindKeyboardControls } from './keyboardControls';
import { DialogueOverlay } from './DialogueOverlay';
import { JournalScreen } from './JournalScreen';
import { InteractionControls } from './InteractionControls';
import { ENEMY_SPAWN_PERCENT, getEnemyName } from '../game/enemies/roamingEnemies';

interface ExplorationScreenProps {
  state: GameState;
  store: GameStore;
}

export function ExplorationScreen({ state, store }: ExplorationScreenProps) {
  const screenRef = useRef<HTMLElement>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const { character, world, currentLocationId, dialogue, journal } = state;
  const dialogueActive = dialogue !== null;

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen || journalOpen || inventoryOpen || dialogueActive) return;
    screen.focus({ preventScroll: true });
    return bindKeyboardControls(screen, store.movePlayer, store.interact);
  }, [store, journalOpen, inventoryOpen, dialogueActive]);

  if (!character || !world || !currentLocationId) return null;
  const location = LOCATIONS[currentLocationId];
  const interactions = getAvailableInteractions(currentLocationId, world.playerPosition);
  const enemies = currentLocationId === 'world' ? state.roaming.enemies : [];
  const lastSpawn = state.roaming.lastSpawn;
  const scene = { world, npcs: getLocationNpcs(currentLocationId), portals: location.portals,
    enemies };

  return (
    <section className="exploration" ref={screenRef} tabIndex={-1} aria-label="Exploration">
      <header className="game-hud">
        <h1 title={character.name}>{character.name}</h1>
        <dl>
          <div><dt>HP</dt><dd>{character.currentHP} / {character.maxHP}</dd></div>
          <div><dt>Gold</dt><dd>{character.gold}</dd></div>
        </dl>
      </header>
      <div className="map-frame">
        <div className="map-caption">
          <h2>{location.name}</h2>
          <button className="journal-button" onClick={() => setInventoryOpen(true)} disabled={dialogueActive}>Inventory</button>
          <button className="journal-button" onClick={() => setJournalOpen(true)} disabled={dialogueActive}>Journal</button>
        </div>
        <div className="game-area">
          <GameCanvas scene={scene} />
          {!dialogueActive && !journalOpen && !inventoryOpen && (
            <div className="exploration-controls">
              <DirectionPad onMove={store.movePlayer} />
              <InteractionControls interactions={interactions} onInteract={store.interact} />
            </div>
          )}

        </div>
      </div>
      <aside className="message-panel">
      <CharacterStats character={character} />
      {dialogue ? <DialogueOverlay dialogue={dialogue} onAdvance={store.advanceDialogue} /> : <>
      <h2>Messages</h2>
      <p className="movement-help" id="movement-help">
        <span className="keyboard-help">Arrows to walk · Q/E/Z/C diagonals · F to interact. </span>
        {currentLocationId === 'world' ? 'Follow the road north to the Greenhaven gate. Stand on a gate and use Interact.' : 'Stand beside a person and use Interact. Leave through the southern gate.'}
      </p>
      {currentLocationId === 'world' && <div className="encounter-hint" role="status">
        <p>Each outdoor step has a {ENEMY_SPAWN_PERCENT}% chance of attracting an enemy. Enemies pursue you; adjacency starts combat.</p>
        {lastSpawn && <p>Last sighting: {getEnemyName(lastSpawn)} appeared at the map edge ({lastSpawn.position.x}, {lastSpawn.position.y}).</p>}
        <p>{enemies.length} roaming {enemies.length === 1 ? 'enemy' : 'enemies'}.</p>
      </div>}
      <p className="session-note" role="status">{journal.clues.length > 0 ? 'A clue is recorded in your Journal. ' : ''}Progress resets when you reload.</p>
      </>}
      </aside>
      {inventoryOpen && <InventoryScreen character={character} onEquip={store.equipItem} onUnequip={store.unequipItem} onClose={() => setInventoryOpen(false)} />}
      {journalOpen && <JournalScreen journal={journal} onClose={() => setJournalOpen(false)} />}
    </section>
  );
}
