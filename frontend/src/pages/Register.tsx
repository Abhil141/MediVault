import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => `${err.loc.slice(-1)}: ${err.msg}`).join(', ');
        }
        throw new Error(errorMessage);
      }

      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950 font-sans">
      
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-300 dark:bg-zinc-900 overflow-hidden items-center justify-center border-r border-slate-400 dark:border-transparent">
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-900 dark:via-indigo-950 dark:to-zinc-950"></div>
        <div className="absolute inset-0 bg-dots opacity-40 dark:opacity-20"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-800/20 dark:bg-indigo-900/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-700/20 dark:bg-cyan-900/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-lg px-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-700 via-indigo-800 to-purple-700 shadow-2xl shadow-indigo-900/30 dark:shadow-indigo-900/50 text-white mb-8">
            <Activity className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Welcome to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 dark:from-indigo-500 dark:to-purple-400">MediVault.</span>
          </h1>
          <p className="text-lg text-slate-700 dark:text-indigo-100/80 leading-relaxed mb-12 font-medium">
            Store your medical records securely, extract clinical insights using AI, and organize your health timeline in one encrypted vault.
          </p>
          
          <div className="flex items-center gap-4 text-indigo-900 bg-white/40 dark:text-indigo-200/60 dark:bg-indigo-950/30 w-max px-6 py-3 rounded-full border border-white/50 dark:border-indigo-500/20 backdrop-blur-md">
             <ShieldCheck className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
             <span className="text-xs font-bold uppercase tracking-widest">Enterprise-Grade Security</span>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 lg:top-8 lg:right-8 p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="max-w-md w-full px-8 py-12 relative z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden text-center mb-10">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/30 text-white mb-6">
              <Activity className="w-8 h-8" />
             </div>
             <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
               MediVault
             </h2>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create an Account</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">
              Join MediVault to securely manage your medical reports and generate AI-driven summaries.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 ml-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 ml-1">Last Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full px-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_8px_30px_rgb(79,70,229,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-4"
            >
              {loading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                 <>
                   Create Account <ArrowRight className="w-4 h-4 stroke-[3]" />
                 </>
              )}
            </button>
          </form>

          
          {/* Footer Link */}
          <div className="mt-10 text-center text-sm font-semibold">
             <span className="text-slate-500 dark:text-zinc-500">Already have an account? </span>
             <button
               onClick={() => navigate('/login')}
               className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
             >
               Sign in securely
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
