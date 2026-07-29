import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Pill, BookOpen, ExternalLink, Calendar, Plus, Check, Loader2, Info } from 'lucide-react';
import type { Document } from '../../pages/Vault';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

interface DocumentDetailsModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentDetailsModal({ document, isOpen, onClose }: DocumentDetailsModalProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  // maps medication index -> reminder id
  const [addedMeds, setAddedMeds] = useState<Record<number, number>>({});
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Fetch reminders and pre-fill state when opening
  useEffect(() => {
    if (isOpen && document) {
      setShareLink(null);
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/reminders/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const activeMeds = res.data
          .filter((r: any) => r.document_id === document.id && r.active === true);
        
        const newlyAdded: Record<number, number> = {};
        document.medications?.forEach((med, idx) => {
          const match = activeMeds.find((r: any) => r.medicine_name?.toLowerCase() === med.medicine_name?.toLowerCase());
          if (match) {
            newlyAdded[idx] = match.id;
          }
        });
        setAddedMeds(newlyAdded);
      }).catch(() => toast.error("Failed to fetch reminders for pre-fill"));
    }
  }, [document?.id, isOpen, token]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      window.document.body.style.overflow = 'hidden';
    } else {
      window.document.body.style.overflow = 'unset';
    }
    return () => {
      window.document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !document) return null;

  const handleAddReminder = async (med: any, idx: number) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/reminders/`, {
        medicine_name: med.medicine_name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        document_id: document.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddedMeds(prev => ({ ...prev, [idx]: response.data.id }));
      toast.success('Reminder added to Dashboard');
    } catch (error) {
      toast.error('Failed to add reminder');
    }
  };

  const handleRemoveReminder = async (idx: number, reminderId: number) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/reminders/${reminderId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddedMeds(prev => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
      toast.success('Reminder removed');
    } catch (error) {
      toast.error('Failed to remove reminder');
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    setShareLink(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/shares/create`, {
        document_id: document.id,
        expires_in_days: 7
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const link = `${window.location.origin}/shared/${response.data.token}`;
      setShareLink(link);
    } catch (error) {
      toast.error('Failed to generate share link');
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success('Secure link copied to clipboard!');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md transition-opacity font-sans">
      <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ring-1 ring-slate-200 dark:ring-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Clinical Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-zinc-900 dark:to-indigo-950/20">
          <div className="flex items-center space-x-4 pr-4">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
              <FileText className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  {document.category}
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">•</span>
                <span className="flex items-center text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-500"/> 
                  {new Date(document.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-50 mt-1">{document.title}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <Link
              to={`/document/${document.id}/view`}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Open Document Viewer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Document</span>
            </Link>
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all shadow-sm cursor-pointer"
              title="Generate a 7-day encrypted share link for your physician"
            >
              {isSharing ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <ExternalLink className="w-4 h-4 text-indigo-500" />}
              <span className="hidden sm:inline">Share Report</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Share Link Input Banner */}
        {shareLink && (
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-cyan-950/40 px-6 py-4 border-b border-indigo-100 dark:border-indigo-900/60 flex items-start justify-between relative animate-in slide-in-from-top-2">
            <div className="flex-1 mr-8">
              <label className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block mb-1.5 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Secure Patient Share Link (Time-Limited: Expires in 7 Days)
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareLink} 
                  className="w-full bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-xs sm:text-sm font-mono px-3.5 py-2 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
                <button 
                  onClick={copyShareLink}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex-shrink-0 cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShareLink(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-zinc-950 flex flex-col md:flex-row">
          {/* Main Content (AI Summary, Medications, Glossary) */}
          <div className="p-6 sm:p-8 space-y-8 flex-1">
            
            {/* AI Summary Section */}
            <section className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-7 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-50 flex items-center">
                  <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mr-3">
                    ✨
                  </span>
                  AI Clinical Summary & Diagnostic Insights
                </h3>
                <div className="relative group ml-2 flex items-center">
                  <span className="inline-flex items-center text-[11px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full cursor-pointer hover:text-slate-600">
                    <Info className="w-3.5 h-3.5 mr-1" />
                    Medical Disclaimer
                  </span>
                  <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 text-slate-200 text-xs rounded-2xl shadow-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 pointer-events-none transition-all z-30 font-normal leading-relaxed border border-slate-700">
                    <strong className="text-amber-400">Clinical Disclaimer:</strong> This AI-generated clinical summary is extracted automatically for informational and tracking purposes only. It does not replace professional medical judgment or physician consultations.
                  </div>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-normal">
                {document.ai_summary || "No summary available for this document."}
              </div>
            </section>

            {/* Medications Section */}
            {document.medications && document.medications.length > 0 && (
              <section className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-50 flex items-center">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mr-3">
                      <Pill className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    Extracted Prescriptions & Dosage Tracker
                  </h3>
                  <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full">
                    {document.medications.length} Prescribed
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {document.medications.map((med, idx) => {
                    const reminderId = addedMeds[idx];
                    const isAdded = reminderId !== undefined;
                    return (
                      <div key={idx} className="p-5 bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 rounded-2xl flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-700/50 transition-all shadow-xs">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-extrabold text-base text-slate-900 dark:text-zinc-50">{med.medicine_name}</h4>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700 shadow-xs flex-shrink-0">
                              {med.frequency || 'Regular'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1.5">{med.dosage || 'Dosage as directed by physician'}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-2 flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {med.duration ? `Course duration: ${med.duration}` : 'Course duration ongoing / unspecified'}
                          </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-end">
                          {isAdded ? (
                            <button
                              onClick={() => handleRemoveReminder(idx, reminderId)}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-red-50 dark:bg-emerald-950/30 dark:hover:bg-red-950/40 text-emerald-700 hover:text-red-600 dark:text-emerald-400 dark:hover:text-red-400 text-xs font-bold rounded-xl border border-emerald-200/80 hover:border-red-200 dark:border-emerald-800/40 dark:hover:border-red-800/40 transition-all group w-full justify-center shadow-xs cursor-pointer"
                            >
                              <Check className="w-4 h-4 group-hover:hidden" />
                              <X className="w-4 h-4 hidden group-hover:block" />
                              <span className="group-hover:hidden">Active on Dashboard</span>
                              <span className="hidden group-hover:inline">Remove Reminder</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddReminder(med, idx)}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-sm hover:scale-[1.01] active:scale-95 w-full justify-center cursor-pointer"
                            >
                              <Plus className="w-4 h-4 stroke-[3]" />
                              <span>Add to Daily Reminders</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Medical Glossary Section */}
            {document.important_terms && document.important_terms.length > 0 && (
              <section className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-50 flex items-center">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 mr-3">
                      <BookOpen className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    Medical Terminology Glossary
                  </h3>
                  <span className="text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full">
                    {document.important_terms.length} Terms Defined
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {document.important_terms.map((term, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-xs flex flex-col justify-center">
                      <span className="text-sm font-extrabold text-purple-900 dark:text-purple-300 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" />
                        {term.term}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed pl-3.5 font-normal">{term.explanation}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>,
    window.document.body
  );
}
