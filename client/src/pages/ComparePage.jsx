import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, Thermometer, CloudSun, Calendar, HelpCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import Toast from '../components/Toast';

export default function ComparePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const storedList = sessionStorage.getItem('compareList');
        const storedPrefs = sessionStorage.getItem('plannerPreferences');

        if (!storedList || !storedPrefs) {
          setError('No active comparison data or search preferences found. Start by searching destinations.');
          setLoading(false);
          return;
        }

        const destinations = JSON.parse(storedList);
        const preferences = JSON.parse(storedPrefs);

        console.log("Fetching comparisons for:", destinations);
        const res = await API.post('/destinations/compare', {
          destinations,
          preferences
        });

        setCompareData(res.data);
      } catch (err) {
        console.error("Comparison load error:", err);
        setError(err.response?.data?.error || 'Failed to fetch comparison details from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex-grow bg-navy-950">
        <div className="text-center mb-12">
          <h2 className="font-outfit text-3xl font-extrabold text-white mb-2">Generating Comparison Grid</h2>
          <p className="text-slate-400 text-sm animate-pulse">Aligning budget matrices and climate overlays...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center bg-navy-950 text-center py-20 px-4">
        <div className="glass-panel border border-slate-900 rounded-2xl p-8 max-w-md space-y-4">
          <HelpCircle className="h-12 w-12 text-rose-400 mx-auto animate-bounce" />
          <h3 className="font-outfit text-xl font-bold text-white">Comparison Unavailable</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <div className="flex justify-center pt-4">
            <Link to="/planner" className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Planner Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { comparisons, bestChoice, recommendationReason } = compareData;

  return (
    <div className="flex-grow py-12 px-4 bg-navy-950">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-900">
          <div>
            <h2 className="font-outfit text-3xl font-extrabold text-white mb-2">Compare Destinations</h2>
            <p className="text-slate-400 text-sm">Contrasting match ratings, average costs, and activities side-by-side.</p>
          </div>
          <Link 
            to="/results"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-lg transition-colors font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Matches</span>
          </Link>
        </div>

        {/* Best Choice Callout Banner */}
        {bestChoice && (
          <div className="p-6 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 bg-brand-500 text-slate-950 rounded-xl font-bold text-sm shrink-0 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-outfit font-extrabold text-lg text-white mb-1">
                ⭐ Best Choice: <span className="text-brand-400">{bestChoice}</span>
              </h4>
              <p className="text-slate-300 text-xs font-light leading-relaxed">{recommendationReason}</p>
            </div>
          </div>
        )}

        {/* COMPARISON MATRIX (Responsive Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {comparisons.map((dest) => {
            const isBest = dest.name === bestChoice;
            const hasForecast = dest.weatherInfo?.type === 'live';
            const tempRange = hasForecast 
              ? `${dest.weatherInfo.current.tempMin}°C - ${dest.weatherInfo.current.tempMax}°C`
              : (dest.weatherInfo?.tempRange || 'N/A');
            const condition = hasForecast
              ? dest.weatherInfo.current.condition
              : (dest.weatherInfo?.condition || 'Seasonal');

            return (
              <div 
                key={dest.id}
                className={`glass-panel border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${isBest ? 'border-brand-500/30 shadow-brand-500/5 ring-1 ring-brand-500/20' : 'border-slate-900'}`}
              >
                
                {/* Header Backdrop card */}
                <div className="h-40 relative overflow-hidden shrink-0">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {isBest && (
                    <div className="absolute top-4 left-4 bg-brand-500 text-slate-950 font-outfit font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Best Choice</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4">
                    <h3 className="font-outfit text-xl font-bold text-white">{dest.name}</h3>
                    <p className="text-xs text-brand-400 font-medium">{dest.state}, {dest.country}</p>
                  </div>
                </div>

                {/* Compare Row items */}
                <div className="p-6 space-y-6 flex-grow flex flex-col">
                  
                  {/* Match Rating */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold font-outfit">Match Score</span>
                    <span className="font-outfit font-extrabold text-base text-brand-400">{dest.matchScore}% Match</span>
                  </div>

                  {/* Pricing Overview */}
                  <div className="space-y-2 pb-3 border-b border-slate-900">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold font-outfit block">Estimated Cost</span>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Budget</span>
                      <span className="font-bold text-white">₹{dest.estimatedCost.total?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Transport (Est)</span>
                      <span className="text-slate-300">₹{dest.estimatedCost.transport?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Hotel/Stay (Est)</span>
                      <span className="text-slate-300">₹{dest.estimatedCost.stay?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Weather Snapshot */}
                  <div className="space-y-2 pb-3 border-b border-slate-900 text-xs">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold font-outfit block">Climate Snapshot</span>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Temperature</span>
                      <span className="text-slate-300 font-semibold">{tempRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Condition</span>
                      <span className="text-slate-300 font-semibold">{condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Season</span>
                      <span className="text-brand-300 font-semibold">{dest.bestTime}</span>
                    </div>
                  </div>

                  {/* Sights & Sensation list */}
                  <div className="space-y-1.5 pb-3 border-b border-slate-900 text-xs flex-grow">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold font-outfit block mb-1">Famous Sights</span>
                    <div className="flex flex-wrap gap-1.5">
                      {dest.popularAttractions?.slice(0, 3).map((att) => (
                        <span key={att} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-900 text-[10px]">
                          {att}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Detailed guides triggers */}
                  <div className="pt-4 mt-auto">
                    <Link
                      to={`/details?destination=${encodeURIComponent(dest.name)}`}
                      className="block w-full text-center bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors"
                    >
                      View Full Dossier
                    </Link>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
