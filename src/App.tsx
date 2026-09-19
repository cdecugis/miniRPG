import { useCombatFeedback } from './ui/combat/useCombatFeedback';
import { useState, useSyncExternalStore } from 'react';
import type { GameStore } from './game/gameStore';
import { CharacterCreation } from './ui/CharacterCreation';
import { ExplorationScreen } from './ui/ExplorationScreen';
import { CombatScreen } from './ui/combat/CombatScreen';

export function App({ store }: { store: GameStore }) {
  const { muted, toggleSound } = useCombatFeedback(store);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const { character, world } = state;
  const [creating, setCreating] = useState(false);

  return (
    <div className={`app-shell${character ? ' is-playing' : ''}`}>
      <header className="site-header">
        <span className="wordmark">mini<span>RPG</span></span>
        <button className="sound-toggle" aria-pressed={!muted} onClick={toggleSound}>Sound {muted ? 'off' : 'on'}</button>
      </header>
      <main>
        {state.combat ? (
          <CombatScreen character={character!} combat={state.combat} onMove={store.moveInCombat} onAttack={store.attackEnemy}
            onEndTurn={store.endCombatTurn} onEnemyTurn={store.runEnemyTurn} onReturn={store.returnToExploration} />
        ) : character && world ? (
          <ExplorationScreen state={state} store={store} />
        ) : creating ? (
          <CharacterCreation onCreate={store.startNewGame} />
        ) : (
          <section className="intro panel" aria-labelledby="new-game-title">
            <p className="eyebrow">Your story starts here</p>
            <h1 id="new-game-title">New Game</h1>
            <p className="lede">A name. A sword.<br />The beginning of your story.</p>
            <button onClick={() => setCreating(true)}>
              Start a new game <span aria-hidden="true">→</span>
            </button>
          </section>
        )}
      </main>
      <footer className="site-footer">miniRPG <span aria-hidden="true">/</span> Chapter one: a beginning</footer>
    </div>
  );
}
