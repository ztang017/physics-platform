import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleId } from './gameStore';

export type NotesSection = ModuleId | 'general';

interface NotesState {
  notes: Record<NotesSection, string>;
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

      setNote: (section, text) =>
        set((state) => ({ notes: { ...state.notes, [section]: text } })),

      clearNote: (section) =>
        set((state) => ({ notes: { ...state.notes, [section]: '' } })),
    }),
    {
      name: 'physics-platform-notes',
      version: 1,
    }
  )
);
