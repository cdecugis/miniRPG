import { useEffect, useRef } from 'react';
import type { JournalState } from '../game/journal/journal';

export function JournalScreen({ journal, onClose }: { journal: JournalState; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} className="journal-screen" aria-labelledby="journal-title" onClose={onClose}>
      <header><h2 id="journal-title">Journal</h2><button autoFocus onClick={onClose}>Close Journal</button></header>
      <h3>Clues</h3>
      {journal.clues.length === 0 ? (
        <p>No clues discovered yet. Speak with people you meet to learn about the world.</p>
      ) : (
        <ul className="clue-list">
          {journal.clues.map((clue) => (
            <li key={clue.id}>
              <h4>{clue.title}</h4>
              <p>{clue.description}</p>
              <p className="clue-source">Source: {clue.sourceNpcName}</p>
            </li>
          ))}
        </ul>
      )}
    </dialog>
  );
}
