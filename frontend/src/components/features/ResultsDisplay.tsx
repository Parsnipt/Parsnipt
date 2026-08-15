import { useMemo, useState } from 'react';
import { Extraction, CodeType } from '../../types';
import CodePreview from './CodePreview';

interface Props {
  extraction: Extraction;
}

type FilterOption = 'all' | CodeType;

export default function ResultsDisplay({ extraction }: Props) {
  const [filterType, setFilterType] = useState<FilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!extraction.extractionResults) return [];

    // Flatten all categories into a single array
    let items = [
      ...extraction.extractionResults.functions,
      ...extraction.extractionResults.components,
      ...extraction.extractionResults.utilities,
      ...extraction.extractionResults.constants,
    ];

    // Apply category filter
    if (filterType !== 'all') {
      items = items.filter((item) => item.type === filterType);
    }

    // Apply search filter (checks both name and code snippet)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.code.toLowerCase().includes(lowerSearch)
      );
    }

    return items;
  }, [extraction.extractionResults, filterType, searchTerm]);

  // Loading state
  if (extraction.status === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">Processing your code...</p>
      </div>
    );
  }

  // Error state
  if (extraction.status === 'failed') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Extraction failed: {extraction.error || 'Unknown error occurred.'}
      </div>
    );
  }

  // Empty state if no results exist yet
  if (!extraction.extractionResults) {
    return (
      <div className="text-center py-8 text-gray-500">
        No extraction results available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search components, functions, or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-base flex-1"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterOption)}
          className="input-base md:w-48"
        >
          <option value="all">All Items</option>
          <option value="function">Functions</option>
          <option value="component">Components</option>
          <option value="utility">Utilities</option>
          <option value="constant">Constants</option>
        </select>
      </div>

      {/* Results List */}
      <div className="flex flex-col gap-2">
        {results.map((item) => (
          <CodePreview key={item.id} item={item} />
        ))}
      </div>

      {/* No match state */}
      {results.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 font-medium">No items match your search criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-semibold"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}