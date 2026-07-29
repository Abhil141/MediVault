import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, File, Search, Plus, Loader2, Trash2, GitCompare, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import DocumentDetailsModal from '../components/documents/DocumentDetailsModal';
import ComparisonModal from '../components/documents/ComparisonModal';

export interface Document {
  id: number;
  title: string;
  category: string;
  file_url: string;
  ai_summary: string;
  created_at: string;
  medications?: any[];
  important_terms?: any[];
}

export default function Vault() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Compare Mode State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Document[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Vault — MediVault";
  }, []);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/documents/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as Document[];
    },
  });


  // Automatically open document if docId is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const docId = params.get('docId');
    if (docId && documents) {
      const docToOpen = documents.find(d => d.id === Number(docId));
      if (docToOpen && (!selectedDoc || selectedDoc.id !== docToOpen.id)) {
        setSelectedDoc(docToOpen);
        // Clear the query parameter so it doesn't re-trigger if they close and do something else
        navigate('/vault', { replace: true });
      }
    }
  }, [location.search, documents, navigate, selectedDoc]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:8000/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Document deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.')[0] || 'Untitled');
    formData.append('category', 'Uncategorized');

    try {
      const loadingToast = toast.loading('Uploading document...');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/documents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.dismiss(loadingToast);
      toast.success('Document uploaded and analyzed successfully!');
      setIsUploadModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCardClick = (doc: Document) => {
    if (isCompareMode) {
      setSelectedForComparison(prev => {
        if (prev.find(d => d.id === doc.id)) {
          return prev.filter(d => d.id !== doc.id); // Deselect
        }
        if (prev.length >= 2) {
          toast.error("You can only compare 2 documents at a time.");
          return prev;
        }
        return [...prev, doc]; // Select
      });
    } else {
      setSelectedDoc(doc);
    }
  };

  const filteredDocs = documents?.filter(d => {
    const query = searchQuery.toLowerCase();
    
    // Search Title and Category
    if (d.title.toLowerCase().includes(query) || d.category.toLowerCase().includes(query)) return true;
    
    // Search AI Summary
    if (d.ai_summary && d.ai_summary.toLowerCase().includes(query)) return true;
    
    // Search Medications
    if (d.medications) {
      const matchMed = d.medications.some(med => 
        med.medicine_name?.toLowerCase().includes(query) ||
        med.dosage?.toLowerCase().includes(query)
      );
      if (matchMed) return true;
    }

    // Search Important Terms
    if (d.important_terms) {
      const matchTerm = d.important_terms.some(term => 
        term.term?.toLowerCase().includes(query) ||
        term.explanation?.toLowerCase().includes(query)
      );
      if (matchTerm) return true;
    }
    
    return false;
  });

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500 font-sans">
      {/* Compact Clinical Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-5 px-6 sm:px-8 text-white shadow-lg shadow-indigo-500/10">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Clinical Records
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl font-normal">
              Securely store, organize, and analyze clinical reports, lab results, and physician notes with instant AI insight extraction.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button 
              onClick={() => {
                setIsCompareMode(!isCompareMode);
                if (isCompareMode) {
                  setSelectedForComparison([]);
                }
              }}
              className={`h-10 inline-flex items-center justify-center px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                isCompareMode 
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 scale-105" 
                  : "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 mr-2 shrink-0" />
              <span>{isCompareMode ? "Exit Compare Mode" : "Compare Reports"}</span>
            </button>
            
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="h-10 inline-flex items-center justify-center rounded-xl bg-white hover:bg-blue-50 px-4 text-xs sm:text-sm font-bold text-indigo-950 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-2 stroke-[3] text-indigo-600" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-zinc-100 transition-all shadow-sm"
            placeholder="Search medical records by diagnosis, medication, title, or AI clinical keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Comparison Inline Banner */}
      {isCompareMode && (
        <div className="bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                Compare Medical Reports Side-by-Side
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
                Select exactly 2 documents below for AI clinical comparison. <span className="font-bold text-indigo-600 dark:text-indigo-400">({selectedForComparison.length}/2 selected)</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedForComparison([])}
              disabled={selectedForComparison.length === 0}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all disabled:opacity-0 cursor-pointer"
            >
              Clear Selection
            </button>
            <button 
              onClick={() => setIsComparisonModalOpen(true)}
              disabled={selectedForComparison.length !== 2}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 disabled:shadow-none disabled:cursor-not-allowed hover:bg-indigo-700 cursor-pointer flex items-center space-x-2 shrink-0"
            >
              <span>Compare {selectedForComparison.length === 2 ? 'Selected' : `(${selectedForComparison.length}/2)`}</span>
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : filteredDocs?.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-4 shadow-inner">
            <Search className="h-8 w-8 stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">No medical records found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">Try adjusting your search query, or upload a new document above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs?.map((doc) => {
            const isSelectedForCompare = selectedForComparison.some(d => d.id === doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => handleCardClick(doc)}
                className={`group flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer relative ${
                  isSelectedForCompare 
                    ? "border-indigo-600 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/30 shadow-xl ring-2 ring-indigo-500/40 -translate-y-1" 
                    : isCompareMode
                      ? "border-slate-200/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30 opacity-60 hover:opacity-100 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm saturate-50 hover:saturate-100"
                      : "border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400/60 dark:hover:border-indigo-500/50"
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                
                <button 
                  onClick={(e) => handleDelete(doc.id, e)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="p-6 flex items-start space-x-4 pr-12">
                  <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 p-3.5 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50 group-hover:scale-110 transition-transform">
                    <File className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-slate-900 dark:text-zinc-50 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {doc.title}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 mt-1 flex items-center">
                      <span>Uploaded on {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </p>
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase text-slate-600 dark:text-zinc-300 mt-3 border border-slate-200/60 dark:border-zinc-700/60">
                      {doc.category}
                    </span>
                  </div>
                </div>

                {doc.ai_summary && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-zinc-800 leading-relaxed">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px] block mb-1">
                        ✨ AI Clinical Insight
                      </span>
                      {doc.ai_summary}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Document Details Modal */}
      <DocumentDetailsModal 
        document={selectedDoc} 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
      />
      
      <ComparisonModal
        doc1={selectedForComparison[0] || null}
        doc2={selectedForComparison[1] || null}
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
      />

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Medical Record</h2>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <Trash2 className="w-5 h-5 opacity-0 absolute" /> {/* Dummy to keep size */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 p-10 flex flex-col items-center justify-center text-center overflow-hidden ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01] shadow-lg shadow-indigo-500/10' 
                    : 'border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-zinc-900'
                }`}
              >
                {isDragging && <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 backdrop-blur-[1px] pointer-events-none" />}
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${isDragging ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600'}`}>
                  <UploadCloud className="w-8 h-8 stroke-[2]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {isDragging ? 'Drop document here to upload' : 'Drag & drop your medical record here'}
                </h3>
                <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mb-6">
                  Supported files: PDF, JPG, JPEG, PNG. Our MediHelp AI will automatically extract clinical insights.
                </p>
                
                <label className="inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>Browse Files Instead</span>
                    </>
                  )}
                  <input 
                    id="file-upload-modal"
                    type="file" 
                    className="hidden" 
                    onChange={handleUpload}
                    accept=".pdf,.jpg,.jpeg,.png" 
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
