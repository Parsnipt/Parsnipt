/**
 * Results summary component
 * Displays statistics about extraction results based on AST parsing
 */

import { FileAnalysis } from '../../types/extraction';

interface ResultsSummaryProps {
  analysis: FileAnalysis;
}

export default function ResultsSummary({ analysis }: ResultsSummaryProps) {
  // Helper to safely aggregate counts from the byKind object
  const getCount = (keys: string[]) => {
    return keys.reduce((sum, key) => sum + (analysis.summary.byKind[key] || 0), 0);
  };

  /**
   * Category info matched to the semantic ArtifactKind tags
   */
  const categories = [
    {
      name: 'Functions',
      count: getCount(['function', 'arrow-function', 'method']),
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Components',
      count: getCount(['component']),
      color: 'text-purple-800',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Classes',
      count: getCount(['class']),
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-100',
    },
    {
      name: 'Variables',
      count: getCount(['constant', 'variable']),
      color: 'text-orange-800',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div>
      {/* Category grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`${category.bgColor} rounded-xl p-4 text-center border border-white shadow-sm`}
          >
            <div className={`text-3xl font-bold ${category.color} mb-1`}>
              {category.count}
            </div>
            <div className={`text-xs ${category.color} font-bold uppercase tracking-wider opacity-90`}>
              {category.name}
            </div>
          </div>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t-2 border-brand-darkGreen/90">
        <div>
          <span className="text-sm text-brand-darkGreen/90 font-bold">Total Artifacts</span>
          <p className="text-2xl font-bold text-brand-brown/80">
            {analysis.summary.totalArtifacts}
          </p>
        </div>
        <div>
          <span className="text-sm text-brand-darkGreen/90 font-bold">Confidence Score</span>
          <p className="text-2xl font-bold text-brand-brown/80">
            {Math.round(analysis.summary.overallConfidence * 100)}%
          </p>
        </div>
        <div>
          <span className="text-sm text-brand-darkGreen/90 font-bold">Doc Coverage</span>
          <p className="text-2xl font-bold text-brand-brown/80">
            {Math.round(analysis.summary.documentationCoverage * 100)}%
          </p>
        </div>
        <div>
          <span className="text-sm text-brand-darkGreen/90 font-bold">Processing Time</span>
          <p className="text-2xl font-bold text-brand-brown/80">
            {analysis.processingTime.totalMs}ms
          </p>
        </div>
      </div>
    </div>
  );
}