
import React, { useState, useCallback } from 'react';
import { auditContract } from './services/geminiService';
import type { AuditReport } from './types';
import { PLACEHOLDER_CODE } from './constants';
import Loader from './components/Loader';
import AuditResult from './components/AuditResult';
import SparklesIcon from './components/icons/SparklesIcon';
import CodeIcon from './components/icons/CodeIcon';
import GithubIcon from './components/icons/GithubIcon';
import CodeEditor from './components/CodeEditor';

const App: React.FC = () => {
  const [contractCode, setContractCode] = useState<string>(PLACEHOLDER_CODE);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = useCallback(async () => {
    if (!contractCode.trim()) {
      setError("Contract code cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAuditReport(null);

    try {
      const report = await auditContract(contractCode);
      setAuditReport(report);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [contractCode]);

  const renderResultPanel = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full"><Loader /></div>;
    }
    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-center text-red-400 bg-red-900/30 rounded-lg p-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Audit Failed</h3>
            <p>{error}</p>
          </div>
        </div>
      );
    }
    if (auditReport) {
      return <AuditResult report={auditReport} />;
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-800/50 rounded-lg">
        <SparklesIcon className="w-16 h-16 text-blue-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">AI-Powered Security Audit</h2>
        <p className="text-gray-400 mt-2 max-w-md">
          Paste your Clarity smart contract code on the left and click "Audit Contract" to receive an instant, AI-driven security analysis.
        </p>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <CodeIcon className="h-8 w-8 text-blue-400"/>
              <h1 className="text-2xl font-bold text-white">ClarityShield AI Auditor</h1>
            </div>
            <a href="https://github.com/google/generative-ai-docs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <GithubIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Code Editor Panel */}
          <div className="flex flex-col bg-gray-800/50 rounded-lg border border-gray-700/50 shadow-xl">
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-xl font-semibold text-white">Smart Contract Code</h2>
            </div>
            <div className="flex-grow p-1 min-h-[500px] lg:min-h-0">
              <CodeEditor code={contractCode} onCodeChange={setContractCode} />
            </div>
            <div className="p-4 border-t border-gray-700/50">
              <button
                onClick={handleAudit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                <SparklesIcon className="w-5 h-5"/>
                <span>{isLoading ? 'Auditing...' : 'Audit Contract'}</span>
              </button>
            </div>
          </div>
          
          {/* Audit Result Panel */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 shadow-xl p-6 overflow-y-auto" style={{maxHeight: 'calc(100vh - 12rem)'}}>
            {renderResultPanel()}
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Powered by Google Gemini. This is not financial or security advice. Always conduct thorough manual audits.</p>
      </footer>
    </div>
  );
};

export default App;