/**
 * Extraction item component
 * Displays an individual extraction in the list
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExtractionStore } from '../../store/extractionStore';
import extractionService from '../../services/extractions';
import { DbExtraction } from '../../types/extraction';

interface ExtractionItemProps {
  extraction: DbExtraction;
}

export default function ExtractionItem({ extraction }: ExtractionItemProps) {
  const navigate = useNavigate();
  const { removeExtraction } = useExtractionStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Handle view extraction details
   */
  const handleView = () => {
     navigate(`/results/${extraction.id}`);
  };

  /**
   * Handle delete extraction
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await extractionService.deleteExtraction(extraction.id);
      removeExtraction(extraction.id);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to delete extraction:', error);
      alert('Failed to delete extraction. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border-2 border-brand-brown/30 rounded-2xl p-6 hover:shadow-md transition-shadow">
      {/* Confirm delete modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border-2 border-brand-brown/80 p-8 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-brand-darkGreen/90 mb-2">
              Delete Artifact?
            </h3>
            <p className="text-brand-brown/80 mb-8 font-medium">
              Are you sure you want to delete this extraction record? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        {/* Left section - file info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* File icon */}
            <svg
              className="w-5 h-5 text-brand-mediumGreen"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>

            {/* Artifact Name */}
            <h3 className="text-lg font-bold text-brand-darkGreen/90 truncate max-w-sm">{extraction.name}</h3>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1 border border-white">
              {extraction.kind.replace('-', ' ')}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1 border border-white">
               {extraction.role}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-brand-brown/80 font-medium ml-8 mt-2">
            <span>{formatDate(extraction.created_at)}</span>
            <span className="text-brand-brown/40">•</span>
            <span className="font-mono text-xs">{extraction.fingerprint.slice(0, 16)}...</span>
          </div>

        </div>

        {/* Right section - actions */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleView}
            className="px-4 py-2 rounded-lg font-bold transition-colors btn-primary"
          >
            View
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className={`px-4 py-2 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors ${
              isDeleting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}