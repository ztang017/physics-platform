import { useMemo } from 'react';
import { useUIStore } from '../../core/store/uiStore';
import { useSRSStore, isCardDue } from '../../core/store/srsStore';
import styles from './SpacedReviewButton.module.css';

/** Header button that opens the spaced-repetition review panel, badged with
 *  how many previously-answered questions are currently due. */
export function SpacedReviewButton() {
  const openSpacedReview = useUIStore((s) => s.openSpacedReview);
  const cards = useSRSStore((s) => s.cards);
  const dueCount = useMemo(() => Object.values(cards).filter((c) => isCardDue(c)).length, [cards]);

  return (
    <button className={styles.btn} onClick={openSpacedReview} aria-label={`Open spaced review${dueCount > 0 ? `, ${dueCount} due` : ''}`}>
      📚 <span className={styles.label}>Review</span>
      {dueCount > 0 && <span className={styles.badge}>{dueCount}</span>}
    </button>
  );
}
