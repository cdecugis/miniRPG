import type { Character } from '../../game/character/character';
import { CharacterStats } from '../CharacterStats';
import { useEffect, useRef, useState } from 'react';
import type { CombatState } from '../../game/combat/types';
import { canAttack } from '../../game/combat/engine';
import { canMoveCombatant, getReachableAdjacentTiles, getRemainingMovement, movementCost } from '../../game/combat/movement';
import { COMBAT_GRID_SIZE } from '../../game/combat/rules';
import { DIRECTIONS } from '../../game/world/world';
import type { Direction, TilePosition } from '../../game/world/world';
import { CombatCanvas } from './CombatCanvas';
import { DirectionPad } from '../DirectionPad';
import { bindKeyboardControls } from '../keyboardControls';
import { formatCombatLog } from './combatLog';

interface CombatScreenProps {
  combat: CombatState;
  character: Character;
  onMove: (tile: TilePosition) => void;
  onAttack: () => void;
  onEndTurn: () => void;
  onEnemyTurn: (expected: CombatState) => void;
  onReturn: () => void;
}

export function CombatScreen({ character, combat, onMove, onAttack, onEndTurn, onEnemyTurn, onReturn }: CombatScreenProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<TilePosition | null>(null);
  const [view, setView] = useState<'player' | 'enemy' | TilePosition>('player');
  const player = combat.combatants.find((actor) => actor.id === 'player')!;
  const enemy = combat.combatants.find((actor) => actor.side === 'enemy')!;
  const lastAttack = [...combat.events].reverse().find((event) => event.type === 'attack');
  const active = combat.combatants.find((actor) => actor.id === combat.activeCombatantId)!;
  const playerTurn = combat.status === 'active' && active.side === 'player';
  const focus = typeof view === 'string' ? (view === 'player' ? player.position : enemy.position) : view;
  const validSelection = selected && canMoveCombatant(combat, 'player', selected) ? selected : null;
  const moveDirection = (direction: Direction) => onMove({ x: player.position.x + DIRECTIONS[direction].x, y: player.position.y + DIRECTIONS[direction].y });

  useEffect(() => { rootRef.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => { if (playerTurn) rootRef.current?.focus({ preventScroll: true }); }, [playerTurn]);
  useEffect(() => { setSelected(null); }, [combat.activeCombatantId, player.position]);
  useEffect(() => {
    if (combat.status !== 'active' || active.side !== 'enemy') return;
    const timer = window.setTimeout(() => onEnemyTurn(combat), 450);
    return () => window.clearTimeout(timer);
  }, [combat, active.side, onEnemyTurn]);
  useEffect(() => {
    if (!rootRef.current || !playerTurn) return;
    return bindKeyboardControls(rootRef.current, (direction) => onMove({
      x: player.position.x + DIRECTIONS[direction].x, y: player.position.y + DIRECTIONS[direction].y,
    }));
  }, [playerTurn, player.position, onMove]);

  function pan(x: number, y: number) {
    setView({ x: Math.max(0, Math.min(COMBAT_GRID_SIZE - 1, focus.x + x)), y: Math.max(0, Math.min(COMBAT_GRID_SIZE - 1, focus.y + y)) });
  }

  return (
    <section className="combat-screen" ref={rootRef} tabIndex={-1} aria-label="Tactical combat">
      <header className="combat-header">
        <div><h1>{enemy.name} encounter</h1><p>{player.name}: <strong>{player.currentHP} / {player.maxHP} HP</strong></p></div>
        <p>{enemy.name}: <strong>{enemy.currentHP} / {enemy.maxHP} HP</strong></p>
      </header>
      <p className="turn-status" role="status">{combat.status === 'active'
        ? `${active.name}'s turn · ${getRemainingMovement(active)} movement points`
        : combat.status === 'victory' ? `Victory! The ${enemy.name} is defeated.` : 'Game Over'}</p>
      <div className="combat-stage">
      {lastAttack && <p className="damage-feedback" role="status">{combat.combatants.find((actor) => actor.id === lastAttack.actorId)?.name}: {lastAttack.result.hit ? `${lastAttack.result.finalDamage} damage to ${combat.combatants.find((actor) => actor.id === lastAttack.targetId)?.name}` : 'Miss!'}</p>}
      <CombatCanvas scene={{ combat, focus, selected: validSelection, reachable: getReachableAdjacentTiles(combat, 'player') }} onSelect={setSelected} />
      <div className="combat-controls">
      {combat.status === 'active' ? <>
        <div className="combat-actions">
          <button onClick={onAttack} disabled={!canAttack(combat, 'player', enemy.id)}>Attack {enemy.name}</button>
          <button onClick={onEndTurn} disabled={!playerTurn}>End Turn</button>
        </div>
        <div className="combat-movement">
          <fieldset disabled={!playerTurn}><legend>Move one tile</legend><DirectionPad onMove={moveDirection} /></fieldset>
          <div className="move-preview">
            <p id="combat-help">Select a highlighted tile to preview its cost, then confirm. Or use the arrows and Q/E/Z/C.</p>
            {validSelection && <button onClick={() => { onMove(validSelection); setSelected(null); }}>
              Move to ({validSelection.x}, {validSelection.y}) · {movementCost(player.position, validSelection)} MP
            </button>}
          </div>
        </div>
      </> : combat.status === 'victory' ? <button className="return-button" onClick={onReturn}>Return to exploration</button>
        : <p>Your journey has ended. Reload to start a new game.</p>}
      </div>
      </div>
      <aside className="message-panel">
      <CharacterStats character={character} />
      {!player.attackId && <p className="encounter-hint">No weapon equipped. Sword attacks require an equipped Long Sword.</p>}
      <details className="camera-controls">
        <summary>Inspect battlefield</summary>
        <div><button onClick={() => setView('player')}>Find player</button><button onClick={() => setView('enemy')}>Find {enemy.name}</button></div>
        <div><button aria-label="Pan west" onClick={() => pan(-3, 0)}>←</button><button aria-label="Pan north" onClick={() => pan(0, 3)}>↑</button><button aria-label="Pan south" onClick={() => pan(0, -3)}>↓</button><button aria-label="Pan east" onClick={() => pan(3, 0)}>→</button></div>
      </details>
      <section className="combat-log" aria-label="Combat log"><h2>Combat log</h2><ol aria-live="polite">{formatCombatLog(combat).slice(-10).reverse().map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ol></section>
      </aside>
    </section>
  );
}
