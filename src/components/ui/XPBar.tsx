import { useEffect, useState } from 'react';
import { useGameStore, getXPProgressInLevel, XP_PER_LEVEL } from '../../core/store/gameStore';
import styles from './XPBar.module.css';

interface XPBarProps {
  compact?: boolean;
}

export function XPBar({ compact = false }: XPBarProps) {
  const { xp, level, studentName } = useGameStore();
  const [displayXP, setDisplayXP] = useState(xp);
  const [flash, setFlash] = useState(false);

  // Animate XP count-up on change
  useEffect(() => {
    if (xp === displayXP) return;
    setFlash(true);
    const start = displayXP;
    const end = xp;
    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayXP(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const timer = setTimeout(() => setFlash(false), 700);
    return () => clearTimeout(timer);
  }, [xp]);

  const progressInLevel = getXPProgressInLevel(displayXP);
  const progressPct = (progressInLevel / XP_PER_LEVEL) * 100;

  if (compact) {
    return (
      <div className={styles.compactBar} aria-label={`Level ${level}, ${displayXP} XP`}>
        <span className={styles.compactLevel}>Lv {level}</span>
        <div className={styles.trackCompact} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
          <div className={styles.fillCompact} style={{ width: `${progressPct}%` }} />
        </div>
        <span className={styles.compactXP}>{displayXP} XP</span>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${flash ? styles.flash : ''}`} aria-label={`${studentName}, Level ${level}`}>
      <div className={styles.header}>
        <div className={styles.levelBadge}>
          <span className={styles.levelNum}>{level}</span>
          <span className={styles.levelLabel}>LVL</span>
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{studentName}</span>
          <span className={styles.xpLabel}>
            <span className={styles.xpCurrent}>{progressInLevel}</span>
            <span className={styles.xpSep}> / {XP_PER_LEVEL} XP</span>
          </span>
        </div>
        <span className={styles.totalXP}>{displayXP} total</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(progressPct)}% progress to level ${level + 1}`}
      >
        <div className={styles.fill} style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
}
