import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-auto py-8 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-brand-400">
              <Compass className="h-5 w-5" />
            </span>
            <span className="font-outfit font-bold text-lg tracking-tight text-white">
              Roam<span className="text-brand-400">AI</span>
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <Link to="/" className="hover:text-brand-400 transition-colors">Home</Link>
            <Link to="/explore" className="hover:text-brand-400 transition-colors">Explore</Link>
            <Link to="/about" className="hover:text-brand-400 transition-colors">About</Link>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">© {new Date().getFullYear()} RoamAI. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
