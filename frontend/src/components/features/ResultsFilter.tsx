/**
 * Results filter component
 * Handles filtering by type and searching
 */

import { FilterType } from './ResultsDisplay';

interface ResultsFilterProps {
  filterType: FilterType;
  searchTerm: string;
  onFilterChange: (type: FilterType) => void;
  onSearchChange: (term: string) => void;
  totalItems: number;
  filteredItems: number;
}

export default function ResultsFilter({
  filterType,
  searchTerm,
  onFilterChange,
  onSearchChange,
  totalItems,
  filteredItems,
}: ResultsFilterProps) {
  
  const filterOptions: Array<{ value: FilterType; label: string }> = [
    { value: 'all', label: 'All Artifacts' },
    { value: 'functions', label: 'Functions & Methods' },
    { value: 'components', label: 'React Components' },
    { value: 'classes', label: 'Classes' },
    { value: 'other', label: 'Variables & Other' },
  ];

  /**
   * Helper to map filter buttons to their exact semantic colors
   */
  const getFilterStyle = (type: FilterType, isActive: boolean) => {
    if (isActive) {
      switch (type) {
        case 'functions': return 'bg-blue-600 text-white border-blue-600 shadow-sm';
        case 'components': return 'bg-purple-600 text-white border-purple-600 shadow-sm';
        case 'classes': return 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
        case 'other': return 'bg-orange-600 text-white border-orange-600 shadow-sm';
        default: return 'bg-brand-darkGreen/90 text-brand-cream border-brand-darkGreen/90 shadow-sm';
      }
    } else {
      switch (type) {
        case 'functions': return 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100';
        case 'components': return 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100';
        case 'classes': return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
        case 'other': return 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100';
        default: return 'bg-brand-cream/50 text-brand-darkGreen/90 border-brand-brown/30 hover:bg-brand-cream hover:border-brand-brown/80';
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Search box */}
      <div>
        <label htmlFor="search" className="block text-sm font-bold text-brand-darkGreen/90 mb-2">
          Search Code Artifacts
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-3 w-5 h-5 text-brand-mediumGreen"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            id="search"
            placeholder="Search by name, role, or code content..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-base pl-10 w-full"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3 text-brand-brown hover:text-brand-darkBrown transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs text-brand-brown/80 mt-1">
          Search in names, code content, kind, and role
        </p>
      </div>

      {/* Filter buttons */}
      <div>
        <label className="block text-sm font-bold text-brand-darkGreen/90 mb-2">
          Filter by Type
        </label>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors border-2 ${getFilterStyle(option.value, filterType === option.value)}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="p-3 bg-brand-mediumGreen/10 border-2 border-brand-mediumGreen/30 rounded-lg text-sm text-brand-darkGreen/90 font-medium">
        Showing <strong className="text-brand-darkGreen/90 text-base">{filteredItems}</strong> of <strong className="text-brand-darkGreen/90 text-base">{totalItems}</strong> items
        {searchTerm && (
          <span>
            {' '}
            matching "<strong className="text-brand-brown/80">{searchTerm}</strong>"
          </span>
        )}
      </div>
    </div>
  );
}