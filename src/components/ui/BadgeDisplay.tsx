import { useEffect, useRef, useState } from 'react';
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

function formatUnlockedDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

export function BadgeDisplay({ unlockedBadges, showAll = false, compact = false }: BadgeDisplayProps) {
  const allBadgeIds = Object.keys(BADGE_DEFINITIONS) as BadgeId[];
  const unlockedIds = new Set(unlockedBadges.map((b) => b.id));
  const [openId, setOpenId] = useState<BadgeId | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const displayBadges = showAll
    ? allBadgeIds.map((id) => ({
        ...BADGE_DEFINITIONS[id],
        unlocked: unlockedIds.has(id),
        unlockedAt: unlockedBadges.find((b) => b.id === id)?.unlockedAt,
      }))
    : unlockedBadges.map((b) => ({ ...b, unlocked: true }));

  // Video-game-style "inspect" popover: click any badge (locked or not) to
  // see how to earn it, or when you did. Closes on outside click or Escape.
  useEffect(() => {
    if (!openId) return;
    const onClickOutside = (e: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null); };
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onKey);
    };
  }, [openId]);

  if (compact) {
    return (
      <div className={styles.compactWrap} aria-label="Earned badges">
        {unlockedBadges.slice(0, 5).map((b) => (
          <span key={b.id} className={styles.compactBadge} title={`${b.name} — ${b.description}`} role="img" aria-label={b.name}>
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
    <div className={styles.grid} role="list" aria-label="Badges" ref={gridRef}>
      {displayBadges.map((b) => {
        const isOpen = openId === b.id;
        const unlockedDate = formatUnlockedDate(b.unlockedAt);
        return (
          <div key={b.id} className={styles.badgeWrap}>
            <button
              type="button"
              className={`${styles.badge} ${b.unlocked ? styles.unlocked : styles.locked}`}
              role="listitem"
              aria-label={`${b.name} — ${b.unlocked ? 'Unlocked' : 'Locked'}. Click for details.`}
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : b.id)}
            >
              <span className={styles.emoji}>{b.emoji}</span>
              <span className={styles.name}>{b.name}</span>
              {!b.unlocked && <span className={styles.lock} aria-hidden="true">🔒</span>}
            </button>

            {isOpen && (
              <div className={styles.popover} role="tooltip">
                <span className={styles.popoverEmoji} aria-hidden="true">{b.emoji}</span>
                <span className={styles.popoverName}>{b.name}</span>
                <p className={styles.popoverDesc}>{b.description}</p>
                {b.unlocked ? (
                  <span className={styles.popoverStatus} data-status="unlocked">
                    ✅ Unlocked{unlockedDate ? ` · ${unlockedDate}` : ''}
                  </span>
                ) : (
                  <span className={styles.popoverStatus} data-status="locked">🔒 Not yet earned</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
