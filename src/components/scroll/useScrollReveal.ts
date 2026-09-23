import { useEffect, useRef, useState } from 'react';

/** Tracks whether an element has scrolled into view, using
 *  IntersectionObserver so the check is passive (no scroll-event
 *  listeners running constantly). Fires once and then disconnects —
 *  content that has already appeared should never fade back out just
 *  because the user scrolled past it. */
export function useScrollReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion: show immediately rather than
    // gating content behind a scroll-triggered transition at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Also treat "already scrolled past" (top edge above the viewport)
        // as revealed — an instant jump (End key, a hash link, a fast
        // programmatic scroll) can skip every intermediate frame where the
        // element would have registered as intersecting, which would
        // otherwise leave it at opacity 0 forever.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}
