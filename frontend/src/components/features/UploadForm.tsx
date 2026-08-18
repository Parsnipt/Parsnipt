import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExtractionStore } from '../../store/extractionStore';
import apiClient from '../../services/api';
import FileInput from '../common/FileInput';
import ProgressBar from '../common/ProgressBar';

export default function UploadForm() {
  const navigate = useNavigate();
  const { addExtraction, setLoading } = useExtractionStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const ALLOWED_TYPES = ['.js', '.jsx', '.ts', '.tsx'];
  const MAX_FILE_SIZE = 50 * 1024; // 50KB

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      return `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Max: ${MAX_FILE_SIZE / 1024}KB`;
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/extractions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const percentage = Math.round((event.loaded / event.total!) * 100);
          setProgress(percentage);
        },
      });

      const extractionData = response.data.data || response.data;

      if (extractionData && extractionData.id) {
        addExtraction(extractionData);
        setProgress(0);

        navigate(`/results/${extractionData.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <FileInput 
        onFileSelect={handleUpload} 
        disabled={isUploading} 
        allowedTypes={ALLOWED_TYPES} 
      />
      
      <ProgressBar progress={progress} />
      
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}