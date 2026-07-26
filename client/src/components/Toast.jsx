import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    },
    error: {
      bg: 'bg-rose-950/90 border-rose-500/30 text-rose-200',
      icon: <AlertCircle className="h-5 w-5 text-rose-400" />
    },
    info: {
      bg: 'bg-indigo-950/90 border-indigo-500/30 text-indigo-200',
      icon: <Info className="h-5 w-5 text-indigo-400" />
    }
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-up ${currentStyle.bg}`}>
      {currentStyle.icon}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors">
        <X className="h-4 w-4 opacity-70 hover:opacity-100" />
      </button>
    </div>
  );
}
