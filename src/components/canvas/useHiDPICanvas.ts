import { useLayoutEffect, type RefObject } from 'react';

/**
 * Keeps a canvas crisp on HiDPI displays and correctly sized when its CSS
 * width is responsive (e.g. `width: 100%; max-width: 600px`).
 *
 * Drawing code keeps using a fixed "logical" coordinate system
 * (0..logicalWidth, 0..logicalHeight) exactly as if devicePixelRatio were 1
 * and the canvas were rendered at its logical size — this hook sets the
 * canvas's actual backing-store resolution to match the real rendered CSS
 * size × devicePixelRatio, and applies a matching transform, so 1 drawn unit
 * always maps to 1 real display pixel regardless of screen density or how
 * much the layout has shrunk the canvas.
 */
export function useHiDPICanvas(
  ref: RefObject<HTMLCanvasElement | null>,
  logicalWidth: number,
  logicalHeight: number
) {
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      const cssWidth = canvas.getBoundingClientRect().width || logicalWidth;
      const scale = (cssWidth * dpr) / logicalWidth;

      const backingWidth = Math.max(1, Math.round(logicalWidth * scale));
      const backingHeight = Math.max(1, Math.round(logicalHeight * scale));
      if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
        canvas.width = backingWidth;
        canvas.height = backingHeight;
      }
      canvas.getContext('2d')?.setTransform(scale, 0, 0, scale, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [ref, logicalWidth, logicalHeight]);
}
