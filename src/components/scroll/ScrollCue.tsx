import { useEffect, useState } from 'react';
import styles from './ScrollCue.module.css';

/** A bouncing "there's more below" hint shown near the top of a long page,
 *  which fades out as soon as the visitor starts scrolling on their own —
 *  it only needs to suggest the gesture once. */
export function ScrollCue() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY < 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={`${styles.cue} ${show ? '' : styles.hidden}`}
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.65, behavior: 'smooth' })}
      aria-label="Scroll down for more"
      tabIndex={show ? 0 : -1}
    >
      <span className={styles.chevron} aria-hidden="true">⌄</span>
    </button>
  );
}
