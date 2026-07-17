import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Alert = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
    error: 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md animate-slide-in ${styles[type]}`}>
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
        <X className="h-4 w-4 opacity-60 hover:opacity-100" />
      </button>
    </div>
  );
};

export default Alert;
