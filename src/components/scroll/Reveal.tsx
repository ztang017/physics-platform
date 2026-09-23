import { type ReactNode } from 'react';
import { useScrollReveal } from './useScrollReveal';
import styles from './Reveal.module.css';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Extra delay (ms) before the transition starts, for staggering a few
   *  Reveal blocks one after another. */
  delay?: number;
}

/** Fades and slides a block of content up into place the first time it
 *  scrolls into the viewport. A thin wrapper around useScrollReveal for
 *  the common single-block case (a whole section or card fading in). */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.visible : ''} ${className}`}
      style={visible && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
