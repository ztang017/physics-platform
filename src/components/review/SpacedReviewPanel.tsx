import { useEffect, useMemo, useState } from 'react';
import { useUIStore } from '../../core/store/uiStore';
import { useSRSStore, isCardDue, type SRSCard } from '../../core/store/srsStore';
import { useGameStore } from '../../core/store/gameStore';
import { findReviewQuestion, type ReviewQuestion } from '../../core/reviewQuestions';
import styles from './SpacedReviewPanel.module.css';

const XP_PER_CORRECT_REVIEW = 5;

/** Spaced-repetition review: pulls due Leitner cards (previously-answered
 *  Explain questions, from any module) and quizzes them one at a time.
 *  Unlike the module's Explain phase, this is single-attempt — a review is
 *  meant to test what's already been taught, not teach it for the first
 *  time — and correctness feeds straight back into the same SRS card so
 *  the next due date reschedules accordingly. */
export function SpacedReviewPanel() {
  const { spacedReviewOpen, closeSpacedReview } = useUIStore();
  const { cards, recordAnswer } = useSRSStore();
  const addXP = useGameStore((s) => s.addXP);

  const [queue, setQueue] = useState<{ card: SRSCard; question: ReviewQuestion }[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  // Snapshot the due queue once, when the panel opens — otherwise a card
  // rescheduling mid-session (right after being answered) could shuffle the
  // list the student is actively working through.
  useEffect(() => {
    if (!spacedReviewOpen) return;
    const due = Object.values(cards)
      .filter((c) => isCardDue(c))
      .map((card) => {
        const question = findReviewQuestion(card.moduleId, card.questionId);
        return question ? { card, question } : null;
      })
      .filter((x): x is { card: SRSCard; question: ReviewQuestion } => x !== null);
    setQueue(due);
    setIdx(0);
    setSelected(null);
    // Deliberately snapshot only on open, not on every `cards` change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spacedReviewOpen]);

  useEffect(() => {
    if (!spacedReviewOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSpacedReview(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spacedReviewOpen, closeSpacedReview]);

  const dueCount = useMemo(() => Object.values(cards).filter((c) => isCardDue(c)).length, [cards]);

  if (!spacedReviewOpen) return null;

  const current = queue[idx];

  const handleSelect = (optionIdx: number) => {
    if (selected !== null || !current) return;
    setSelected(optionIdx);
    const correct = optionIdx === current.question.correctIndex;
    recordAnswer(current.card.moduleId, current.card.questionId, correct);
    if (correct) addXP(XP_PER_CORRECT_REVIEW);
  };

  const handleNext = () => {
    setSelected(null);
    setIdx((i) => i + 1);
  };

  return (
    <div className={styles.overlay} onClick={closeSpacedReview}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Spaced review"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>📚 Spaced Review</h2>
          <button className={styles.closeBtn} onClick={closeSpacedReview} aria-label="Close spaced review">✕</button>
        </div>
        <p className={styles.subtitle}>
          Questions you've answered before, resurfaced right when you're about to forget them.
        </p>

        {queue.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎉</span>
            <p><strong>All caught up!</strong></p>
            <p className={styles.emptyHint}>
              {dueCount === 0 && Object.keys(cards).length === 0
                ? "Answer some Explain-phase questions in any module, and they'll show up here for review once it's time."
                : "Nothing is due for review right now — check back later."}
            </p>
          </div>
        )}

        {current && idx < queue.length && (
          <div className={styles.card}>
            <span className={styles.moduleTag}>{current.question.moduleTitle}</span>
            <p className={styles.question}>{current.question.question}</p>

            <div className={styles.options} role="radiogroup" aria-label="Answer options">
              {current.question.options.map((opt, i) => {
                const isCorrect = i === current.question.correctIndex;
                let optClass = styles.option;
                if (selected !== null) {
                  if (isCorrect) optClass += ` ${styles.optionCorrect}`;
                  else if (i === selected) optClass += ` ${styles.optionWrong}`;
                }
                return (
                  <button
                    key={i}
                    className={optClass}
                    onClick={() => handleSelect(i)}
                    disabled={selected !== null}
                    role="radio"
                    aria-checked={selected === i}
                  >
                    <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className={`${styles.feedback} ${selected === current.question.correctIndex ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                <p>
                  <strong>{selected === current.question.correctIndex ? '✓ Correct!' : '✗ Not quite —'}</strong>{' '}
                  {current.question.explanation}
                </p>
                <button className="btn btn--primary" onClick={handleNext}>
                  {idx + 1 >= queue.length ? 'Finish Review' : 'Next →'}
                </button>
              </div>
            )}

            <span className={styles.progress}>{idx + 1} of {queue.length} due</span>
          </div>
        )}

        {queue.length > 0 && idx >= queue.length && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎉</span>
            <p><strong>Review complete!</strong> Come back later for the next round.</p>
          </div>
        )}
      </div>
    </div>
  );
}
