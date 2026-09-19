import React, { type ReactNode, useState, useEffect } from 'react';
import { useSessionStore, type ExplainQuestion, type POEPhase } from '../../core/store/sessionStore';
import styles from './POEShell.module.css';

interface POEShellProps {
  moduleId: string;
  predictComponent: ReactNode;
  observeComponent: ReactNode;
  explainQuestions: ExplainQuestion[];
  onComplete: (score: number) => void;
  predictCorrect?: boolean; // parent sets this when prediction is evaluated
}

const PHASE_LABELS: Record<POEPhase, { icon: string; label: string }> = {
  predict:  { icon: '🔮', label: 'Predict' },
  observe:  { icon: '👁️', label: 'Observe' },
  explain:  { icon: '💡', label: 'Explain' },
  complete: { icon: '✅', label: 'Complete' },
};

const PHASES: POEPhase[] = ['predict', 'observe', 'explain', 'complete'];

export function POEShell({
  moduleId,
  predictComponent,
  observeComponent,
  explainQuestions,
  onComplete,
}: POEShellProps) {
  const { poePhase, setPOEPhase, answerExplainQuestion, sessionScore, addScore, resetSession, setModule } =
    useSessionStore();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [observeReady, setObserveReady] = useState(false);

  // Reset on mount if a different module is loaded
  React.useEffect(() => {
    setModule(moduleId);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [moduleId]);

  // Delay the Observe→Explain button so students must spend time observing
  useEffect(() => {
    if (poePhase !== 'observe') { setObserveReady(false); return; }
    const t = setTimeout(() => setObserveReady(true), 2000);
    return () => clearTimeout(t);
  }, [poePhase]);

  // ─── Phase Bar ──────────────────────────────────────────────────────────────
  const PhaseBar = () => (
    <nav className={styles.phaseBar} aria-label="POE cycle progress">
      {PHASES.filter((p) => p !== 'complete').map((phase, i) => {
        const isActive = poePhase === phase;
        const isDone = PHASES.indexOf(poePhase) > PHASES.indexOf(phase);
        return (
          <React.Fragment key={phase}>
            <div
              className={`${styles.phaseStep} ${isActive ? styles.active : ''} ${isDone ? styles.done : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className={styles.phaseIcon}>{PHASE_LABELS[phase].icon}</span>
              <span className={styles.phaseLabel}>{PHASE_LABELS[phase].label}</span>
              {isDone && <span className={styles.check} aria-hidden="true">✓</span>}
            </div>
            {i < 2 && <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} aria-hidden="true" />}
          </React.Fragment>
        );
      })}
    </nav>
  );

  // ─── Explain Phase ──────────────────────────────────────────────────────────
  const ExplainPhase = () => {
    const q = explainQuestions[currentQuestionIdx];
    if (!q) return null;

    const handleSelect = (idx: number) => {
      if (showFeedback) return;
      setSelectedAnswer(idx);
      setShowFeedback(true);
      answerExplainQuestion(q.id, idx);
      if (idx === q.correctIndex) {
        addScore(Math.round(100 / explainQuestions.length));
      }
    };

    const handleNext = () => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      if (currentQuestionIdx + 1 >= explainQuestions.length) {
        setPOEPhase('complete');
        onComplete(sessionScore);
      } else {
        setCurrentQuestionIdx((i) => i + 1);
      }
    };

    return (
      <div className={styles.explainWrap}>
        <div className={styles.questionHeader}>
          <span className={styles.questionNum}>
            Question {currentQuestionIdx + 1} of {explainQuestions.length}
          </span>
          <div className={styles.questionTrack}>
            {explainQuestions.map((_, i) => (
              <div
                key={i}
                className={`${styles.questionDot} ${i < currentQuestionIdx ? styles.dotDone : ''} ${i === currentQuestionIdx ? styles.dotActive : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        <p className={styles.questionText}>{q.question}</p>

        <div className={styles.optionsGrid} role="radiogroup" aria-label="Answer options">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.correctIndex;
            const isSelected = selectedAnswer === idx;
            let optClass = styles.option;
            if (showFeedback) {
              if (isCorrect) optClass += ` ${styles.optionCorrect}`;
              else if (isSelected) optClass += ` ${styles.optionWrong}`;
            } else if (isSelected) {
              optClass += ` ${styles.optionSelected}`;
            }

            return (
              <button
                key={idx}
                className={optClass}
                onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                role="radio"
                aria-checked={isSelected}
                aria-label={opt}
              >
                <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                <span>{opt}</span>
                {showFeedback && isCorrect && <span className={styles.optionCheck} aria-hidden="true">✓</span>}
                {showFeedback && isSelected && !isCorrect && <span className={styles.optionX} aria-hidden="true">✗</span>}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`${styles.feedback} ${selectedAnswer === q.correctIndex ? styles.feedbackCorrect : styles.feedbackWrong}`} role="alert">
            <p>{q.explanation}</p>
            <button className="btn btn--primary" onClick={handleNext}>
              {currentQuestionIdx + 1 >= explainQuestions.length ? '🎉 Finish Module' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─── Complete Phase ──────────────────────────────────────────────────────────
  if (poePhase === 'complete') {
    return (
      <div className={styles.completeWrap}>
        <div className={styles.completeCard}>
          <div className={styles.completeEmoji}>🎉</div>
          <h2>Module Complete!</h2>
          <p>You scored <strong className="text-cyan">{sessionScore} points</strong> in this session.</p>
          <div className={styles.completeActions}>
            <button className="btn btn--primary" onClick={() => { resetSession(); setModule(moduleId); setCurrentQuestionIdx(0); }}>
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <PhaseBar />

      <div className={styles.content}>
        {poePhase === 'predict' && (
          <div className={styles.phaseContent}>
            <div className={styles.phaseHero}>
              <span className={styles.heroIcon}>🔮</span>
              <div>
                <h3>Make Your Prediction</h3>
                <p>Before running the simulation, commit to what you think will happen.</p>
              </div>
            </div>
            {predictComponent}
          </div>
        )}

        {poePhase === 'observe' && (
          <div className={styles.phaseContent}>
            <div className={styles.phaseHero}>
              <span className={styles.heroIcon}>👁️</span>
              <div>
                <h3>Observe the Simulation</h3>
                <p>Run the simulation and compare the outcome to your prediction.</p>
              </div>
            </div>
            {observeComponent}
            <div className={styles.observeFooter}>
              {observeReady ? (
                <button className="btn btn--primary" onClick={() => setPOEPhase('explain')}>
                  I've Observed → Explain
                </button>
              ) : (
                <p className={styles.observeWait}>⏳ Interact with the simulation first...</p>
              )}
            </div>
          </div>
        )}

        {poePhase === 'explain' && <ExplainPhase />}
      </div>
    </div>
  );
}
