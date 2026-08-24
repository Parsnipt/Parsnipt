/**
 * Results summary component
 * Displays statistics about extraction results
 */

import { ExtractionResults } from '../../types/extraction';

interface ResultsSummaryProps {
  results: ExtractionResults;
}

export default function ResultsSummary({ results }: ResultsSummaryProps) {
  /**
   * Category info matched to the exact semantic CodeItem tags
   * Icons removed per design specs
   */
  const categories = [
    {
      name: 'Functions',
      count: results.functions.length,
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Components',
      count: results.components.length,
      color: 'text-purple-800',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Utilities',
      count: results.utilities.length,
      color: 'text-green-800',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Constants',
      count: results.constants.length,
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
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t-2 border-brand-darkGreen/90">
        <div>
          <span className="text-sm text-brand-darkGreen/90 font-bold">Total Items</span>
          <p className="text-2xl font-bold text-brand-brown/80">
            {results.summary.totalItems}
          </p>
        </div>
        <div>
          <span className="text-sm text-brand-darkGreen/90 font-bold">Processing Time</span>
          <p className="text-2xl font-bold text-brand-brown/80">
            {results.summary.processingTimeMs}ms
          </p>
        </div>
      </div>
    </div>
  );
}