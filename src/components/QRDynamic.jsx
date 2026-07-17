import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Eye, Smartphone, Globe, Plus, Trash2, Edit2, Link, Save, X, Activity } from 'lucide-react';

const QRDynamic = ({ user, isPro, addAlert }) => {
  const [links, setLinks] = useState([]);
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTargetUrl, setEditTargetUrl] = useState('');

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/dynamic', {
        headers: { 'x-user-id': user?.sub || user?.id || 'mock-user-id' }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setLinks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isPro) {
      fetchLinks();
    }
  }, [isPro, user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isPro) {
      addAlert('Dynamic QR codes are a Pro feature!', 'error');
      return;
    }
    if (!name || !targetUrl) {
      addAlert('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/dynamic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.sub || user?.id || 'mock-user-id'
        },
        body: JSON.stringify({ name, targetUrl }),
      });
      const newLink = await res.json();
      if (newLink.id) {
        addAlert('Dynamic QR code created!', 'success');
        setName('');
        setTargetUrl('');
        fetchLinks();
      }
    } catch (err) {
      addAlert('Failed to create link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch('/api/dynamic', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.sub || user?.id || 'mock-user-id'
        },
        body: JSON.stringify({ id, name: editName, targetUrl: editTargetUrl }),
      });
      if (res.ok) {
        addAlert('Destination updated!', 'success');
        setEditingId(null);
        fetchLinks();
      }
    } catch (err) {
      addAlert('Failed to update destination', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this dynamic QR?')) return;
    try {
      const res = await fetch(`/api/dynamic?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.sub || user?.id || 'mock-user-id' }
      });
      if (res.ok) {
        addAlert('Deleted successfully!', 'success');
        setSelectedLink(null);
        fetchLinks();
      }
    } catch (err) {
      addAlert('Deletion failed', 'error');
    }
  };

  // Prepares data for analytics charts
  const getDeviceAnalytics = (history = []) => {
    const devices = {};
    history.forEach(item => {
      devices[item.device] = (devices[item.device] || 0) + 1;
    });
    return Object.entries(devices);
  };

  const getCountryAnalytics = (history = []) => {
    const countries = {};
    history.forEach(item => {
      countries[item.country] = (countries[item.country] || 0) + 1;
    });
    return Object.entries(countries);
  };

  if (!isPro) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4 animate-fade-in">
        <div className="inline-flex p-3 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mb-4 ring-8 ring-blue-500/5">
          <Activity className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Dynamic QRs & Analytics</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Unlock dynamic QR codes to update destinations anytime without changing the physical code. Get visual graphs of scan count, visitor locations, and devices.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-8 animate-fade-in">
      {/* Management / Creation Sidebar */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" /> Create Dynamic QR
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                placeholder="Product Launch, Portfolio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Destination URL
              </label>
              <input
                type="url"
                placeholder="https://mywebsite.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
            >
              Generate Dynamic Code
            </button>
          </form>
        </div>

        {/* Links List */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-4">Your Dynamic QRs</h3>
          {links.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
              Create your first dynamic link above.
            </p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scroll pr-1">
              {links.map((link) => (
                <div
                  key={link.id}
                  onClick={() => setSelectedLink(link)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedLink?.id === link.id
                      ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {link.name}
                    </span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {link.scans} scans
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                    {link.targetUrl}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Analytics Display */}
      <div className="md:col-span-2">
        {selectedLink ? (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                {editingId === selectedLink.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1 text-lg font-bold rounded-lg border dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white"
                    />
                    <input
                      type="url"
                      value={editTargetUrl}
                      onChange={(e) => setEditTargetUrl(e.target.value)}
                      className="px-3 py-1 text-sm rounded-lg border dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(selectedLink.id)}
                        className="px-3 py-1 rounded bg-emerald-600 text-white text-xs flex items-center gap-1"
                      >
                        <Save className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      {selectedLink.name}
                      <button
                        onClick={() => {
                          setEditingId(selectedLink.id);
                          setEditName(selectedLink.name);
                          setEditTargetUrl(selectedLink.targetUrl);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Link className="h-3.5 w-3.5" /> Destination: {selectedLink.targetUrl}
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(selectedLink.id)}
                  className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* QR Code and Redirect details */}
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    window.location.origin + '/api/r?id=' + selectedLink.id
                  )}`}
                  alt="Dynamic QR"
                  className="h-44 w-44 object-contain shadow-md rounded-xl"
                />
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-400">Short Redirect Link</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 break-all">
                    {window.location.origin + '/api/r?id=' + selectedLink.id}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20">
                  <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Scans</h4>
                  <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{selectedLink.scans}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50">
                  <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Created On</h4>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> {new Date(selectedLink.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Breakdown Charts */}
            <div className="grid sm:grid-cols-2 gap-8">
              {/* Devices Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-blue-500" /> Device Breakdown
                </h3>
                {selectedLink.history && selectedLink.history.length > 0 ? (
                  <div className="space-y-2">
                    {getDeviceAnalytics(selectedLink.history).map(([device, count]) => {
                      const percentage = Math.round((count / selectedLink.history.length) * 100);
                      return (
                        <div key={device} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <span>{device}</span>
                            <span>{percentage}% ({count})</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    No scan data yet. Scan the QR code to log diagnostics.
                  </p>
                )}
              </div>

              {/* Geographic Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-blue-500" /> Geographic Location
                </h3>
                {selectedLink.history && selectedLink.history.length > 0 ? (
                  <div className="space-y-2">
                    {getCountryAnalytics(selectedLink.history).map(([country, count]) => {
                      const percentage = Math.round((count / selectedLink.history.length) * 100);
                      return (
                        <div key={country} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <span>{country}</span>
                            <span>{percentage}% ({count})</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    No scan data yet. Scan the QR code to log diagnostics.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
            <Eye className="h-10 w-10 text-slate-400 mb-2 stroke-1" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Link Selected</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] text-center">
              Select one of your dynamic QR campaigns on the left to review metrics and adjust settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRDynamic;
