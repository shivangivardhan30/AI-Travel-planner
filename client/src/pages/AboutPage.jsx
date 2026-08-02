import React from 'react';
import { Compass, Shield, Clock, Heart, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex-grow py-12 px-4 bg-navy-950">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        
        {/* Title Block */}
        <div className="text-center space-y-4">
          <span className="p-2 rounded-xl bg-teal-500/10 text-brand-400 inline-flex mb-2">
            <Compass className="h-8 w-8" />
          </span>
          <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white">About TripMate</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            TripMate is a next-generation AI travel companion designed to streamline trip scheduling, weather checks, budgeting, and packing requirements.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-900 flex gap-4">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl shrink-0 h-fit border border-brand-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-outfit font-bold text-white text-base mb-2">AI-Driven Recommendations</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                TripMate maps out travel periods, starting locations, and budget pools to matching database targets using rule-based metrics or Gemini LLM filters.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-900 flex gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 h-fit border border-indigo-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-outfit font-bold text-white text-base mb-2">Detailed Cost Modeling</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Get instant splits covering transportation (flights, trains, cars), hotels, dining, local cabs, and sightseeing events in INR (₹).
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-900 flex gap-4">
            <div className="p-3 bg-teal-500/10 text-brand-400 rounded-xl shrink-0 h-fit border border-teal-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-outfit font-bold text-white text-base mb-2">Climate Smart Scheduling</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Review temperature forecasts, weather descriptors, or fall back to high-fidelity seasonal climates for dates far in the future.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-900 flex gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl shrink-0 h-fit border border-rose-500/20">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-outfit font-bold text-white text-base mb-2">Interactive Packing Lists</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Get custom-built checklist grids for apparel, electronics, and documentation matching local laws and seasonal conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack Details */}
        <div className="glass-panel rounded-2xl p-8 border border-slate-900 space-y-6">
          <h3 className="font-outfit font-bold text-white text-lg text-center border-b border-slate-900 pb-4">Technology Architecture</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs font-semibold text-slate-400">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Frontend</span>
              <span className="text-white font-medium block">React & Vite</span>
              <span className="text-slate-500 text-[10px] block">Tailwind CSS</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Backend</span>
              <span className="text-white font-medium block">NodeJS & Express</span>
              <span className="text-slate-500 text-[10px] block">REST APIs</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Database</span>
              <span className="text-white font-medium block">SQLite</span>
              <span className="text-slate-500 text-[10px] block">Prisma ORM</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Services</span>
              <span className="text-white font-medium block">Gemini AI</span>
              <span className="text-slate-500 text-[10px] block">OpenWeatherMap</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
