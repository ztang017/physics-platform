import { useEffect } from 'react';
import { useUIStore } from '../../core/store/uiStore';
import { WHATS_NEW_ITEMS } from '../../pages/whatsNewData';
import styles from './WhatsNewModal.module.css';

/** A one-time-per-session announcement of recent changes. Centered (not a
 *  side drawer, unlike Notes/Formulas/Study Buddy) since it's a single
 *  focused announcement the visitor dismisses once, not a tool they return
 *  to — following standard "what's new" modal UX: short, scannable,
 *  single dismiss action, never blocks re-access. */
export function WhatsNewModal() {
  const { whatsNewOpen, closeWhatsNew } = useUIStore();

  useEffect(() => {
    if (!whatsNewOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeWhatsNew(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [whatsNewOpen, closeWhatsNew]);

  if (!whatsNewOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeWhatsNew}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="What's New"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>✨ What's New!</h2>
          <button className={styles.closeBtn} onClick={closeWhatsNew} aria-label="Close">✕</button>
        </div>

        <ul className={styles.list}>
          {WHATS_NEW_ITEMS.map((item) => (
            <li key={item.title} className={styles.item}>
              <span className={styles.itemIcon} aria-hidden="true">{item.icon}</span>
              <div>
                <div className={styles.itemTitle}>{item.title}</div>
                <p className={styles.itemDesc}>{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <button className={`btn btn--primary ${styles.dismissBtn}`} onClick={closeWhatsNew}>
          Got it, let's go! 🚀
        </button>
      </div>
    </div>
  );
}
