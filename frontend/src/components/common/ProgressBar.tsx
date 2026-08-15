interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  if (progress <= 0) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Uploading...</span>
        <span className="text-sm">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}