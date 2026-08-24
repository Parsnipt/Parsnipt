/**
 * Extraction item component
 * Displays an individual extraction in the list
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExtractionStore } from '../../store/extractionStore';
import extractionService from '../../services/extractions';
import { Extraction } from '../../types/extraction';

interface ExtractionItemProps {
  extraction: Extraction;
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
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (): { bg: string; text: string; icon: string } => {
    switch (extraction.status) {
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' };
      case 'processing':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⟳' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏱' };
      case 'failed':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: '✕' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' };
    }
  };

  /**
   * Handle view extraction details
   */
  const handleView = () => {
    if (extraction.status === 'completed') {
      navigate(`/results/${extraction.id}`);
    }
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

  const statusBadge = getStatusBadge();
  const itemCount = extraction.extractionResults
    ? extraction.extractionResults.summary.totalItems
    : 0;

  return (
    <div className="bg-white border-2 border-brand-brown/30 rounded-2xl p-6 hover:shadow-md transition-shadow">
      {/* Confirm delete modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border-2 border-brand-brown/80 p-8 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-brand-darkGreen/90 mb-2">
              Delete Extraction?
            </h3>
            <p className="text-brand-brown/80 mb-8 font-medium">
              Are you sure you want to delete this extraction? This action cannot be undone.
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>

            {/* File name */}
            <h3 className="text-lg font-bold text-brand-darkGreen/90">{extraction.fileName}</h3>

            {/* Status badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text} flex items-center gap-1 border border-white`}
            >
              <span>{statusBadge.icon}</span>
              {extraction.status.charAt(0).toUpperCase() + extraction.status.slice(1)}
            </span>
          </div>

          {/* File metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-brand-brown/80 font-medium ml-8">
            <span>{formatFileSize(extraction.fileSizeBytes)}</span>
            <span className="text-brand-brown/40">•</span>
            <span>{formatDate(extraction.createdAt)}</span>
            {extraction.status === 'completed' && itemCount > 0 && (
              <>
                <span className="text-brand-brown/40">•</span>
                <span className="font-bold">{itemCount} item{itemCount !== 1 ? 's' : ''} extracted</span>
              </>
            )}
          </div>

          {/* Error message if failed */}
          {extraction.status === 'failed' && extraction.error && (
            <p className="mt-2 text-sm font-bold text-red-600 ml-8">
              Error: {extraction.error}
            </p>
          )}

          {/* Processing time if completed */}
          {extraction.status === 'completed' && extraction.extractionResults && (
            <p className="mt-2 text-xs text-brand-brown/60 ml-8">
              Processed in {extraction.extractionResults.summary.processingTimeMs}ms
            </p>
          )}
        </div>

        {/* Right section - actions */}
        <div className="flex gap-2 ml-4">
          {/* View button */}
          <button
            onClick={handleView}
            disabled={extraction.status !== 'completed'}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              extraction.status === 'completed'
                ? 'btn-primary'
                : 'bg-brand-cream/50 text-brand-brown/50 cursor-not-allowed border-2 border-transparent'
            }`}
          >
            {extraction.status === 'completed' ? 'View' : 'Processing'}
          </button>

          {/* Delete button */}
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