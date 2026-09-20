import { create } from 'zustand';

// ─── UI Store ─────────────────────────────────────────────────────────────────
// Ephemeral cross-page UI state that doesn't belong in gameStore (persisted
// progress) or sessionStore (per-module POE state).

interface UIState {
  formulaSheetOpen: boolean;
  openFormulaSheet: () => void;
  closeFormulaSheet: () => void;
  toggleFormulaSheet: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  formulaSheetOpen: false,
  openFormulaSheet: () => set({ formulaSheetOpen: true }),
  closeFormulaSheet: () => set({ formulaSheetOpen: false }),
  toggleFormulaSheet: () => set((state) => ({ formulaSheetOpen: !state.formulaSheetOpen })),
}));
