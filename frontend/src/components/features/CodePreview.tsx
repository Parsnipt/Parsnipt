import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { CodeItem } from '../../types';

interface Props {
  item: CodeItem;
}

export default function CodePreview({ item }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    // Stop the click from bubbling up and collapsing the window
    e.stopPropagation(); 
    navigator.clipboard.writeText(item.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeColors: Record<string, string> = {
    function: 'bg-blue-100 text-blue-800',
    component: 'bg-purple-100 text-purple-800',
    utility: 'bg-green-100 text-green-800',
    constant: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <div
        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${typeColors[item.type] || 'bg-gray-100 text-gray-800'}`}>
              {item.type}
            </span>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <span className="text-xs text-gray-500">
              {item.lineCount} lines
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCopy}
              className="text-sm font-medium text-primary-600 hover:text-primary-800 transition"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="h-[300px] w-full border-b border-gray-200">
            <Editor
              height="100%"
              language="typescript" // Defaults to TS to handle both JS and TS
              theme="vs-dark"
              value={item.code}
              options={{
                readOnly: true,
                minimap: { enabled: false }, // Hides the tiny side-map for a cleaner look
                scrollBeyondLastLine: false,
                fontSize: 14,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>
          <div className="p-4 bg-gray-50 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-500">Complexity:</span>
              <span className="ml-2 font-bold text-gray-900">{item.complexity}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Lines:</span>
              <span className="ml-2 font-bold text-gray-900">{item.startLine} - {item.endLine}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}