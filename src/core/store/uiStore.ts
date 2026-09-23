import { create } from 'zustand';
import type { NotesSection } from './notesStore';
import type { ModuleId } from './gameStore';

// ─── UI Store ─────────────────────────────────────────────────────────────────
// Ephemeral cross-page UI state that doesn't belong in gameStore (persisted
// progress) or sessionStore (per-module POE state).

interface UIState {
  formulaSheetOpen: boolean;
  openFormulaSheet: () => void;
  closeFormulaSheet: () => void;
  toggleFormulaSheet: () => void;

  notesOpen: boolean;
  notesActiveSection: NotesSection;
  // Optional `section` jumps the panel straight to that module's notes —
  // e.g. the button inside a module opens directly on that module's tab
  // instead of always landing on General.
  openNotes: (section?: NotesSection) => void;
  closeNotes: () => void;
  toggleNotes: (section?: NotesSection) => void;

  studyBuddyOpen: boolean;
  studyBuddyModuleFilter: ModuleId | null;
  openStudyBuddy: (moduleId?: ModuleId) => void;
  closeStudyBuddy: () => void;

  whatsNewOpen: boolean;
  openWhatsNew: () => void;
  closeWhatsNew: () => void;

  spacedReviewOpen: boolean;
  openSpacedReview: () => void;
  closeSpacedReview: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  formulaSheetOpen: false,
  openFormulaSheet: () => set({ formulaSheetOpen: true }),
  closeFormulaSheet: () => set({ formulaSheetOpen: false }),
  toggleFormulaSheet: () => set((state) => ({ formulaSheetOpen: !state.formulaSheetOpen })),

  notesOpen: false,
  notesActiveSection: 'general',
  openNotes: (section) => set({ notesOpen: true, ...(section ? { notesActiveSection: section } : {}) }),
  closeNotes: () => set({ notesOpen: false }),
  toggleNotes: (section) =>
    set((state) => ({
      notesOpen: !state.notesOpen,
      ...(section ? { notesActiveSection: section } : {}),
    })),

  studyBuddyOpen: false,
  studyBuddyModuleFilter: null,
  openStudyBuddy: (moduleId) => set({ studyBuddyOpen: true, studyBuddyModuleFilter: moduleId ?? null }),
  closeStudyBuddy: () => set({ studyBuddyOpen: false }),

  whatsNewOpen: false,
  openWhatsNew: () => set({ whatsNewOpen: true }),
  closeWhatsNew: () => set({ whatsNewOpen: false }),

  spacedReviewOpen: false,
  openSpacedReview: () => set({ spacedReviewOpen: true }),
  closeSpacedReview: () => set({ spacedReviewOpen: false }),
}));
