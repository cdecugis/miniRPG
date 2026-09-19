import type { Direction } from '../game/world/world';

const BUTTONS: { direction: Direction; label: string; arrow: string; row: number; column: number }[] = [
  { direction: 'northWest', label: 'North-west', arrow: '↖', row: 1, column: 1 },
  { direction: 'north', label: 'North', arrow: '↑', row: 1, column: 2 },
  { direction: 'northEast', label: 'North-east', arrow: '↗', row: 1, column: 3 },
  { direction: 'west', label: 'West', arrow: '←', row: 2, column: 1 },
  { direction: 'east', label: 'East', arrow: '→', row: 2, column: 3 },
  { direction: 'southWest', label: 'South-west', arrow: '↙', row: 3, column: 1 },
  { direction: 'south', label: 'South', arrow: '↓', row: 3, column: 2 },
  { direction: 'southEast', label: 'South-east', arrow: '↘', row: 3, column: 3 },
];

export function DirectionPad({ onMove }: { onMove: (direction: Direction) => void }) {
  return (
    <div className="direction-pad" role="group" aria-label="Movement controls">
      {BUTTONS.map(({ direction, label, arrow, row, column }) => (
        <button key={direction} type="button" aria-label={`Move ${label.toLowerCase()}`}
          style={{ gridArea: `${row} / ${column}` }} onClick={() => onMove(direction)}>
          <span aria-hidden="true">{arrow}</span>
        </button>
      ))}
      <span className="pad-center" aria-hidden="true">◆</span>
    </div>
  );
}
