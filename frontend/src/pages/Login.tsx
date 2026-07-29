import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      login(data.access_token);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetToken = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send token");
      
      toast.success(data.message);
      setResetStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reset password");
      
      toast.success(data.message);
      setShowForgotModal(false);
      setResetStep(1);
      setResetEmail('');
      setResetToken('');
      setNewPassword('');
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
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sign In</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
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
              <div className="flex items-center justify-between mb-2 ml-1 pr-1">
                 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Password</label>
                 <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Forgot password?</button>
              </div>
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
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_8px_30px_rgb(79,70,229,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-2"
            >
              {loading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                 <>
                   Sign In <ArrowRight className="w-4 h-4 stroke-[3]" />
                 </>
              )}
            </button>
          </form>

          
          {/* Footer Link */}
          <div className="mt-10 text-center text-sm font-semibold">
             <span className="text-slate-500 dark:text-zinc-500">Don't have an account? </span>
             <button
               onClick={() => navigate('/register')}
               className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
             >
               Create a secure account
             </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h3>
            
            {resetStep === 1 ? (
              <>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Enter your email address to receive a password reset token.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendResetToken}
                      disabled={loading || !resetEmail}
                      className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Token'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Enter the reset token you received and your new password.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Reset Token</label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest font-mono"
                      placeholder="123456"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowForgotModal(false);
                        setResetStep(1);
                      }}
                      className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={loading || !resetToken || !newPassword}
                      className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Reset'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
