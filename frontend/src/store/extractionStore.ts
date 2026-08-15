import { create } from 'zustand';
import { Extraction } from '../types';

interface ExtractionStore {
  extractions: Extraction[];
  isLoading: boolean;
  addExtraction: (extraction: Extraction) => void;
  setExtractions: (extractions: Extraction[]) => void;
  setLoading: (loading: boolean) => void;
  removeExtraction: (id: string) => void;
}

export const useExtractionStore = create<ExtractionStore>((set) => ({
  extractions: [],
  isLoading: false,
  addExtraction: (extraction) =>
    set((state) => ({ extractions: [extraction, ...state.extractions] })),
  setExtractions: (extractions) => set({ extractions }),
  setLoading: (isLoading) => set({ isLoading }),
  removeExtraction: (id) =>
    set((state) => ({
      extractions: state.extractions.filter((e) => e.id !== id),
    })),
}));