import { useState } from 'react';
import { Katex } from '../ui/Katex';
import styles from './TryIt.module.css';

export interface TryItVariable {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
}

interface TryItProps {
  /** What the formula computes, in plain words, e.g. "How far it travels" */
  resultLabel: string;
  resultUnit: string;
  formulaLatex: string;
  variables: TryItVariable[];
  compute: (values: Record<string, number>) => number;
  /** Optional short line of interpretation shown under the result */
  interpret?: (values: Record<string, number>, result: number) => string;
}

/** A tiny inline "try it yourself" playground: sliders feed a formula and the
 * live numeric result updates instantly, so an abstract equation becomes something
 * a beginner can poke at rather than just read. */
export function TryIt({ resultLabel, resultUnit, formulaLatex, variables, compute, interpret }: TryItProps) {
  const [values, setValues] = useState<Record<string, number>>(
    () => Object.fromEntries(variables.map((v) => [v.id, v.defaultValue]))
  );

  const result = compute(values);

  return (
    <div className={styles.tryIt}>
      <div className={styles.tryItHeader}>
        <span className={styles.tryItIcon}>🧪</span>
        <span>Try it yourself</span>
      </div>

      <div className={styles.formulaRow}>
        <Katex latex={formulaLatex} />
      </div>

      <div className={styles.sliders}>
        {variables.map((v) => (
          <div className="slider-wrap" key={v.id}>
            <label className="slider-label" htmlFor={`tryit-${v.id}`}>
              {v.label}
              <span className="value">{values[v.id]} {v.unit}</span>
            </label>
            <input
              id={`tryit-${v.id}`}
              type="range"
              min={v.min}
              max={v.max}
              step={v.step}
              value={values[v.id]}
              onChange={(e) => setValues((prev) => ({ ...prev, [v.id]: parseFloat(e.target.value) }))}
              aria-label={`${v.label}: ${values[v.id]} ${v.unit}`}
            />
          </div>
        ))}
      </div>

      <div className={styles.resultRow}>
        <span className={styles.resultLabel}>{resultLabel}</span>
        <span className={styles.resultValue}>{Number.isFinite(result) ? result.toFixed(2) : '—'} {resultUnit}</span>
      </div>

      {interpret && (
        <p className={styles.interpretation}>{interpret(values, result)}</p>
      )}
    </div>
  );
}
