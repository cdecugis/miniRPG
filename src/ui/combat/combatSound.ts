/** Browser audio is presentation only; no random rolls or game state are changed. */
export function createCombatSound() {
  let context: AudioContext | null = null;
  let muted = false;
  const unlock = () => {
    if (muted || typeof AudioContext === 'undefined') return;
    try {
      context ??= new AudioContext();
      if (context.state === 'suspended') void context.resume().catch(() => {});
    } catch { /* Audio is optional when the browser or device does not support it. */ }
  };
  return {
    unlock,
    setMuted(value: boolean) { muted = value; if (!value) unlock(); },
    play(side: 'player' | 'enemy', hit: boolean) {
      if (muted || !context || context.state !== 'running') return;
      const oscillator = context.createOscillator();
      const volume = context.createGain();
      const now = context.currentTime;
      oscillator.type = hit ? 'triangle' : 'sine';
      const pitch = side === 'player' ? 520 : 180;
      oscillator.frequency.setValueAtTime(hit ? pitch : pitch * 1.5, now);
      oscillator.frequency.exponentialRampToValueAtTime(hit ? pitch / 3 : pitch * 0.8, now + 0.16);
      volume.gain.setValueAtTime(0.0001, now);
      volume.gain.exponentialRampToValueAtTime(hit ? 0.12 : 0.06, now + 0.01);
      volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      oscillator.connect(volume);
      volume.connect(context.destination);
      oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
      oscillator.start(now);
      oscillator.stop(now + 0.22);
    },
    dispose() { if (context) void context.close().catch(() => {}); context = null; },
  };
}
