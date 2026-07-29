import { useState, useEffect } from 'react';
import { Activity, Heart, Flame, BedDouble, Footprints, Droplets, Loader2, Plus, X, LineChart, Settings2, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface HealthData {
  id?: number;
  heartRate?: number;
  heartRateDate?: string;
  heartRateDay?: string;
  spO2?: number;
  spO2Date?: string;
  spO2Day?: string;
  steps?: number;
  stepsDate?: string;
  stepsDay?: string;
  sleepDuration?: number;
  sleepDate?: string;
  sleepDay?: string;
  calories?: number;
  caloriesDate?: string;
  caloriesDay?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  inputDate?: string; // Unified date input for the form
}

export default function HealthMetrics() {
  const navigate = useNavigate();
  const [data, setData] = useState<HealthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<HealthData>({
    inputDate: today,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/health-data/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load health metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const selectedDate = formData.inputDate || today;
      const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' });
      
      const payload = {
        ...formData,
        heartRateDate: formData.heartRate ? selectedDate : undefined,
        heartRateDay: formData.heartRate ? dayOfWeek : undefined,
        
        spO2Date: formData.spO2 ? selectedDate : undefined,
        spO2Day: formData.spO2 ? dayOfWeek : undefined,
        
        stepsDate: formData.steps ? selectedDate : undefined,
        stepsDay: formData.steps ? dayOfWeek : undefined,
        
        sleepDate: formData.sleepDuration ? selectedDate : undefined,
        sleepDay: formData.sleepDuration ? dayOfWeek : undefined,
        
        caloriesDate: formData.calories ? selectedDate : undefined,
        caloriesDay: formData.calories ? dayOfWeek : undefined,
      };

      await axios.post('http://localhost:8000/api/health-data/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Health data logged successfully!");
      setIsModalOpen(false);
      setFormData({ inputDate: today });
      fetchData();
    } catch (error) {
      toast.error("Failed to save health data");
    }
  };

  const confirmAction = (message: string, action: () => void) => {
    toast((t) => (
      <div className="flex flex-col gap-1.5 max-w-[240px]">
        <p className="text-[13px] font-medium text-slate-800 leading-tight m-0">{message}</p>
        <div className="flex gap-1.5 justify-end">
          <button 
            className="px-2 py-1 text-[11px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button 
            className="px-2 py-1 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            onClick={() => {
              toast.dismiss(t.id);
              action();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleDeleteByDate = (dateStr: string) => {
    confirmAction(`Are you sure you want to delete all health metrics recorded on ${dateStr}?`, async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/health-data/by-date?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Data for ${dateStr} deleted successfully`);
        fetchData();
      } catch (err) {
        toast.error("Failed to delete health data");
      }
    });
  };

  const handleDeleteById = (id: number) => {
    confirmAction(`Are you sure you want to delete this specific health data entry?`, async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/health-data/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Entry deleted successfully`);
        fetchData();
      } catch (err) {
        toast.error("Failed to delete health entry");
      }
    });
  };

  const handleClearAll = () => {
    confirmAction('WARNING: This will permanently delete ALL your health data history. Are you sure?', async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/health-data/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("All health data cleared");
        fetchData();
        setIsManageModalOpen(false);
      } catch (err) {
        toast.error("Failed to clear health data");
      }
    });
  };

  const getLatest = (field: keyof HealthData) => {
    if (!data.length) return '--';
    const validEntries = data.filter(d => d[field] !== null && d[field] !== undefined);
    if (!validEntries.length) return '--';
    validEntries.sort((a, b) => (b.id || 0) - (a.id || 0));
    return validEntries[0][field];
  };

  const getUniqueDates = () => {
    const dates = new Set<string>();
    data.forEach(d => {
      if (d.heartRateDate) dates.add(d.heartRateDate);
      if (d.spO2Date) dates.add(d.spO2Date);
      if (d.stepsDate) dates.add(d.stepsDate);
      if (d.sleepDate) dates.add(d.sleepDate);
      if (d.caloriesDate) dates.add(d.caloriesDate);
    });
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };
  
  const uniqueDates = getUniqueDates();

  const metrics = [
    { label: 'Heart Rate', value: getLatest('heartRate'), unit: 'bpm', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/20' },
    { label: 'SpO2 Level', value: getLatest('spO2'), unit: '%', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-500/20' },
    { label: 'Daily Steps', value: getLatest('steps'), unit: 'steps', icon: Footprints, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { label: 'Sleep', value: getLatest('sleepDuration'), unit: 'hrs', icon: BedDouble, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
    { label: 'Calories Burned', value: getLatest('calories'), unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20' },
    { label: 'Current BMI', value: getLatest('bmi'), unit: '', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-500" /> Vitals & Health Metrics
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsManageModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 border border-slate-200 dark:border-zinc-700"
          >
            <Settings2 className="w-4 h-4 text-slate-500" /> Manage Data
          </button>
          <button 
            onClick={() => navigate('/timeline')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95"
          >
            <LineChart className="w-4 h-4 text-indigo-500" /> View Full History
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Log Vitals
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="bg-white dark:bg-zinc-900/90 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center group hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
                <div className={`p-3 rounded-xl ${m.bg} ${m.color} mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{m.label}</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {m.value} <span className="text-sm font-medium text-slate-400">{m.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for manage data */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 w-full max-w-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-zinc-800 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-500" /> Manage Health Data Entries
              </h3>
              <button onClick={() => setIsManageModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {data.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-400 text-center py-6">No individual health data entries recorded yet.</p>
              ) : (
                data.slice().reverse().map(entry => {
                  // Determine the primary date for this entry (usually they share the same date if logged together)
                  const entryDate = entry.heartRateDate || entry.spO2Date || entry.stepsDate || entry.sleepDate || entry.caloriesDate || 'Unknown Date';
                  const formattedDate = entryDate !== 'Unknown Date' ? new Date(entryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
                  
                  return (
                    <div key={entry.id} className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                          Entry logged on {formattedDate}
                        </span>
                        <button 
                          onClick={() => entry.id && handleDeleteById(entry.id)}
                          className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                          title={`Delete this entry`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                        {entry.heartRate != null && (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Heart Rate</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{entry.heartRate} bpm</span>
                          </div>
                        )}
                        {entry.spO2 != null && (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">SpO2</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{entry.spO2} %</span>
                          </div>
                        )}
                        {entry.steps != null && (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Steps</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{entry.steps}</span>
                          </div>
                        )}
                        {entry.sleepDuration != null && (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Sleep</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{entry.sleepDuration} hrs</span>
                          </div>
                        )}
                        {entry.calories != null && (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Calories</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{entry.calories} kcal</span>
                          </div>
                        )}
                        {entry.bmi != null && (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">BMI</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{entry.bmi}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {data.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
                <button 
                  onClick={handleClearAll}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-xl transition-all active:scale-95 border border-red-200 dark:border-red-900/50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Clear All Health Data
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for data entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 w-full max-w-md shadow-2xl ring-1 ring-slate-200 dark:ring-zinc-800 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Vitals</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Date of Reading</label>
                 <input 
                   type="date" 
                   value={formData.inputDate} 
                   onChange={e => setFormData({...formData, inputDate: e.target.value})} 
                   className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                   required
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Heart Rate (bpm)</label>
                  <input type="number" value={formData.heartRate || ''} onChange={e => setFormData({...formData, heartRate: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">SpO2 (%)</label>
                  <input type="number" value={formData.spO2 || ''} onChange={e => setFormData({...formData, spO2: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Steps</label>
                  <input type="number" value={formData.steps || ''} onChange={e => setFormData({...formData, steps: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Sleep (hrs)</label>
                  <input type="number" step="0.1" value={formData.sleepDuration || ''} onChange={e => setFormData({...formData, sleepDuration: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Calories Burned</label>
                  <input type="number" value={formData.calories || ''} onChange={e => setFormData({...formData, calories: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Current BMI</label>
                  <input type="number" step="0.1" value={formData.bmi || ''} onChange={e => setFormData({...formData, bmi: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 mt-4">
                Save Vitals
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
