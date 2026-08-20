/**
 * Results filter component
 * Handles filtering by type and searching
 */


type FilterType = 'all' | 'functions' | 'components' | 'utilities' | 'constants';

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
  /**
   * Filter options
   */
  const filterOptions: Array<{ value: FilterType; label: string; icon: string }> = [
    { value: 'all', label: 'All Items', icon: '📋' },
    { value: 'functions', label: 'Functions', icon: 'ƒ' },
    { value: 'components', label: 'Components', icon: '⧬' },
    { value: 'utilities', label: 'Utilities', icon: '🔧' },
    { value: 'constants', label: 'Constants', icon: '◆' },
  ];

  return (
    <div className="space-y-4">
      {/* Search box */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Code Items
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-3 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            id="search"
            placeholder="Search by name, type, or code..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-base pl-10 w-full"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Search in names and code content
        </p>
      </div>

      {/* Filter buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Type
        </label>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === option.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
        Showing <strong>{filteredItems}</strong> of <strong>{totalItems}</strong> items
        {searchTerm && (
          <span>
            {' '}
            matching "<strong>{searchTerm}</strong>"
          </span>
        )}
      </div>
    </div>
  );
}