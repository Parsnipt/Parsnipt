/**
 * Extraction state management with Zustand
 * Manages upload history and extraction data
 */

import { create } from 'zustand';
import { Extraction } from '../types/extraction';

interface ExtractionStore {
  // Extraction data
  extractions: Extraction[];
  currentExtraction: Extraction | null;

  // Loading and error states
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;

  // Actions
  addExtraction: (extraction: Extraction) => void;
  setExtractions: (extractions: Extraction[]) => void;
  setCurrentExtraction: (extraction: Extraction | null) => void;
  updateExtraction: (extractionId: string, updates: Partial<Extraction>) => void;
  removeExtraction: (extractionId: string) => void;

  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  reset: () => void;
}

const initialState = {
  extractions: [],
  currentExtraction: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
};

export const useExtractionStore = create<ExtractionStore>((set) => ({
  ...initialState,

  addExtraction: (extraction) =>
    set((state) => ({
      extractions: [extraction, ...state.extractions],
      currentExtraction: extraction,
    })),

  setExtractions: (extractions) =>
    set({
      extractions,
    }),

  setCurrentExtraction: (extraction) =>
    set({
      currentExtraction: extraction,
    }),

  updateExtraction: (extractionId, updates) =>
    set((state) => ({
      extractions: state.extractions.map((e) =>
        e.id === extractionId ? { ...e, ...updates } : e
      ),
      currentExtraction:
        state.currentExtraction?.id === extractionId
          ? { ...state.currentExtraction, ...updates }
          : state.currentExtraction,
    })),

  removeExtraction: (extractionId) =>
    set((state) => ({
      extractions: state.extractions.filter((e) => e.id !== extractionId),
      currentExtraction:
        state.currentExtraction?.id === extractionId
          ? null
          : state.currentExtraction,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setUploading: (isUploading) => set({ isUploading }),

  setUploadProgress: (uploadProgress) => set({ uploadProgress }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));