import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DetailedPageSkeleton } from '../components/LoadingSkeleton';
import MapComponent from '../components/MapComponent';
import Toast from '../components/Toast';
import { 
  Heart, Calendar, Compass, Thermometer, CloudSun, Briefcase, 
  MapPin, CheckCircle, Plus, Sparkles, Navigation, DollarSign, Wallet,
  Plane, Home, Utensils, Footprints, Ticket, Percent 
} from 'lucide-react';

export default function DetailsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const destName = searchParams.get('destination');
  const tripId = searchParams.get('tripId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(null);
  
  // Active travel plan details (from backend generate API or saved trip)
  const [tripData, setTripData] = useState(null);
  
  // Interactive UI States
  const [selectedBudgetTier, setSelectedBudgetTier] = useState('standard');
  const [recalculating, setRecalculating] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        if (tripId) {
          console.log(`Loading saved trip ID: ${tripId}...`);
          const res = await API.get(`/trips/${tripId}`);
          const trip = res.data.trip;

          const duration = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)));

          const mappedData = {
            destination: trip.destinationDetails || { 
              name: trip.destination, 
              image: trip.destinationImage, 
              typicalSeason: trip.travelStyle,
              description: `Saved itinerary for your trip to ${trip.destination}.`,
              bestTime: 'Consult itinerary',
              lat: trip.destinationDetails?.lat || 0.0,
              lon: trip.destinationDetails?.lon || 0.0
            },
            preferences: {
              origin: trip.origin,
              startDate: trip.startDate,
              endDate: trip.endDate,
              numberOfTravellers: trip.numberOfTravellers,
              budget: trip.budget,
              travelStyle: trip.travelStyle,
              transportPreference: trip.transportPreference,
              interests: trip.interests
            },
            durationDays: duration,
            budgetTier: trip.budget / (duration * trip.numberOfTravellers) < 2500 ? 'budget' : 'standard',
            weatherInfo: trip.weatherData,
            costEstimate: {
              transport: trip.estimatedTransportCost,
              stay: trip.estimatedHotelCost,
              food: trip.estimatedFoodCost,
              localTravel: trip.estimatedLocalTravelCost,
              activities: trip.estimatedActivitiesCost,
              misc: trip.estimatedMiscCost,
              total: trip.estimatedTotalCost
            },
            packingList: trip.packingList,
            itinerary: trip.itinerary
          };

          setTripData(mappedData);
          setPreferences(mappedData.preferences);
          setSelectedBudgetTier(mappedData.budgetTier);

          // Initialize checklist
          const listObj = {};
          const categories = ['clothing', 'documents', 'gear', 'healthAndSafety'];
          categories.forEach(cat => {
            if (mappedData.packingList[cat]) {
              mappedData.packingList[cat].forEach(item => {
                listObj[item] = false;
              });
            }
          });
          setChecklist(listObj);
          setLoading(false);
          return;
        }

        if (!destName) {
          setError('No destination selected.');
          setLoading(false);
          return;
        }

        const stored = sessionStorage.getItem('plannerPreferences');
        let prefs = {};
        if (stored) {
          prefs = JSON.parse(stored);
        } else {
          // Mock some preferences if user came directly
          const today = new Date();
          const nextWeek = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
          prefs = {
            origin: 'Mumbai',
            startDate: today.toISOString().split('T')[0],
            endDate: nextWeek.toISOString().split('T')[0],
            budget: 30000,
            numberOfTravellers: 1,
            travelStyle: 'Solo',
            interests: ['Nature'],
            preferredWeather: 'Pleasant',
            transportPreference: 'Any'
          };
          sessionStorage.setItem('plannerPreferences', JSON.stringify(prefs));
        }
        
        setPreferences(prefs);

        // Fetch generated plan
        console.log(`Generating plan for ${destName}...`);
        const res = await API.post('/trips/generate', {
          ...prefs,
          destinationName: destName
        });

        setTripData(res.data);
        setSelectedBudgetTier(res.data.budgetTier || 'standard');
        
        // Initialize interactive packing checklist
        const listObj = {};
        const categories = ['clothing', 'documents', 'gear', 'healthAndSafety'];
        categories.forEach(cat => {
          if (res.data.packingList[cat]) {
            res.data.packingList[cat].forEach(item => {
              listObj[item] = false;
            });
          }
        });
        setChecklist(listObj);

        // Check if destination is in favorites
        if (isAuthenticated) {
          try {
            const favRes = await API.get('/favourites/all');
            const match = favRes.data.favourites.some(f => f.destinationName === destName);
            setIsFavourite(match);
          } catch (favErr) {
            console.error("Error reading favourites:", favErr);
          }
        }

      } catch (err) {
        console.error("Error generating trip plan details:", err);
        setError(err.response?.data?.error || 'Failed to generate travel plan from backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [destName, tripId, isAuthenticated]);

  // Handle live budget recalculation
  const handleBudgetTierChange = async (tier) => {
    setSelectedBudgetTier(tier);
    setRecalculating(true);
    try {
      // Re-trigger generate API with different budget threshold or calculate locally.
      // Since local generator handles cost multiplier, let's call the generate API again
      // with a mock adjusted total budget to force recalculation!
      // budgetTier is set based on budget/days/travellers. Let's adjust total budget parameter.
      const duration = tripData.durationDays;
      const travellers = preferences.numberOfTravellers;
      let newBudget = 15000;
      if (tier === 'standard') newBudget = 40000;
      if (tier === 'premium') newBudget = 90000;

      const adjustedPrefs = {
        ...preferences,
        budget: newBudget
      };

      const res = await API.post('/trips/generate', {
        ...adjustedPrefs,
        destinationName: destName
      });

      setTripData(res.data);

      // Re-initialize checklist items that might be new
      const listObj = { ...checklist };
      const categories = ['clothing', 'documents', 'gear', 'healthAndSafety'];
      categories.forEach(cat => {
        if (res.data.packingList[cat]) {
          res.data.packingList[cat].forEach(item => {
            if (listObj[item] === undefined) {
              listObj[item] = false;
            }
          });
        }
      });
      setChecklist(listObj);

    } catch (err) {
      console.error("Recalculate cost error:", err);
    } finally {
      setRecalculating(false);
    }
  };

  const toggleChecklistItem = (item) => {
    setChecklist({
      ...checklist,
      [item]: !checklist[item]
    });
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      // Redirect user to login and remember to bring them back
      setToastMessage({ message: 'Please login to save your travel plans!', type: 'info' });
      setTimeout(() => {
        navigate('/login', { state: { from: { pathname: `/details?destination=${encodeURIComponent(destName)}` } } });
      }, 1500);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        origin: preferences.origin,
        destination: destName,
        startDate: preferences.startDate,
        endDate: preferences.endDate,
        numberOfTravellers: preferences.numberOfTravellers,
        budget: preferences.budget,
        travelStyle: preferences.travelStyle,
        transportPreference: preferences.transportPreference,
        interests: preferences.interests,
        costEstimate: tripData.costEstimate,
        weatherInfo: tripData.weatherInfo,
        packingList: tripData.packingList,
        itinerary: tripData.itinerary
      };

      await API.post('/trips', payload);
      setToastMessage({ message: `Successfully saved trip to ${destName}!`, type: 'success' });
    } catch (err) {
      console.error("Save trip error:", err);
      setToastMessage({ message: err.response?.data?.error || 'Failed to save trip.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavourite = async () => {
    if (!isAuthenticated) {
      setToastMessage({ message: 'Log in to add to favourites!', type: 'info' });
      return;
    }

    try {
      if (isFavourite) {
        await API.delete(`/favourites/remove/${encodeURIComponent(destName)}`);
        setIsFavourite(false);
        setToastMessage({ message: 'Removed from favourites.', type: 'success' });
      } else {
        await API.post('/favourites/add', { destinationName: destName });
        setIsFavourite(true);
        setToastMessage({ message: 'Added to favourites.', type: 'success' });
      }
    } catch (err) {
      console.error("Toggle favourite error:", err);
    }
  };

  if (loading) {
    return <DetailedPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center bg-navy-950 text-center py-20 px-4">
        <div className="glass-panel rounded-2xl p-8 border border-slate-900 max-w-md">
          <p className="text-rose-400 font-semibold mb-4">{error}</p>
          <Link to="/planner" className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-6 py-2 rounded-lg text-sm font-bold">
            Back to Planner
          </Link>
        </div>
      </div>
    );
  }

  const { destination, weatherInfo, costEstimate, packingList, itinerary } = tripData;
  const isHistorical = weatherInfo.type === 'historical';

  return (
    <div className="flex-grow bg-navy-950 pb-20 relative">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Hero Backdrop Cover */}
      <div className="relative w-full h-[400px] border-b border-slate-900 bg-slate-950 overflow-hidden">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Core title labels */}
        <div className="absolute bottom-10 left-4 right-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-brand-500/20">
                <Compass className="h-3.5 w-3.5" />
                <span>{destination.typicalSeason}</span>
              </div>
              <h1 className="font-outfit text-4xl sm:text-5xl font-extrabold text-white mb-2">{destination.name}</h1>
              <p className="text-slate-300 text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4 text-brand-400" />
                <span>{destination.state}, {destination.country}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleFavourite}
                className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${isFavourite ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-slate-950/45 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <Heart className="h-5 w-5" fill={isFavourite ? 'currentColor' : 'none'} />
              </button>
              
              <button
                onClick={handleSaveTrip}
                disabled={saving}
                className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>{saving ? 'Saving...' : 'Save Travel Plan'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Destination Summary details */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-6 mb-8 relative">
          <h2 className="font-outfit text-xl font-bold text-white mb-3">Destination Overview</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">{destination.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-400 border-t border-slate-900 pt-6">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1 font-semibold">Best Time to Visit</span>
              <span className="text-white font-medium">{destination.bestTime}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1 font-semibold">Travel Style Match</span>
              <span className="text-white font-medium">{preferences?.travelStyle} style</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1 font-semibold">Starting Hub</span>
              <span className="text-white font-medium">{preferences?.origin}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1 font-semibold">Dates Selected</span>
              <span className="text-white font-medium">{preferences?.startDate} to {preferences?.endDate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Itinerary and Weather */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ITINERARY */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-900">
                <h2 className="font-outfit text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-brand-400" />
                  <span>Day-by-Day Itinerary</span>
                </h2>
                <span className="text-xs bg-brand-500/10 text-brand-400 border border-brand-500/25 px-2.5 py-1 rounded-md font-semibold font-outfit uppercase">
                  {itinerary.days?.length} Days plan
                </span>
              </div>

              {/* Vertical timeline grid */}
              <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-8 py-2">
                {itinerary.days?.map((day, idx) => (
                  <div key={idx} className="relative group">
                    
                    {/* Circle icon marker */}
                    <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-brand-400 flex items-center justify-center text-xs font-bold font-outfit group-hover:border-brand-500/50 shadow-md">
                      D{day.dayNumber}
                    </span>

                    <div className="glass-panel border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-colors">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h4 className="font-outfit font-bold text-white text-base">Day {day.dayNumber} Activities</h4>
                        <span className="text-xs font-semibold text-slate-400 px-2 py-1 bg-slate-900/60 rounded border border-slate-800/80 shrink-0">
                          Est: ₹{day.estimatedCost?.toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-3.5 text-xs text-slate-300 font-light">
                        <div className="flex gap-3">
                          <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider w-16 pt-0.5 shrink-0">🌅 Morning</span>
                          <p className="leading-relaxed">{day.morning}</p>
                        </div>
                        <div className="flex gap-3 border-t border-slate-900/60 pt-3">
                          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider w-16 pt-0.5 shrink-0">☀️ Afternoon</span>
                          <p className="leading-relaxed">{day.afternoon}</p>
                        </div>
                        <div className="flex gap-3 border-t border-slate-900/60 pt-3">
                          <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider w-16 pt-0.5 shrink-0">🌆 Evening</span>
                          <p className="leading-relaxed">{day.evening}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* MAP VIEW */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
              <h2 className="font-outfit text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Navigation className="h-5.5 w-5.5 text-brand-400" />
                <span>Travel Geography Map</span>
              </h2>
              <div className="w-full h-80">
                <MapComponent 
                  lat={destination.lat} 
                  lon={destination.lon} 
                  destinationName={destination.name} 
                />
              </div>
            </div>

          </div>

          {/* Right Column: Pricing Recalculator, Weather Forecast, and Packing Checklists */}
          <div className="space-y-8">
            
            {/* PRICING ESTIMATOR RECALCULATOR */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
              <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-brand-400" />
                <span>Cost Estimator</span>
              </h3>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950 border border-slate-900 rounded-lg p-1 mb-5">
                {['budget', 'standard', 'premium'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleBudgetTierChange(tier)}
                    disabled={recalculating}
                    className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all capitalize ${selectedBudgetTier === tier ? 'bg-brand-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              {recalculating ? (
                <div className="py-10 text-center animate-pulse text-xs text-brand-400 font-medium">Recalculating costs...</div>
              ) : (
                <div className="space-y-4">
                  {/* Detailed Items list */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-900/50 pb-2">
                      <span className="flex items-center gap-1.5"><Plane className="h-3.5 w-3.5 text-teal-400" /> Transport</span>
                      <span className="font-semibold text-white">₹{costEstimate.transport?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-900/50 pb-2">
                      <span className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5 text-indigo-400" /> Stay (Hotel)</span>
                      <span className="font-semibold text-white">₹{costEstimate.stay?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-900/50 pb-2">
                      <span className="flex items-center gap-1.5"><Utensils className="h-3.5 w-3.5 text-orange-400" /> Food</span>
                      <span className="font-semibold text-white">₹{costEstimate.food?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-900/50 pb-2">
                      <span className="flex items-center gap-1.5"><Footprints className="h-3.5 w-3.5 text-brand-400" /> Local transit</span>
                      <span className="font-semibold text-white">₹{costEstimate.localTravel?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-900/50 pb-2">
                      <span className="flex items-center gap-1.5"><Ticket className="h-3.5 w-3.5 text-amber-400" /> Sightseeing</span>
                      <span className="font-semibold text-white">₹{costEstimate.activities?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-900/50 pb-2">
                      <span className="flex items-center gap-1.5"><Percent className="h-3.5 w-3.5 text-slate-400" /> Miscellaneous</span>
                      <span className="font-semibold text-white">₹{costEstimate.misc?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-4 mt-6 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Total Estimated Cost</span>
                      <span className="font-outfit text-xl font-bold text-white">₹{costEstimate.total?.toLocaleString()}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium italic">Actual prices may vary.</span>
                  </div>
                </div>
              )}
            </div>

            {/* WEATHER FORECAST */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
              <h3 className="font-outfit text-lg font-bold text-white mb-2 flex items-center gap-2">
                <CloudSun className="h-5 w-5 text-brand-400" />
                <span>Weather Conditions</span>
              </h3>
              
              {isHistorical ? (
                <div className="space-y-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase tracking-wider mb-2">
                    {weatherInfo.label}
                  </span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1 font-semibold">Season Mode</span>
                      <span className="text-white font-medium">{weatherInfo.season}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1 font-semibold">Avg Temp</span>
                      <span className="text-white font-medium">{weatherInfo.tempRange}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1 font-semibold">Rain Probability</span>
                      <span className="text-white font-medium">{weatherInfo.rainProbability}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1 font-semibold">Condition</span>
                      <span className="text-white font-medium truncate block">{weatherInfo.condition}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider mb-2 animate-pulse">
                    Live Forecast Data
                  </span>
                  
                  <div className="flex items-center gap-4 border-b border-slate-900 pb-4 mb-4">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <img 
                        src={`https://openweathermap.org/img/wn/${weatherInfo.current.icon}@2x.png`} 
                        alt="Icon" 
                        className="h-10 w-10 shrink-0" 
                      />
                    </div>
                    <div>
                      <div className="font-outfit font-extrabold text-2xl text-white">{weatherInfo.current.temp}°C</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 uppercase font-semibold">
                        <span>{weatherInfo.current.condition}</span>
                        <span>•</span>
                        <span>{weatherInfo.current.description}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tiny forecast strips */}
                  <div className="space-y-2">
                    {weatherInfo.forecast?.slice(0, 4).map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/30 border border-slate-900/60 p-2 rounded-lg">
                        <span className="font-medium font-outfit">{new Date(f.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <img src={`https://openweathermap.org/img/wn/${f.icon}.png`} alt="icon" className="h-7 w-7" />
                          <span className="text-white font-bold">{f.temp}°C</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* THINGS YOU'LL NEED CHECKLIST */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
              <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-brand-400" />
                <span>Things You'll Need</span>
              </h3>

              <div className="space-y-4">
                
                {/* Categorized Checklist Items */}
                {['clothing', 'gear', 'healthAndSafety'].map((cat) => {
                  const items = packingList[cat] || [];
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={cat} className="space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block font-outfit capitalize">
                        {cat === 'healthAndSafety' ? 'Health & Safety' : cat}
                      </span>
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <div 
                            key={item}
                            onClick={() => toggleChecklistItem(item)}
                            className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40 border border-slate-900/80 cursor-pointer text-xs transition-colors hover:border-slate-800"
                          >
                            <button
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${checklist[item] ? 'bg-brand-500 border-brand-500 text-slate-950' : 'border-slate-600 bg-transparent text-transparent'}`}
                            >
                              ✓
                            </button>
                            <span className={`leading-relaxed text-slate-300 font-light ${checklist[item] ? 'line-through text-slate-500 opacity-60' : ''}`}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Documents & Requirements */}
                <div className="border-t border-slate-900 pt-4 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block font-outfit">Documents Required</span>
                    <ul className="list-disc pl-4 text-xs font-light text-slate-300 space-y-1 pt-1 leading-relaxed">
                      {packingList.documents?.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-950/20 border border-indigo-500/10 p-3 rounded-lg text-xs space-y-1">
                    <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold block">Entry & Visas</span>
                    <p className="text-slate-400 leading-relaxed font-light">{packingList.entryRequirements}</p>
                  </div>

                  <div className="bg-brand-500/5 border border-brand-500/10 p-3 rounded-lg text-xs space-y-0.5">
                    <span className="text-[10px] text-brand-400 uppercase tracking-wider font-bold block">Local Currency Info</span>
                    <p className="text-slate-400 leading-relaxed font-light">{packingList.currency}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
