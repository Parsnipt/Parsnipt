/**
 * Results page
 * Displays extraction results with filtering and preview
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useExtractionStore } from '../store/extractionStore';
import extractionService from '../services/extractions';
import ResultsDisplay, { ExtractionProcessState } from '../components/features/ResultsDisplay';
import { Artifact } from '../types/extraction';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentAnalysis } = useExtractionStore();

  const [processState, setProcessState] = useState<ExtractionProcessState>({
    status: 'processing',
    fileName: 'Loading...',
    createdAt: new Date().toISOString(),
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch extraction details on mount or when ID changes
   */
  useEffect(() => {
    if (!id) {
      setError('No extraction ID provided');
      setIsLoading(false);
      return;
    }

    // If viewing the latest upload, pull the AST instantly from memory
    if (id === 'latest' && currentAnalysis) {
      setProcessState({
        status: 'completed',
        fileName: currentAnalysis.source.fileName,
        createdAt: currentAnalysis.timestamp,
        fileAnalysis: currentAnalysis
      });
      setIsLoading(false);
      return;
    }

    // If viewing a historical record, fetch it and wrap it in the new AST schema
    const fetchHistoricalExtraction = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await extractionService.getExtraction(id);
        
        // Mock a single artifact for the history view
        const mockArtifact: Artifact = {
          id: data.id,
          name: data.name,
          kind: data.kind,
          role: data.role,
          code: data.code,
          fingerprint: data.fingerprint,
          source: { startLine: 1, endLine: data.code.split('\n').length },
          parent: null,
          scopeDepth: 0,
          syntax: { isAsync: false, isGenerator: false, isArrow: false, visibility: 'public', exportType: 'none' },
          parameters: [],
          returns: { present: false, count: 0, expressions: [], isAsync: false, isGenerator: false },
          documentation: { leading: [], inline: [], trailing: [] },
          analysis: { complexity: 'low', cyclomaticComplexity: 1, nestingDepth: 0, branchCount: 0, loopCount: 0, callCount: 0, documentationCoverage: 1 },
          relationships: { calls: [], calledBy: [], references: [], referencedBy: [], imports: [], exports: [], children: [] },
          confidence: { overall: 1, classification: 1, location: 1, parameters: 1, returns: 1, analysis: 1 }
        };

        setProcessState({
          status: 'completed',
          fileName: `${data.name} (Historical Record)`,
          createdAt: data.created_at,
          fileAnalysis: {
            schemaVersion: '1.5.0',
            generator: { name: 'Parsnipt', version: '1.5.0' },
            source: { fileName: data.name, language: 'unknown', lineCount: 0, characterCount: 0 },
            processingTime: { parsingMs: 0, extractionMs: 0, analysisMs: 0, totalMs: 0 },
            timestamp: data.created_at,
            summary: {
              totalArtifacts: 1,
              byKind: { [data.kind]: 1 },
              byRole: { [data.role]: 1 },
              overallConfidence: 1,
              documentationCoverage: 1
            },
            artifacts: [mockArtifact]
          }
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load extraction';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (id !== 'latest') {
      fetchHistoricalExtraction();
    } else if (!currentAnalysis) {
      setError('No recent extraction found in memory.');
      setIsLoading(false);
    }
  }, [id, currentAnalysis]);

  const handleBack = () => {
    navigate('/upload');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-brand-darkGreen/90 font-bold hover:text-brand-mediumGreen transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Uploads
        </button>

        <div className="flex justify-center py-20">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-brand-mediumGreen border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !processState) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-brand-darkGreen/90 font-bold hover:text-brand-mediumGreen transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Uploads
        </button>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Results</h2>
          <p className="text-red-700 mb-4">
            {error || 'The extraction could not be found.'}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          >
            Back to Uploads
          </button>
        </div>
      </div>
    );
  }

  // Show results
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Slim Navigation Card */}
      <div className="flex items-center justify-between mb-6 bg-white py-2 px-6 rounded-2xl shadow-md shadow-brand-darkBrown/10 border-2 border-brand-brown/80">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-brand-darkGreen/90 font-bold hover:text-brand-mediumGreen transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Uploads
        </button>

        <div className="flex gap-2">
          <Link
            to="/upload"
            className="px-4 py-1.5 border-2 border-brand-mediumGreen text-brand-darkGreen/90 font-bold hover:bg-brand-mediumGreen/10 rounded-lg transition-colors text-sm"
          >
            Upload More
          </Link>
        </div>
      </div>

      {/* Results display */}
      <ResultsDisplay extraction={processState} />
    </div>
  );
}