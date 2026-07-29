import React from 'react';
import { Shield, FileText, Database, Lock, UserCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="bg-transparent font-sans h-full">
      <div className="max-w-4xl mx-auto py-8">
        
        <Link to="/about" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium text-sm mb-10 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl w-max">
          <ArrowLeft className="w-4 h-4" />
          Back to About
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Last updated: July 29, 2026</p>
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="space-y-12 pb-12">
          
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">1. Introduction</h2>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-base">
              At MediVault, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our health record management services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">2. Information We Collect</h2>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mb-6 text-base">
              We may collect information about you in a variety of ways. The information we may collect includes:
            </p>
            <div className="bg-slate-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/80 space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Personal Data</h4>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 pl-3.5">Personally identifiable information, such as your name, email address, and demographic information that you voluntarily give to us when you register.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Health Data</h4>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 pl-3.5">Medical records, prescriptions, test reports, and other health-related documents that you choose to upload to your secure vault.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Derivative Data</h4>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 pl-3.5">Information our servers automatically collect when you access the site, such as your IP address, your browser type, and your operating system.</p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">3. Use of Your Information</h2>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mb-6 text-base">
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-base text-slate-600 dark:text-zinc-400">
              <li>Create and manage your account.</li>
              <li>Extract medical insights using AI (only processed securely and never shared with third-party advertising entities).</li>
              <li>Compile anonymous statistical data and analysis for internal use.</li>
              <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">4. Security of Information</h2>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-base">
              We use administrative, technical, and physical security measures to help protect your personal information. All health documents are encrypted at rest and in transit. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>
          </section>

          <section className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">5. Contact Us</h2>
            <p className="text-slate-700 dark:text-indigo-200 leading-relaxed text-base mb-6">
              If you have questions or comments about this Privacy Policy, you can reach us at our official helpdesk email.
            </p>
            <a href="mailto:medivault.helpdesk@gmail.com" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-sm">
              medivault.helpdesk@gmail.com
            </a>
          </section>

        </div>
      </div>
    </div>
  );
}
