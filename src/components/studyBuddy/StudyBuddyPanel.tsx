import { useEffect, useMemo, useState } from 'react';
import { useUIStore } from '../../core/store/uiStore';
import type { ModuleId } from '../../core/store/gameStore';
import { STUDY_TOPICS, type StudyTopic } from './studyBuddyData';
import styles from './StudyBuddyPanel.module.css';

const MODULE_LABELS: Record<ModuleId, string> = {
  kinematics: 'Kinematics',
  projectile: 'Projectile',
  incline: 'Incline',
  collision: 'Collision',
};

function matchTopic(query: string): StudyTopic | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  let best: { topic: StudyTopic; score: number } | null = null;
  for (const topic of STUDY_TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (q.includes(kw.toLowerCase())) score += kw.length; // longer/more specific phrase wins
    }
    if (score > 0 && (!best || score > best.score)) best = { topic, score };
  }
  return best?.topic ?? null;
}

/** A curated, rule-based Socratic study guide — not a live LLM. It routes a
 *  typed question (or a picked topic) to a hand-written chain of guiding
 *  prompts for that sticking point, revealed one at a time, and only shows
 *  the underlying principle once the student has worked through them. This
 *  keeps the "prompt thinking, don't hand over the answer" pedagogy intact
 *  without needing a backend to hold an API key on a static-hosted site. */
export function StudyBuddyPanel() {
  const { studyBuddyOpen, studyBuddyModuleFilter, closeStudyBuddy } = useUIStore();
  const [query, setQuery] = useState('');
  const [triedNoMatch, setTriedNoMatch] = useState(false);
  const [activeTopic, setActiveTopic] = useState<StudyTopic | null>(null);
  const [revealCount, setRevealCount] = useState(1);
  const [showAllModules, setShowAllModules] = useState(false);

  useEffect(() => {
    if (!studyBuddyOpen) return;
    setQuery('');
    setTriedNoMatch(false);
    setActiveTopic(null);
    setRevealCount(1);
    setShowAllModules(false);
  }, [studyBuddyOpen]);

  useEffect(() => {
    if (!studyBuddyOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeStudyBuddy(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [studyBuddyOpen, closeStudyBuddy]);

  const visibleTopics = useMemo(() => {
    if (showAllModules || !studyBuddyModuleFilter) return STUDY_TOPICS;
    return STUDY_TOPICS.filter((t) => t.moduleId === studyBuddyModuleFilter);
  }, [showAllModules, studyBuddyModuleFilter]);

  if (!studyBuddyOpen) return null;

  const handleAsk = () => {
    const match = matchTopic(query);
    if (match) {
      setActiveTopic(match);
      setRevealCount(1);
      setTriedNoMatch(false);
    } else {
      setTriedNoMatch(true);
    }
  };

  const openTopic = (topic: StudyTopic) => {
    setActiveTopic(topic);
    setRevealCount(1);
    setTriedNoMatch(false);
  };

  const backToTopics = () => {
    setActiveTopic(null);
    setQuery('');
    setTriedNoMatch(false);
  };

  return (
    <div className={styles.overlay} onClick={closeStudyBuddy}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Study Buddy"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>🧠 Study Buddy</h2>
          <button className={styles.closeBtn} onClick={closeStudyBuddy} aria-label="Close Study Buddy">
            ✕
          </button>
        </div>
        <p className={styles.subtitle}>
          A guided-thinking helper, not a live AI — it nudges you toward the physics with questions instead of handing you the answer.
        </p>

        <div className={styles.body}>
          {!activeTopic && (
            <>
              <div className={styles.askRow}>
                <input
                  className={styles.askInput}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setTriedNoMatch(false); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(); }}
                  placeholder="What are you stuck on?"
                  aria-label="Describe what you're stuck on"
                />
                <button className="btn btn--primary" onClick={handleAsk}>Ask</button>
              </div>

              {triedNoMatch && (
                <p className={styles.noMatch}>
                  I couldn't match that to one of my guided topics yet — pick the closest one below instead.
                </p>
              )}

              <div className={styles.topicListHeader}>
                <span>{studyBuddyModuleFilter && !showAllModules ? `${MODULE_LABELS[studyBuddyModuleFilter]} sticking points` : 'All sticking points'}</span>
                {studyBuddyModuleFilter && (
                  <button className={styles.scopeToggle} onClick={() => setShowAllModules((v) => !v)}>
                    {showAllModules ? 'Show this module only' : 'Show all modules'}
                  </button>
                )}
              </div>

              <ul className={styles.topicList}>
                {visibleTopics.map((topic) => (
                  <li key={topic.id}>
                    <button className={styles.topicBtn} onClick={() => openTopic(topic)}>
                      {topic.question}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {activeTopic && (
            <div className={styles.flow}>
              <button className={styles.backLink} onClick={backToTopics}>← Back to topics</button>
              <p className={styles.flowQuestion}>{activeTopic.question}</p>

              <ol className={styles.promptList}>
                {activeTopic.prompts.slice(0, revealCount).map((p, i) => (
                  <li key={i} className={styles.promptItem}>{p}</li>
                ))}
              </ol>

              {revealCount < activeTopic.prompts.length && (
                <button className="btn btn--secondary" onClick={() => setRevealCount((c) => c + 1)}>
                  💭 I've thought about it — next nudge
                </button>
              )}

              {revealCount >= activeTopic.prompts.length && (
                <div className={styles.principleBox}>
                  <span className={styles.principleLabel}>Core principle</span>
                  <p>{activeTopic.principle}</p>
                  <p className={styles.flowCta}>Now go try it again in the simulation with this in mind. 🔁</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
