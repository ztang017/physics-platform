import { useEffect, useState } from 'react';

/** Animates a number from 0 up to `target` once `active` becomes true —
 *  used to give a plain stat a bit of "data counter" motion the moment it
 *  scrolls into view, rather than just appearing as static text. */
export function useCountUp(target: number, active: boolean, duration = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}
