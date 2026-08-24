/**
 * Upload form component
 * Handles file upload with drag-and-drop, validation, and progress tracking
 */

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExtractionStore } from '../../store/extractionStore';
import { useAuthStore } from '../../store/authStore';
import extractionService from '../../services/extractions';

/**
 * File validation configuration
 */
const UPLOAD_CONFIG = {
  ALLOWED_EXTENSIONS: ['.js', '.jsx', '.ts', '.tsx'],
  FILE_SIZE_LIMITS: {
    free: 50 * 1024, // 50KB
    pro: 10 * 1024 * 1024, // 10MB
    enterprise: 100 * 1024 * 1024, // 100MB
  },
};

export default function UploadForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    addExtraction,
    setUploading,
    setUploadProgress,
    setError,
    clearError,
  } = useExtractionStore();

  // Local component state
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploadProgress, setLocalUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Get file size limit based on user tier
   */
  const getFileSizeLimit = (): number => {
    const tier = (user?.tier || 'free') as keyof typeof UPLOAD_CONFIG.FILE_SIZE_LIMITS;
    return UPLOAD_CONFIG.FILE_SIZE_LIMITS[tier] || UPLOAD_CONFIG.FILE_SIZE_LIMITS.free;
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Validate file
   */
  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid file type. Allowed types: ${UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`;
    }

    const sizeLimit = getFileSizeLimit();
    if (file.size > sizeLimit) {
      const tier = user?.tier || 'free';
      return `File too large. Maximum size for ${tier} tier: ${formatFileSize(sizeLimit)}`;
    }

    if (file.size === 0) {
      return 'File is empty. Please select a file with content.';
    }

    return null;
  };

  /**
   * Handle file upload
   */
  const handleUpload = useCallback(
    async (file: File) => {
      clearError();
      setLocalError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        setError(validationError);
        return;
      }

      setIsSubmitting(true);
      setUploading(true);
      setLocalUploadProgress(0);

      try {
        // Upload file to API
        const extraction = await extractionService.uploadFile(file, (event) => {
          const percentComplete = Math.round((event.loaded / event.total!) * 100);
          setLocalUploadProgress(percentComplete);
          setUploadProgress(percentComplete);
        });

        // Add to store
        addExtraction(extraction);

        // Clear form
        setLocalUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Check if backend finished instantly
        if (extraction.status === 'completed') {
          setIsSubmitting(false);
          setUploading(false);
          navigate(`/results/${extraction.id}`);
          return;
        }

        // Only poll if the backend says "processing"
        pollForCompletion(extraction.id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed. Please try again.';
        setLocalError(errorMessage);
        setError(errorMessage);
        setIsSubmitting(false);
        setUploading(false);
        setLocalUploadProgress(0);
      }
    },
    [user, addExtraction, setUploading, setUploadProgress, setError, clearError, navigate]
  );

  /**
   * Poll extraction status until completion
   */
  const pollForCompletion = async (extractionId: string) => {
    try {
      const completed = await extractionService.pollExtractionStatus(extractionId);
      
      const { updateExtraction } = useExtractionStore.getState();
      updateExtraction(extractionId, {
        status: completed.status,
        extractionResults: completed.extractionResults,
        error: completed.error,
      });

      // Transport immediately upon successful polling
      navigate(`/results/${extractionId}`);
    } catch (error) {
      console.error('Error polling extraction status:', error);
      const { setError: storeSetError } = useExtractionStore.getState();
      storeSetError('Failed to complete extraction processing');
    } finally {
      setIsSubmitting(false);
      setUploading(false);
      setLocalUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files?.length) {
      handleUpload(files[0]);
    }
  };

  return (
    <div className="w-full">
      {/* Error alert */}
      {localError && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
          <span>{localError}</span>
          <button
            type="button"
            onClick={() => setLocalError(null)}
            className="font-bold text-xl leading-none hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Drag and drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          isDragging
            ? 'border-brand-brown bg-brand-brown/10 scale-105'
            : 'border-brand-darkGreen/90 bg-brand-cream/80 hover:border-brand-mediumGreen'
        } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* Upload icon */}
        <div className="mb-4 flex justify-center">
          <svg
            className={`w-16 h-16 transition-colors ${
              isDragging ? 'text-brand-brown' : 'text-brand-mediumGreen'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Upload text */}
        <h3 className="text-xl font-bold text-brand-darkGreen/90 mb-2">
          {isSubmitting ? 'Uploading...' : 'Upload Your Code'}
        </h3>
        <p className="text-brand-brown/80 mb-4">
          Drag and drop your file here, or click to browse
        </p>

        {/* Browse button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`btn-primary mb-4 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          Choose File
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(',')}
          className="hidden"
          disabled={isSubmitting}
          aria-label="File input"
        />

        {/* File info */}
        <div className="mt-6 space-y-2 text-sm text-brand-brown/80">
          <p>
            <strong className="text-brand-darkGreen/90">Supported formats:</strong> {UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')}
          </p>
          <p>
            <strong className="text-brand-darkGreen/90">Max file size:</strong> {formatFileSize(getFileSizeLimit())} (
            {user?.tier || 'free'} tier)
          </p>
          <p className="text-xs text-brand-brown/80 mt-3">
            Your code is processed locally and never stored without your consent.
          </p>
        </div>
      </div>

      {/* Upload progress bar */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-darkGreen">Uploading...</span>
            <span className="text-sm font-bold text-brand-brown">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-brand-mediumGreen/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-mediumGreen h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload complete message */}
      {uploadProgress === 100 && isSubmitting && (
        <div className="mt-6 p-4 bg-brand-mediumGreen/10 border border-brand-mediumGreen/30 rounded flex items-center space-x-3">
          <svg
            className="w-5 h-5 text-brand-darkGreen animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-brand-darkGreen/90 font-medium text-sm">Processing your code...</span>
        </div>
      )}
    </div>
  );
}