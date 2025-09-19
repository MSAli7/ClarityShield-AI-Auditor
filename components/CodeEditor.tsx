import React, { useRef } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// Fix: Changed to default import for vscDarkPlus style object.
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import clarity from 'react-syntax-highlighter/dist/esm/languages/prism/clarity';

SyntaxHighlighter.registerLanguage('clarity', clarity);

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // The ref is attached to the `code` tag, which is an HTMLElement.
  const codeRef = useRef<HTMLElement>(null);

  const handleScroll = () => {
    const textarea = textareaRef.current;
    // The scrollable container is the parent of the `code` element, which is the `pre` tag.
    const highlighterContainer = codeRef.current?.parentElement;
    
    if (textarea && highlighterContainer) {
      highlighterContainer.scrollTop = textarea.scrollTop;
      highlighterContainer.scrollLeft = textarea.scrollLeft;
    }
  };

  const commonStyle: React.CSSProperties = {
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: '14px',
    lineHeight: '1.6',
    padding: '1rem',
    margin: 0,
    whiteSpace: 'pre',
    overflow: 'auto',
    minHeight: '100%',
    width: '100%',
  };
  
  const modifiedVscDarkPlus = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
        ...vscDarkPlus['pre[class*="language-"]'],
        ...commonStyle,
        backgroundColor: 'transparent',
    },
    'code[class*="language-"]': {
        ...vscDarkPlus['code[class*="language-"]'],
         backgroundColor: 'transparent',
    }
  };
  
  // Adjust textarea padding to align with code when line numbers are shown
  const textareaStyle: React.CSSProperties = {
    ...commonStyle,
    // This value is calculated to align the textarea's text with the
    // syntax-highlighted code. It accounts for the original padding (1rem)
    // plus the space taken by the line numbers (approx 3.25em).
    paddingLeft: '4.5em',
  };

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        onScroll={handleScroll}
        placeholder=";; Paste your Clarity contract code here..."
        className="absolute top-0 left-0 w-full h-full bg-transparent text-transparent caret-white resize-none border-0 focus:outline-none z-10"
        style={textareaStyle}
        spellCheck="false"
      />
      <SyntaxHighlighter
        language="clarity"
        style={modifiedVscDarkPlus}
        showLineNumbers
        lineNumberStyle={{
          minWidth: '2.25em',
          paddingRight: '1em',
          textAlign: 'right',
          userSelect: 'none',
          color: '#6b7280', // Tailwind's gray-500
        }}
        codeTagProps={{
          ref: codeRef,
          style: {
            display: 'block',
          }
        }}
        className="pointer-events-none"
      >
        {/* Add a newline to prevent last line from being cut off and ensure scrollbar appears */}
        {code + '\n'}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeEditor;
