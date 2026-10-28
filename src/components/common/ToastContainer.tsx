import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400';
        let bgIconClass = 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400';
          bgIconClass = 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400';
          bgIconClass = 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400';
          bgIconClass = 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-200 animate-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${bgIconClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
