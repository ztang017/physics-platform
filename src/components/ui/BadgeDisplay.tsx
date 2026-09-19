import { useEffect } from 'react';
import { type Badge, type BadgeId, BADGE_DEFINITIONS } from '../../core/store/gameStore';
import styles from './BadgeDisplay.module.css';

interface BadgeDisplayProps {
  unlockedBadges: Badge[];
  /** If provided, show all possible badges with locked state */
  showAll?: boolean;
  compact?: boolean;
}

/** Toast notification for newly unlocked badge */
export function BadgeToast({ badge, onDismiss }: { badge: Badge; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={styles.toast} role="status" aria-live="polite" aria-label={`Badge unlocked: ${badge.name}`}>
      <span className={styles.toastEmoji}>{badge.emoji}</span>
      <div className={styles.toastContent}>
        <span className={styles.toastTitle}>Badge Unlocked!</span>
        <span className={styles.toastName}>{badge.name}</span>
        <span className={styles.toastDesc}>{badge.description}</span>
      </div>
    </div>
  );
}

export function BadgeDisplay({ unlockedBadges, showAll = false, compact = false }: BadgeDisplayProps) {
  const allBadgeIds = Object.keys(BADGE_DEFINITIONS) as BadgeId[];
  const unlockedIds = new Set(unlockedBadges.map((b) => b.id));

  const displayBadges = showAll
    ? allBadgeIds.map((id) => ({
        ...BADGE_DEFINITIONS[id],
        unlocked: unlockedIds.has(id),
        unlockedAt: unlockedBadges.find((b) => b.id === id)?.unlockedAt,
      }))
    : unlockedBadges.map((b) => ({ ...b, unlocked: true }));

  if (compact) {
    return (
      <div className={styles.compactWrap} aria-label="Earned badges">
        {unlockedBadges.slice(0, 5).map((b) => (
          <span key={b.id} className={styles.compactBadge} title={b.name} role="img" aria-label={b.name}>
            {b.emoji}
          </span>
        ))}
        {unlockedBadges.length > 5 && (
          <span className={styles.moreCount}>+{unlockedBadges.length - 5}</span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.grid} role="list" aria-label="Badges">
      {displayBadges.map((b) => (
        <div
          key={b.id}
          className={`${styles.badge} ${b.unlocked ? styles.unlocked : styles.locked}`}
          role="listitem"
          aria-label={`${b.name} — ${b.unlocked ? 'Unlocked' : 'Locked'}`}
          title={b.description}
        >
          <span className={styles.emoji}>{b.emoji}</span>
          <span className={styles.name}>{b.name}</span>
          {!b.unlocked && <span className={styles.lock} aria-hidden="true">🔒</span>}
        </div>
      ))}
    </div>
  );
}
