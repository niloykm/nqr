import React, { useEffect } from 'react';
import logo from '../assets/favicon.png';
import { Sun, Moon, LogOut, Sparkles } from 'lucide-react';

function Header({ user, onSignIn, onSignOut, theme, toggleTheme, isPro }) {
  
  useEffect(() => {
    // Initialize Google Identity Services
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '782012028639-6p4u6n6p8m5f.apps.googleusercontent.com', // fallback credentials
          callback: (response) => {
            try {
              // Parse JWT Client-Side without libraries
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                window.atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const decoded = JSON.parse(jsonPayload);
              onSignIn(decoded);
            } catch (err) {
              console.error('Failed to parse Google credential token:', err);
            }
          },
        });

        const btnElement = document.getElementById('google-signin-btn');
        if (btnElement) {
          window.google.accounts.id.renderButton(btnElement, {
            theme: theme === 'dark' ? 'filled_black' : 'outline',
            size: 'medium',
            shape: 'pill',
          });
        }
      }
    };

    // Delay initialization slightly to ensure SDK script is fully loaded
    const timer = setTimeout(initGoogle, 1000);
    return () => clearTimeout(timer);
  }, [user, theme]);

  return (
    <header className="w-full border-b border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <img src={logo} alt="NQR Logo" className="h-6 w-6 invert-0 brightness-200" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 dark:text-white leading-none">NQR</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Advanced QR Suite</span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-4">
          
          {/* Pro tag */}
          {isPro && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md shadow-blue-500/10">
              <Sparkles className="h-3 w-3 fill-white" />
              PRO
            </span>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-650 dark:text-slate-350 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.picture}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 shadow"
              />
              <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user.name}
              </span>
              <button
                onClick={onSignOut}
                title="Sign out"
                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div id="google-signin-btn" />
          )}

        </div>
      </div>
    </header>
  );
}

export default Header;
