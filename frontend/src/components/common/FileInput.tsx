import { useState, useRef } from 'react';

interface FileInputProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  allowedTypes?: string[];
  maxSizeText?: string;
}

export default function FileInput({
  onFileSelect,
  disabled = false,
  allowedTypes = ['.js', '.jsx', '.ts', '.tsx'],
  maxSizeText = '50KB (free tier)',
}: FileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files?.length) {
      onFileSelect(files[0]);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
        isDragging
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-primary-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="mb-4">
        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <p className="text-lg font-semibold text-gray-700 mb-2">
        Drag and drop your file here
      </p>
      <p className="text-gray-500 mb-4">or</p>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="btn-primary mb-4"
        disabled={disabled}
      >
        {disabled ? 'Uploading...' : 'Choose File'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        className="hidden"
        disabled={disabled}
      />

      <p className="text-sm text-gray-500">
        Allowed types: {allowedTypes.join(', ')}
      </p>
      <p className="text-sm text-gray-500">
        Max size: {maxSizeText}
      </p>
    </div>
  );
}