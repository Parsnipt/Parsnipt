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

  /**
   * Fetch user's extractions on page load
   */
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
    <div className="container-narrow py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Code</h1>
        <p className="text-lg text-gray-600">
          Upload your JavaScript or TypeScript files to extract functions, components, and utilities.
        </p>
      </div>

      {/* Upload form section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select File to Upload</h2>
        <UploadForm />
      </div>

      {/* Recent uploads section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Recent Uploads</h2>
          {extractions.length > 0 && (
            <span className="text-sm text-gray-600">
              {extractions.length} file{extractions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && extractions.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
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
            <p className="text-gray-600 text-lg">No uploads yet</p>
            <p className="text-gray-500 text-sm">
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