import { getTileSize } from '../renderer/camera';
import { useLayoutEffect, useRef } from 'react';
import { createWorldRenderer } from '../renderer/worldRenderer';
import type { WorldScene } from '../renderer/worldRenderer';

export function GameCanvas({ scene }: { scene: WorldScene }) {
  const { world } = scene;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef(scene);
  const redrawRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = createWorldRenderer(canvas);
    const redraw = () => {
      const bounds = canvas.getBoundingClientRect();
      render(worldRef.current, bounds.width, bounds.height, window.devicePixelRatio || 1, getTileSize(window.innerWidth));
    };
    redrawRef.current = redraw;
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    let densityQuery: MediaQueryList;
    const watchDensity = () => {
      densityQuery?.removeEventListener('change', watchDensity);
      densityQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      densityQuery.addEventListener('change', watchDensity);
      redraw();
    };
    watchDensity();
    window.addEventListener('resize', redraw);
    return () => {
      observer.disconnect();
      densityQuery.removeEventListener('change', watchDensity);
      window.removeEventListener('resize', redraw);
      redrawRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    worldRef.current = scene;
    redrawRef.current?.();
  }, [scene]);

  return (
    <canvas ref={canvasRef} className="world-canvas" role="img"
      aria-label={`${world.map.name}. Player at tile ${world.playerPosition.x}, ${world.playerPosition.y}.`}
      aria-describedby="movement-help">
      Explore using the keyboard or the directional buttons. Use Interact at gates or beside people.
    </canvas>
  );
}
