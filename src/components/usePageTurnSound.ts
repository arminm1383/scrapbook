import { useCallback, useEffect, useRef } from 'react';
import pageTurn from '../assets/audio/page-turn.wav';

/** Play directly from the gesture so mobile browsers can authorize the sound. */
export function usePageTurnSound() {
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => {
    audio.current?.pause();
    audio.current = null;
  }, []);

  return useCallback(() => {
    const sound = audio.current ?? new Audio(pageTurn);
    audio.current = sound;
    sound.volume = 0.45;
    // Reuse one voice: fast interactions cannot stack multiple rustles.
    sound.pause();
    sound.currentTime = 0;
    void sound.play().catch(() => { /* Sound availability must never block a page turn. */ });
  }, []);
}
