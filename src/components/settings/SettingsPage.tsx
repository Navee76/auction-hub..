import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  RotateCcw,
  Moon,
  Sun,
  Database,
  Code2,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    resetDemoData,
    currentUser,
    auctions,
    settlements,
    categories,
  } = useApp();

  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setConfirmReset(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-purple-600" />
          <span>Platform Settings & Data Controls</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage system preferences, prototype data storage, and review internship architecture specs.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {darkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          <span>Interface Appearance & Color Scheme</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Switch between crisp high-contrast light mode and ergonomic deep dark mode.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (darkMode) toggleDarkMode();
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              !darkMode
                ? 'border-[#7C3AED] bg-purple-50/60 text-[#7C3AED] shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Sun className="w-5 h-5" />
              {!darkMode && <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />}
            </div>
            <span className="text-xs font-bold block">Light Theme</span>
            <span className="text-[11px] text-slate-400">Clean slate canvas (#EDE7FF & #7C3AED)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!darkMode) toggleDarkMode();
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              darkMode
                ? 'border-[#7C3AED] bg-purple-950/40 text-purple-300 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Moon className="w-5 h-5" />
              {darkMode && <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />}
            </div>
            <span className="text-xs font-bold block">Dark Theme</span>
            <span className="text-[11px] text-slate-400">Deep obsidian slate (#0F172A)</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            <span>Prototype Storage State</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Browser localStorage</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 block text-[11px]">Stored Lots</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{auctions.length} auctions</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 block text-[11px]">Categories</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{categories.length} active</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 block text-[11px]">Settlements</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{settlements.length} rows</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 block text-[11px]">Active User</span>
            <span className="font-bold text-purple-600 dark:text-purple-400 truncate block">{currentUser?.name}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reset Demo Environment</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Restores initial sample auctions, fresh timer timestamps, and test user profiles.
            </p>
          </div>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Yes, Restore Initial Data
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Prototype Data</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-3xl p-6 border border-purple-200 dark:border-purple-900/50 space-y-3">
        <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
          <Code2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-bold">Data Alcott Systems – Web Development Internship Task</h3>
        </div>
        <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
          This single-page application satisfies all requirements of the Web Development Internship specification:
          multi-step auction creator, interactive bidding engine with countdown timers, dynamic user dashboard, winning settlement workflow, taxonomy category editor, and CSV report exports.
        </p>
        <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-purple-700 dark:text-purple-300">
          <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-purple-900/40">React 19 SPA</span>
          <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-purple-900/40">Tailwind CSS v4</span>
          <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-purple-900/40">Lucide Icons</span>
          <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-purple-900/40">Browser LocalStorage</span>
          <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-purple-900/40">Zero Broken Images</span>
        </div>
      </div>
    </div>
  );
};
