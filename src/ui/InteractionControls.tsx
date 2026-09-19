import type { Interaction } from '../game/interaction/interactions';

export function InteractionControls({ interactions, onInteract }: { interactions: readonly Interaction[]; onInteract: (id?: string) => void }) {
  return (
    <div className="interaction-controls">
      {interactions.length === 0 ? <button disabled>Interact</button> : interactions.map((interaction, index) => (
        <button key={interaction.id} onClick={() => onInteract(interaction.id)}>
          <span>Interact{index === 0 && <span className="key-hint"> · F</span>}</span>
          <small>{interaction.label}</small>
        </button>
      ))}
    </div>
  );
}
