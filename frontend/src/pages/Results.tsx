import { useParams, Link } from 'react-router-dom';
import { useExtractionStore } from '../store/extractionStore';
import ResultsDisplay from '../components/features/ResultsDisplay';

export default function Results() {
  // Grab the ID from the URL (e.g., /results/123)
  const { id } = useParams<{ id: string }>();
  
  // Find the matching extraction in our global store
  const extraction = useExtractionStore((state) =>
    state.extractions.find((e) => e.id === id)
  );

  // Fallback if the user types in a bad ID or refreshes and clears the store
  if (!extraction) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Extraction Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the results you're looking for. The extraction may have been deleted or expired.
          </p>
          <Link to="/" className="btn-primary inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Extraction Results</h1>
          <p className="text-gray-500 text-sm">
            ID: <span className="font-mono">{extraction.id}</span>
          </p>
        </div>
        <Link 
          to="/" 
          className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-2 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Render the list manager built in Step 4 */}
      <ResultsDisplay extraction={extraction} />
    </div>
  );
}