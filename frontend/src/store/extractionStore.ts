/**
 * Extraction state management with Zustand
 * Manages upload history and extraction data
 */

import { create } from 'zustand';
import { DbExtraction, FileAnalysis } from '../types/extraction';

interface ExtractionStore {
  // Extraction data
  extractions: DbExtraction[];
  currentExtraction: DbExtraction | null;
  currentAnalysis: FileAnalysis | null; 

  // Loading and error states
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;

  // Actions
  addExtraction: (extraction: DbExtraction) => void;
  setExtractions: (extractions: DbExtraction[]) => void;
  setCurrentExtraction: (extraction: DbExtraction | null) => void;
  setCurrentAnalysis: (analysis: FileAnalysis | null) => void; 
  updateExtraction: (extractionId: string, updates: Partial<DbExtraction>) => void;
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
  currentAnalysis: null,
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

  setCurrentAnalysis: (analysis) =>
    set({
      currentAnalysis: analysis,
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