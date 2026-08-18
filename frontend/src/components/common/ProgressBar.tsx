interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  if (progress <= 0) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-brand-darkGreen">Uploading & Extracting...</span>
        <span className="text-sm font-medium text-brand-darkGreen">{progress}%</span>
      </div>      
      <div className="w-full bg-brand-mediumGreen/20 rounded-full h-2">
        <div
          className="bg-brand-mediumGreen h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}