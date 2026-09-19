import { useGameStore } from '../../core/store/gameStore';
import styles from './MathToggle.module.css';

export function MathToggle() {
  const { mathMode, toggleMathMode } = useGameStore();

  return (
    <button
      className={`${styles.toggle} ${mathMode ? styles.active : ''}`}
      onClick={toggleMathMode}
      aria-pressed={mathMode}
      aria-label={`Switch to ${mathMode ? 'visual' : 'mathematical'} mode`}
      title={mathMode ? 'Switch to Visual mode' : 'Switch to Math mode'}
    >
      <span className={`${styles.pill} ${!mathMode ? styles.pillActive : ''}`}>
        👁 Visual
      </span>
      <span className={`${styles.pill} ${mathMode ? styles.pillActive : ''}`}>
        ∑ Math
      </span>
    </button>
  );
}
