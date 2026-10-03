import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Badge Definitions ────────────────────────────────────────────────────────

export type BadgeId =
  | 'graph-whisperer'    // Module 1: perfect graph match
  | 'motion-maestro'     // Module 1: complete kinematics module
  | 'relief-pilot'       // Module 2: land within 2m × 3 times
  | 'trajectory-ace'     // Module 2: complete projectile module
  | 'force-whisperer'    // Module 3: first-attempt FBD
  | 'equilibrium-master' // Module 3: complete incline module
  | 'energy-accountant'  // Module 4: correct energy bar chart on the first graded try
  | 'perfect-parking'    // Module 4: Stop Zone cleared on the very first release
  | 'energy-architect'   // Module 4: complete work, energy & power module
  | 'conservationist'    // Module 5: perfect elastic collision
  | 'momentum-guardian'  // Module 5: complete collision module
  | 'no-such-force'      // Module 6: predicted the tangent path of a released coin on the first lock-in
  | 'safe-driver'        // Module 6: all three Safe Speed Band rounds cleared on the first check
  | 'spin-doctor'        // Module 6: complete circular motion module
  | 'first-steps'        // Complete first module
  | 'halfway-there'      // Complete more than half of the modules
  | 'physics-champion'   // Complete every module
  | 'sharp-shooter';     // Any module: perfect Explain phase, zero wrong answers

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: string; // ISO timestamp
}

export const BADGE_DEFINITIONS: Record<BadgeId, Omit<Badge, 'unlockedAt'>> = {
  'graph-whisperer': {
    id: 'graph-whisperer',
    name: 'Graph Whisperer',
    description: 'Achieved a perfect graph match (≥95%) in the Kinematics mini-game.',
    emoji: '📈',
  },
  'motion-maestro': {
    id: 'motion-maestro',
    name: 'Motion Maestro',
    description: 'Completed the Vector Kinematics module.',
    emoji: '🎯',
  },
  'relief-pilot': {
    id: 'relief-pilot',
    name: 'Relief Pilot',
    description: 'Landed within 2m of the target 3 times in a row.',
    emoji: '✈️',
  },
  'trajectory-ace': {
    id: 'trajectory-ace',
    name: 'Trajectory Ace',
    description: 'Completed the Projectile Motion module.',
    emoji: '🚀',
  },
  'force-whisperer': {
    id: 'force-whisperer',
    name: 'Force Whisperer',
    description: 'Placed a perfect FBD on the first attempt.',
    emoji: '⚡',
  },
  'equilibrium-master': {
    id: 'equilibrium-master',
    name: 'Equilibrium Master',
    description: 'Completed the Free-Body Diagram module.',
    emoji: '⚖️',
  },
  'energy-accountant': {
    id: 'energy-accountant',
    name: 'Energy Accountant',
    description: 'Built a correct energy bar chart on your first graded attempt in the Energy Ramp.',
    emoji: '📊',
  },
  'perfect-parking': {
    id: 'perfect-parking',
    name: 'Perfect Parking',
    description: 'Stopped the block inside the Stop Zone on your very first release.',
    emoji: '🅿️',
  },
  'energy-architect': {
    id: 'energy-architect',
    name: 'Energy Architect',
    description: 'Completed the Work, Energy & Power module.',
    emoji: '🔋',
  },
  'conservationist': {
    id: 'conservationist',
    name: 'Conservationist',
    description: 'Demonstrated perfect elastic collision (energy conserved within 1%).',
    emoji: '♻️',
  },
  'momentum-guardian': {
    id: 'momentum-guardian',
    name: 'Momentum Guardian',
    description: 'Completed the Collisions module.',
    emoji: '💥',
  },
  'no-such-force': {
    id: 'no-such-force',
    name: 'No Such Force',
    description: 'Predicted on your first lock-in that a coin that lets go of the turntable flies off along the tangent, not outward.',
    emoji: '🧭',
  },
  'safe-driver': {
    id: 'safe-driver',
    name: 'Safe Driver',
    description: 'Cleared all three Safe Speed Band rounds on the first check each.',
    emoji: '🚗',
  },
  'spin-doctor': {
    id: 'spin-doctor',
    name: 'Spin Doctor',
    description: 'Completed the Circular Motion module.',
    emoji: '🎡',
  },
  'first-steps': {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Completed your first module.',
    emoji: '🌟',
  },
  'halfway-there': {
    id: 'halfway-there',
    name: 'Halfway There',
    description: 'Completed more than half of the modules.',
    emoji: '🏃',
  },
  'physics-champion': {
    id: 'physics-champion',
    name: 'Physics Champion',
    description: 'Completed every module!',
    emoji: '🏆',
  },
  'sharp-shooter': {
    id: 'sharp-shooter',
    name: 'Sharp Shooter',
    description: 'Answered every Explain-phase question correctly on the first try, in a single module run.',
    emoji: '🏹',
  },
};

