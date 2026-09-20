import { useEffect, useState } from 'react';
import { useGameStore } from '../../core/store/gameStore';
import styles from './MathToggle.module.css';

// Toggling used to be nearly invisible — the only change was a small
// equations panel appearing somewhere below the fold. A brief toast spells
// out, every time, what mode you're now in and what actually changes.
export function MathToggle() {
  const { mathMode, toggleMathMode } = useGameStore();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 2600);
    return () => clearTimeout(t);
  }, [showToast]);

  const handleClick = () => {
    toggleMathMode();
    setShowToast(true);
  };

  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.toggle} ${mathMode ? styles.active : ''}`}
        onClick={handleClick}
        aria-pressed={mathMode}
        aria-label={`Switch to ${mathMode ? 'visual' : 'mathematical'} mode`}
        title={mathMode ? 'Math mode: shows the equations & live values behind each simulation. Click for Visual mode.' : 'Visual mode: clean simulation only. Click for Math mode, which adds an equations panel.'}
      >
        <span className={`${styles.pill} ${!mathMode ? styles.pillActive : ''}`}>
          👁 Visual
        </span>
        <span className={`${styles.pill} ${mathMode ? styles.pillActive : ''}`}>
          ∑ Math
        </span>
      </button>

      {showToast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {mathMode
            ? <><strong>∑ Math Mode</strong> — an equations panel with live values now appears in each simulation.</>
            : <><strong>👁 Visual Mode</strong> — equations panels are hidden; just the clean simulation.</>}
        </div>
      )}
    </div>
  );
}
