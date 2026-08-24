/**
 * Results page
 * Displays extraction results with filtering and preview
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useExtractionStore } from '../store/extractionStore';
import extractionService from '../services/extractions';
import { Extraction } from '../types/extraction';
import ResultsDisplay from '../components/features/ResultsDisplay';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentExtraction, setCurrentExtraction } = useExtractionStore();

  const [extraction, setExtraction] = useState<Extraction | null>(currentExtraction);
  const [isLoading, setIsLoading] = useState(!currentExtraction);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch extraction details on mount or when ID changes
   */
  useEffect(() => {
    if (!id) {
      setError('No extraction ID provided');
      return;
    }

    if (currentExtraction?.id === id) {
      setExtraction(currentExtraction);
      setIsLoading(false);
      return;
    }

    const fetchExtraction = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await extractionService.getExtraction(id);
        setExtraction(data);
        setCurrentExtraction(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load extraction';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExtraction();
  }, [id, currentExtraction, setCurrentExtraction]);

  const handleBack = () => {
    navigate('/upload');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-brand-darkGreen/90 font-bold hover:text-brand-mediumGreen transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Uploads
        </button>

        <div className="flex justify-center py-20">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-brand-mediumGreen border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !extraction) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-brand-darkGreen/90 font-bold hover:text-brand-mediumGreen transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Uploads
        </button>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Results</h2>
          <p className="text-red-700 mb-4">
            {error || 'The extraction could not be found.'}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          >
            Back to Uploads
          </button>
        </div>
      </div>
    );
  }

  // Show results
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Slim Navigation Card */}
      <div className="flex items-center justify-between mb-6 bg-white py-2 px-6 rounded-2xl shadow-md shadow-brand-darkBrown/10 border-2 border-brand-brown/80">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-brand-darkGreen/90 font-bold hover:text-brand-mediumGreen transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Uploads
        </button>

        <div className="flex gap-2">
          <Link
            to="/upload"
            className="px-4 py-1.5 border-2 border-brand-mediumGreen text-brand-darkGreen/90 font-bold hover:bg-brand-mediumGreen/10 rounded-lg transition-colors text-sm"
          >
            Upload More
          </Link>
        </div>
      </div>

      {/* Results display */}
      <ResultsDisplay extraction={extraction} />
    </div>
  );
}