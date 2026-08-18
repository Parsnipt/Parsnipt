import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import ResultsDisplay from '../components/features/ResultsDisplay';
import { Extraction } from '../types';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExtraction = async () => {
      try {
        const response = await apiClient.get(`/extractions/${id}`);
        const data = response.data.data || response.data;
        setExtraction(data);
      } catch (err) {
        console.error("Error fetching extraction:", err);
        setError("Could not find this extraction.");
      }
    };

    fetchExtraction();

    let interval: NodeJS.Timeout;
    if (extraction && extraction.status === 'processing') {
      interval = setInterval(fetchExtraction, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, extraction?.status]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-brand-darkBrown/20">
          <h2 className="text-2xl font-bold text-brand-darkGreen mb-2">Extraction Not Found</h2>
          <p className="text-brand-brown mb-6">{error}</p>
          <Link to="/" className="btn-primary inline-block">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!extraction) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-mediumGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex justify-end">
        <Link 
          to="/" 
          className="text-brand-mediumGreen hover:text-brand-darkGreen font-medium flex items-center gap-2 transition-colors uppercase tracking-wide text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <ResultsDisplay extraction={extraction} />
    </div>
  );
}