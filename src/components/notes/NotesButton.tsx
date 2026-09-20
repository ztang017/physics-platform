import { useUIStore } from '../../core/store/uiStore';
import type { NotesSection } from '../../core/store/notesStore';
import styles from './NotesButton.module.css';

/** Small header button that opens the student's persistent notebook. When
 *  rendered inside a module, pass that module's id so it opens straight to
 *  the relevant tab instead of always landing on General. */
export function NotesButton({ section }: { section?: NotesSection }) {
  const openNotes = useUIStore((s) => s.openNotes);
  return (
    <button className={styles.btn} onClick={() => openNotes(section)} aria-label="Open my notes">
      📝 <span className={styles.label}>Notes</span>
    </button>
  );
}
