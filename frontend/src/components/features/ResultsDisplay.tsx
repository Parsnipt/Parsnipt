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

    let items = [
      ...extraction.extractionResults.functions,
      ...extraction.extractionResults.components,
      ...extraction.extractionResults.utilities,
      ...extraction.extractionResults.constants,
    ];

    if (filterType !== 'all') {
      items = items.filter((item) => item.type === filterType);
    }

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

  if (extraction.status === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-brand-mediumGreen border-t-transparent rounded-full" />
        </div>
        <p className="mt-4 text-brand-darkGreen font-medium">Processing your code...</p>
      </div>
    );
  }

  if (extraction.status === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
        Extraction failed: {extraction.error || 'Unknown error occurred.'}
      </div>
    );
  }

  if (!extraction.extractionResults) {
    return (
      <div className="text-center py-8 text-brand-brown/70 bg-white rounded-2xl shadow-xl border border-brand-darkBrown/20">
        No extraction results available.
      </div>
    );
  }

  return (
    <div className="space-y-8">      
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-brand-darkBrown/10 border-2 border-brand-brown/70 space-y-6">        
        
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
            className="input-base md:w-48 text-brand-darkGreen"
          >
            <option value="all">All Items</option>
            <option value="function">Functions</option>
            <option value="component">Components</option>
            <option value="utility">Utilities</option>
            <option value="constant">Constants</option>
          </select>
        </div>
        
        <div className="pt-6 border-t-2 border-brand-brown/50">
          <h1 className="text-2xl font-bold text-brand-darkGreen mb-1 tracking-tight">Extraction Results</h1>
          <p className="text-brand-brown text-sm">
            ID: <span className="font-mono text-brand-darkGreen/70">{extraction.id}</span>
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        {results.map((item) => (          
          <div key={item.id} className="rounded-xl shadow-lg shadow-brand-darkBrown/20 border-2 border-brand-brown/70 overflow-hidden bg-white">
            <CodePreview item={item} />
          </div>
        ))}
      </div>
      
      {results.length === 0 && (
        <div className="text-center py-12 bg-white/50 rounded-2xl border border-brand-mediumGreen/20 shadow-sm">
          <p className="text-brand-brown font-medium">No items match your search criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="mt-3 text-brand-mediumGreen hover:text-brand-darkGreen text-sm font-semibold uppercase tracking-wide transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}