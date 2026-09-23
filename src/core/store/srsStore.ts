import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleId } from './gameStore';

// ─── Spaced Repetition (Leitner system) ────────────────────────────────────────
// Every Explain-phase question a student answers gets a "card" here. A correct
// answer moves the card up a box (and further out before it's due again); a
// wrong answer drops it back to box 1 (due again tomorrow). This is the
// classic Leitner box system — simple to reason about and explain to a
// student, unlike a full SM-2 implementation.

export interface SRSCard {
  questionId: string;
  moduleId: ModuleId;
  box: number; // 1–5
  dueAt: string; // ISO timestamp
  timesSeen: number;
  timesCorrect: number;
}

// Box N's interval, in days, before a card in that box comes due again.
const BOX_INTERVAL_DAYS = [1, 3, 7, 14, 30];
const MAX_BOX = BOX_INTERVAL_DAYS.length;

function cardKey(moduleId: ModuleId, questionId: string): string {
  return `${moduleId}:${questionId}`;
}

function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

interface SRSState {
  cards: Record<string, SRSCard>;
  recordAnswer: (moduleId: ModuleId, questionId: string, correct: boolean) => void;
}

export const useSRSStore = create<SRSState>()(
  persist(
    (set, get) => ({
      cards: {},

      recordAnswer: (moduleId, questionId, correct) => {
        const key = cardKey(moduleId, questionId);
        const existing = get().cards[key];
        const prevBox = existing?.box ?? 0;
        const nextBox = correct ? Math.min(MAX_BOX, prevBox + 1) : 1;
        const card: SRSCard = {
          questionId,
          moduleId,
          box: nextBox,
          dueAt: addDaysISO(BOX_INTERVAL_DAYS[nextBox - 1]),
          timesSeen: (existing?.timesSeen ?? 0) + 1,
          timesCorrect: (existing?.timesCorrect ?? 0) + (correct ? 1 : 0),
        };
        set((state) => ({ cards: { ...state.cards, [key]: card } }));
      },
    }),
    {
      name: 'physics-platform-srs',
      version: 1,
    }
  )
);

export function isCardDue(card: SRSCard, now: Date = new Date()): boolean {
  return new Date(card.dueAt).getTime() <= now.getTime();
}
