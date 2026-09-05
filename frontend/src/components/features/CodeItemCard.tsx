import { useState } from 'react';
import { Artifact } from '../../types/extraction';
import CodeHighlight from '../common/CodeHighlight';

interface CodeItemCardProps {
  item: Artifact;
}

export default function CodeItemCard({ item }: CodeItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const getKindBadge = (): { bg: string; text: string } => {
    switch (item.kind) {
      case 'function': return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'arrow-function': return { bg: 'bg-indigo-100', text: 'text-indigo-800' };
      case 'class': return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
      case 'method': return { bg: 'bg-teal-100', text: 'text-teal-800' };
      case 'component': return { bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'constant': return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'variable': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const getRoleBadge = (): { bg: string; text: string } => {
    switch (item.role) {
      case 'rendering': return { bg: 'bg-pink-100', text: 'text-pink-800' };
      case 'data-processing': return { bg: 'bg-cyan-100', text: 'text-cyan-800' };
      case 'validation': return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'networking': return { bg: 'bg-sky-100', text: 'text-sky-800' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-800' };
    }
  };

  const getComplexityStyle = (): string => {
    switch (item.analysis.complexity) {
      case 'low': return 'bg-green-50 text-green-700 border border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'high': return 'bg-red-50 text-red-700 border border-red-200';
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
    if (item.kind === 'component' || item.role === 'rendering') {
      return item.code.includes('JSX.Element') || item.code.includes('React.FC') ? 'tsx' : 'jsx';
    }
    if (item.parameters.some((p) => p.type) || item.code.includes('interface ') || item.code.includes('type ')) {
      return 'typescript';
    }
    return 'javascript';
  };

  const kindBadge = getKindBadge();
  const roleBadge = getRoleBadge();
  
  // Helper to safely get documentation
  const primaryDoc = item.documentation.jsdoc?.description || 
                     item.documentation.leading[0] || 
                     item.documentation.inline[0] || null;

  return (
    <div className="border-2 border-brand-darkGreen/90 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 hover:bg-brand-cream/30 transition-colors focus:outline-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${kindBadge.bg} ${kindBadge.text} flex items-center gap-1 min-w-fit`}>
                {item.kind.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleBadge.bg} ${roleBadge.text} flex items-center gap-1 min-w-fit`}>
                {item.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              
              <h3 className="text-lg font-bold text-brand-darkGreen/90 truncate max-w-md">{item.name}</h3>
            </div>

            <div className="flex flex-wrap gap-4 text-sm mt-3">
              <span className="flex items-center gap-1">
                <span className="font-bold text-brand-darkGreen/90">Lines:</span>
                <span className="text-brand-brown/80">{item.source.startLine}-{item.source.endLine}</span>
              </span>
              
              <span className="flex items-center gap-1">
                <span className="font-bold text-brand-darkGreen/90">Complexity:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getComplexityStyle()}`}>
                  {item.analysis.complexity.toUpperCase()} ({item.analysis.cyclomaticComplexity})
                </span>
              </span>
              
              {item.parameters.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="font-bold text-brand-darkGreen/90">Params:</span>
                  <span className="text-brand-brown/80">{item.parameters.length}</span>
                </span>
              )}
              
              {item.returns.present && (
                <span className="flex items-center gap-1">
                  <span className="font-bold text-brand-darkGreen/90">Returns:</span>
                  <span className="text-brand-brown/80">{item.returns.count} path(s)</span>
                </span>
              )}
              
              {item.syntax.isAsync && (
                <span className="px-2 py-0.5 bg-brand-darkGreen/10 text-brand-darkGreen/90 border border-brand-darkGreen/30 rounded text-xs font-bold">
                  async
                </span>
              )}
              
              {item.parent && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-medium truncate max-w-[150px]">
                  child of: {item.parent.name}
                </span>
              )}
            </div>

            {primaryDoc && (
              <p className="text-xs text-brand-brown/80 mt-3 line-clamp-2 italic font-medium border-l-2 border-brand-mediumGreen/40 pl-2">
                {primaryDoc}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 ml-4">
            <span className="text-xs px-2 py-1 bg-brand-cream text-brand-brown/80 rounded font-bold border border-brand-brown/20 whitespace-nowrap">
              {Math.round(item.confidence.overall * 100)}% conf
            </span>
            <svg
              className={`w-5 h-5 text-brand-darkGreen/90 transition-transform flex-shrink-0 mt-2 ${
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
          
          {/* Documentation Block */}
          {(item.documentation.jsdoc || item.documentation.leading.length > 0) && (
            <div>
              <h4 className="font-bold text-brand-darkGreen/90 text-sm mb-2">Documentation</h4>
              <div className="bg-white p-3 rounded text-sm text-brand-brown/80 border-l-2 border-brand-brown/80 shadow-sm">
                {item.documentation.jsdoc ? (
                  <div className="space-y-2">
                    <p className="font-sans whitespace-pre-wrap break-words text-xs font-medium">
                      {item.documentation.jsdoc.description}
                    </p>
                    {item.documentation.jsdoc.tags.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        {item.documentation.jsdoc.tags.map((tag, idx) => (
                          <div key={idx} className="text-xs font-mono mb-1">
                            <span className="text-brand-darkGreen/80 font-bold mr-2">@{tag.tag}</span>
                            <span>{tag.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="font-sans whitespace-pre-wrap break-words text-xs font-medium">
                    {item.documentation.leading.join('\n')}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Parameters Block */}
          {item.parameters.length > 0 && (
            <div>
              <h4 className="font-bold text-brand-darkGreen/90 text-sm mb-2">Parameters</h4>
              <div className="space-y-2">
                {item.parameters.map((param, idx) => (
                  <div key={idx} className="text-sm pl-4 border-l-2 border-brand-mediumGreen/40 bg-white p-2 rounded shadow-sm flex items-center flex-wrap gap-2">
                    <code className="bg-brand-cream px-2 py-1 rounded text-xs border border-brand-brown/30 font-bold text-brand-darkGreen/90">
                      {param.name}
                    </code>
                    {param.type && (
                      <code className="bg-gray-50 px-1.5 py-0.5 rounded text-xs text-brand-brown/80 border border-brand-brown/30">
                        {param.type}
                      </code>
                    )}
                    {param.hasDefault && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                        default: {param.defaultValue}
                      </span>
                    )}
                    {param.isDestructured && (
                      <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                        destructured
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return Info Block */}
          {item.returns.present && (
            <div>
              <h4 className="font-bold text-brand-darkGreen/90 text-sm mb-2">Return Analysis</h4>
              <div className="bg-white p-3 rounded shadow-sm text-sm text-brand-brown/80 border border-brand-brown/20">
                <p className="text-xs font-medium mb-2">Detected <span className="font-bold text-brand-darkGreen/90">{item.returns.count}</span> distinct return path(s).</p>
                {item.returns.expressions.length > 0 && (
                  <div className="space-y-1">
                    {item.returns.expressions.map((expr, idx) => (
                      <code key={idx} className="block bg-gray-50 px-2 py-1 rounded text-xs text-brand-brown/80 border border-brand-brown/30 truncate">
                        return {expr}
                      </code>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Relationships / Calls Block */}
          {item.relationships.calls.length > 0 && (
            <div>
              <h4 className="font-bold text-brand-darkGreen/90 text-sm mb-2">Internal Calls</h4>
              <div className="flex flex-wrap gap-2">
                {item.relationships.calls.map((call, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-white border border-brand-brown/30 rounded-md text-brand-brown/80 font-mono shadow-sm">
                    {call}()
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Code Block */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-brand-darkGreen/90 text-sm">Source Code</h4>
              <button
                onClick={handleCopyCode}
                className="text-xs px-3 py-1 bg-brand-darkGreen/90 hover:bg-brand-mediumGreen text-brand-cream rounded font-bold transition-colors shadow-sm"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <CodeHighlight code={item.code} language={getLanguage()} showLineNumbers={true} maxHeight="500px" />
          </div>

          {/* Footer Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-4 border-t border-brand-darkGreen/10">
            <div className="bg-white p-2 rounded-lg border border-brand-brown/20 shadow-sm text-center">
              <span className="block text-brand-darkGreen/90 font-bold mb-1">Depth</span>
              <p className="text-brand-brown/80 font-bold">{item.scopeDepth}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-brand-brown/20 shadow-sm text-center">
              <span className="block text-brand-darkGreen/90 font-bold mb-1">Branches</span>
              <p className="text-brand-brown/80 font-bold">{item.analysis.branchCount}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-brand-brown/20 shadow-sm text-center">
              <span className="block text-brand-darkGreen/90 font-bold mb-1">Loops</span>
              <p className="text-brand-brown/80 font-bold">{item.analysis.loopCount}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-brand-brown/20 shadow-sm text-center">
              <span className="block text-brand-darkGreen/90 font-bold mb-1">Visibility</span>
              <p className="text-brand-brown/80 font-bold">{item.syntax.visibility}</p>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}