/**
 * Code item card component
 * Displays an individual extracted code item with metadata and preview
 */

import { useState } from 'react';
import { CodeItem } from '../../types/extraction';
import CodeHighlight from '../common/CodeHighlight';

interface CodeItemCardProps {
  item: CodeItem;
}

export default function CodeItemCard({ item }: CodeItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Get type badge styling
   */
  const getTypeBadge = (): { bg: string; text: string; icon: string } => {
    switch (item.type) {
      case 'function':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'ƒ' };
      case 'component':
        return { bg: 'bg-purple-100', text: 'text-purple-800', icon: '⧬' };
      case 'utility':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '🔧' };
      case 'constant':
        return { bg: 'bg-orange-100', text: 'text-orange-800', icon: '◆' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' };
    }
  };

  /**
   * Get complexity styling
   */
  const getComplexityStyle = (): string => {
    switch (item.complexity) {
      case 'simple':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'moderate':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'complex':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  /**
   * Copy code to clipboard
   */
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  /**
   * Determine if this is a TypeScript file based on code content
   */
  const getLanguage = (): 'javascript' | 'typescript' | 'jsx' | 'tsx' => {
    if (item.type === 'component') {
      return item.code.includes('JSX.Element') ? 'tsx' : 'jsx';
    }
    if (
      item.metadata.returnType ||
      item.metadata.parameters.some((p) => p.type)
    ) {
      return 'typescript';
    }
    return 'javascript';
  };

  const typeBadge = getTypeBadge();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
      {/* Card header - clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <div className="flex items-start justify-between">
          {/* Left section - code item info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* Type badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${typeBadge.bg} ${typeBadge.text} flex items-center gap-1 min-w-fit`}
              >
                <span className="text-sm">{typeBadge.icon}</span>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>

              {/* Item name */}
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>

              {/* Confidence badge (if < 1.0) */}
              {item.confidence < 1.0 && (
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  {Math.round(item.confidence * 100)}% confidence
                </span>
              )}
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span className="font-medium">Lines:</span>
                {item.startLine}-{item.endLine} ({item.lineCount} total)
              </span>

              <span className="flex items-center gap-1">
                <span className="font-medium">Complexity:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${getComplexityStyle()}`}>
                  {item.complexity.charAt(0).toUpperCase() + item.complexity.slice(1)}
                </span>
              </span>

              {/* Parameter count for functions/components */}
              {item.metadata.parameters.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Parameters:</span>
                  {item.metadata.parameters.length}
                </span>
              )}

              {/* Return type for functions */}
              {item.metadata.returnType && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Returns:</span>
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    {item.metadata.returnType}
                  </code>
                </span>
              )}

              {/* Async indicator */}
              {item.metadata.isAsync && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                  async
                </span>
              )}
            </div>

            {/* DocComment preview if available */}
            {item.metadata.docComment && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">
                {item.metadata.docComment}
              </p>
            )}
          </div>

          {/* Right section - expand icon */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
          {/* Parameters section */}
          {item.metadata.parameters.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Parameters</h4>
              <div className="space-y-1">
                {item.metadata.parameters.map((param, idx) => (
                  <div key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-gray-300">
                    <code className="bg-white px-2 py-1 rounded text-xs mr-2">
                      {param.name}
                    </code>
                    {param.type && (
                      <code className="bg-white px-1.5 py-0.5 rounded text-xs text-gray-600">
                        {param.type}
                      </code>
                    )}
                    {param.hasDefault && (
                      <span className="text-xs text-gray-500 ml-2">(has default)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return type section */}
          {item.metadata.returnType && (
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Return Type</h4>
              <code className="bg-white px-3 py-2 rounded text-sm block text-gray-700">
                {item.metadata.returnType}
              </code>
            </div>
          )}

          {/* DocComment section */}
          {item.metadata.docComment && (
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Documentation</h4>
              <div className="bg-white p-3 rounded text-sm text-gray-700 border-l-2 border-blue-300">
                <pre className="font-sans whitespace-pre-wrap break-words text-xs">
                  {item.metadata.docComment}
                </pre>
              </div>
            </div>
          )}

          {/* Code section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-900 text-sm">Code</h4>
              <button
                onClick={handleCopyCode}
                className="text-xs px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded transition"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <CodeHighlight
              code={item.code}
              language={getLanguage()}
              showLineNumbers={true}
              maxHeight="500px"
            />
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-gray-600 font-medium">Type</span>
              <p className="text-gray-900 font-semibold capitalize">{item.type}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-gray-600 font-medium">Complexity</span>
              <p className="text-gray-900 font-semibold capitalize">
                {item.complexity}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-gray-600 font-medium">Lines of Code</span>
              <p className="text-gray-900 font-semibold">{item.lineCount}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-gray-600 font-medium">Confidence</span>
              <p className="text-gray-900 font-semibold">
                {Math.round(item.confidence * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}