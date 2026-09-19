import { useRef, useEffect, useCallback } from 'react';

interface AnimationLoopOptions {
  onFrame: (dt: number, elapsed: number) => void;
  /** Set to false to pause the loop */
  running?: boolean;
}

/**
 * A high-precision RAF-based animation loop.
 * Calls onFrame(deltaTime, elapsedTime) each frame.
 * deltaTime is capped at 100ms to avoid large jumps after tab blur.
 */
export function useAnimationLoop({ onFrame, running = true }: AnimationLoopOptions) {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    lastTimeRef.current = null;
  }, []);

  const start = useCallback(() => {
    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const rawDt = now - lastTimeRef.current;
      const dt = Math.min(rawDt, 100) / 1000; // seconds, capped
      lastTimeRef.current = now;
      elapsedRef.current += dt;
      onFrameRef.current(dt, elapsedRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    if (running) start();
    else stop();
    return stop;
  }, [running, start, stop]);

  return { stop, start };
}
