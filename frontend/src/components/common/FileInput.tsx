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
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
        isDragging
          ? 'border-brand-darkGreen/90 bg-brand-mediumGreen/50'
          : 'border-brand-mediumGreen/50 hover:border-brand-mediumGreen'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="mb-4">        
        <svg className="w-12 h-12 mx-auto text-brand-brown/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <p className="text-lg font-semibold text-brand-brown/80 mb-2">
        Drag and drop your file here
      </p>
      <p className="text-brand-brown/80 mb-4">or</p>

      {/* Uses the global btn-primary from index.css */}
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

      <p className="text-sm text-brand-brown/80">
        Allowed types: {allowedTypes.join(', ')}
      </p>
      <p className="text-sm text-brand-brown/80 mt-1">
        Max size: {maxSizeText}
      </p>
    </div>
  );
}