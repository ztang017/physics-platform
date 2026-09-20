import { type ReactNode, useState } from 'react';
import { Katex } from '../ui/Katex';
import styles from './ConceptNotes.module.css';

export interface FormulaSymbol {
  /** The symbol as it appears in the formula, e.g. "θ" or "μₛ" — plain text, not LaTeX. */
  symbol: string;
  meaning: string;
  unit?: string;
}

export interface ConceptSection {
  id: string;
  icon: string;
  title: string;
  /** Plain-language paragraphs. No prior physics background assumed. */
  body: string[];
  formulaLatex?: string;
  formulaCaption?: string;
  /** Plain-English definition of every symbol used in formulaLatex, so a
   *  beginner never has to guess what a letter or subscript means. */
  symbols?: FormulaSymbol[];
  interactive?: ReactNode;
}

interface ConceptNotesProps {
  title: string;
  intro: string;
  sections: ConceptSection[];
}

/** A collapsible "learn this first" panel of beginner-friendly explanations,
 * shown above a module's Predict/Observe/Explain cycle. Closed by default so it
 * never gets in the way of a student who already knows the material. */
export function ConceptNotes({ title, intro, sections }: ConceptNotesProps) {
  const [open, setOpen] = useState(false);
  const [openSectionId, setOpenSectionId] = useState<string | null>(sections[0]?.id ?? null);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="concept-notes-panel"
      >
        <span className={styles.toggleIcon}>📘</span>
        <span className={styles.toggleText}>
          <span className={styles.toggleTitle}>New to {title}? Learn the concepts first</span>
          <span className={styles.toggleSub}>{intro}</span>
        </span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">▾</span>
      </button>

      {open && (
        <div id="concept-notes-panel" className={styles.panel}>
          {sections.map((s) => {
            const isOpen = openSectionId === s.id;
            return (
              <div key={s.id} className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() => setOpenSectionId(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.sectionIcon}>{s.icon}</span>
                  <span className={styles.sectionTitle}>{s.title}</span>
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} aria-hidden="true">▾</span>
                </button>

                {isOpen && (
                  <div className={styles.sectionBody}>
                    {s.body.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}

                    {s.formulaLatex && (
                      <div className={styles.formulaBlock}>
                        <Katex latex={s.formulaLatex} displayMode />
                        {s.formulaCaption && <span className={styles.formulaCaption}>{s.formulaCaption}</span>}
                        {s.symbols && s.symbols.length > 0 && (
                          <dl className={styles.symbolList}>
                            {s.symbols.map((sym) => (
                              <div key={sym.symbol} className={styles.symbolRow}>
                                <dt className={styles.symbolTerm}>{sym.symbol}</dt>
                                <dd className={styles.symbolDef}>
                                  {sym.meaning}
                                  {sym.unit && <span className={styles.symbolUnit}> ({sym.unit})</span>}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </div>
                    )}

                    {s.interactive}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
