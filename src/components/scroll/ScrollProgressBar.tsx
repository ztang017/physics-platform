import { useEffect, useState } from 'react';
import styles from './ScrollProgressBar.module.css';

/** A thin bar pinned to the very top of the viewport that fills as the
 *  visitor scrolls down the page — a standard "how much is left" cue for
 *  a long-scrolling page like the Dashboard. */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={styles.track} role="progressbar" aria-label="Page scroll progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.bar} style={{ width: `${progress}%` }} />
    </div>
  );
}
