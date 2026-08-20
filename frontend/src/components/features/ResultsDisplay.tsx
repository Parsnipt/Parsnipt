/**
 * Results display component
 * Main container for displaying extraction results with filtering and search
 */

import { useMemo, useState } from 'react';
import { Extraction, CodeItem } from '../../types/extraction';
import ResultsSummary from './ResultsSummary';
import ResultsFilter from './ResultsFilter';
import CodeItemCard from './CodeItemCard';

type FilterType = 'all' | 'functions' | 'components' | 'utilities' | 'constants';

interface ResultsDisplayProps {
  extraction: Extraction;
}

export default function ResultsDisplay({ extraction }: ResultsDisplayProps) {
  // Filter and search state
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Filter and search results
   */
  const filteredResults = useMemo(() => {
    if (!extraction.extractionResults) return [];

    // Get all items
    let items: CodeItem[] = [
      ...extraction.extractionResults.functions,
      ...extraction.extractionResults.components,
      ...extraction.extractionResults.utilities,
      ...extraction.extractionResults.constants,
    ];

    // Apply type filter
    if (filterType !== 'all') {
      items = items.filter((item) => `${item.type}s` === filterType);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.code.toLowerCase().includes(searchLower) ||
          item.type.toLowerCase().includes(searchLower)
      );
    }

    return items;
  }, [extraction.extractionResults, filterType, searchTerm]);

  // Show loading state
  if (extraction.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin mb-4">
          <svg
            className="w-12 h-12 text-primary-600"
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
        </div>
        <p className="text-gray-600 text-lg">Processing your code...</p>
        <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
      </div>
    );
  }

  // Show error state
  if (extraction.status === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Extraction Failed</h3>
        <p className="text-red-700 mb-4">
          {extraction.error ||
            'An error occurred while processing your code. Please try again.'}
        </p>
        <a
          href="/upload"
          className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition"
        >
          Try Again
        </a>
      </div>
    );
  }

  // Show results
  if (extraction.status === 'completed' && extraction.extractionResults) {
    const results = extraction.extractionResults;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Extraction Results
          </h1>
          <p className="text-gray-600">
            File: <strong>{extraction.fileName}</strong>
            {' • '}
            Extracted: <strong>{new Date(extraction.createdAt).toLocaleDateString()}</strong>
          </p>
        </div>

        {/* Summary cards */}
        <ResultsSummary results={results} />

        {/* Filter and search */}
        <ResultsFilter
          filterType={filterType}
          searchTerm={searchTerm}
          onFilterChange={setFilterType}
          onSearchChange={setSearchTerm}
          totalItems={results.summary.totalItems}
          filteredItems={filteredResults.length}
        />

        {/* Results list */}
        <div>
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No items found</p>
              {searchTerm && (
                <p className="text-gray-500 text-sm">
                  Try adjusting your search or filter criteria
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredResults.map((item) => (
                <CodeItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Export section (placeholder for Phase 2) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Export Results</h3>
          <p className="text-blue-700 text-sm mb-4">
            Export functionality is coming soon! You'll be able to download results as JSON, CSV, or PDF.
          </p>
          <button
            disabled
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium cursor-not-allowed opacity-50"
          >
            Export (Coming Soon)
          </button>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="text-center py-12">
      <p className="text-gray-600">No results available</p>
    </div>
  );
}