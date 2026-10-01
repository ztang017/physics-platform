import React, { type ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSessionStore, type ExplainQuestion, type POEPhase } from '../../core/store/sessionStore';
import { useSRSStore } from '../../core/store/srsStore';
import type { ModuleId } from '../../core/store/gameStore';
import styles from './POEShell.module.css';

interface POEShellProps {
  moduleId: ModuleId;
  predictComponent: ReactNode;
  observeComponent: ReactNode;
  explainQuestions: ExplainQuestion[];
  /** `perfectExplain` is true only if every Explain-phase question in this run
   *  was answered correctly on the FIRST attempt — used to award the
   *  "Sharp Shooter" badge without needing new persisted state per module. */
  onComplete: (score: number, perfectExplain: boolean) => void;
  predictCorrect?: boolean; // parent sets this when prediction is evaluated
  /** Optional scaffolding shown in the Predict phase behind a "Need a hint?"
   *  reveal — unlike the Explain-phase hint (only shown after a wrong guess),
   *  this is available any time, since Predict has no pass/fail attempt to be
   *  wrong about yet. Should nudge toward the reasoning, not give the answer. */
  predictHint?: string;
  /** Called when the student clicks "Try Again" on the Complete screen, so the
   *  parent module can reset its own local state (sliders, fired/predicted
   *  flags, etc.) — without this, stale state from the previous run can let
   *  a student replay an already-scored interaction for repeat XP. */
  onTryAgain?: () => void;
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
  onTryAgain,
  predictHint,
}: POEShellProps) {
  const { poePhase, setPOEPhase, answerExplainQuestion, sessionScore, addScore, resetSession, setModule } =
    useSessionStore();
  const recordSRSAnswer = useSRSStore((s) => s.recordAnswer);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  // Wrong answers get one retry before the correct answer is revealed.
  const [attemptCount, setAttemptCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [observeReady, setObserveReady] = useState(false);
  const [predictHintOpen, setPredictHintOpen] = useState(false);
  // Tracks whether every Explain question so far has been answered correctly
  // on the first attempt — one wrong guess anywhere in the run clears it for
  // good, regardless of whether the retry succeeds.
  const [perfectExplain, setPerfectExplain] = useState(true);

  // Reset on mount if a different module is loaded
  React.useEffect(() => {
    setModule(moduleId);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAttemptCount(0);
    setRevealed(false);
    setPredictHintOpen(false);
    setPerfectExplain(true);
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

    const isCorrectAnswer = selectedAnswer !== null && selectedAnswer === q.correctIndex;
    const hasRetryLeft = attemptCount === 0;

    const handleSelect = (idx: number) => {
      if (showFeedback) return;
      setSelectedAnswer(idx);
      setShowFeedback(true);

      if (idx === q.correctIndex) {
        answerExplainQuestion(q.id, idx);
        recordSRSAnswer(moduleId, q.id, true);
        // Each question's share is the difference of rounded running totals, so a
        // perfect run is exactly 100 for any question count (a flat round(100/n)
        // per question gives 96 for 12 questions and 98 for 7).
        const n = explainQuestions.length;
        addScore(Math.round((100 * (currentQuestionIdx + 1)) / n) - Math.round((100 * currentQuestionIdx) / n));
        setRevealed(true);
      } else if (hasRetryLeft) {
        // First miss: nudge only, let them try again — don't record or reveal yet.
        // Still disqualifies this run from "Sharp Shooter" even if the retry succeeds.
        setAttemptCount(1);
        setRevealed(false);
        setPerfectExplain(false);
      } else {
        // Second miss: record it and reveal the correct answer.
        answerExplainQuestion(q.id, idx);
        recordSRSAnswer(moduleId, q.id, false);
        setRevealed(true);
        setPerfectExplain(false);
      }
    };

    const handleTryAgain = () => {
      setShowFeedback(false);
      setSelectedAnswer(null);
    };

    const handleNext = () => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      setAttemptCount(0);
      setRevealed(false);
      if (currentQuestionIdx + 1 >= explainQuestions.length) {
        setPOEPhase('complete');
        onComplete(sessionScore, perfectExplain);
      } else {
        setCurrentQuestionIdx((i) => i + 1);
      }
    };

    return (
      <div className={styles.explainWrap}>
        <button className={styles.backLink} onClick={() => setPOEPhase('observe')}>
          ← Back to Observe
        </button>
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
            // Never mark the correct option until the question is actually
            // resolved — otherwise a wrong first guess would give it away.
            let optClass = styles.option;
            if (showFeedback && revealed) {
              if (isCorrect) optClass += ` ${styles.optionCorrect}`;
              else if (isSelected) optClass += ` ${styles.optionWrong}`;
            } else if (showFeedback && isSelected) {
              optClass += ` ${styles.optionWrong}`;
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
                {showFeedback && revealed && isCorrect && <span className={styles.optionCheck} aria-hidden="true">✓</span>}
                {showFeedback && isSelected && !isCorrect && <span className={styles.optionX} aria-hidden="true">✗</span>}
              </button>
            );
          })}
        </div>

        {showFeedback && !revealed && (
          <div className={styles.feedback + ' ' + styles.feedbackHint} role="alert">
            <p><strong>Not quite — try again!</strong> {q.hint}</p>
            <button className="btn btn--secondary" onClick={handleTryAgain}>
              🔁 Try Again
            </button>
          </div>
        )}

        {showFeedback && revealed && (
          <div className={`${styles.feedback} ${isCorrectAnswer ? styles.feedbackCorrect : styles.feedbackWrong}`} role="alert">
            <p>
              <strong>{isCorrectAnswer ? '✓ Correct!' : '✗ Not quite — here\'s why:'}</strong>{' '}
              {q.explanation}
            </p>
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
            <button
              className="btn btn--secondary"
              onClick={() => {
                resetSession();
                setModule(moduleId);
                setCurrentQuestionIdx(0);
                setPerfectExplain(true);
                onTryAgain?.();
              }}
            >
              🔄 Try Again
            </button>
            <Link to="/courses" className="btn btn--primary">
              📚 Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <PhaseBar />
      <span className="sr-only" role="status" aria-live="polite">
        {PHASE_LABELS[poePhase].label} phase
      </span>

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

            {predictHint && (
              <div className={styles.hintBox}>
                {predictHintOpen ? (
                  <p><span aria-hidden="true">💡</span> {predictHint}</p>
                ) : (
                  <button className={styles.hintToggle} onClick={() => setPredictHintOpen(true)}>
                    💡 Not sure where to start? Reveal a hint
                  </button>
                )}
              </div>
            )}

            {predictComponent}
          </div>
        )}

        {poePhase === 'observe' && (
          <div className={styles.phaseContent}>
            <button className={styles.backLink} onClick={() => setPOEPhase('predict')}>
              ← Back to Predict
            </button>
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
