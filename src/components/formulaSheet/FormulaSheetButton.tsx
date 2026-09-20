import { useUIStore } from '../../core/store/uiStore';
import styles from './FormulaSheetButton.module.css';

/** Small header button that opens the cross-module formula reference sheet.
 *  Shared between the Dashboard and every module page so it's reachable from
 *  anywhere in the app, not just the module you happen to be in. */
export function FormulaSheetButton() {
  const openFormulaSheet = useUIStore((s) => s.openFormulaSheet);
  return (
    <button className={styles.btn} onClick={openFormulaSheet} aria-label="Open formula reference sheet">
      📐 <span className={styles.label}>Formulas</span>
    </button>
  );
}
