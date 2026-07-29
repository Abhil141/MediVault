import React from 'react';
import { Mail, ArrowRight, ArrowLeft, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <div className="bg-transparent font-sans h-full">
      <div className="max-w-5xl mx-auto py-8">
        
        <Link to="/about" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium text-sm mb-10 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl w-max">
          <ArrowLeft className="w-4 h-4" />
          Back to About
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl">
            Need help with your vault, or encountered an issue with our AI? Our team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Email Support Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-3">Help Desk Support</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-base leading-relaxed mb-8 flex-1">
              For any questions regarding your account, data extraction errors, or general inquiries, email our helpdesk directly.
            </p>
            <a 
              href="mailto:medivault.helpdesk@gmail.com" 
              className="inline-flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-2xl text-indigo-600 dark:text-indigo-400 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors group"
            >
              medivault.helpdesk@gmail.com
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </a>
          </div>

          {/* Technical Issues Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-6">
              <Bug className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-3">Report a Bug</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-base leading-relaxed mb-8 flex-1">
              If you found a technical issue while uploading a document or using the MediHelp AI, please send us a detailed bug report.
            </p>
            <a 
              href="mailto:medivault.helpdesk@gmail.com?subject=Bug Report" 
              className="inline-flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-2xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors group"
            >
              Submit Bug Report
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
