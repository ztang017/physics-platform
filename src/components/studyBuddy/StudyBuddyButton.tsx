import { useUIStore } from '../../core/store/uiStore';
import type { ModuleId } from '../../core/store/gameStore';
import styles from './StudyBuddyButton.module.css';

/** Header button that opens the Study Buddy guided-thinking panel. Pass the
 *  current module so the panel opens pre-filtered to relevant sticking points. */
export function StudyBuddyButton({ moduleId }: { moduleId?: ModuleId }) {
  const openStudyBuddy = useUIStore((s) => s.openStudyBuddy);
  return (
    <button className={styles.btn} onClick={() => openStudyBuddy(moduleId)} aria-label="Open Study Buddy">
      🧠 <span className={styles.label}>Study Buddy</span>
    </button>
  );
}
