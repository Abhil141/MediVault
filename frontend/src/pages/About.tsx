import React from 'react';
import { Shield, Database, Brain, Activity, Clock, FileText, Lock, Smartphone, Search, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-6 sm:px-10 lg:px-16 font-sans">
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight mb-4">
          About MediVault
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-zinc-400 max-w-4xl mx-auto leading-relaxed">
          Your intelligent, secure, and comprehensive personal health record system. MediVault was built to bridge the gap between complex medical systems and patient accessibility, giving you the power to own, understand, and control your health data.
        </p>
      </div>

      {/* Core Features Grid - Now 3 columns, smaller text/padding to use space densely */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Secure Document Vault</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
              Store and organize all medical records in one secure location. Your sensitive data is protected through secure authentication.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">MediHelp AI</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
              Our intelligent clinical assistant references verified public health data to answer your health queries quickly and reliably.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Clinical Timeline</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
              Visualize your medical history chronologically. Track doctor visits, prescriptions, and health events over time.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Health Dashboard</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
              A comprehensive overview of your active medications, upcoming reminders, and recent records.
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Search</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
              Find exactly what you're looking for across hundreds of documents instantly with our powerful semantic search engine.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Accessible Anywhere</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
              Your data is synced seamlessly across your desktop and mobile devices. Always have your records in your pocket.
            </p>
          </div>
        </div>
      </div>

      {/* How it Works / Security split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        
        {/* How it works */}
        <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">How it Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Upload Your Records</h4>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Simply drag and drop your PDFs, lab results, and prescriptions directly into the vault.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">AI Analyzes the Data</h4>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Our intelligent system automatically extracts key details, tags, and dates without manual entry.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Access & Chat</h4>
                <p className="text-sm text-slate-600 dark:text-zinc-400">View your timeline, search instantly, or ask the MediHelp AI questions about your personal health data.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Commitment */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-zinc-900 dark:to-black rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <Lock className="w-8 h-8 text-indigo-400 mb-6" />
          <h2 className="text-xl font-bold mb-4">Bank-Grade Security</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Health data is the most sensitive information you own. That's why we built MediVault with a zero-compromise approach to security.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Secure storage for all your uploaded medical files.
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Your personal queries are never used to train public AI models.
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Strictly access-controlled through modern authentication standards.
            </li>
          </ul>
        </div>
      </div>
      
      {/* Footer */}
      <div className="pt-6 pb-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 dark:text-zinc-500">
        <p>© 2026 MediVault. All rights reserved.</p>
        <div className="flex gap-6 mt-4 sm:mt-0 font-medium">
          <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};

export default About;
