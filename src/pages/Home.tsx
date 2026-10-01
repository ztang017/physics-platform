import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGameStore,
  BADGE_DEFINITIONS,
  MODULE_ORDER,
  XP_PER_LEVEL,
  getXPProgressInLevel,
} from '../core/store/gameStore';
import { getNextCourse, progressMessage } from '../core/courses';
import { BadgeDisplay } from '../components/ui/BadgeDisplay';
import { Reveal } from '../components/scroll/Reveal';
import { ScrollProgressBar } from '../components/scroll/ScrollProgressBar';
import { useScrollReveal } from '../components/scroll/useScrollReveal';
import { useCountUp } from '../components/scroll/useCountUp';
import { usePageTitle } from '../components/layout/usePageTitle';
import { PHYSICS_TIDBITS, type PhysicsTidbit } from './physicsFacts';
import styles from './Home.module.css';

const TIDBIT_ICONS: Record<PhysicsTidbit['type'], string> = { fact: '🔭', quote: '💬', myth: '🤔' };
const TIDBIT_LABELS: Record<PhysicsTidbit['type'], string> = {
  fact: 'Physics fun fact',
  quote: 'Quote',
  myth: 'Common misconception',
};

const STEPS = [
  { icon: '🔮', title: 'Predict', text: 'Commit to what you think will happen before you see anything. Even a wrong guess primes your brain to learn.' },
  { icon: '👁️', title: 'Observe', text: 'Run a real simulation and watch the physics play out, with live graphs, vectors and energy bars to compare against.' },
  { icon: '💡', title: 'Explain', text: 'Answer short questions that close the gap between what you expected and what happened, then earn XP and badges.' },
];

/** Fisher-Yates shuffle, then take the first n: a fresh, non-repeating handful of tidbits. */
function pickRandom<T>(items: T[], n: number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/** A decorative projectile arc — the whole site in one picture: a launch angle,
 *  a velocity that stays constant sideways, and gravity pulling straight down. */
function HeroArt() {
  return (
    <div className={styles.heroArt} aria-hidden="true">
      <svg viewBox="0 0 480 340" className={styles.heroSvg} focusable="false">
        <defs>
          <linearGradient id="hero-ball" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#16a34a" />
          </marker>
          <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#dc2626" />
          </marker>
        </defs>

        <rect x="0" y="290" width="480" height="50" fill="rgba(23,27,38,0.05)" />
        <line x1="0" y1="290" x2="480" y2="290" stroke="rgba(23,27,38,0.25)" strokeWidth="1.5" />

        <path d="M60 290 Q240 -110 420 290" fill="none" stroke="#4f46e5" strokeWidth="3" strokeDasharray="6 9" strokeLinecap="round" />
        <rect x="392" y="282" width="56" height="8" rx="2" fill="rgba(22,163,74,0.4)" />

        <line x1="60" y1="290" x2="85" y2="235" stroke="rgba(23,27,38,0.35)" strokeWidth="1.5" strokeDasharray="3 4" />
        <path d="M96 290 A36 36 0 0 0 74.7 257.1" fill="none" stroke="#b45309" strokeWidth="2" />
        <text x="102" y="278" fill="#b45309" fontSize="15" fontWeight="700" fontFamily="var(--font-mono)">θ</text>
        <circle cx="60" cy="290" r="6" fill="#171b26" />

        <line x1="258" y1="90" x2="326" y2="90" stroke="#16a34a" strokeWidth="3" markerEnd="url(#arrow-green)" />
        <text x="334" y="95" fill="#16a34a" fontSize="15" fontWeight="700" fontFamily="var(--font-mono)">vₓ</text>
        <line x1="240" y1="110" x2="240" y2="170" stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow-red)" />
        <text x="250" y="168" fill="#dc2626" fontSize="15" fontWeight="700" fontFamily="var(--font-mono)">g</text>

        <circle cx="240" cy="90" r="16" fill="url(#hero-ball)" className={styles.heroBall} />
        <circle cx="234" cy="84" r="4.5" fill="rgba(255,255,255,0.7)" />
      </svg>
    </div>
  );
}

interface StatProps {
  label: string;
  value: string | number;
  detail: string;
  /** Omit for a stat that has no natural "out of" (e.g. total XP). */
  percent?: number;
  accent: string;
}

function Stat({ label, value, detail, percent, accent }: StatProps) {
  return (
    <div className={styles.stat} style={{ '--stat-accent': accent } as React.CSSProperties}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{value}</strong>
      {percent !== undefined && (
        <div
          className={styles.statBar}
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
        >
          <div className={styles.statFill} style={{ width: `${Math.min(100, percent)}%` }} />
        </div>
      )}
      <span className={styles.statDetail}>{detail}</span>
    </div>
  );
}

