import { useEffect } from 'react';
import { useUIStore } from '../../core/store/uiStore';
import { useNotesStore, type NotesSection } from '../../core/store/notesStore';
import styles from './NotesPanel.module.css';

const TABS: { id: NotesSection; label: string; icon: string }[] = [
  { id: 'general',    label: 'General',    icon: '📝' },
  { id: 'kinematics', label: 'Kinematics', icon: '📈' },
  { id: 'projectile', label: 'Projectile', icon: '🚀' },
  { id: 'incline',    label: 'Incline',    icon: '⚖️' },
  { id: 'collision',  label: 'Collision',  icon: '💥' },
];

/** A persistent notebook the student can jot ideas into while working through
 *  any module, reachable from anywhere via the header button. Saved to
 *  localStorage on every keystroke, split by module so a note taken during
 *  Incline doesn't get buried under one from Kinematics. */
export function NotesPanel() {
  const { notesOpen, notesActiveSection, openNotes, closeNotes } = useUIStore();
  const { notes, setNote, clearNote } = useNotesStore();

  useEffect(() => {
    if (!notesOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeNotes(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [notesOpen, closeNotes]);

  if (!notesOpen) return null;

  const activeTab = TABS.find((t) => t.id === notesActiveSection) ?? TABS[0];
  const activeText = notes[activeTab.id] ?? '';

  const handleClear = () => {
    if (!activeText.trim()) return;
    if (window.confirm(`Clear your ${activeTab.label} notes? This cannot be undone.`)) {
      clearNote(activeTab.id);
    }
  };

  return (
    <div className={styles.overlay} onClick={closeNotes}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="My notes"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>📝 My Notes</h2>
          <button className={styles.closeBtn} onClick={closeNotes} aria-label="Close notes">
            ✕
          </button>
        </div>
        <p className={styles.subtitle}>Jot anything down as you go — it's saved automatically and stays here between visits.</p>

        <div className={styles.tabs} role="tablist" aria-label="Notes section">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tab.id === activeTab.id}
              className={`${styles.tab} ${tab.id === activeTab.id ? styles.tabActive : ''}`}
              onClick={() => openNotes(tab.id)}
            >
              <span aria-hidden="true">{tab.icon}</span> {tab.label}
              {notes[tab.id]?.trim() && <span className={styles.tabDot} aria-hidden="true" />}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          <textarea
            className={styles.textarea}
            value={activeText}
            onChange={(e) => setNote(activeTab.id, e.target.value)}
            placeholder={`Write your ${activeTab.label.toLowerCase()} notes here…`}
            aria-label={`${activeTab.label} notes`}
            autoFocus
          />
          <div className={styles.footer}>
            <span className={styles.savedHint}>💾 Autosaved to this browser</span>
            <button className={styles.clearBtn} onClick={handleClear} disabled={!activeText.trim()}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
