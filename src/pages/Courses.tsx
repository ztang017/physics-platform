import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore, MODULE_ORDER } from '../core/store/gameStore';
import { useSRSStore, isCardDue } from '../core/store/srsStore';
import { useUIStore } from '../core/store/uiStore';
import { COURSE_LIST, getNextCourse, isModuleUnlocked } from '../core/courses';
import { PageHeader } from '../components/layout/PageHeader';
import { usePageTitle } from '../components/layout/usePageTitle';
import styles from './Courses.module.css';

export function Courses() {
  usePageTitle('Courses');
  const completedModules = useGameStore((s) => s.completedModules);
  const cards = useSRSStore((s) => s.cards);
  const openSpacedReview = useUIStore((s) => s.openSpacedReview);

  const total = MODULE_ORDER.length;
  const done = completedModules.length;
  const nextCourse = getNextCourse(completedModules);
  const cardList = useMemo(() => Object.values(cards), [cards]);
  const dueCount = useMemo(() => cardList.filter((c) => isCardDue(c)).length, [cardList]);

  return (
    <>
      <PageHeader
        eyebrow="CY1308 mechanics"
        title="Courses"
        lead="Work through the modules in order. Each one follows Predict, Observe, Explain, and ends with a short quiz and an optional Challenge Yourself section."
      >
        <div className={styles.summary}>
          <div
            className={styles.summaryBar}
            role="progressbar"
            aria-label="Modules completed"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
          >
            <div className={styles.summaryFill} style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <span className={styles.summaryText}>
            <strong>{done}</strong> of {total} modules completed
          </span>
        </div>
      </PageHeader>

      <div className={styles.container}>
        {cardList.length > 0 && (
          <div className={styles.review}>
            <span className={styles.reviewIcon} aria-hidden="true">📚</span>
            <div className={styles.reviewText}>
              <strong>Daily review</strong>
              <span>
                {dueCount > 0
                  ? `${dueCount} question${dueCount === 1 ? '' : 's'} due today. A few minutes now keeps what you've learned from fading.`
                  : "You're all caught up. Come back tomorrow, and finish a module to add more questions."}
              </span>
            </div>
            <button type="button" className="btn btn--secondary" onClick={openSpacedReview}>
              {dueCount > 0 ? 'Start review' : 'Open review'}
            </button>
          </div>
        )}

        <ol className={styles.grid}>
          {COURSE_LIST.map((course, i) => {
            const isComplete = completedModules.includes(course.id);
            const isUnlocked = isModuleUnlocked(course.id, completedModules);
            const isNext = nextCourse?.id === course.id;
            const previous = i > 0 ? COURSE_LIST[i - 1] : null;

            return (
              <li key={course.id} className={styles.item}>
                <article
                  className={`${styles.card} ${!isUnlocked ? styles.cardLocked : ''} ${isNext ? styles.cardNext : ''}`}
                  style={{ '--accent': course.accent } as React.CSSProperties}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.moduleNumber}>Module {i + 1}</span>
                    {isComplete && <span className={`${styles.status} ${styles.statusDone}`}>✅ Completed</span>}
                    {isNext && isUnlocked && <span className={`${styles.status} ${styles.statusNext}`}>Up next</span>}
                    {!isUnlocked && <span className={`${styles.status} ${styles.statusLocked}`}>🔒 Locked</span>}
                  </div>

                  <div className={styles.titleRow}>
                    <span className={styles.icon} aria-hidden="true">{course.emoji}</span>
                    <div>
                      <p className={styles.topic}>{course.topic}</p>
                      <h2 className={styles.title}>{course.title}</h2>
                    </div>
                  </div>

                  <p className={styles.description}>{course.description}</p>

                  <ul className={styles.tags} aria-label="Module details">
                    <li>CY1308 · {course.lecture}</li>
                    <li>Predict · Observe · Explain</li>
                    <li>Challenge Yourself included</li>
                  </ul>

                  <div className={styles.action}>
                    {isUnlocked ? (
                      <Link to={course.path} className={`btn ${isComplete ? 'btn--secondary' : 'btn--primary'}`}>
                        {isComplete ? 'Review module' : 'Start module'} <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <>
                        <button type="button" className="btn btn--secondary" disabled>🔒 Locked</button>
                        {previous && <p className={styles.lockHint}>Finish “{previous.title}” to unlock.</p>}
                      </>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
