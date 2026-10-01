import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../core/store/uiStore';
import styles from './SiteFooter.module.css';

const FOOTER_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses', end: false },
  { to: '/contact', label: 'Contact us', end: false },
];

/** The one footer shared by every page: the homepage, the subpages, each
 *  module and its quiz. It carries the site links so a student at the bottom
 *  of any long page can get anywhere without scrolling back up. */
export function SiteFooter() {
  const openWhatsNew = useUIStore((s) => s.openWhatsNew);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.logo}><span aria-hidden="true">⚛️</span> PhysicsLab</span>
            <p className={styles.tagline}>Learn physics by predicting first.</p>
          </div>

          <nav aria-label="Footer">
            <ul className={styles.links}>
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <button type="button" className={`${styles.link} ${styles.linkButton}`} onClick={openWhatsNew}>
                  ✨ What's new
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.credit}>Designed and built with Antigravity 2.0, Claude Code and Google Gemini by Tang Zong Nan.</p>
          <p className={styles.disclaimer}>
            PhysicsLab is a supplementary practice tool, not a substitute for your CY1308 lectures, tutorials or official
            course materials. Always defer to your course notes and instructor for anything that affects your grades.
          </p>
        </div>
      </div>
    </footer>
  );
}
