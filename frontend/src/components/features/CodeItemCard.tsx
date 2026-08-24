import { useState } from 'react';
import { CodeItem } from '../../types/extraction';
import CodeHighlight from '../common/CodeHighlight';

interface CodeItemCardProps {
  item: CodeItem;
}

export default function CodeItemCard({ item }: CodeItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const getTypeBadge = (): { bg: string; text: string } => {
    switch (item.type) {
      case 'function': return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'component': return { bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'utility': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'constant': return { bg: 'bg-orange-100', text: 'text-orange-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const getComplexityStyle = (): string => {
    switch (item.complexity) {
      case 'simple': return 'bg-green-50 text-green-700 border border-green-200';
      case 'moderate': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'complex': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const handleCopyCode = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const getLanguage = (): 'javascript' | 'typescript' | 'jsx' | 'tsx' => {
    if (item.type === 'component') {
      return item.code.includes('JSX.Element') ? 'tsx' : 'jsx';
    }
    if (item.metadata.returnType || item.metadata.parameters.some((p) => p.type)) {
      return 'typescript';
    }
    return 'javascript';
  };

  const typeBadge = getTypeBadge();

  return (
    <div className="border-2 border-brand-darkGreen/90 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 hover:bg-brand-cream/30 transition-colors focus:outline-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeBadge.bg} ${typeBadge.text} flex items-center gap-1 min-w-fit`}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>
              
              <h3 className="text-lg font-bold text-brand-darkGreen/90">{item.name}</h3>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="font-bold text-brand-darkGreen/90">Lines:</span>
                <span className="text-brand-brown/80">{item.startLine}-{item.endLine} ({item.lineCount} total)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-brand-darkGreen/90">Complexity:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getComplexityStyle()}`}>
                  {item.complexity.charAt(0).toUpperCase() + item.complexity.slice(1)}
                </span>
              </span>
              {item.metadata.parameters.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="font-bold text-brand-darkGreen/90">Parameters:</span>
                  <span className="text-brand-brown/80">{item.metadata.parameters.length}</span>
                </span>
              )}
              {item.metadata.returnType && (
                <span className="flex items-center gap-1">
                  <span className="font-bold text-brand-darkGreen/90">Returns:</span>
                  <code className="bg-brand-cream px-1 rounded text-xs border border-brand-brown/30 text-brand-brown/80">
                    {item.metadata.returnType}
                  </code>
                </span>
              )}
              {item.metadata.isAsync && (
                <span className="px-2 py-0.5 bg-brand-darkGreen/10 text-brand-darkGreen/90 border border-brand-darkGreen/30 rounded text-xs font-bold">
                  async
                </span>
              )}
            </div>

            {item.metadata.docComment && (
              <p className="text-xs text-brand-brown/80 mt-2 line-clamp-2 italic font-medium">
                {item.metadata.docComment}
              </p>
            )}
          </div>

          {/* Right-aligned container for confidence badge and expand arrow */}
          <div className="flex items-center gap-4 ml-4">
            {item.confidence < 1.0 && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold border border-yellow-200 whitespace-nowrap">
                {Math.round(item.confidence * 100)}% conf.
              </span>
            )}
            <svg
              className={`w-5 h-5 text-brand-darkGreen/90 transition-transform flex-shrink-0 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t-2 border-brand-darkGreen/20 p-4 bg-brand-cream/30 space-y-4">
          {item.metadata.parameters.length > 0 && (
            <div>
              <h4 className="font-bold text-brand-darkGreen/90 text-sm mb-2">Parameters</h4>
              <div className="space-y-1">
                {item.metadata.parameters.map((param, idx) => (
                  <div key={idx} className="text-sm pl-4 border-l-2 border-brand-mediumGreen/40">
                    <code className="bg-white px-2 py-1 rounded text-xs mr-2 border border-brand-brown/30 font-bold text-brand-darkGreen/90">
                      {param.name}
                    </code>
                    {param.type && (
                      <code className="bg-white px-1.5 py-0.5 rounded text-xs text-brand-brown/80 border border-brand-brown/30">
                        {param.type}
                      </code>
                    )}
                    {param.hasDefault && (
                      <span className="text-xs text-brand-brown/80 ml-2 font-medium">(has default)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.metadata.returnType && (
            <div>
              <h4 className="font-bold text-brand-darkGreen/90 text-sm mb-2">Return Type</h4>
              <code className="bg-white px-3 py-2 rounded text-sm block text-brand-brown/80 border border-brand-brown/30">
                {item.metadata.returnType}
              </code>
            </div>
          )}

          {item.metadata.docComment && (
            <div>
              <h4 className="font-bold text-brand-darkGreen/90 text-sm mb-2">Documentation</h4>
              <div className="bg-white p-3 rounded text-sm text-brand-brown/80 border-l-2 border-brand-brown/80">
                <pre className="font-sans whitespace-pre-wrap break-words text-xs font-medium">
                  {item.metadata.docComment}
                </pre>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-brand-darkGreen/90 text-sm">Code</h4>
              <button
                onClick={handleCopyCode}
                className="text-xs px-3 py-1 bg-brand-darkGreen/90 hover:bg-brand-mediumGreen text-brand-cream rounded font-bold transition-colors"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <CodeHighlight code={item.code} language={getLanguage()} showLineNumbers={true} maxHeight="500px" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className="bg-white p-3 rounded-lg border border-brand-brown/30">
              <span className="text-brand-darkGreen/90 font-bold">Type</span>
              <p className="text-brand-brown/80 font-bold capitalize text-sm">{item.type}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-brand-brown/30">
              <span className="text-brand-darkGreen/90 font-bold">Complexity</span>
              <p className="text-brand-brown/80 font-bold capitalize text-sm">{item.complexity}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-brand-brown/30">
              <span className="text-brand-darkGreen/90 font-bold">Lines of Code</span>
              <p className="text-brand-brown/80 font-bold text-sm">{item.lineCount}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-brand-brown/30">
              <span className="text-brand-darkGreen/90 font-bold">Confidence</span>
              <p className="text-brand-brown/80 font-bold text-sm">
                {Math.round(item.confidence * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}