// ─── XP Thresholds ───────────────────────────────────────────────────────────

export const XP_PER_LEVEL = 200;
export const MAX_LEVEL = 20;

export function getLevelFromXP(xp: number): number {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
}

export function getXPProgressInLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

// ─── Module IDs ───────────────────────────────────────────────────────────────

export type ModuleId = 'kinematics' | 'projectile' | 'incline' | 'energy' | 'collision' | 'circular';

// Follows the course's lecture order: energy is taught before momentum, and
// the Collisions module already leans on kinetic energy. Circular motion and
// rotation come last (Lecture 5 and Tutorial 5 onwards).
export const MODULE_ORDER: ModuleId[] = [
  'kinematics',
  'projectile',
  'incline',
  'energy',
  'collision',
  'circular',
];

/** The count at which "Halfway There" is earned: strictly more than half. */
export const HALFWAY_MODULE_COUNT = Math.floor(MODULE_ORDER.length / 2) + 1;

// ─── Game Store ───────────────────────────────────────────────────────────────

interface GameState {
  // Progress
  xp: number;
  level: number;
  unlockedBadges: Badge[];
  completedModules: ModuleId[];

  // Settings
  mathMode: boolean;
  showLeaderboard: boolean;
  studentName: string;

  // Leaderboard (local history only in Phase 1)
  sessionHistory: Array<{ moduleId: ModuleId; score: number; date: string }>;

  // Actions
  addXP: (amount: number) => void;
  unlockBadge: (id: BadgeId) => void;
  completeModule: (id: ModuleId) => void;
  toggleMathMode: () => void;
  setLeaderboardOptIn: (opt: boolean) => void;
  setStudentName: (name: string) => void;
  recordSession: (moduleId: ModuleId, score: number) => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      unlockedBadges: [],
      completedModules: [],
      mathMode: false,
      showLeaderboard: false,
      studentName: 'Student',
      sessionHistory: [],

      addXP: (amount) => {
        const newXP = get().xp + amount;
        set({ xp: newXP, level: getLevelFromXP(newXP) });
      },

      unlockBadge: (id) => {
        const already = get().unlockedBadges.some((b) => b.id === id);
        if (already) return;
        const def = BADGE_DEFINITIONS[id];
        set((state) => ({
          unlockedBadges: [
            ...state.unlockedBadges,
            { ...def, unlockedAt: new Date().toISOString() },
          ],
        }));
      },

      completeModule: (id) => {
        const already = get().completedModules.includes(id);
        if (already) return;

        const newCompleted = [...get().completedModules, id];
        set({ completedModules: newCompleted });

        // Award milestone badges
        const { unlockBadge } = get();
        if (newCompleted.length === 1) unlockBadge('first-steps');
        if (newCompleted.length === HALFWAY_MODULE_COUNT) unlockBadge('halfway-there');
        if (MODULE_ORDER.every((m) => newCompleted.includes(m))) unlockBadge('physics-champion');
      },

      toggleMathMode: () => set((state) => ({ mathMode: !state.mathMode })),

      setLeaderboardOptIn: (opt) => set({ showLeaderboard: opt }),

      setStudentName: (name) => set({ studentName: name }),

      recordSession: (moduleId, score) => {
        set((state) => ({
          sessionHistory: [
            ...state.sessionHistory,
            { moduleId, score, date: new Date().toISOString() },
          ].slice(-100), // keep last 100
        }));
      },

      resetProgress: () =>
        set({
          xp: 0,
          level: 1,
          unlockedBadges: [],
          completedModules: [],
          sessionHistory: [],
        }),
    }),
    {
      name: 'physics-platform-game-state',
      version: 1,
    }
  )
);
