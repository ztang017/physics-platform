export interface WhatsNewItem {
  icon: string;
  title: string;
  desc: string;
}

// Bump this whenever new items are added below — it's used only to decide
// whether returning visitors get a fresh popup for genuinely new content
// (not used for the session gate itself, which always fires once per visit
// regardless of version).
export const WHATS_NEW_VERSION = '2026-09-23';

export const WHATS_NEW_ITEMS: WhatsNewItem[] = [
  { icon: '🎯', title: 'Projectile fixes', desc: 'Your predicted landing spot now stays on screen to compare against the real one, and the flight actually animates instead of snapping straight to the final line.' },
  { icon: '🧮', title: 'Challenge Yourself sections', desc: 'Each module now has an optional calculus-based extension for students heading into H3 or university-level mechanics.' },
  { icon: '❓', title: 'More quiz questions', desc: "Every module's Explain phase has extra, tougher questions mixed in with the originals." },
  { icon: '🧠', title: 'Study Buddy', desc: "Stuck on something? Ask in plain English and get guided, Socratic-style nudges instead of the answer handed to you." },
  { icon: '📝', title: 'Personal Notes', desc: 'Jot thoughts down in any module — autosaved to your browser and organized by module.' },
  { icon: '🏅', title: 'Clickable badges', desc: 'Click any badge, locked or unlocked, to see exactly what it takes to earn it.' },
  { icon: '💌', title: 'Feedback that reaches the creator', desc: "The feedback box at the bottom of the Dashboard now really sends your message, instead of just opening an email draft." },
  { icon: '🔭', title: 'A bigger Physics Corner', desc: 'Many more facts, quotes, and myth-busting cards now rotate in on every visit.' },
];
