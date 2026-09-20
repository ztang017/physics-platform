import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleId } from './gameStore';

export type NotesSection = ModuleId | 'general';

interface NotesState {
  notes: Record<NotesSection, string>;
  // zustand's persist middleware always rehydrates from localStorage on a
  // later microtask, even though localStorage reads are synchronous — so a
  // keystroke landing in the gap between store creation and rehydration
  // gets silently overwritten when the (older) persisted snapshot merges
  // in afterwards. Panels gate on this instead of reading `notes` too early.
  hasHydrated: boolean;
  setHasHydrated: () => void;
  setNote: (section: NotesSection, text: string) => void;
  clearNote: (section: NotesSection) => void;
}

const EMPTY_NOTES: Record<NotesSection, string> = {
  general: '',
  kinematics: '',
  projectile: '',
  incline: '',
  collision: '',
};

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: EMPTY_NOTES,
      hasHydrated: false,
      setHasHydrated: () => set({ hasHydrated: true }),

      setNote: (section, text) =>
        set((state) => ({ notes: { ...state.notes, [section]: text } })),

      clearNote: (section) =>
        set((state) => ({ notes: { ...state.notes, [section]: '' } })),
    }),
    {
      name: 'physics-platform-notes',
      version: 1,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(),
    }
  )
);
