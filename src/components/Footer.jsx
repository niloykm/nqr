import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-6 border-t border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Copyright info */}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} NQR. Crafted for performance and privacy.
        </p>

        {/* Author link */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Created with</span>
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <span>by</span>
          <a
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline transition-all"
            href="https://niloykm.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Niloy
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
