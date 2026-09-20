import { create } from 'zustand';

// ─── POE Phase ────────────────────────────────────────────────────────────────

export type POEPhase = 'predict' | 'observe' | 'explain' | 'complete';

export interface ExplainQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  /** Shown after a WRONG first attempt — a nudge, not the answer, so the student can try again. */
  hint: string;
  /** Shown once the question is resolved (answered correctly, or a second wrong attempt) —
   *  written as a neutral statement of fact, not "Correct!"/"Right!", since the UI supplies
   *  that framing itself depending on how the question was resolved. */
  explanation: string;
}

// ─── Session Store ────────────────────────────────────────────────────────────
// Ephemeral per-module state. Intentionally NOT persisted to localStorage.

interface SessionState {
  currentModule: string | null;
  poePhase: POEPhase;
  predictAnswer: string | null;   // whatever the student predicted
  explainAnswers: Record<string, number>; // questionId → chosen index
  sessionScore: number;            // 0–100 accumulated from POE
  attempts: number;                // how many predict attempts in current module

  // Actions
  setModule: (id: string) => void;
  setPOEPhase: (phase: POEPhase) => void;
  setPredictAnswer: (answer: string) => void;
  answerExplainQuestion: (questionId: string, chosenIndex: number) => void;
  addScore: (points: number) => void;
  resetSession: () => void;
}

const initialState = {
  currentModule: null,
  poePhase: 'predict' as POEPhase,
  predictAnswer: null,
  explainAnswers: {},
  sessionScore: 0,
  attempts: 0,
};

export const useSessionStore = create<SessionState>()((set) => ({
  ...initialState,

  setModule: (id) =>
    set({ ...initialState, currentModule: id, poePhase: 'predict' }),

  setPOEPhase: (phase) => set({ poePhase: phase }),

  setPredictAnswer: (answer) =>
    set((state) => ({
      predictAnswer: answer,
      attempts: state.attempts + 1,
    })),

  answerExplainQuestion: (questionId, chosenIndex) =>
    set((state) => ({
      explainAnswers: { ...state.explainAnswers, [questionId]: chosenIndex },
    })),

  addScore: (points) =>
    set((state) => ({ sessionScore: Math.min(100, state.sessionScore + points) })),

  resetSession: () => set(initialState),
}));
