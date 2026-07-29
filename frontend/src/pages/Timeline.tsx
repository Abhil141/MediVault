import { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Flame, BedDouble, Footprints, Droplets, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none min-w-[120px]">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          let unit = '';
          if (entry.dataKey === 'heartRate') unit = 'bpm';
          if (entry.dataKey === 'spO2') unit = '%';
          if (entry.dataKey === 'steps') unit = 'steps';
          if (entry.dataKey === 'sleepDuration') unit = 'hrs';
          if (entry.dataKey === 'calories') unit = 'kcal';
          
          return (
            <div key={`item-${index}`} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
              <p className="text-xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-1">
                {entry.value}
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{unit}</span>
              </p>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function Timeline() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/health-data/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Transform data for charts
        const transformedData = response.data.map((item: any) => {
           const dateStr = item.heartRateDate || item.spO2Date || item.stepsDate || item.sleepDate || item.caloriesDate || new Date(item.created_at).toISOString().split('T')[0];
           
           return {
             ...item,
             displayDate: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
           };
        });

        transformedData.sort((a: any, b: any) => new Date(a.displayDate).getTime() - new Date(b.displayDate).getTime());

        setData(transformedData);
      } catch (error) {
        toast.error("Failed to fetch health data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" /> Health Timeline
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Detailed historical view of your vital metrics</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-10 text-center border border-slate-200 dark:border-zinc-800 shadow-sm">
          <Activity className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Health Data Found</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">Log your vitals on the dashboard to see your timeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Heart Rate Chart */}
          <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-rose-500" /> Heart Rate (bpm)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.filter(d => d.heartRate)}>
                  <defs>
                    <linearGradient id="colorHeartRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-zinc-800/80" />
                  <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f43f5e', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }} />
                  <Area type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorHeartRate)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SpO2 Chart */}
          <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Droplets className="w-5 h-5 text-cyan-500" /> SpO2 Levels (%)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.filter(d => d.spO2)}>
                  <defs>
                    <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-zinc-800/80" />
                  <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }} />
                  <Area type="monotone" dataKey="spO2" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSpO2)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Steps Chart */}
          <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Footprints className="w-5 h-5 text-emerald-500" /> Daily Steps
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.filter(d => d.steps)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-zinc-800/80" />
                  <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
                  <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Chart */}
          <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <BedDouble className="w-5 h-5 text-indigo-500" /> Sleep Duration (hrs)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.filter(d => d.sleepDuration)}>
                  <defs>
                    <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-zinc-800/80" />
                  <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis domain={[0, 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }} />
                  <Area type="monotone" dataKey="sleepDuration" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calories Chart */}
          <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Flame className="w-5 h-5 text-orange-500" /> Calories Burned (kcal)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.filter(d => d.calories)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-zinc-800/80" />
                  <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }} />
                  <Bar dataKey="calories" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
