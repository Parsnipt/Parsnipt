/**
 * Upload page
 * Displays file upload component and recent uploads
 */

import { useEffect } from 'react';
import { useExtractionStore } from '../store/extractionStore';
import extractionService from '../services/extractions';
import UploadForm from '../components/features/UploadForm';
import ExtractionItem from '../components/features/ExtractionItem';

export default function Upload() {
  const { extractions, setExtractions, isLoading, setLoading } = useExtractionStore();

  useEffect(() => {
    const fetchExtractions = async () => {
      setLoading(true);
      try {
        const data = await extractionService.getExtractions();
        setExtractions(data);
      } catch (error) {
        console.error('Failed to fetch extractions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExtractions();
  }, [setExtractions, setLoading]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header text in a card container */}
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-brand-darkBrown/10 border-2 border-brand-brown/60 mb-8 text-center">
        <h1 className="text-4xl font-bold text-brand-darkGreen/90 mb-4">Upload Code</h1>
        <p className="text-lg text-brand-brown font-medium">
          Upload your JavaScript or TypeScript files to extract functions, components, and utilities.
        </p>
      </div>

      {/* Upload form section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-brand-darkBrown/10 border-2 border-brand-brown/60 mb-12">
        <h2 className="text-2xl font-bold text-brand-darkGreen/90 mb-6 text-center">Select File to Upload</h2>
        <UploadForm />
      </div>

      {/* Recent uploads section */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-bold text-brand-darkGreen/90">Recent Uploads</h2>
          {extractions.length > 0 && (
            <span className="text-sm font-bold text-brand-cream bg-brand-darkGreen/90 px-4 py-1 rounded-full shadow-sm">
              {extractions.length} file{extractions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-brand-mediumGreen border-t-transparent rounded-full" />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && extractions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-brand-mediumGreen/30 shadow-sm">
            <svg
              className="w-12 h-12 mx-auto text-brand-mediumGreen/50 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-brand-darkGreen/90 font-bold text-lg">No uploads yet</p>
            <p className="text-brand-brown/80 text-sm mt-1">
              Upload a file above to get started
            </p>
          </div>
        )}

        {/* Extractions list */}
        {!isLoading && extractions.length > 0 && (
          <div className="grid gap-4">
            {extractions.map((extraction) => (
              <ExtractionItem key={extraction.id} extraction={extraction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}