import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Home, Folder, LogOut, Activity, Sun, Moon, ShieldCheck, User, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';

export default function DashboardLayout() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--mouse-x', `${e.clientX}`);
      containerRef.current.style.setProperty('--mouse-y', `${e.clientY}`);
    }
  };

  const navItems = [
    { name: 'Health Dashboard', path: '/', icon: Home },
    { name: 'Clinical Records', path: '/vault', icon: Folder },
    { name: 'MediHelp AI', path: '/chat', icon: Sparkles },
    { name: 'About MediVault', path: '/about', icon: ShieldCheck },
  ];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="flex h-screen bg-slate-200 dark:bg-zinc-950 bg-dots mouse-glow transition-colors duration-300 font-sans overflow-hidden"
    >
      {/* Sidebar */}
      <aside 
        className={`group ${isCollapsed ? 'w-20' : 'w-72'} border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col z-20 shadow-xl dark:shadow-none transition-all duration-300 relative shrink-0 absolute md:relative h-full`}
      >
        {/* Brand Header */}
        <div className={`p-6 border-b border-slate-100 dark:border-zinc-800/80 flex items-center h-[96px] relative ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}>
          <Link to="/" className={`flex items-center space-x-3 hover:opacity-90 transition-opacity ${isCollapsed ? 'ml-0' : 'ml-2'}`}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-800 to-purple-700 flex items-center justify-center shadow-md shadow-indigo-900/30 dark:shadow-indigo-900/50 text-white shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-200 min-w-0">
                <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-300 bg-clip-text text-transparent truncate block">
                  MediVault
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 truncate">
                  Secure Health Vault
                </p>
              </div>
            )}
          </Link>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-9 p-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-sm z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              Menu
            </p>
          )}
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center ${isCollapsed ? 'justify-center py-3 px-2' : 'justify-between px-4 py-2.5'} text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 shrink-0 ${!isCollapsed ? 'mr-3' : ''} ${isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Account & Footer Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/20 space-y-3">
          {!isCollapsed ? (
            <Link to="/profile" className="flex items-center space-x-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800 shadow-xs transition-colors cursor-pointer block">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">My Account</p>
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">Profile Settings</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex justify-center">
              <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity font-bold text-sm shadow-inner" title="My Account">
                <User className="w-5 h-5" />
              </Link>
            </div>
          )}

          <div className={`grid ${isCollapsed ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-2'} pt-1`}>
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200/60 dark:border-zinc-800 shadow-xs transition-all cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className={`w-3.5 h-3.5 ${!isCollapsed ? 'mr-1.5' : ''} text-indigo-600`} />
                  {!isCollapsed && "Dark"}
                </>
              ) : (
                <>
                  <Sun className={`w-3.5 h-3.5 ${!isCollapsed ? 'mr-1.5' : ''} text-amber-400`} />
                  {!isCollapsed && "Light"}
                </>
              )}
            </button>
            
            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center justify-center px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg border border-red-200/60 dark:border-red-900/40 shadow-xs transition-all cursor-pointer"
            >
              <LogOut className={`w-3.5 h-3.5 ${!isCollapsed ? 'mr-1.5' : ''}`} />
              {!isCollapsed && "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto relative z-10 flex flex-col ${location.pathname === '/chat' ? 'p-2 sm:p-4' : 'p-6 sm:p-10'}`}>
        <div className={`w-full ${location.pathname === '/chat' ? 'flex-1 flex flex-col max-w-none' : 'max-w-7xl mx-auto'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
