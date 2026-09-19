import type { Direction } from '../game/world/world';

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'north', ArrowDown: 'south', ArrowLeft: 'west', ArrowRight: 'east',
  q: 'northWest', e: 'northEast', z: 'southWest', c: 'southEast',
  '7': 'northWest', '8': 'north', '9': 'northEast', '4': 'west',
  '6': 'east', '1': 'southWest', '2': 'south', '3': 'southEast',
};

export function getKeyboardDirection(key: string): Direction | undefined {
  return KEY_DIRECTIONS[key.length === 1 ? key.toLowerCase() : key];
}

export function bindKeyboardControls(target: HTMLElement, onMove: (direction: Direction) => void, onInteract?: () => void) {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"], dialog, [role="dialog"]')) return;
    if (event.key.toLowerCase() === 'f' && onInteract) {
      event.preventDefault();
      if (!event.repeat) onInteract();
      return;
    }
    const direction = getKeyboardDirection(event.key);
    if (!direction) return;
    event.preventDefault();
    onMove(direction);
  };
  target.addEventListener('keydown', onKeyDown);
  return () => target.removeEventListener('keydown', onKeyDown);
}
