/**
 * Code highlighting component
 * Displays code with syntax highlighting using react-syntax-highlighter
 */

import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodeHighlightProps {
  code: string;
  language?: 'javascript' | 'typescript' | 'jsx' | 'tsx';
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export default function CodeHighlight({
  code,
  language = 'javascript',
  showLineNumbers = true,
  maxHeight = '400px',
}: CodeHighlightProps) {
  const [copied, setCopied] = useState(false);

  /**
   * Handle copy code to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="relative group">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition opacity-0 group-hover:opacity-100"
        title="Copy code"
      >
        {copied ? (
          <>
            <span className="text-green-400">✓</span> Copied!
          </>
        ) : (
          <>
            <span>📋</span> Copy
          </>
        )}
      </button>

      {/* Syntax highlighted code */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <SyntaxHighlighter
          language={language}
          style={atomOneDark}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '16px',
            backgroundColor: '#282c34',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          lineNumberStyle={{
            color: '#6e7681',
            paddingRight: '16px',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}