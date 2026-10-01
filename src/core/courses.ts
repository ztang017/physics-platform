import { MODULE_ORDER, type ModuleId } from './store/gameStore';

export interface Course {
  id: ModuleId;
  title: string;
  /** Short topic label shown above the title. */
  topic: string;
  emoji: string;
  /** Brand colour for the card accent. */
  accent: string;
  path: string;
  description: string;
  /** Which CY1308 lecture this module supports. */
  lecture: string;
}

// A Record keyed by ModuleId (rather than an array) so the compiler forces an
// entry for every module, and the display order always comes from MODULE_ORDER.
const COURSES: Record<ModuleId, Course> = {
  kinematics: {
    id: 'kinematics',
    title: 'Vector Kinematics Grapher',
    topic: '1D motion',
    emoji: '📈',
    accent: '#0d9488',
    path: '/module/kinematics',
    description: 'Explore position, velocity and acceleration graphs in real time, then test yourself in the Graph-Match mini-game.',
    lecture: 'Lecture 1',
  },
  projectile: {
    id: 'projectile',
    title: 'Projectile Motion Sandbox',
    topic: '2D motion',
    emoji: '🚀',
    accent: '#d97706',
    path: '/module/projectile',
    description: 'Launch relief packages over a wall and discover why horizontal and vertical motion never get in each other\'s way.',
    lecture: 'Lecture 1',
  },
  incline: {
    id: 'incline',
    title: 'Free-Body Diagram Incline',
    topic: 'Forces & friction',
    emoji: '⚖️',
    accent: '#059669',
    path: '/module/incline',
    description: 'Drag the force vectors into place, predict whether a block will slide, then check against the real physics as the angle changes.',
    lecture: 'Lecture 2',
  },
  energy: {
    id: 'energy',
    title: 'Energy Ramp: Work, Energy & Power',
    topic: 'Work & energy',
    emoji: '🔋',
    accent: '#db2777',
    path: '/module/energy',
    description: 'Follow a block from ramp to rough patch to spring, build energy bar charts, and watch energy change form but never disappear.',
    lecture: 'Lecture 3',
  },
  collision: {
    id: 'collision',
    title: '1D Elastic & Inelastic Collisions',
    topic: 'Momentum',
    emoji: '💥',
    accent: '#7c3aed',
    path: '/module/collision',
    description: 'Crash carts, scrub through slow-motion impacts, and prove that momentum is always conserved.',
    lecture: 'Lecture 4',
  },
};

/** Every course, in the order a student should take them. */
export const COURSE_LIST: Course[] = MODULE_ORDER.map((id) => COURSES[id]);

export function getCourse(id: ModuleId): Course {
  return COURSES[id];
}

/**
 * A module is open if it is the first one, the one before it is complete, or
 * the student already finished it — so adding a module in the middle of the
 * sequence later never locks anyone out of something they've already done.
 */
export function isModuleUnlocked(id: ModuleId, completed: ModuleId[]): boolean {
  const index = MODULE_ORDER.indexOf(id);
  return index === 0 || completed.includes(id) || completed.includes(MODULE_ORDER[index - 1]);
}

/** The first module the student hasn't finished, or null once they have finished all of them. */
export function getNextCourse(completed: ModuleId[]): Course | null {
  const next = MODULE_ORDER.find((id) => !completed.includes(id));
  return next ? COURSES[next] : null;
}

/** The encouraging line shown on the homepage, based on how far along the student is. */
export function progressMessage(completed: ModuleId[]): string {
  const total = MODULE_ORDER.length;
  const done = MODULE_ORDER.filter((id) => completed.includes(id)).length;
  const next = getNextCourse(completed);

  if (done === 0) return 'Your first module is waiting. It only takes one prediction to get started.';
  if (!next) return 'You have completed every module. Revisit any of them, and keep your skills sharp with daily Review.';
  const remaining = total - done;
  return `${done} of ${total} modules done. ${remaining === 1 ? 'Just one to go' : `${remaining} to go`}, and ${next.title} is up next.`;
}
