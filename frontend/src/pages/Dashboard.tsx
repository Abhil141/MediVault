import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FileText, Pill, CalendarDays, ArrowUpRight, Loader2, Circle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HealthMetrics from '../components/dashboard/HealthMetrics';

interface Document {
  id: number;
  title: string;
  category: string;
  file_url: string;
  ai_summary: string;
  created_at: string;
  medications: any[];
}

interface Reminder {
  id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  active: boolean;
  document_id?: number;
}

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [greeting] = useState('Welcome back');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    document.title = "Dashboard — MediVault";
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.first_name) {
          setUserName(response.data.first_name);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchUser();
  }, [token]);

  const handleReminderClick = (documentId?: number) => {
    if (documentId) {
      navigate(`/vault?docId=${documentId}`);
    } else {
      navigate('/vault');
    }
  };

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/documents/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as Document[];
    },
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/reminders/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as Reminder[];
    },
  });

  const toggleReminder = useMutation({
    mutationFn: async (id: number) => {
      await axios.put(`http://localhost:8000/api/reminders/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const totalDocuments = documents?.length || 0;
  
  const totalMedications = documents?.reduce((acc, doc) => {
    return acc + (doc.medications ? doc.medications.length : 0);
  }, 0) || 0;

  const activeReminders = reminders?.filter(r => r.active) || [];

  const recentUploads = documents 
    ? [...documents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3)
    : [];

  const stats = [
    { name: 'Total Documents', value: totalDocuments.toString(), icon: FileText, change: 'Live count', changeType: 'neutral' },
    { name: 'Active Medications', value: totalMedications.toString(), icon: Pill, change: 'Extracted via AI', changeType: 'neutral' },
    { name: 'Active Reminders', value: activeReminders.length.toString(), icon: CalendarDays, change: 'Tracked', changeType: 'neutral' },
  ];

  const generateChartData = () => {
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        monthValue: d.getMonth(),
        yearValue: d.getFullYear(),
        name: d.toLocaleString('default', { month: 'short' }),
        uploads: 0
      };
    });

    if (documents && documents.length > 0) {
      documents.forEach(doc => {
        const date = new Date(doc.created_at);
        const m = date.getMonth();
        const y = date.getFullYear();
        
        const bucket = last6Months.find(b => b.monthValue === m && b.yearValue === y);
        if (bucket) {
          bucket.uploads += 1;
        }
      });
    }

    return last6Months;
  };

  const chartData = generateChartData();

  if (docsLoading || remindersLoading) {
    return (
      <div className="flex justify-center items-center h-full py-32">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500 font-sans">
      {/* Compact Clinical Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-5 px-6 sm:px-8 text-white shadow-lg shadow-indigo-500/10">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute right-20 -bottom-20 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting}{userName ? `, ${userName}` : ''}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl font-normal">
              Your personal medical records and health timeline are securely organized in your vault.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/vault')}
              className="h-10 px-5 rounded-xl bg-white text-indigo-950 font-bold text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Open Vault
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats / Vitals Monitors */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-md shadow-indigo-500/20">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{item.change}</span>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{item.value}</h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mt-1">{item.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <HealthMetrics />

      {/* Analytics & Reminders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <Activity className="w-5 h-5 mr-2.5 text-indigo-500 animate-pulse" />
                Clinical Upload Frequency
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Monthly document ingestion & AI analysis volume</p>
            </div>
            <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
              Last 6 Months
            </span>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-zinc-800/80" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.2)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-prose-body)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#4f46e5" strokeWidth={3.5} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar - Active Reminders */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-md flex flex-col h-full overflow-hidden">
            <div className="border-b border-slate-100 dark:border-zinc-800/80 px-6 py-5 flex items-center justify-between bg-slate-50/60 dark:bg-zinc-900/40">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">Active Reminders</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Prescription schedule</p>
                </div>
              </div>
              <span className="bg-indigo-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                {activeReminders.length}
              </span>
            </div>
            
            <div className="px-6 py-5 flex-1">
              {activeReminders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl flex items-center justify-center mb-3 text-slate-400 dark:text-zinc-500">
                    <Pill className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">No Active Medications</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-[180px]">Add prescriptions from your Medical Vault reports.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeReminders.map(rem => (
                    <div key={rem.id} className="group relative flex items-start p-4 bg-slate-50/80 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-zinc-900 transition-all cursor-pointer shadow-xs hover:shadow-md">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReminder.mutate(rem.id);
                        }} 
                        className="mt-0.5 mr-3.5 flex-shrink-0 text-slate-300 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors z-10 p-1 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="Mark as taken / dismiss reminder"
                      >
                        <Circle className="w-5 h-5 fill-current opacity-20 group-hover:opacity-100" />
                      </button>
                      <div className="flex-1 min-w-0" onClick={() => handleReminderClick(rem.document_id)}>
                        <p className="text-sm font-bold text-slate-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{rem.medicine_name}</p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                          {rem.dosage && <span className="bg-slate-200/70 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-slate-700 dark:text-zinc-300 font-bold">{rem.dosage}</span>}
                          {rem.frequency && <span>• {rem.frequency}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Health Timeline */}
      <div className="mt-12 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Clinical Health Timeline</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Chronological record of recent medical test reports and physician summaries</p>
          </div>
          <button
            onClick={() => navigate('/vault')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center"
          >
            View Full Clinical History →
          </button>
        </div>

        <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900/60 ml-4 space-y-8 pb-4">
          {recentUploads.length === 0 ? (
            <div className="pl-6 py-8 text-sm text-slate-500 dark:text-zinc-400 italic">No clinical records recorded yet. Upload a document in the Medical Vault to start generating your timeline.</div>
          ) : (
            recentUploads.map((doc) => (
              <div key={doc.id} className="relative pl-8">
                <div className="absolute -left-[9px] top-3 h-4 w-4 rounded-full border-[3px] border-white dark:border-zinc-950 bg-indigo-600 shadow-sm"></div>
                <div 
                  onClick={() => navigate(`/vault?docId=${doc.id}`)}
                  className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:border-indigo-400/60 dark:hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-base font-bold text-slate-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{doc.title}</h4>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                        {doc.category}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full self-start sm:self-auto">
                      {new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-zinc-300 mt-3 line-clamp-2 leading-relaxed font-normal">
                    {doc.ai_summary || "Document uploaded and processed successfully by MediVault AI Clinical Engine."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
