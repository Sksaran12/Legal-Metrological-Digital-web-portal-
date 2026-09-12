import React, { useEffect } from 'react';
import { ToastMessage } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X
} from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9998] flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-lg pointer-events-none items-center animate-in fade-in slide-in-from-top-4 duration-300">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    error: <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
  };

  const borders = {
    success: 'border-emerald-300 bg-white/95 ring-1 ring-emerald-500/20 shadow-emerald-500/10',
    warning: 'border-amber-300 bg-white/95 ring-1 ring-amber-500/20 shadow-amber-500/10',
    error: 'border-rose-400 bg-white/95 ring-2 ring-rose-500/20 shadow-rose-500/15',
    info: 'border-sky-300 bg-white/95 ring-1 ring-sky-500/20 shadow-sky-500/10'
  };

  const topBars = {
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600',
    error: 'bg-gradient-to-r from-rose-600 to-red-700',
    info: 'bg-gradient-to-r from-[#16a34a] to-[#0c2340]'
  };

  const type = toast.type || 'info';

  return (
    <div
      className={`pointer-events-auto w-full relative overflow-hidden flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.01] ${borders[type]}`}
    >
      {/* Top glowing statutory accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${topBars[type]}`} />

      {icons[type]}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <h5 className="font-extrabold text-sm text-[#0c2340] tracking-tight leading-tight">
            {toast.title}
          </h5>
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest shrink-0">
            {type}
          </span>
        </div>
        <p className="text-xs text-[#4e6073] mt-1 leading-relaxed">{toast.description}</p>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-gray-400 hover:text-[#0c2340] hover:bg-slate-100 rounded-lg shrink-0 transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
