import { useEffect, useRef, useState } from 'react';
import type { GameStore } from '../../game/gameStore';
import { createCombatFeedback, logCombatRoll } from './combatFeedback';
import { createCombatSound } from './combatSound';

export function useCombatFeedback(store: GameStore) {
  const [muted, setMuted] = useState(false);
  const soundRef = useRef<ReturnType<typeof createCombatSound> | null>(null);
  const feedbackRef = useRef(createCombatFeedback((event, combat) => {
    logCombatRoll(event, combat);
    if (event.type === 'attack') {
      const actor = combat.combatants.find((entry) => entry.id === event.actorId)!;
      soundRef.current?.play(actor.side, event.result.hit);
    }
  }));
  useEffect(() => {
    const sound = createCombatSound();
    soundRef.current = sound;
    document.addEventListener('pointerdown', sound.unlock);
    document.addEventListener('keydown', sound.unlock);
    const consume = () => {
      const combat = store.getSnapshot().combat;
      if (combat) feedbackRef.current(combat);
    };
    const unsubscribe = store.subscribe(consume);
    consume();
    return () => {
      unsubscribe();
      document.removeEventListener('pointerdown', sound.unlock);
      document.removeEventListener('keydown', sound.unlock);
      sound.dispose();
      soundRef.current = null;
    };
  }, [store]);
  useEffect(() => { soundRef.current?.setMuted(muted); }, [muted]);
  return { muted, toggleSound: () => setMuted((value) => !value) };
}
