import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export function SkeletonText({ width = '100%', height = '20px', count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ width, height }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="space-y-4">
        <div className="skeleton" style={{ height: '24px', width: '60%' }} />
        <div className="space-y-2">
          <div className="skeleton" style={{ height: '16px' }} />
          <div className="skeleton" style={{ height: '16px', width: '80%' }} />
        </div>
        <div className="flex gap-2">
          <div className="skeleton" style={{ height: '32px', width: '60px' }} />
          <div className="skeleton" style={{ height: '32px', width: '60px' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCodeBlock() {
  // Stable, staggered widths that look natural but won't jump on re-render
  const lineLengths = ['85%', '60%', '90%', '70%', '80%', '45%', '75%', '50%'];

  return (
    <div className="bg-gray-900 rounded p-4 space-y-2">
      {lineLengths.map((width, i) => (
        <div
          key={i}
          className="skeleton skeleton-dark"
          style={{ height: '20px', width }}
        />
      ))}
    </div>
  );
}

export default SkeletonText;