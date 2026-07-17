import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import QRGenerator from './components/QRGenerator';
import QRBulk from './components/QRBulk';
import QRDynamic from './components/QRDynamic';
import QRHistory from './components/QRHistory';
import Billing from './components/Billing';
import Alert from './components/Alert';
import { 
  Sparkles, Sliders, Layers, RefreshCw, History, CreditCard 
} from 'lucide-react';

const App = () => {
  // Theme & UI state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [activeTab, setActiveTab] = useState('generate');
  
  // User & Subscription state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isPro, setIsPro] = useState(() => {
    return localStorage.getItem('isPro') === 'true';
  });

  // Local generations history
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('qr_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Alert system
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = 'info') => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Toggle dark/light theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync auth state to local storage
  const handleSignIn = (decodedUser) => {
    setUser(decodedUser);
    localStorage.setItem('user', JSON.stringify(decodedUser));
    addAlert(`Welcome back, ${decodedUser.name}!`, 'success');
  };

  const handleSignOut = () => {
    setUser(null);
    setIsPro(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isPro');
    addAlert('Signed out successfully', 'info');
  };

  const handleUpgrade = (status) => {
    setIsPro(status);
    localStorage.setItem('isPro', String(status));
    addAlert('Congratulations! You are now Pro!', 'success');
  };

  // Check URL params for Stripe Checkout redirect completion
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      handleUpgrade(true);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // History operations
  const handleGenerateSuccess = (newItem) => {
    setHistory((prev) => {
      const updated = [newItem, ...prev.slice(0, 19)]; // limit to 20 items
      localStorage.setItem('qr_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteHistory = (id) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('qr_history', JSON.stringify(updated));
      return updated;
    });
    addAlert('Removed from history', 'info');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + H: Switch to history
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setActiveTab('history');
        addAlert('Shortcut: Switch to History', 'info');
      }
      // Cmd/Ctrl + B: Switch to billing
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setActiveTab('billing');
        addAlert('Shortcut: Switch to Pricing', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sleek Top Navigation */}
      <Header
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        theme={theme}
        toggleTheme={toggleTheme}
        isPro={isPro}
      />

      {/* Main dashboard body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/40 w-full sm:w-auto overflow-x-auto custom-scroll flex-nowrap self-stretch sm:self-start">
          {[
            { id: 'generate', label: 'Generator', icon: <Sliders className="h-4 w-4" /> },
            { id: 'bulk', label: 'Bulk Export', icon: <Layers className="h-4 w-4" /> },
            { id: 'dynamic', label: 'Dynamic QRs', icon: <RefreshCw className="h-4 w-4" /> },
            { id: 'history', label: 'History', icon: <History className="h-4 w-4" /> },
            { id: 'billing', label: 'Pricing', icon: <CreditCard className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md shadow-black/5'
                  : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Views rendering */}
        <div className="flex-1 w-full min-h-[500px]">
          {activeTab === 'generate' && (
            <QRGenerator
              isPro={isPro}
              onGenerateSuccess={handleGenerateSuccess}
              addAlert={addAlert}
            />
          )}
          {activeTab === 'bulk' && (
            <QRBulk 
              isPro={isPro} 
              addAlert={addAlert} 
            />
          )}
          {activeTab === 'dynamic' && (
            <QRDynamic
              user={user}
              isPro={isPro}
              addAlert={addAlert}
            />
          )}
          {activeTab === 'history' && (
            <QRHistory
              history={history}
              onDelete={handleDeleteHistory}
              onSelect={(item) => {
                setActiveTab('generate');
                // Auto trigger select values in generator page if needed
              }}
              addAlert={addAlert}
            />
          )}
          {activeTab === 'billing' && (
            <Billing
              user={user}
              isPro={isPro}
              onUpgrade={handleUpgrade}
              addAlert={addAlert}
            />
          )}
        </div>
      </main>

      {/* Styled Footer */}
      <Footer />

      {/* Toast Alert stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </div>

    </div>
  );
};

export default App;
