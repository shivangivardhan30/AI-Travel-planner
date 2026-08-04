import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, Thermometer, CloudSun, Calendar, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Toast from '../components/Toast';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destParam = searchParams.get('destination');

  const [preferences, setPreferences] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Compare selection state
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        let prefs;
        const stored = sessionStorage.getItem('plannerPreferences');
        if (!stored) {
          console.log("No search preferences in session. Generating default fallback preferences.");
          // Setup fallback preferences so direct link visits or refreshes don't show error screens
          prefs = {
            origin: 'Delhi',
            suggestDestination: true,
            destinationName: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            budget: 25000,
            numberOfTravellers: 1,
            travelStyle: 'Solo',
            interests: ['Nature', 'Mountains'],
            preferredWeather: 'Pleasant',
            transportPreference: 'Any',
            stayPreference: 'Hotel'
          };
          sessionStorage.setItem('plannerPreferences', JSON.stringify(prefs));
        } else {
          prefs = JSON.parse(stored);
        }

        setPreferences(prefs);

        // If a specific destination was chosen, let's create a pseudo-recommendation for that single spot
        // or call `/api/trips/recommend` and inject it.
        // For a seamless user flow, we will call recommend.
        // If they provided a specific destination, we will call the generate API for that destination and save in session.
        if (destParam) {
          console.log("Generating plan for specific destination:", destParam);
          // Redirect directly to DetailsPage but pass preferences
          navigate(`/details?destination=${encodeURIComponent(destParam)}`);
          return;
        }

        console.log("Calling recommend API with preferences:", prefs);
        const res = await API.post('/trips/recommend', prefs);
        setRecommendations(res.data.recommendations || []);
      } catch (err) {
        console.error("Error loading recommendations:", err);
        setError(err.response?.data?.error || 'Failed to fetch recommendations from the server. Verify your backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [destParam, navigate]);

  const handleCompareToggle = (name) => {
    if (selectedForCompare.includes(name)) {
      setSelectedForCompare(selectedForCompare.filter(n => n !== name));
    } else {
      if (selectedForCompare.length >= 3) {
        setToastMessage({ message: 'You can compare up to 3 destinations at a time.', type: 'error' });
        return;
      }
      setSelectedForCompare([...selectedForCompare, name]);
    }
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length < 2) {
      setToastMessage({ message: 'Select at least 2 destinations to compare.', type: 'error' });
      return;
    }
    // Save compare parameters and navigate
    sessionStorage.setItem('compareList', JSON.stringify(selectedForCompare));
    navigate('/compare');
  };

  const handleCardClick = (destinationName, e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) {
      return;
    }
    navigate(`/details?destination=${encodeURIComponent(destinationName)}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex-grow bg-navy-950">
        <div className="text-center mb-12">
          <h2 className="font-outfit text-3xl font-extrabold text-white mb-2">Analyzing Travel Matches</h2>
          <p className="text-slate-400 text-sm animate-pulse">Running budget models, checking climate indexes, and preparing your guides...</p>
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
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center bg-navy-950">
        <div className="glass-panel border border-slate-900 rounded-2xl p-8 max-w-md space-y-4">
          <HelpCircle className="h-12 w-12 text-rose-400 mx-auto" />
          <h3 className="font-outfit text-xl font-bold text-white">Oops, planning failed</h3>
          <p className="text-slate-400 text-sm">{error}</p>
          <div className="flex justify-center gap-4 pt-4">
            <Link to="/planner" className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retry Planner</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow py-12 px-4 bg-navy-950">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-900">
          <div>
            <h2 className="font-outfit text-3xl font-extrabold text-white mb-2">Top Recommendations</h2>
            <p className="text-slate-400 text-sm">Based on starting city <span className="text-white font-medium">{preferences?.origin}</span>, budget of <span className="text-white font-medium">₹{preferences?.budget?.toLocaleString()}</span>, and matching interests.</p>
          </div>
          
          {selectedForCompare.length > 0 && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-xs text-slate-400 font-medium font-outfit">{selectedForCompare.length} selected for comparison</span>
              <button
                onClick={handleLaunchCompare}
                disabled={selectedForCompare.length < 2}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Compare Selected</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-slate-900 max-w-lg mx-auto">
            <p className="text-slate-400 mb-6">No matching destinations found. This might happen if your budget is too constrained for the travel distance or duration.</p>
            <Link to="/planner" className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-6 py-2.5 rounded-lg font-bold text-sm">
              Adjust Planner Values
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((rec) => {
              const d = rec.destination;
              const isSelected = selectedForCompare.includes(d.name);
              
              // Climate variables
              const hasForecast = rec.weatherInfo && rec.weatherInfo.type === 'live';
              const tempText = hasForecast 
                ? `${rec.weatherInfo.current.temp}°C`
                : (rec.weatherInfo?.tempRange || 'N/A');
              const conditionText = hasForecast
                ? rec.weatherInfo.current.condition
                : (rec.weatherInfo?.condition || 'Seasonal Weather');

              return (
                <div 
                  key={d.id} 
                  onClick={(e) => handleCardClick(d.name, e)}
                  className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-350 flex flex-col h-full hover:shadow-2xl relative cursor-pointer hover:scale-[1.015] hover:border-brand-500/35 ${isSelected ? 'border-brand-500/40 ring-1 ring-brand-500/30' : 'border-slate-900'}`}
                >
                  {/* Destination image with match score badge */}
                  <div className="h-48 overflow-hidden relative shrink-0">
                    <img 
                      src={d.image} 
                      alt={d.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Match Score */}
                    <div className="absolute top-4 left-4 bg-teal-500/90 text-slate-950 font-outfit font-extrabold text-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{rec.matchScore}% Match</span>
                    </div>

                    {/* Compare Selection Checkbox */}
                    <button
                      onClick={() => handleCompareToggle(d.name)}
                      className={`absolute top-4 right-4 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-brand-500 border-brand-500 text-slate-950' : 'bg-slate-950/60 border-slate-400 text-transparent'}`}
                    >
                      ✓
                    </button>

                    <div className="absolute bottom-3 left-4">
                      <h3 className="font-outfit text-xl font-bold text-white">{d.name}</h3>
                      <p className="text-xs text-brand-300 font-medium">{d.state}, {d.country}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    
                    {/* Fast info stats */}
                    <div className="grid grid-cols-3 gap-2 border-b border-slate-900/60 pb-4 mb-4 text-xs font-semibold text-slate-300">
                      <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/40 border border-slate-900">
                        <Calendar className="h-3.5 w-3.5 text-brand-400 mb-1" />
                        <span>{rec.durationDays} Days</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/40 border border-slate-900">
                        <CloudSun className="h-3.5 w-3.5 text-indigo-400 mb-1" />
                        <span className="truncate max-w-full text-center">{conditionText}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/40 border border-slate-900">
                        <Thermometer className="h-3.5 w-3.5 text-amber-400 mb-1" />
                        <span>{tempText}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed mb-4 italic flex-grow">
                      "{rec.reason}"
                    </p>

                    <div className="border-t border-slate-900/80 pt-4 mt-auto">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Est. Total Cost</span>
                          <span className="font-outfit text-lg font-bold text-white">₹{rec.estimatedTotalCost?.toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium italic">Actual prices may vary.</span>
                      </div>

                      <div className="flex gap-2.5">
                        <Link 
                          to={`/details?destination=${encodeURIComponent(d.name)}`}
                          className="flex-1 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs text-center transition-colors shadow-md shadow-brand-500/5"
                        >
                          View Itinerary
                        </Link>
                        <button
                          onClick={() => handleCompareToggle(d.name)}
                          className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          {isSelected ? 'Selected' : 'Compare'}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
