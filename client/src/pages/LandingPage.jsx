import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Shield, Calendar, ArrowRight, ArrowUpRight, HelpCircle } from 'lucide-react';
import heroImg from '../assets/hero_dashboard.jpg';

const popularPicks = [
  {
    name: 'Goa',
    state: 'Goa',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    desc: 'Golden sands, Portuguese architecture, and energetic coastal vibes.',
  },
  {
    name: 'Manali',
    state: 'Himachal Pradesh',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
    desc: 'Breathtaking snow peaks, mountain air, and valley hiking treks.',
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1477584322904-486a247a30d5?auto=format&fit=crop&w=400&q=80',
    desc: 'Majestic forts, pink palaces, and rich Rajasthani heritage details.',
  },
  {
    name: 'Kerala',
    state: 'Kerala',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=400&q=80',
    desc: 'Tranquil houseboats, wellness Ayurveda spas, and emerald hills.',
  }
];

export default function LandingPage() {
  return (
    <div className="flex-grow flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-900 bg-navy-950">
        {/* Dynamic Glowing Accents */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 animate-fade-in">
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider border border-brand-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Travel Intelligence</span>
            </div>

            <h1 className="font-outfit text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Plan Smarter. <br />
              <span className="gradient-text">Travel Better.</span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed font-light">
              Tell us your budget, travel dates, and preferred style. TripMate analyzes destination climates, projects transit expenses, compiles custom checklists, and structures interactive day-by-day itineraries tailored to you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/planner"
                className="glow-btn bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 group justify-center text-base"
              >
                <span>Plan My Trip</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/explore"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-medium px-8 py-3.5 rounded-xl transition-all text-center text-base flex items-center justify-center"
              >
                Explore Destinations
              </Link>
            </div>
          </div>

          {/* Right Image/Mockup Column */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Glowing ring backing the image */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-teal-400 to-indigo-500 opacity-25 blur-lg animate-pulse" style={{ animationDuration: '4s' }} />
            
            <div className="relative glass-panel p-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-lg lg:max-w-full">
              <img 
                src={heroImg} 
                alt="AI Travel Planner Dashboard Mockup" 
                className="w-full h-auto rounded-xl object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-slate-950/40 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Generate a complete, optimized travel plan in just three easy steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel rounded-2xl p-8 border border-slate-900 relative">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-brand-400 flex items-center justify-center font-bold text-lg mb-6 border border-teal-500/20">1</div>
              <h3 className="font-outfit text-xl font-bold mb-3">Input Preferences</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Provide your starting city, budget in ₹, travellers count, dates, preferred weather, and trip interests.
              </p>
            </div>
            
            <div className="glass-panel rounded-2xl p-8 border border-slate-900 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg mb-6 border border-indigo-500/20">2</div>
              <h3 className="font-outfit text-xl font-bold mb-3">Get Recommendations</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                TripMate processes typical climate patterns, transport metrics, and interest scores to matching destinations.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-8 border border-slate-900 relative">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-lg mb-6 border border-brand-500/20">3</div>
              <h3 className="font-outfit text-xl font-bold mb-3">Save & Customize</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Unlock daily timelines, interact with dynamic budget splits, review packing requirements, and export your maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Picks Section */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-3">Featured Destinations</h2>
              <p className="text-slate-400">Discover handpicked travel inspirations with complete local guides.</p>
            </div>
            <Link to="/explore" className="text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1 transition-colors mt-4 sm:mt-0 text-sm">
              <span>View all destinations</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularPicks.map((pick) => (
              <div key={pick.name} className="glass-panel rounded-2xl overflow-hidden border border-slate-900 group relative">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={pick.image}
                    alt={pick.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-3 left-4 text-xs font-semibold px-2 py-1 rounded bg-slate-900/60 border border-slate-800 text-brand-400">
                    {pick.state}
                  </span>
                </div>
                
                <div className="p-5 flex flex-col">
                  <h3 className="font-outfit text-xl font-bold mb-2 text-white">{pick.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">{pick.desc}</p>
                  <Link
                    to={`/explore?search=${pick.name}`}
                    className="text-xs text-brand-400 font-semibold inline-flex items-center gap-1 group-hover:text-brand-300 transition-colors mt-auto"
                  >
                    <span>Start Planning</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose AI Travel Planner Section */}
      <section className="py-20 px-4 bg-slate-950/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-4">Why Use TripMate?</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Skip hours of manual research. Let intelligence plan your next escape.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20 shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-outfit text-lg font-semibold mb-2">Cost Optimization</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Budget calculators split accommodations, transport averages, food, and activities to match your spend.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-outfit text-lg font-semibold mb-2">Climate Smart planning</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Avoid planning beach trips during peak monsoons or mountain tracks in heavy winters, thanks to climate modeling.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-teal-500/10 text-brand-400 rounded-xl border border-teal-500/20 shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-outfit text-lg font-semibold mb-2">Custom Pack List</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Generates checklists (medication, documents, apparel, electronics) based on weather profiles and destinations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
