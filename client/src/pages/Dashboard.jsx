import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import Toast from '../components/Toast';
import { 
  Briefcase, Calendar, MapPin, Sparkles, Heart, Trash2, 
  ExternalLink, Compass, Plus, ArrowRight, User 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tripsRes, favsRes] = await Promise.all([
          API.get('/trips'),
          API.get('/favourites')
        ]);
        
        setTrips(tripsRes.data.trips || []);
        setFavourites(favsRes.data.favourites || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
        setError("Failed to sync dashboard data with server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeleteTrip = async (id, destination) => {
    if (!window.confirm(`Are you sure you want to delete your trip to ${destination}?`)) {
      return;
    }

    try {
      await API.delete(`/trips/${id}`);
      setTrips(trips.filter(t => t.id !== id));
      setToastMessage({ message: `Successfully deleted trip to ${destination}.`, type: 'success' });
    } catch (err) {
      console.error("Delete trip error:", err);
      setToastMessage({ message: 'Failed to delete trip.', type: 'error' });
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Segment trips into Upcoming vs Past
  const today = new Date();
  const upcomingTrips = trips.filter(t => new Date(t.startDate) >= today);
  const pastTrips = trips.filter(t => new Date(t.startDate) < today);

  return (
    <div className="flex-grow py-12 px-4 bg-navy-950">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Welcome message banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-900">
          <div>
            <h1 className="font-outfit text-3xl font-extrabold text-white flex items-center gap-2">
              <User className="h-7 w-7 text-brand-400" />
              <span>Welcome, {user?.name || 'Explorer'}!</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage your saved itineraries, review packing checklists, and trigger new plans.</p>
          </div>
          <Link
            to="/planner"
            className="glow-btn bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-1.5 text-sm shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Plan New Trip</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-slate-300 text-xs">
            ⚠️ {error} - Showing cached/offline local details.
          </div>
        )}

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Saved Trips */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* UPCOMING TRIPS PANEL */}
            <div className="space-y-4">
              <h2 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-brand-400" />
                <span>Upcoming Journeys</span>
              </h2>

              {upcomingTrips.length === 0 ? (
                <div className="glass-panel rounded-2xl p-8 text-center border border-slate-900">
                  <p className="text-slate-400 text-sm mb-4">No upcoming trips saved yet. Time to map out your next adventure!</p>
                  <Link to="/planner" className="text-xs text-brand-400 font-bold inline-flex items-center gap-1 hover:underline">
                    <span>Launch the AI Planner</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingTrips.map((trip) => (
                    <div key={trip.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-900 flex flex-col hover:border-slate-800 transition-all">
                      <div className="h-36 relative shrink-0">
                        <img src={trip.destinationImage} alt={trip.destination} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                        
                        <div className="absolute bottom-3 left-4">
                          <h3 className="font-outfit text-lg font-bold text-white">{trip.destination}</h3>
                          <span className="text-[10px] text-brand-300 font-medium flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" /> Started from {trip.origin}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-grow text-xs">
                        <div className="flex items-center gap-1 text-slate-400 mb-4 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span>
                            {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold border-b border-slate-900/60 pb-3 mb-4">
                          <span>{trip.numberOfTravellers} Traveller(s)</span>
                          <span>Budget: ₹{trip.budget?.toLocaleString()}</span>
                        </div>

                        <div className="flex gap-2 mt-auto">
                          {/* Direct view link with custom saved trip parameter */}
                          <Link
                            to={`/details?tripId=${trip.id}`}
                            className="flex-grow bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-center font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <span>Open Itinerary</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteTrip(trip.id, trip.destination)}
                            className="p-2 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAST TRIPS PANEL */}
            {pastTrips.length > 0 && (
              <div className="space-y-4 pt-4">
                <h2 className="font-outfit text-xl font-bold text-slate-300">Previous Searches / Travels</h2>
                <div className="space-y-2">
                  {pastTrips.map((trip) => (
                    <div key={trip.id} className="glass-panel rounded-xl p-4 border border-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-semibold text-white font-outfit text-sm">{trip.destination}</h4>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(trip.startDate).toLocaleDateString()} - {trip.numberOfTravellers} travellers
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/details?tripId=${trip.id}`}
                          className="p-1.5 hover:bg-slate-900 rounded border border-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteTrip(trip.id, trip.destination)}
                          className="p-1.5 hover:bg-rose-950/20 rounded border border-slate-800 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Favourites List */}
          <div className="space-y-6">
            <h2 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <span>Favourites</span>
            </h2>

            {favourites.length === 0 ? (
              <div className="glass-panel rounded-2xl p-6 text-center border border-slate-900 text-xs">
                <p className="text-slate-400">Your favourites list is empty. Click the heart icon on any destination page to pin it here.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {favourites.map((fav) => {
                  const d = fav.destination;
                  return (
                    <div key={fav.id} className="glass-panel rounded-xl overflow-hidden border border-slate-900 flex items-center gap-3 p-2.5">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={d?.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80'} 
                          alt={fav.destinationName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <h4 className="font-outfit font-bold text-white text-xs truncate">{fav.destinationName}</h4>
                        <span className="text-[10px] text-slate-500 block truncate">{d?.state || 'India'}</span>
                        <Link 
                          to={`/details?destination=${encodeURIComponent(fav.destinationName)}`}
                          className="text-[10px] text-brand-400 font-semibold hover:underline mt-1 block"
                        >
                          View Guide
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
