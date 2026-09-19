import { useEffect, useRef } from 'react';
import { getDialogueView } from '../game/dialogue/dialogue';
import type { DialogueState } from '../game/dialogue/dialogue';

export function DialogueOverlay({ dialogue, onAdvance }: { dialogue: DialogueState; onAdvance: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const view = getDialogueView(dialogue);
  useEffect(() => { buttonRef.current?.focus({ preventScroll: true }); }, []);

  return (
    <section className="dialogue-overlay" role="dialog" aria-labelledby="dialogue-speaker" aria-describedby="dialogue-text">
      <h2 id="dialogue-speaker">{view.speakerName}</h2>
      <p id="dialogue-text" aria-live="polite">{view.text}</p>
      <button ref={buttonRef} onClick={onAdvance}>{view.isLastLine ? 'Close dialogue' : 'Next'}</button>
    </section>
  );
}
