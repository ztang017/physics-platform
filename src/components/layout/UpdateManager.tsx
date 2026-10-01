import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { applyUpdateNow, useUpdateStore } from '../../core/pwaUpdate';
import { isSafeToRefresh } from '../../core/updatePolicy';
import styles from './UpdateManager.module.css';

/** Applies a downloaded update at a moment that won't cost the student any work.
 *
 *  On safe pages (home, Courses) it reloads straight away. On a module or the
 *  Contact page it shows a small banner instead, and applies the update as soon
 *  as the student navigates somewhere safe, or when they choose "Refresh now". */
export function UpdateManager() {
  const updateReady = useUpdateStore((s) => s.updateReady);
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const safe = isSafeToRefresh(pathname);

  useEffect(() => {
    if (updateReady && safe) applyUpdateNow();
  }, [updateReady, safe]);

  if (!updateReady || safe || dismissed) return null;

  return (
    <div className={styles.banner} role="status">
      <span className={styles.text}>
        <span aria-hidden="true">✨</span> A new version of PhysicsLab is ready. It will load when you leave this page.
      </span>
      <button type="button" className={styles.refresh} onClick={applyUpdateNow}>Refresh now</button>
      <button type="button" className={styles.dismiss} onClick={() => setDismissed(true)} aria-label="Dismiss update notice">✕</button>
    </div>
  );
}
