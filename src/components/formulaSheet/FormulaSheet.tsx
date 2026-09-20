import { useEffect } from 'react';
import { useUIStore } from '../../core/store/uiStore';
import { Katex } from '../ui/Katex';
import { FORMULA_SHEET } from './formulaSheetData';
import styles from './FormulaSheet.module.css';

/** A persistent, cross-module formula reference — every module's core
 *  equations in one place, reachable from anywhere via the header button,
 *  so a student doesn't have to leave what they're doing to look something up. */
export function FormulaSheet() {
  const { formulaSheetOpen, closeFormulaSheet } = useUIStore();

  useEffect(() => {
    if (!formulaSheetOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeFormulaSheet(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [formulaSheetOpen, closeFormulaSheet]);

  if (!formulaSheetOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeFormulaSheet}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Formula reference sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>📐 Formula Reference</h2>
          <button className={styles.closeBtn} onClick={closeFormulaSheet} aria-label="Close formula reference">
            ✕
          </button>
        </div>
        <p className={styles.subtitle}>Every module's core equations, in one place.</p>

        <div className={styles.body}>
          {FORMULA_SHEET.map((section) => (
            <section key={section.moduleId} className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span aria-hidden="true">{section.icon}</span> {section.title}
              </h3>
              <div className={styles.formulaList}>
                {section.formulas.map((f) => (
                  <div key={f.label} className={styles.formulaCard}>
                    <span className={styles.formulaLabel}>{f.label}</span>
                    <div className={styles.formulaLatex}>
                      <Katex latex={f.latex} displayMode />
                    </div>
                    {f.caption && <span className={styles.formulaCaption}>{f.caption}</span>}
                    <dl className={styles.symbolList}>
                      {f.symbols.map((sym) => (
                        <div key={sym.symbol} className={styles.symbolRow}>
                          <dt className={styles.symbolTerm}>{sym.symbol}</dt>
                          <dd className={styles.symbolDef}>
                            {sym.meaning}
                            {sym.unit && <span className={styles.symbolUnit}> ({sym.unit})</span>}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
