import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore, MODULE_ORDER, type ModuleId, BADGE_DEFINITIONS } from '../core/store/gameStore';
import { XPBar } from '../components/ui/XPBar';
import { MathToggle } from '../components/ui/MathToggle';
import { BadgeDisplay } from '../components/ui/BadgeDisplay';
import styles from './Dashboard.module.css';

interface ModuleCard {
  id: ModuleId;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  borderColor: string;
  path: string;
  description: string;
}

const MODULE_CARDS: ModuleCard[] = [
  {
    id: 'kinematics',
    title: 'Vector Kinematics Grapher',
    subtitle: '1D Motion',
    emoji: '📈',
    gradient: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))',
    borderColor: 'rgba(0,212,255,0.3)',
    path: '/module/kinematics',
    description: 'Explore position, velocity & acceleration graphs in real-time. Play the Graph-Match mini-game.',
  },
  {
    id: 'projectile',
    title: 'Projectile Motion Sandbox',
    subtitle: '2D Motion',
    emoji: '🚀',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
    borderColor: 'rgba(245,158,11,0.3)',
    path: '/module/projectile',
    description: 'Launch packages over walls! Discover the independence of horizontal and vertical motion.',
  },
  {
    id: 'incline',
    title: 'Free-Body Diagram Incline',
    subtitle: 'Forces & Friction',
    emoji: '⚖️',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
    borderColor: 'rgba(16,185,129,0.3)',
    path: '/module/incline',
    description: 'Place force vectors on a tilted surface. See live decomposition of gravity as the angle changes.',
  },
  {
    id: 'collision',
    title: '1D Elastic & Inelastic Collisions',
    subtitle: 'Momentum',
    emoji: '💥',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(124,58,237,0.04))',
    borderColor: 'rgba(124,58,237,0.3)',
    path: '/module/collision',
    description: 'Crash carts, scrub through slow-motion impact, prove momentum is always conserved.',
  },
];

export function Dashboard() {
  const { studentName, setStudentName, unlockedBadges, completedModules, xp, level } = useGameStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(studentName);

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

  // Completion ring metrics
  const total = MODULE_CARDS.length;
  const done = completedModules.length;
  const RADIUS = 48;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const ringProgress = CIRCUMFERENCE - (done / total) * CIRCUMFERENCE;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚛️</span>
            <div>
              <span className={styles.logoText}>PhysicsLab</span>
              <span className={styles.logoSub}>Interactive Learning Platform</span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <MathToggle />
          <XPBar compact />
        </div>
      </header>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.greeting}>
              {editingName ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleNameSubmit(); }}
                  className={styles.nameForm}
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
                <button
                  className={styles.greetingBtn}
                  onClick={() => setEditingName(true)}
                  aria-label="Click to edit your name"
                  title="Click to edit name"
                >
                  <h1>
                    Welcome back, <span className="text-cyan">{studentName}</span> 👋
                  </h1>
                  <span className={styles.editHint}>✏️ edit</span>
                </button>
              )}
            </div>

            <p className={styles.heroSubtitle}>
              You're at <strong className="text-violet">Level {level}</strong> with <strong className="text-cyan">{xp} XP</strong> total.
              {' '}{completedModules.length}/4 modules completed.
            </p>
          </div>

          <div className={styles.heroXP}>
            {/* Completion ring */}
            <div className={styles.completionRing} aria-label={`${done} of ${total} modules completed`}>
              <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r={RADIUS}
                  fill="none"
                  stroke={done === total ? 'var(--accent-green)' : 'var(--accent-cyan)'}
                  strokeWidth="8"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={ringProgress}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s' }}
                />
                <text x="60" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="800" fontFamily="var(--font-sans)">{done}/{total}</text>
                <text x="60" y="73" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-sans)">modules</text>
              </svg>
            </div>
            <XPBar />
            <button
              className={styles.resetBtn}
              onClick={handleResetProgress}
              aria-label="Reset all progress"
            >
              🗑 Reset Progress
            </button>
          </div>
        </section>

        {/* Module Cards */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Physics Modules</h2>
            <p>Complete each module through the Predict → Observe → Explain cycle to earn XP and badges.</p>
          </div>

          <div className={styles.moduleGrid}>
            {MODULE_CARDS.map((card, i) => {
              const isComplete = completedModules.includes(card.id);
              const isUnlocked = i === 0 || completedModules.includes(MODULE_ORDER[i - 1]);

              return (
                <Link
                  key={card.id}
                  to={card.path}
                  className={`${styles.moduleCard} ${!isUnlocked ? styles.locked : ''}`}
                  style={{ '--card-gradient': card.gradient, '--card-border': card.borderColor } as React.CSSProperties}
                  aria-label={`${card.title} module — ${isComplete ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}`}
                  aria-disabled={!isUnlocked}
                  onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.cardEmoji}>{card.emoji}</span>
                    <div className={styles.cardBadges}>
                      {isComplete && <span className={styles.completeBadge}>✅ Complete</span>}
                      {!isUnlocked && <span className={styles.lockedBadge}>🔒 Locked</span>}
                    </div>
                  </div>
                  <div className={styles.cardSubtitle}>{card.subtitle}</div>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDesc}>{card.description}</p>
                  {isUnlocked && !isComplete && (
                    <div className={styles.cardCta}>Start Module →</div>
                  )}
                  {isComplete && (
                    <div className={styles.cardCta} style={{ color: 'var(--accent-green)' }}>Review Module →</div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Badges Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Your Badges</h2>
            <p>{unlockedBadges.length} of {Object.keys(BADGE_DEFINITIONS).length} unlocked</p>
          </div>
          <div className="card">
            <BadgeDisplay unlockedBadges={unlockedBadges} showAll />
          </div>
        </section>

        {/* Misconceptions Reminder */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Common Misconceptions We Target</h2>
          </div>
          <div className={styles.misconceptionGrid}>
            {[
              { icon: '🏃', title: 'Impetus Theory', desc: 'Motion does NOT require a continuous force. Objects keep moving forever unless a force stops them.' },
              { icon: '📊', title: 'v vs. a Confusion', desc: 'Velocity and acceleration are different quantities. You can have velocity without acceleration, and vice versa.' },
              { icon: '💥', title: 'Action-Reaction', desc: 'In a collision, both objects exert equal and opposite forces — regardless of mass.' },
            ].map((m) => (
              <div key={m.title} className={`card ${styles.misconceptionCard}`}>
                <span className={styles.mIcon}>{m.icon}</span>
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>PhysicsLab MVP · Phase 1 · Built with Antigravity 2.0</p>
      </footer>
    </div>
  );
}
