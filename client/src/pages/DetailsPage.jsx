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
  Plane, Home, Utensils, Footprints, Ticket, Percent, Trash2, PlusCircle, 
  Activity, Info, Phone, ShieldAlert, AlertCircle, HelpCircle, ArrowLeft
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

  // Tab State
  const [activeTab, setActiveTab] = useState('itinerary');

  // Expense Tracker States
  const [tripExpenses, setTripExpenses] = useState([]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCat, setExpenseCat] = useState('Food');
  const [expenseDate, setExpenseDate] = useState('');

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
          setTripExpenses(trip.expenses || []);

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
        setTripExpenses([]);
        
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

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount || !expenseCat) {
      setToastMessage({ message: 'Please fill in all expense details.', type: 'error' });
      return;
    }

    try {
      const res = await API.post(`/trips/${tripId}/expenses`, {
        description: expenseDesc,
        amount: parseFloat(expenseAmount),
        category: expenseCat,
        date: expenseDate || new Date().toISOString().split('T')[0]
      });
      setTripExpenses(res.data.trip.expenses || []);
      setExpenseDesc('');
      setExpenseAmount('');
      setToastMessage({ message: 'Expense logged successfully!', type: 'success' });
    } catch (err) {
      console.error("Add expense error:", err);
      setToastMessage({ message: 'Failed to record expense.', type: 'error' });
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const res = await API.delete(`/trips/${tripId}/expenses/${expenseId}`);
      setTripExpenses(res.data.trip.expenses || []);
      setToastMessage({ message: 'Expense deleted.', type: 'success' });
    } catch (err) {
      console.error("Delete expense error:", err);
      setToastMessage({ message: 'Failed to delete expense.', type: 'error' });
    }
  };

  if (loading) {
    return <DetailedPageSkeleton />;
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

  const { 
    destination, 
    weatherInfo, 
    costEstimate, 
    packingList, 
    itinerary,
    hotels, 
    transportation, 
    attractionDetails, 
    restaurants, 
    emergency, 
    aiSuggestions, 
    weatherDetails, 
    nearbyPlaces 
  } = tripData;

  const isHistorical = weatherInfo.type === 'historical';
  const hotelOptions = hotels || [];
  const transportOptions = transportation || { bestRoute: 'Direct transit route', options: [], cheapest: '', fastest: '' };
  const attractionsList = attractionDetails || [];
  const restaurantsList = restaurants || [];
  const emergencyInfo = emergency || { hospital: 'Local Clinic', police: 'Local Police (100)', atm: 'ATM Hub Nearby', pharmacy: 'Local Chemist' };
  const aiTips = aiSuggestions || { bestTimeToStart: '8:00 AM', visitingOrder: 'Sightseeing in the morning, leisure/shopping in the evening.', hiddenGems: 'Scenic view points nearby.', localFood: 'Try local specialties and regional street food.', moneySavingTips: 'Use shared auto-rickshaws or rent a scooter.', placesToAvoid: 'Avoid unlit margins late at night.', safetyTips: 'Keep offline maps downloaded and carry hydrated packs.' };
  const weatherSpecs = weatherDetails || { currentTemp: '24°C', forecast: 'Clear skies and pleasant breeze', rainChance: '10%', uvIndex: 'Low (3)', suggestedClothing: 'Comfortable light cotton wear' };
  const nearbyList = nearbyPlaces || [];

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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-900 pb-4 mb-8">
          {[
            { id: 'itinerary', label: 'Itinerary & Sights', icon: Calendar },
            { id: 'transportStay', label: 'Transport & Stay', icon: Plane },
            { id: 'budgetExpenses', label: 'Budget & Expenses', icon: Wallet },
            { id: 'advisorSafety', label: 'AI Tips & Safety', icon: Sparkles },
            { id: 'packing', label: 'Packing Checklist', icon: Briefcase }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${active ? 'bg-brand-500 text-slate-950 border-brand-500 shadow-lg shadow-brand-500/10' : 'bg-slate-950/45 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="space-y-8">
          
          {/* TAB 1: ITINERARY & SIGHTS */}
          {activeTab === 'itinerary' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              
              {/* Day Timeline */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
                  <h3 className="font-outfit text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar className="h-5.5 w-5.5 text-brand-400" />
                    <span>Day-by-Day Journey</span>
                  </h3>
                  
                  <div className="relative border-l border-slate-850 ml-4 pl-6 space-y-8 py-2">
                    {itinerary.days?.map((day, idx) => (
                      <div key={idx} className="relative group">
                        <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full bg-slate-950 border border-slate-855 text-brand-400 flex items-center justify-center text-xs font-bold font-outfit group-hover:border-brand-500/50 shadow-md">
                          D{day.dayNumber}
                        </span>
                        
                        <div className="glass-panel border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-colors">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <h4 className="font-outfit font-bold text-white text-base">Day {day.dayNumber} Plan</h4>
                            <span className="text-xs font-semibold text-slate-400 px-2 py-1 bg-slate-900/60 rounded border border-slate-850 shrink-0">
                              Est: ₹{day.estimatedCost?.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="space-y-3 text-xs text-slate-300 font-light">
                            <div className="flex gap-3">
                              <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider w-16 pt-0.5 shrink-0">🌅 Morning</span>
                              <p className="leading-relaxed">{day.morning}</p>
                            </div>
                            <div className="flex gap-3 border-t border-slate-900/60 pt-3">
                              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider w-16 pt-0.5 shrink-0">☀️ Afternoon</span>
                              <p className="leading-relaxed">{day.afternoon}</p>
                            </div>
                            <div className="flex gap-3 border-t border-slate-900/60 pt-3">
                              <span className="text-[9px] text-brand-400 font-bold uppercase tracking-wider w-16 pt-0.5 shrink-0">🌆 Evening</span>
                              <p className="leading-relaxed">{day.evening}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Geography Map */}
                <div className="glass-panel border border-slate-900 rounded-2xl p-6">
                  <h3 className="font-outfit text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Navigation className="h-5.5 w-5.5 text-brand-400" />
                    <span>Travel Geography Map</span>
                  </h3>
                  <div className="w-full h-80 rounded-xl overflow-hidden">
                    <MapComponent lat={destination.lat} lon={destination.lon} destinationName={destination.name} />
                  </div>
                </div>
              </div>

              {/* Side Columns: Attractions & Nearby */}
              <div className="space-y-6">
                
                {/* Detailed Attraction Timing & Price Specs */}
                <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
                  <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-brand-400" />
                    <span>Attraction Guides</span>
                  </h3>
                  
                  {attractionsList.length === 0 ? (
                    <div className="text-slate-500 text-xs italic">Select destinations to view attractions details.</div>
                  ) : (
                    <div className="space-y-4">
                      {attractionsList.map((att, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-900/85 space-y-3 hover:border-slate-800 transition-all">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-outfit font-bold text-white text-sm">{att.name}</h4>
                            <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded font-semibold border border-brand-500/20">{att.ticketPrice}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                            <div>
                              <span className="text-slate-500 block uppercase font-semibold">Hours</span>
                              <span>{att.openingTime} - {att.closingTime}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase font-semibold">Required Time</span>
                              <span>{att.timeRequired}</span>
                            </div>
                            <div className="col-span-2 pt-1 border-t border-slate-900/50">
                              <span className="text-slate-500 block uppercase font-semibold">Best Time to Visit</span>
                              <span className="text-slate-300">{att.bestTimeToVisit}</span>
                            </div>
                          </div>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(att.name + ' ' + destination.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-center bg-slate-900 hover:bg-slate-850 text-slate-350 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-slate-800 transition-colors"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Google Maps directions</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nearby Places within 30 km */}
                <div className="glass-panel border border-slate-900 rounded-2xl p-6">
                  <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-indigo-400" />
                    <span>Nearby Excursions (&lt;30 km)</span>
                  </h3>
                  
                  {nearbyList.length === 0 ? (
                    <div className="text-slate-500 text-xs italic">Explore surrounding local areas.</div>
                  ) : (
                    <div className="space-y-3">
                      {nearbyList.map((place, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl">
                          <div>
                            <span className="text-white text-xs font-bold block">{place.name}</span>
                            <span className="text-[10px] text-slate-500 font-light mt-0.5 block">Feature: {place.attraction}</span>
                          </div>
                          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/10 shrink-0 font-bold font-outfit">{place.distance}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: TRANSPORT & STAY */}
          {activeTab === 'transportStay' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Transportation Comparison */}
              <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
                <h3 className="font-outfit text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Plane className="h-5.5 w-5.5 text-brand-400" />
                  <span>Transit Options Comparison</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-light">
                  <span className="font-semibold text-white">Suggested Route:</span> {transportOptions.bestRoute}
                </p>

                {/* Fastest vs Cheapest banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs flex gap-3 items-center">
                    <span className="p-2.5 bg-teal-500/20 text-teal-400 rounded-lg shrink-0 text-xs font-bold uppercase tracking-wider">Cheapest</span>
                    <p className="text-slate-350 font-light"><span className="text-teal-400 font-semibold">{transportOptions.cheapest ? 'Optimal Value:' : 'Train / Bus options'}</span> {transportOptions.cheapest || 'Scenic rail route provides cheapest transit pools.'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex gap-3 items-center">
                    <span className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0 text-xs font-bold uppercase tracking-wider">Fastest</span>
                    <p className="text-slate-350 font-light"><span className="text-indigo-400 font-semibold">{transportOptions.fastest ? 'Time Optimized:' : 'Flight connections'}</span> {transportOptions.fastest || 'Direct flights offer the absolute minimal transit duration.'}</p>
                  </div>
                </div>

                {/* Transport choices list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {transportOptions.options?.map((opt, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 flex flex-col justify-between hover:border-slate-800 transition-colors">
                      <div className="space-y-1 mb-4">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">{opt.type}</span>
                        <span className="text-white text-sm font-bold block">{opt.name}</span>
                        <span className="text-slate-400 text-xs block font-light">Duration: {opt.duration}</span>
                      </div>
                      <span className="text-base text-white font-extrabold font-outfit">₹{opt.cost?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accommodation choices */}
              <div className="glass-panel border border-slate-900 rounded-2xl p-6">
                <h3 className="font-outfit text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Home className="h-5.5 w-5.5 text-brand-400" />
                  <span>Accommodation Recommendations (Budget Adjusted)</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-light">
                  Recommended properties matching your <span className="font-semibold text-white capitalize">{preferences?.stayPreference || 'Hotel'}</span> preference selection.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hotelOptions.map((hotel, idx) => (
                    <div key={idx} className="glass-panel border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex flex-col justify-between relative">
                      <span className="absolute top-4 right-4 bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2.5 py-0.5 rounded text-[10px] font-bold">★ {hotel.rating}</span>
                      
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-outfit font-bold text-white text-base pr-8 truncate">{hotel.name}</h4>
                          <p className="text-slate-450 text-[10px] leading-relaxed font-light">{hotel.address}</p>
                          <p className="text-slate-500 text-[10px] leading-normal font-light">{hotel.distanceFromTouristPlaces}</p>
                        </div>
                        
                        {/* Amenities list */}
                        <div className="flex flex-wrap gap-1.5">
                          {hotel.amenities?.map((am, aIdx) => (
                            <span key={aIdx} className="bg-slate-900/80 text-slate-400 border border-slate-850 px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase">{am}</span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-900/60 pt-4 mt-6 flex justify-between items-end">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Per Night</span>
                          <span className="text-base text-white font-extrabold font-outfit">₹{hotel.pricePerNight?.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Total Stay</span>
                          <span className="text-xs text-brand-400 font-bold font-outfit">₹{hotel.totalCost?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BUDGET & EXPENSES */}
          {activeTab === 'budgetExpenses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              
              {/* Cost splits & Donut Chart */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
                  <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-brand-400" />
                    <span>Cost Split Overview</span>
                  </h3>
                  
                  {/* Recalculator toggles */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 border border-slate-900 rounded-lg p-1 mb-5">
                    {['budget', 'standard', 'premium'].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => handleBudgetTierChange(tier)}
                        disabled={recalculating}
                        className={`py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all capitalize ${selectedBudgetTier === tier ? 'bg-brand-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>

                  {recalculating ? (
                    <div className="py-12 text-center animate-pulse text-xs text-brand-400 font-medium">Recalculating costs...</div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Responsive SVG Donut Chart */}
                      <div className="relative flex justify-center py-2">
                        {(() => {
                          const totalCostVal = costEstimate.total || 1;
                          const donutCats = [
                            { name: 'Stay', value: costEstimate.stay || 0, color: '#6366f1' },
                            { name: 'Transport', value: costEstimate.transport || 0, color: '#38bdf8' },
                            { name: 'Food', value: costEstimate.food || 0, color: '#f97316' },
                            { name: 'Transit', value: costEstimate.localTravel || 0, color: '#2dd4bf' },
                            { name: 'Sightseeing', value: costEstimate.activities || 0, color: '#f59e0b' },
                            { name: 'Misc', value: costEstimate.misc || 0, color: '#64748b' }
                          ].filter(c => c.value > 0);

                          let cumulativeOffset = 0;

                          return (
                            <div className="relative">
                              <svg width="140" height="140" viewBox="0 0 120 120" className="mx-auto drop-shadow-2xl">
                                <circle cx="60" cy="60" r="45" fill="none" stroke="#0f172a" strokeWidth="12" />
                                {donutCats.map((cat, idx) => {
                                  const percentage = cat.value / totalCostVal;
                                  const strokeLength = percentage * 282.74; // 2 * pi * 45
                                  const strokeOffset = 282.74 - strokeLength + cumulativeOffset;
                                  cumulativeOffset -= strokeLength;
                                  return (
                                    <circle
                                      key={idx}
                                      cx="60"
                                      cy="60"
                                      r="45"
                                      fill="none"
                                      stroke={cat.color}
                                      strokeWidth="12"
                                      strokeDasharray="282.74"
                                      strokeDashoffset={strokeOffset}
                                      strokeLinecap="round"
                                      transform="rotate(-90 60 60)"
                                      className="transition-all duration-300 hover:stroke-[14] cursor-pointer"
                                    />
                                  );
                                })}
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Total Est</span>
                                <span className="text-sm font-extrabold text-white">₹{Math.round(costEstimate.total / 1000)}k</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Cost Details & Legends */}
                      <div className="space-y-2.5 text-xs">
                        {[
                          { name: 'Accommodation', val: costEstimate.stay, color: '#6366f1', icon: Home },
                          { name: 'Transportation', val: costEstimate.transport, color: '#38bdf8', icon: Plane },
                          { name: 'Food & Dining', val: costEstimate.food, color: '#f97316', icon: Utensils },
                          { name: 'Local Cabs', val: costEstimate.localTravel, color: '#2dd4bf', icon: Footprints },
                          { name: 'Sightseeing', val: costEstimate.activities, color: '#f59e0b', icon: Ticket },
                          { name: 'Miscellaneous', val: costEstimate.misc, color: '#64748b', icon: Percent }
                        ].map((item, idx) => {
                          const Icon = item.icon;
                          const totalVal = costEstimate.total || 1;
                          const pct = Math.round(((item.val || 0) / totalVal) * 100);
                          return (
                            <div key={idx} className="flex justify-between items-center text-slate-400 border-b border-slate-900/50 pb-2">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <Icon className="h-3.5 w-3.5" />
                                <span>{item.name}</span>
                              </span>
                              <span className="font-semibold text-white">₹{item.val?.toLocaleString()} ({pct}%)</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-900 pt-4 flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Total Estimated Plan:</span>
                        <span className="font-outfit text-lg font-bold text-brand-400">₹{costEstimate.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expense Tracker */}
              <div className="lg:col-span-2 space-y-6">
                {tripId ? (
                  <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
                    <h3 className="font-outfit text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Activity className="h-5.5 w-5.5 text-brand-400 animate-pulse" />
                      <span>Interactive Expense Ledger</span>
                    </h3>

                    {/* Spend Counter details */}
                    {(() => {
                      const totalSpent = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
                      const originalBudget = costEstimate.total || budget || 1;
                      const remaining = Math.max(0, originalBudget - totalSpent);
                      const spendPercent = Math.min(100, Math.round((totalSpent / originalBudget) * 100));

                      return (
                        <div className="space-y-6 mb-6">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-955/60 border border-slate-900 rounded-xl">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Total Budget Pool</span>
                              <span className="text-lg font-bold text-white">₹{originalBudget.toLocaleString()}</span>
                            </div>
                            <div className="p-4 bg-slate-955/60 border border-slate-900 rounded-xl">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Logged Expenses</span>
                              <span className="text-lg font-bold text-teal-400">₹{totalSpent.toLocaleString()}</span>
                            </div>
                            <div className="p-4 bg-slate-955/60 border border-slate-900 rounded-xl">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Remaining Budget</span>
                              <span className={`text-lg font-bold ${remaining < 2000 ? 'text-rose-400' : 'text-indigo-400'}`}>₹{remaining.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase">
                              <span>Budget depletion progress</span>
                              <span>{spendPercent}% spent</span>
                            </div>
                            <div className="w-full bg-slate-900 border border-slate-850 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${spendPercent > 90 ? 'bg-rose-500' : spendPercent > 70 ? 'bg-amber-500' : 'bg-teal-400'}`}
                                style={{ width: `${spendPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Expense line graph */}
                          <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl space-y-4">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Cumulative Spend Curve</span>
                            
                            {tripExpenses.length === 0 ? (
                              <div className="h-32 flex items-center justify-center text-slate-500 text-xs italic">Graph updates as expenses are added.</div>
                            ) : (
                              <div className="relative">
                                {(() => {
                                  const sortedExps = [...tripExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));
                                  let cumulativeSum = 0;
                                  const chartPoints = [{ amount: 0, date: 'Start' }, ...sortedExps.map(e => {
                                    cumulativeSum += e.amount;
                                    return { amount: cumulativeSum, date: e.date };
                                  })];

                                  const maxVal = Math.max(originalBudget, cumulativeSum) || 1;
                                  const chartW = 500;
                                  const chartH = 150;

                                  const points = chartPoints.map((pt, idx) => {
                                    const x = 30 + (idx / Math.max(1, chartPoints.length - 1)) * 440;
                                    const y = chartH - 20 - (pt.amount / maxVal) * (chartH - 45);
                                    return `${x},${y}`;
                                  });

                                  const linePath = `M ${points.join(' L ')}`;
                                  const areaPath = chartPoints.length > 1 
                                    ? `M 30,${chartH - 20} L ${points.join(' L ')} L ${points[points.length - 1].split(',')[0]},${chartH - 20} Z` 
                                    : '';

                                  return (
                                    <svg className="w-full h-40" viewBox="0 0 500 150">
                                      <defs>
                                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.3" />
                                          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
                                        </linearGradient>
                                      </defs>
                                      {/* Grid lines */}
                                      <line x1="30" y1="25" x2="470" y2="25" stroke="#1e293b" strokeDasharray="3 3" />
                                      <line x1="30" y1="70" x2="470" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
                                      <line x1="30" y1="110" x2="470" y2="110" stroke="#1e293b" strokeDasharray="3 3" />
                                      <line x1="30" y1="130" x2="470" y2="130" stroke="#0f172a" strokeWidth="2" />
                                      
                                      {/* Area Fill */}
                                      {chartPoints.length > 1 && <path d={areaPath} fill="url(#expenseGrad)" />}
                                      
                                      {/* Line Curve */}
                                      <path d={linePath} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />
                                      
                                      {/* Nodes */}
                                      {points.map((pt, pIdx) => {
                                        const [cx, cy] = pt.split(',');
                                        const val = chartPoints[pIdx].amount;
                                        return (
                                          <g key={pIdx} className="group cursor-pointer">
                                            <circle cx={cx} cy={cy} r="4" fill="#2dd4bf" stroke="#0f172a" strokeWidth="1.5" className="hover:r-6 hover:fill-white transition-all" />
                                            <title>{chartPoints[pIdx].date}: ₹{val.toLocaleString()}</title>
                                          </g>
                                        );
                                      })}
                                    </svg>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Add expense form */}
                    <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl mb-6">
                      <div className="col-span-1">
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase mb-1">Description</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. Taxi / Lunch" 
                          className="w-full glass-input text-xs py-2 px-3"
                          value={expenseDesc}
                          onChange={(e) => setExpenseDesc(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase mb-1">Amount (₹)</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="Amount" 
                          className="w-full glass-input text-xs py-2 px-3 font-semibold"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase mb-1">Category</label>
                        <select 
                          className="w-full glass-input text-xs py-2 px-2 bg-slate-950"
                          value={expenseCat}
                          onChange={(e) => setExpenseCat(e.target.value)}
                        >
                          {['Food', 'Stay', 'Travel', 'Activities', 'Shopping', 'Emergency', 'Misc'].map(c => (
                            <option key={c} value={c} className="bg-slate-950">{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="submit" 
                          className="w-full bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>Log Expense</span>
                        </button>
                      </div>
                    </form>

                    {/* Expense history ledger logs list */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Expense History Log</span>
                      
                      {tripExpenses.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-950/20 border border-slate-900 rounded-xl">No expenses recorded yet. Start adding items above!</div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto border border-slate-900 rounded-xl divide-y divide-slate-900 bg-slate-950/30">
                          {tripExpenses.map((exp, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3.5 text-xs hover:bg-slate-900/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${exp.category === 'Stay' ? 'bg-indigo-400' : exp.category === 'Travel' ? 'bg-sky-400' : exp.category === 'Food' ? 'bg-orange-400' : exp.category === 'Activities' ? 'bg-amber-400' : exp.category === 'Emergency' ? 'bg-rose-500' : 'bg-slate-500'}`} />
                                <div>
                                  <span className="text-white font-bold block">{exp.description}</span>
                                  <span className="text-[10px] text-slate-500 font-light mt-0.5 flex gap-1.5 uppercase font-semibold">
                                    <span>{exp.category}</span>
                                    <span>•</span>
                                    <span>{exp.date}</span>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-white font-outfit">₹{exp.amount?.toLocaleString()}</span>
                                <button 
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                                  title="Delete expense"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel border border-slate-900 rounded-2xl p-8 text-center relative flex flex-col justify-center items-center gap-4 min-h-[300px]">
                    <div className="w-14 h-14 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h4 className="font-outfit text-lg font-bold text-white">Unlock Expense Tracking</h4>
                      <p className="text-slate-400 text-xs font-light leading-relaxed">
                        To enable real-time ledger bookings, dynamic spending charts, and remaining budget alerts, you need to save this generated plan to your dashboard first.
                      </p>
                    </div>
                    <button 
                      onClick={handleSaveTrip}
                      disabled={saving}
                      className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{saving ? 'Saving...' : 'Save Plan to Dashboard'}</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: AI TIPS & SAFETY */}
          {activeTab === 'advisorSafety' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              
              {/* Smart AI Suggestions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
                  <h3 className="font-outfit text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="h-5.5 w-5.5 text-brand-400" />
                    <span>Smart AI Travel Suggestions</span>
                  </h3>

                  <div className="space-y-4">
                    {[
                      { title: 'Best Time to Start', value: aiTips.bestTimeToStart, color: 'text-teal-400' },
                      { title: 'Visiting Order Recommendation', value: aiTips.visitingOrder, color: 'text-indigo-400' },
                      { title: 'Hidden Gems / Local Secret Spots', value: aiTips.hiddenGems, color: 'text-brand-400' },
                      { title: 'Must-Try Local Foods', value: aiTips.localFood, color: 'text-orange-400' },
                      { title: 'Money Saving Strategies', value: aiTips.moneySavingTips, color: 'text-emerald-400' },
                      { title: 'Local Places to Avoid', value: aiTips.placesToAvoid, color: 'text-rose-400' },
                      { title: 'Essential Safety Warnings', value: aiTips.safetyTips, color: 'text-amber-400' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-955/50 border border-slate-900 rounded-xl hover:border-slate-850 transition-colors">
                        <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${item.color}`}>{item.title}</span>
                        <p className="text-slate-300 text-xs leading-relaxed font-light">{item.value || 'Consult local boards for custom strategies.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weather info & Emergency details */}
              <div className="space-y-6">
                
                {/* Weather Forecast Details */}
                <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
                  <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CloudSun className="h-5 w-5 text-brand-400" />
                    <span>Weather Advisory</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-950/60 p-4 border border-slate-900 rounded-xl">
                      <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400 shrink-0"><Thermometer className="h-6 w-6" /></div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Current Temperature</span>
                        <span className="font-outfit text-xl font-bold text-white">{weatherSpecs.currentTemp}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-3.5 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500 block uppercase text-[10px] font-semibold">Climate Forecast</span>
                        <span className="text-white font-medium">{weatherSpecs.forecast}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-900/60">
                        <div>
                          <span className="text-slate-500 block uppercase text-[9px] font-semibold">Rain Chance</span>
                          <span className="text-slate-300 font-bold">{weatherSpecs.rainChance}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase text-[9px] font-semibold">UV Index</span>
                          <span className="text-slate-300 font-bold">{weatherSpecs.uvIndex}</span>
                        </div>
                      </div>
                      <div className="pt-2.5 border-t border-slate-900/60">
                        <span className="text-slate-500 block uppercase text-[10px] font-semibold">Suggested Clothing</span>
                        <span className="text-slate-300 font-medium leading-relaxed block mt-0.5">{weatherSpecs.suggestedClothing}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency details nearby */}
                <div className="glass-panel border border-slate-900 rounded-2xl p-6">
                  <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-400" />
                    <span>Emergency Services Grid</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    {[
                      { label: 'Hospital', val: emergencyInfo.hospital, icon: Phone },
                      { label: 'Police Station', val: emergencyInfo.police, icon: ShieldAlert },
                      { label: 'ATM Locator', val: emergencyInfo.atm, icon: Wallet },
                      { label: 'Pharmacy', val: emergencyInfo.pharmacy, icon: Info }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="p-3.5 bg-rose-950/10 border border-rose-500/10 rounded-xl space-y-1">
                          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">{item.label}</span>
                          <span className="text-slate-305 font-light flex items-center gap-1.5 leading-relaxed">
                            <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span>{item.val}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'packing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              
              {/* Checklists items */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative">
                  <h3 className="font-outfit text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Briefcase className="h-5.5 w-5.5 text-brand-400" />
                    <span>Things You'll Need (Interactive)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['clothing', 'gear', 'healthAndSafety'].map((cat) => {
                      const items = packingList[cat] || [];
                      if (items.length === 0) return null;
                      
                      return (
                        <div key={cat} className="space-y-3">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block font-outfit border-b border-slate-900 pb-2 capitalize">
                            {cat === 'healthAndSafety' ? 'Health & Safety' : cat}
                          </span>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <div 
                                key={item}
                                onClick={() => toggleChecklistItem(item)}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/40 border border-slate-900 cursor-pointer text-xs transition-colors hover:border-slate-800"
                              >
                                <button
                                  className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${checklist[item] ? 'bg-brand-500 border-brand-500 text-slate-950' : 'border-slate-600 bg-transparent text-transparent'}`}
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
                  </div>
                </div>
              </div>

              {/* Requirements & visa */}
              <div className="space-y-6">
                
                <div className="glass-panel border border-slate-900 rounded-2xl p-6 relative space-y-4">
                  <h3 className="font-outfit text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Info className="h-5 w-5 text-indigo-400" />
                    <span>Documents & Visas</span>
                  </h3>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block font-outfit">Documents Checklist</span>
                    <ul className="list-disc pl-4 text-xs font-light text-slate-350 space-y-2.5 pt-2 leading-relaxed">
                      {packingList.documents?.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-955/20 border border-indigo-500/10 p-4 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold block">Entry & Visas</span>
                    <p className="text-slate-400 leading-relaxed font-light">{packingList.entryRequirements}</p>
                  </div>

                  <div className="bg-brand-500/5 border border-brand-500/10 p-4 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] text-brand-400 uppercase tracking-wider font-bold block">Local Currency Details</span>
                    <p className="text-slate-400 leading-relaxed font-light">{packingList.currency}</p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
