import { getTileSize } from '../../renderer/camera';
import { useLayoutEffect, useRef } from 'react';
import { createCombatRenderer, screenToCombatTile } from '../../renderer/combatRenderer';
import type { CombatScene } from '../../renderer/combatRenderer';
import type { TilePosition } from '../../game/world/world';

export function CombatCanvas({ scene, onSelect }: { scene: CombatScene; onSelect: (tile: TilePosition) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(scene);
  const redrawRef = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = createCombatRenderer(canvas);
    const redraw = () => {
      const bounds = canvas.getBoundingClientRect();
      render(sceneRef.current, bounds.width, bounds.height, window.devicePixelRatio || 1, getTileSize(window.innerWidth));
    };
    redrawRef.current = redraw;
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    let density: MediaQueryList;
    const watchDensity = () => {
      density?.removeEventListener('change', watchDensity);
      density = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      density.addEventListener('change', watchDensity);
      redraw();
    };
    watchDensity();
    window.addEventListener('resize', redraw);
    return () => {
      observer.disconnect();
      density.removeEventListener('change', watchDensity);
      window.removeEventListener('resize', redraw);
      redrawRef.current = null;
    };
  }, []);
  useLayoutEffect(() => { sceneRef.current = scene; redrawRef.current?.(); }, [scene]);
  const player = scene.combat.combatants.find((actor) => actor.side === 'player')!;

  return <canvas ref={canvasRef} className="combat-canvas" role="img"
    aria-label={`Tactical battlefield. Player at ${player.position.x}, ${player.position.y}.`}
    aria-describedby="combat-help"
    onClick={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const tile = screenToCombatTile(event.clientX - bounds.left, event.clientY - bounds.top, bounds.width, bounds.height, scene.focus, getTileSize(window.innerWidth));
      if (tile) onSelect(tile);
    }}>Use the directional controls or keyboard to move across the battlefield.</canvas>;
}
