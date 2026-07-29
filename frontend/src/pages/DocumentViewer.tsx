import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import type { Document } from './Vault';

export default function DocumentViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/documents/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as Document[];
    },
  });

  const document = documents?.find(d => d.id === Number(id));

  useEffect(() => {
    if (document) {
      window.document.title = `${document.title} - MediVault`;
    } else {
      window.document.title = "Document Viewer | MediVault";
    }
  }, [document]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Document not found</h2>
        <button onClick={() => navigate('/vault')} className="mt-4 text-brand-600 hover:underline">
          Return to Vault
        </button>
      </div>
    );
  }

  const fileUrl = document.file_url.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${document.file_url}` : document.file_url;

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/vault')}
            className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Vault
          </button>
          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate max-w-md">
            {document.title}
          </h1>
        </div>
        <a 
          href={fileUrl}
          download
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </a>
      </div>

      {/* PDF Viewer using iframe */}
      <div className="flex-1 w-full relative">
        <iframe 
          src={`${fileUrl}#toolbar=0&navpanes=0`} 
          className="w-full h-full border-none absolute inset-0"
          title={document.title}
        />
      </div>
    </div>
  );
}
