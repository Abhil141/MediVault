import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, FileText, Pill, BookOpen, AlertTriangle, ShieldCheck, Info, Download } from 'lucide-react';
import type { Document } from './Vault';

export default function SharedDocumentView() {
  const { token } = useParams<{ token: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.document.title = "Shared Medical Record | MediVault";
    
    const fetchDocument = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/shares/${token}`);
        setDocument(response.data);
      } catch (err: any) {
        if (err.response?.status === 410) {
          setError("This shared link has expired.");
        } else if (err.response?.status === 404) {
          setError("Invalid or expired share link.");
        } else {
          setError("Failed to load shared document.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [token]);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!document) return;
    setIsDownloading(true);
    try {
      const url = document.file_url?.startsWith('/uploads') 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${document.file_url}` 
        : document.file_url;
        
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.download = `${document.title}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download file:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center flex-col space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-zinc-600">Verifying secure link...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 text-center">
          <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Access Denied</h2>
          <p className="text-zinc-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">MediVault <span className="text-brand-600 font-normal">Secure Share</span></span>
          </div>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center space-x-2 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isDownloading ? "Downloading..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Title Card */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex items-start space-x-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{document.title}</h1>
            <p className="text-zinc-500 mt-1">Uploaded on {new Date(document.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-zinc-900">AI Clinical Summary</h3>
            <div className="relative group ml-2 flex items-center">
              <Info className="w-4 h-4 text-zinc-400 hover:text-zinc-600 cursor-pointer" />
              <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-zinc-800 text-zinc-200 text-xs rounded shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 pointer-events-none transition-all z-20">
                <strong>Disclaimer:</strong> This AI-generated summary is for informational purposes only and does not constitute medical advice. Always consult with a healthcare provider.
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-zinc-700 leading-relaxed">{document.ai_summary}</p>
          </div>
        </div>

        {/* Medications */}
        {document.medications && document.medications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center space-x-2">
              <Pill className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-zinc-900">Prescribed Medications</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="px-6 py-3 font-medium text-zinc-500">Medicine</th>
                    <th className="px-6 py-3 font-medium text-zinc-500">Dosage</th>
                    <th className="px-6 py-3 font-medium text-zinc-500">Frequency</th>
                    <th className="px-6 py-3 font-medium text-zinc-500">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {document.medications.map((med, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-4 font-medium text-zinc-900">{med.medicine_name}</td>
                      <td className="px-6 py-4 text-zinc-600">{med.dosage || '-'}</td>
                      <td className="px-6 py-4 text-zinc-600">{med.frequency || '-'}</td>
                      <td className="px-6 py-4 text-zinc-600">{med.duration || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Glossary */}
        {document.important_terms && document.important_terms.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-12">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-zinc-900">Medical Glossary</h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {document.important_terms.map((term, idx) => (
                  <div key={idx} className="bg-zinc-50 rounded-lg p-4">
                    <h4 className="font-semibold text-zinc-900">{term.term}</h4>
                    <p className="text-zinc-600 mt-1">{term.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}</div>
    </div>
  );
}
