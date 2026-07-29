import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, GitCompare } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import type { Document } from '../../pages/Vault';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ComparisonModalProps {
  doc1: Document | null;
  doc2: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ComparisonModal({ doc1, doc2, isOpen, onClose }: ComparisonModalProps) {
  const { token } = useAuth();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && doc1 && doc2 && !markdown) {
      compareDocs();
    }
    if (!isOpen) {
      setMarkdown(null);
      setError(null);
    }
  }, [isOpen, doc1, doc2]);

  const compareDocs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/documents/compare`, {
        doc1_id: doc1!.id,
        doc2_id: doc2!.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMarkdown(response.data.markdown);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to compare documents.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md transition-opacity font-sans">
      <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col ring-1 ring-slate-200 dark:ring-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Clean Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white rounded-2xl shadow-md font-bold">
              <GitCompare className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Compare Reports</h2>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                <span className="text-indigo-300 font-semibold">{doc1?.title}</span>
                <span>vs.</span>
                <span className="text-cyan-300 font-semibold">{doc2?.title}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50 dark:bg-zinc-950">
          {isLoading ? (
            <div className="h-72 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <div className="text-center">
                <h4 className="text-base font-bold text-slate-900 dark:text-zinc-50">Analyzing reports...</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Comparing records side-by-side</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-72 flex items-center justify-center">
              <div className="text-center bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-md max-w-md">
                <p className="text-base font-bold text-red-600 dark:text-red-400 mb-2">Comparison Error</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">{error}</p>
                <button onClick={compareDocs} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer">Try Again</button>
              </div>
            </div>
          ) : (
            <div className="max-w-none space-y-4 bg-white dark:bg-zinc-900/90 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
              {markdown && (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 border-b pb-3 border-slate-200 dark:border-zinc-800 tracking-tight" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-8 mb-3 flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500 pl-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 py-2 rounded-r-xl" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mt-6 mb-2 text-purple-600 dark:text-purple-400" {...props} />,
                    p: ({node, ...props}) => <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed mb-4 font-normal" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-5 text-sm text-slate-700 dark:text-zinc-300 pl-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-5 text-sm text-slate-700 dark:text-zinc-300 pl-2" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed pl-1" {...props} />,
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-6 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                        <table className="w-full text-left text-xs sm:text-sm border-collapse" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-extrabold uppercase tracking-wider text-[11px]" {...props} />,
                    tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950/60" {...props} />,
                    tr: ({node, ...props}) => <tr className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors" {...props} />,
                    th: ({node, ...props}) => <th className="py-3.5 px-4 font-bold whitespace-nowrap text-indigo-900 dark:text-indigo-300" {...props} />,
                    td: ({node, ...props}) => <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300 align-top leading-relaxed" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 px-5 py-3.5 rounded-r-2xl my-5 text-slate-700 dark:text-zinc-300 italic font-medium shadow-xs" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-extrabold text-slate-900 dark:text-white" {...props} />
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900 flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>,
    window.document.body
  );
}
