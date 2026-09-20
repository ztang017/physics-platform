import styles from './FormulaPanel.module.css';
import { useGameStore } from '../../core/store/gameStore';
import { Katex } from './Katex';

export interface FormulaEntry {
  /** LaTeX string for the formula, e.g. "v = v_0 + at" */
  latex: string;
  /** Human label shown next to formula */
  label: string;
  /** Optional live substituted value string, e.g. "= 12.4 m/s" */
  liveValue?: string;
  /** Color accent for the formula row */
  accentColor?: 'cyan' | 'green' | 'amber' | 'violet';
}

interface FormulaPanelProps {
  title?: string;
  formulas: FormulaEntry[];
}

const accentVarMap: Record<string, string> = {
  cyan:   'var(--accent-cyan)',
  green:  'var(--accent-green)',
  amber:  'var(--accent-amber)',
  violet: 'var(--accent-violet)',
};

export function FormulaPanel({ title = 'Equations', formulas }: FormulaPanelProps) {
  const { mathMode } = useGameStore();
  if (!mathMode) return null;

  return (
    <div className={styles.panel} role="complementary" aria-label="Mathematical equations panel">
      <h4 className={styles.title}>
        <span className={styles.icon}>∑</span>
        {title}
        <span className={styles.mathModeTag}>Math Mode</span>
      </h4>
      <div className={styles.formulaList}>
        {formulas.map((f, i) => (
          <div
            key={i}
            className={styles.row}
            style={{ borderLeftColor: f.accentColor ? accentVarMap[f.accentColor] : 'var(--accent-violet)' }}
          >
            <span className={styles.label}>{f.label}</span>
            <span className={styles.formula}>
              <Katex latex={f.latex} />
            </span>
            {f.liveValue && (
              <span className={styles.liveValue}>{f.liveValue}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
