import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/** Renders a LaTeX string with KaTeX, falling back to plain text on parse errors. */
export function Katex({ latex, displayMode = false }: { latex: string; displayMode?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode,
        output: 'mathml', // MathML for screen reader support
      });
    } catch {
      ref.current.textContent = latex;
    }
  }, [latex, displayMode]);

  return <span ref={ref} aria-label={latex} />;
}
