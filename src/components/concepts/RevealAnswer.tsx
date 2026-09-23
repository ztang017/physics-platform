import { type ReactNode, useState } from 'react';
import styles from './RevealAnswer.module.css';

interface RevealAnswerProps {
  question: ReactNode;
  answer: ReactNode;
}

/** A single self-check question with a click-to-reveal worked solution —
 *  used inside Challenge Yourself sections so a student can attempt the
 *  problem before seeing how it's solved, without the overhead of a full
 *  graded quiz for what's meant to be optional enrichment. */
export function RevealAnswer({ question, answer }: RevealAnswerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <div className={styles.questionRow}>
        <span className={styles.icon} aria-hidden="true">✏️</span>
        <p className={styles.question}>{question}</p>
      </div>
      {open ? (
        <div className={styles.answer}>{answer}</div>
      ) : (
        <button className={styles.revealBtn} onClick={() => setOpen(true)}>
          💡 Reveal worked solution
        </button>
      )}
    </div>
  );
}
