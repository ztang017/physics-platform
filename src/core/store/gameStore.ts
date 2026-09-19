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
  | 'conservationist'    // Module 4: perfect elastic collision
  | 'momentum-guardian'  // Module 4: complete collision module
  | 'first-steps'        // Complete first module
  | 'halfway-there'      // Complete 2 modules
  | 'physics-champion';  // Complete all 4 modules

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
  'first-steps': {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Completed your first module.',
    emoji: '🌟',
  },
  'halfway-there': {
    id: 'halfway-there',
    name: 'Halfway There',
    description: 'Completed 2 out of 4 modules.',
    emoji: '🏃',
  },
  'physics-champion': {
    id: 'physics-champion',
    name: 'Physics Champion',
    description: 'Completed all 4 modules!',
    emoji: '🏆',
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

export type ModuleId = 'kinematics' | 'projectile' | 'incline' | 'collision';

export const MODULE_ORDER: ModuleId[] = [
  'kinematics',
  'projectile',
  'incline',
  'collision',
];

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
        if (newCompleted.length === 2) unlockBadge('halfway-there');
        if (newCompleted.length === 4) unlockBadge('physics-champion');
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