export function Home() {
  usePageTitle();
  const { studentName, setStudentName, unlockedBadges, completedModules, xp, level } = useGameStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(studentName);
  const [tidbits, setTidbits] = useState(() => pickRandom(PHYSICS_TIDBITS, 3));

  const statsReveal = useScrollReveal<HTMLDivElement>();
  const badgesReveal = useScrollReveal<HTMLDivElement>();
  const xpShown = useCountUp(xp, statsReveal.visible);
  const badgesShown = useCountUp(unlockedBadges.length, badgesReveal.visible);

  const totalModules = MODULE_ORDER.length;
  const doneModules = completedModules.length;
  const totalBadges = Object.keys(BADGE_DEFINITIONS).length;
  const unlockedIds = new Set(unlockedBadges.map((b) => b.id));
  const nextBadge = Object.values(BADGE_DEFINITIONS).find((b) => !unlockedIds.has(b.id));
  const nextCourse = getNextCourse(completedModules);
  const isNewStudent = xp === 0 && doneModules === 0;
  const ctaLabel = isNewStudent ? 'Start learning' : nextCourse ? 'Continue learning' : 'Browse the courses';

  const xpIntoLevel = getXPProgressInLevel(xp);

  const handleNameSubmit = () => {
    if (nameInput.trim()) setStudentName(nameInput.trim());
    setEditingName(false);
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all progress? This will clear your XP, badges, and completed modules. This cannot be undone.')) {
      useGameStore.persist.clearStorage();
      window.location.reload();
    }
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.page}>
      <ScrollProgressBar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrowChip}>Interactive physics, built for beginners</span>
              <h1 id="hero-heading" className={styles.heroTitle}>
                Learn physics by <span className={styles.highlight}>predicting</span> first.
              </h1>
              <p className={styles.heroLead}>
                Commit to a prediction, watch the simulation, then explain what happened. PhysicsLab turns first-year
                mechanics into hands-on practice, and you don't need any physics background to start.
              </p>
              <div className={styles.heroActions}>
                <Link to="/courses" className={`btn btn--primary ${styles.btnLg}`}>
                  {ctaLabel} <span aria-hidden="true">→</span>
                </Link>
                <button type="button" className={styles.textButton} onClick={scrollToHowItWorks}>
                  See how it works
                </button>
              </div>
              <ul className={styles.heroMeta}>
                <li>{totalModules} hands-on modules</li>
                <li>{totalBadges} badges to earn</li>
                <li>Matched to your CY1308 lectures</li>
              </ul>
            </div>
            <HeroArt />
          </div>
        </div>
      </section>

      {/* ── Your progress ────────────────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="progress-heading">
        <div className={styles.container}>
          <Reveal>
            <div className={styles.progressCard}>
              <div className={styles.progressTop}>
                <div className={styles.progressIntro}>
                  <p className="eyebrow">Your progress</p>
                  {editingName ? (
                    <form
                      className={styles.nameForm}
                      onSubmit={(e) => { e.preventDefault(); handleNameSubmit(); }}
                    >
                      <input
                        className={styles.nameInput}
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        autoFocus
                        maxLength={30}
                        aria-label="Your name"
                      />
                      <button type="submit" className="btn btn--primary">Save</button>
                    </form>
                  ) : (
                    <h2 id="progress-heading" className={styles.progressTitle}>
                      {isNewStudent ? 'Welcome' : 'Welcome back'}, <span className="text-cyan">{studentName}</span>
                      <button
                        type="button"
                        className={styles.editName}
                        onClick={() => { setNameInput(studentName); setEditingName(true); }}
                        aria-label="Edit your name"
                      >
                        ✏️
                      </button>
                    </h2>
                  )}
                  <p className={styles.progressMessage}>{progressMessage(completedModules)}</p>
                </div>
                <Link to="/courses" className={`btn btn--primary ${styles.btnLg}`}>
                  Go to Courses <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div ref={statsReveal.ref} className={styles.statGrid}>
                <Stat
                  label="Level"
                  value={level}
                  detail={`${xpIntoLevel} / ${XP_PER_LEVEL} XP to level ${level + 1}`}
                  percent={(xpIntoLevel / XP_PER_LEVEL) * 100}
                  accent="var(--accent-violet)"
                />
                <Stat
                  label="XP earned"
                  value={xpShown}
                  detail="Earned from predictions, mini-games and quizzes"
                  accent="var(--accent-cyan)"
                />
                <Stat
                  label="Modules completed"
                  value={`${doneModules}/${totalModules}`}
                  detail={nextCourse ? `Next up: ${nextCourse.title}` : 'Every module complete'}
                  percent={(doneModules / totalModules) * 100}
                  accent="var(--accent-green)"
                />
                <Stat
                  label="Badges earned"
                  value={`${unlockedBadges.length}/${totalBadges}`}
                  detail={nextBadge ? `Next: ${nextBadge.name}` : 'Every badge unlocked'}
                  percent={(unlockedBadges.length / totalBadges) * 100}
                  accent="var(--accent-amber)"
                />
              </div>

              <div className={styles.progressFooter}>
                <button type="button" className={styles.subtleButton} onClick={handleResetProgress}>
                  Reset progress
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className={`${styles.section} ${styles.sectionTint}`} aria-labelledby="how-heading">
        <div className={styles.container}>
          <Reveal>
            <div className={styles.sectionHead}>
              <p className="eyebrow">How it works</p>
              <h2 id="how-heading">Three steps that make the physics stick</h2>
              <p>
                Reading a worked example feels easy, but it doesn't last. Predicting first, then finding out why you were
                right or wrong, is where the learning actually happens.
              </p>
            </div>
          </Reveal>
          <ol className={styles.steps}>
            {STEPS.map((step, i) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">{i + 1}</span>
                <span className={styles.stepIcon} aria-hidden="true">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <div className={styles.sectionCta}>
            <Link to="/courses" className={`btn btn--primary ${styles.btnLg}`}>
              {isNewStudent ? 'Try your first module' : 'Pick a module'} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Badges ───────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="badges-heading">
        <div className={styles.container}>
          <div ref={badgesReveal.ref} className={styles.sectionHead}>
            <p className="eyebrow">Achievements</p>
            <h2 id="badges-heading">Your badges</h2>
            <p>
              {badgesShown} of {totalBadges} earned.{' '}
              {nextBadge
                ? <>Next to chase: <strong>{nextBadge.name}</strong> — {nextBadge.description}</>
                : 'You have unlocked every badge. Well done!'}
            </p>
          </div>
          <Reveal>
            <div className="card">
              <BadgeDisplay unlockedBadges={unlockedBadges} showAll />
            </div>
          </Reveal>
          {nextBadge && (
            <div className={styles.sectionCta}>
              <Link to="/courses" className="btn btn--secondary">
                Earn your next badge in Courses <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Physics Corner ───────────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionTint}`} aria-labelledby="corner-heading">
        <div className={styles.container}>
          <div className={styles.cornerHead}>
            <div className={styles.sectionHead}>
              <p className="eyebrow">Take a break</p>
              <h2 id="corner-heading">🔭 Physics Corner</h2>
              <p>A fresh mix of facts, quotes and myths we bust. New picks every visit.</p>
            </div>
            <button type="button" className="btn btn--secondary" onClick={() => setTidbits(pickRandom(PHYSICS_TIDBITS, 3))}>
              🔀 Show me different ones
            </button>
          </div>
          <div className={styles.tidbitGrid}>
            {tidbits.map((t) => (
              <article key={t.text} className={`card ${styles.tidbitCard}`} data-type={t.type}>
                <span className={styles.tidbitIcon} aria-hidden="true">{TIDBIT_ICONS[t.type]}</span>
                <div className={styles.tidbitLabel}>{TIDBIT_LABELS[t.type]}</div>
                {t.type === 'myth' ? (
                  <>
                    <p className={styles.tidbitText}><strong>Myth:</strong> {t.text}</p>
                    <p className={styles.tidbitReality}><strong>Reality:</strong> {t.reality}</p>
                  </>
                ) : (
                  <p className={styles.tidbitText}>
                    “{t.text}”
                    {t.author && <span className={styles.tidbitAuthor}> — {t.author}</span>}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing call to action ───────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="final-heading">
        <div className={styles.container}>
          <Reveal>
            <div className={styles.finalCta}>
              <h2 id="final-heading">
                {nextCourse ? 'Ready for your next module?' : 'Keep your physics sharp'}
              </h2>
              <p>
                {nextCourse
                  ? `Every module you finish earns XP and gets you closer to your next badge. ${nextCourse.title} is waiting for you.`
                  : 'You have finished every module. Revisit them any time, and use Review to make it all stick.'}
              </p>
              <Link to="/courses" className={`btn ${styles.btnLight}`}>
                {nextCourse ? 'Head to Courses' : 'Open Courses'} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
