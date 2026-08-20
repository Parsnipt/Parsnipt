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
   * Get category info
   */
  const categories = [
    {
      name: 'Functions',
      count: results.functions.length,
      icon: 'ƒ',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Components',
      count: results.components.length,
      icon: '⧬',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Utilities',
      count: results.utilities.length,
      icon: '🔧',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Constants',
      count: results.constants.length,
      icon: '◆',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Extraction Summary</h2>

      {/* Category grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`${category.bgColor} rounded-lg p-4 text-center`}
          >
            <div className={`text-2xl font-bold ${category.color} mb-1`}>
              {category.count}
            </div>
            <div className="text-xs text-gray-600 font-medium">{category.name}</div>
          </div>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div>
          <span className="text-sm text-gray-600">Total Items</span>
          <p className="text-2xl font-bold text-gray-900">
            {results.summary.totalItems}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-600">Processing Time</span>
          <p className="text-2xl font-bold text-gray-900">
            {results.summary.processingTimeMs}ms
          </p>
        </div>
      </div>
    </div>
  );
}