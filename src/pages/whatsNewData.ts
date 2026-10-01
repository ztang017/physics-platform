export interface WhatsNewItem {
  icon: string;
  title: string;
  desc: string;
}

// Bump this whenever new items are added below — it's used only to decide
// whether returning visitors get a fresh popup for genuinely new content
// (not used for the session gate itself, which always fires once per visit
// regardless of version).
export const WHATS_NEW_VERSION = '2026-10-02';

export const WHATS_NEW_ITEMS: WhatsNewItem[] = [
  { icon: '📊', title: 'Energy bar charts and the Stop Zone', desc: "The Energy Ramp now lets you drag bars to build an energy chart before you see the result (and earn the Energy Accountant badge), then check it against the real thing. After the replay, park the block in the Stop Zone for the Perfect Parking badge — all with energy, no guessing." },
  { icon: '🤝', title: 'Momentum meets energy in Collisions', desc: "New concept notes and questions on systems that push themselves apart, building up to the classic block-on-a-sliding-wedge problem where you need both conservation laws." },
  { icon: '🔋', title: 'New module: Work, Energy & Power', desc: "A fifth module following the course's work-and-energy lecture: predict what a block does on a ramp, rough patch and spring, watch a live energy ledger, then test yourself on ten questions. It sits before Collisions, and has its own Challenge Yourself calculus section." },
  { icon: '🧭', title: 'Relative velocity in Projectile Motion', desc: "New concept notes and Explain questions on combining velocities — a boat crossing a current, aimed with or across the flow — rounding out the 'Kinematics and Relative Velocity' topic from the course syllabus." },
  { icon: '🛗', title: 'The elevator effect in Incline', desc: "New concept notes and questions on accelerating reference frames — how normal force (and an incline's sliding speed) changes inside an accelerating elevator, using the same effective-gravity trick as real tutorial problems." },
  { icon: '🪂', title: 'Terminal velocity, derived', desc: "Kinematics' Challenge Yourself section now derives terminal velocity from a = g − kv as a separable differential equation, with a live calculator." },
  { icon: '🚀', title: 'Rocket thrust from first principles', desc: "Collisions' Challenge Yourself section now covers variable-mass systems — deriving rocket thrust with the product rule on F = d(mv)/dt." },
  { icon: '📚', title: 'Quiz questions matched to real course tutorials', desc: "We cross-checked every module against actual university tutorial sheets and added new Explain questions and concept notes for gaps we found: rendezvous problems in Kinematics, normal-force stacking and contact forces in Incline, and centre-of-mass, chained collisions, and 2D momentum in Collisions." },
  { icon: '🏹', title: 'New badge: Sharp Shooter', desc: 'Answer every Explain-phase question correctly on your first try, in a single module run, to unlock it.' },
  { icon: '🎯', title: 'Projectile fixes', desc: 'Your predicted landing spot now stays on screen to compare against the real one, and the flight actually animates instead of snapping straight to the final line.' },
  { icon: '🧮', title: 'Challenge Yourself sections', desc: 'Each module now has an optional calculus-based extension for students heading into H3 or university-level mechanics.' },
  { icon: '❓', title: 'More quiz questions', desc: "Every module's Explain phase has extra, tougher questions mixed in with the originals." },
  { icon: '🧠', title: 'Study Buddy', desc: "Stuck on something? Ask in plain English and get guided, Socratic-style nudges instead of the answer handed to you." },
  { icon: '📝', title: 'Personal Notes', desc: 'Jot thoughts down in any module — autosaved to your browser and organized by module.' },
  { icon: '🏅', title: 'Clickable badges', desc: 'Click any badge, locked or unlocked, to see exactly what it takes to earn it.' },
  { icon: '💌', title: 'Feedback that reaches the creator', desc: "The feedback box at the bottom of the Dashboard now really sends your message, instead of just opening an email draft." },
  { icon: '🔭', title: 'A bigger Physics Corner', desc: 'Many more facts, quotes, and myth-busting cards now rotate in on every visit.' },
];
