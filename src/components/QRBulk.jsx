import React, { useState } from 'react';
import { Download, Play, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import JSZip from 'jszip';
import QRCodeStyling from 'qr-code-styling';

const QRBulk = ({ isPro, addAlert }) => {
  const [inputText, setInputText] = useState('');
  const [qrList, setQrList] = useState([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!isPro) {
      addAlert('Bulk generation is a Pro feature!', 'error');
      return;
    }

    const lines = inputText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      addAlert('Please paste some values first', 'error');
      return;
    }

    setGenerating(true);
    const results = lines.map((val, idx) => ({
      id: idx,
      value: val,
      name: `qr-code-${idx + 1}`,
    }));
    setQrList(results);
    setGenerating(false);
    addAlert(`Successfully loaded ${results.length} items!`, 'success');
  };

  const downloadAllAsZip = async () => {
    if (qrList.length === 0) return;

    addAlert('Generating ZIP archive...', 'info');

    const zip = new JSZip();

    for (let i = 0; i < qrList.length; i++) {
      const item = qrList[i];
      const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        data: item.value,
        dotsOptions: { color: '#0f172a', type: 'rounded' },
        backgroundOptions: { color: '#ffffff' },
      });

      // Get raw blob/buffer from qr-code-styling
      const rawData = await qrCode.getRawData('png');
      zip.file(`${item.name}.png`, rawData);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const localUrl = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = localUrl;
    a.download = `nqr-bulk-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(localUrl);

    addAlert('ZIP downloaded successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Batch & Bulk Generator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Paste a list of URLs or text lines to generate and export them all at once.
        </p>
      </div>

      {!isPro && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300">Pro Feature</h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
              Bulk generation is currently locked. Upgrade to Pro to paste list coordinates and download zip archives.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl mb-8">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Paste Values (One per line)
        </label>
        <textarea
          disabled={!isPro}
          rows={6}
          placeholder={
            isPro
              ? 'https://google.com\nhttps://github.com\nhttps://vercel.com'
              : 'Upgrade to Pro to unlock bulk imports...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm transition-all"
        />

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handleGenerate}
            disabled={!isPro || generating}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-500/10 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {generating ? 'Processing...' : 'Load Codes'}
          </button>

          {qrList.length > 0 && (
            <button
              onClick={downloadAllAsZip}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
            >
              <Download className="h-4 w-4" />
              Download ZIP ({qrList.length} QRs)
            </button>
          )}
        </div>
      </div>

      {qrList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
          {qrList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  item.value
                )}`}
                alt={item.name}
                className="h-28 w-28 object-contain"
              />
              <div className="w-full mt-2">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-full">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRBulk;
