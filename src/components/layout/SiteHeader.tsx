import { Link, NavLink } from 'react-router-dom';
import { XPBar } from '../ui/XPBar';
import { SpacedReviewButton } from '../review/SpacedReviewButton';
import { StudyBuddyButton } from '../studyBuddy/StudyBuddyButton';
import { NotesButton } from '../notes/NotesButton';
import { FormulaSheetButton } from '../formulaSheet/FormulaSheetButton';
import styles from './SiteHeader.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses', end: false },
  { to: '/contact', label: 'Contact us', end: false },
];

/** Top bar for the homepage and the subpages: brand, the three site links,
 *  and the study tools. (Module pages keep their own header, which adds the
 *  Math toggle and a way back to Courses.) */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="PhysicsLab home">
          <span className={styles.logoIcon} aria-hidden="true">⚛️</span>
          <span className={styles.logoText}>PhysicsLab</span>
        </Link>

        <nav aria-label="Main" className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.tools}>
          <SpacedReviewButton />
          <StudyBuddyButton />
          <NotesButton />
          <FormulaSheetButton />
          <XPBar compact />
        </div>
      </div>
    </header>
  );
}
