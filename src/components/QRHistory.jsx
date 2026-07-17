import React from 'react';
import { Trash2, Download, Copy, ExternalLink, Calendar, KeyRound } from 'lucide-react';

const QRHistory = ({ history, onDelete, onSelect, addAlert }) => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addAlert('Copied to clipboard!', 'success');
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <KeyRound className="h-12 w-12 mx-auto text-slate-400 mb-4 stroke-1" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Generated QRs Yet</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Your generated static QR codes will appear here for easy access.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Generations</h2>
        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Stored locally ({history.length})
        </span>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                {/* Fallback rendering of simple QR */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(item.value)}`}
                  alt="QR Mini Preview"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">
                    {item.type || 'Text'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                  {item.value}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end sm:self-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item.value);
                }}
                title="Copy contents"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                title="Delete from history"
                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded-xl transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRHistory;
