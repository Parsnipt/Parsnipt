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
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResults = useMemo(() => {
    if (!extraction.extractionResults) return [];

    let items: CodeItem[] = [
      ...extraction.extractionResults.functions,
      ...extraction.extractionResults.components,
      ...extraction.extractionResults.utilities,
      ...extraction.extractionResults.constants,
    ];

    if (filterType !== 'all') {
      items = items.filter((item) => `${item.type}s` === filterType);
    }

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

  /**
   * Handle exporting results as a JSON file
   */
  const handleExportJSON = () => {
    if (!extraction.extractionResults) return;

    // Create a clean JSON string from the results
    const dataStr = JSON.stringify(extraction.extractionResults, null, 2);
    
    // Create a blob and a temporary download link
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    // Name the file based on the original upload name
    a.download = `${extraction.fileName.split('.')[0]}-architecture.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (extraction.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin mb-4">
          <svg className="w-12 h-12 text-brand-mediumGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="text-brand-darkGreen/90 font-bold text-lg">Processing your code...</p>
        <p className="text-brand-brown/80 text-sm mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (extraction.status === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-900 mb-2">Extraction Failed</h3>
        <p className="text-red-700 mb-4">
          {extraction.error || 'An error occurred while processing your code. Please try again.'}
        </p>
        <a href="/upload" className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors">
          Try Again
        </a>
      </div>
    );
  }

  if (extraction.status === 'completed' && extraction.extractionResults) {
    const results = extraction.extractionResults;

    return (
      <div className="space-y-6">
        
        {/* Header & Summary Master Container */}
        <div className="bg-white rounded-2xl border-2 border-brand-brown/80 shadow-xl shadow-brand-darkBrown/10 p-6">
          <div className="mb-6 pb-6 border-b-2 border-brand-brown/30">
            <h1 className="text-3xl font-bold text-brand-darkGreen/90 mb-2">
              Extraction Results
            </h1>
            <p className="text-sm">
              <strong className="text-brand-darkGreen/90">File: </strong>
              <span className="text-brand-brown/80">{extraction.fileName}</span>
              <span className="mx-2 text-brand-brown/40">•</span>
              <strong className="text-brand-darkGreen/90">Date: </strong>
              <span className="text-brand-brown/80">{new Date(extraction.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
          <ResultsSummary results={results} />
        </div>

        {/* Search, Filter, and List Master Container */}
        <div className="bg-white rounded-2xl border-2 border-brand-brown/80 shadow-xl shadow-brand-darkBrown/10 p-6">
          <ResultsFilter
            filterType={filterType}
            searchTerm={searchTerm}
            onFilterChange={setFilterType}
            onSearchChange={setSearchTerm}
            totalItems={results.summary.totalItems}
            filteredItems={filteredResults.length}
          />

          <div className="mt-6">
            {filteredResults.length === 0 ? (
              <div className="text-center py-12 bg-brand-cream/30 rounded-lg border-2 border-brand-brown/80 shadow-sm">
                <svg className="w-12 h-12 mx-auto text-brand-mediumGreen/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-brand-darkGreen/90 font-bold text-lg mb-2">No items found</p>
                {searchTerm && (
                  <p className="text-brand-brown/80 text-sm">
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
        </div>

        {/* Export section */}
        <div className="bg-white rounded-2xl border-2 border-brand-brown/80 shadow-xl shadow-brand-darkBrown/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-brand-darkGreen/90 mb-1">Export Results</h3>
            <p className="text-brand-brown/80 text-sm">
              Download your parsed architecture as a structured JSON file.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportJSON}
              className="px-6 py-2 bg-brand-darkGreen/90 hover:bg-brand-mediumGreen text-brand-cream rounded-lg font-bold transition-colors shadow-sm"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <p className="text-brand-brown/80 font-medium">No results available</p>
    </div>
  );
}