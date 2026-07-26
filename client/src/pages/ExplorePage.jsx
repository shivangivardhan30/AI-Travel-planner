import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Search, MapPin, Compass, Sparkles, Filter } from 'lucide-react';

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [seasonFilter, setSeasonFilter] = useState('');
  
  useEffect(() => {
    const loadDestinations = async () => {
      setLoading(true);
      try {
        const res = await API.get('/destinations/search', {
          params: {
            q: searchQuery,
            season: seasonFilter
          }
        });
        setDestinations(res.data.destinations || []);
      } catch (err) {
        console.error("Explore load error:", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      loadDestinations();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, seasonFilter]);

  return (
    <div className="flex-grow py-12 px-4 bg-navy-950">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Title block */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white">Explore Destinations</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Browse through our curated seed catalog of popular destinations. Check local sightseeing list guidelines, typical seasonal costs, and start customized itineraries.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/40 border border-slate-900 p-4 rounded-2xl max-w-4xl mx-auto">
          {/* Search box */}
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              className="w-full glass-input pl-10 text-sm py-2"
              placeholder="Search by name, state, attractions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Season Filter Dropdown */}
          <div className="relative min-w-[180px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Filter className="h-4 w-4" />
            </span>
            <select
              className="w-full glass-input pl-9 text-sm py-2 cursor-pointer appearance-none bg-slate-950 text-slate-300"
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
            >
              <option value="">All Seasons</option>
              <option value="Winter">Winter (Oct - Feb)</option>
              <option value="Summer">Summer (Mar - Jun)</option>
              <option value="Monsoon">Monsoon (Jul - Sep)</option>
              <option value="Coastal">Coastal / Beach</option>
            </select>
          </div>
        </div>

        {/* Grid Lists */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : destinations.length === 0 ? (
          <div className="glass-panel border border-slate-900 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
            <Compass className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="font-outfit font-bold text-white text-base">No destinations match</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              We couldn't find matches. Try adjusting your keywords or clearing the season filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {destinations.map((d) => (
              <div 
                key={d.id} 
                className="glass-panel rounded-2xl overflow-hidden border border-slate-900 hover:border-slate-800 transition-all flex flex-col h-full hover:shadow-xl group"
              >
                {/* Visual Image header */}
                <div className="h-48 overflow-hidden relative shrink-0">
                  <img 
                    src={d.image} 
                    alt={d.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  
                  <span className="absolute bottom-3 left-4 text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/25 px-2.5 py-0.5 rounded font-semibold tracking-wider uppercase font-outfit">
                    {d.typicalSeason.split(' ')[0]}
                  </span>
                </div>

                {/* Details body */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-outfit text-xl font-bold text-white mb-1">{d.name}</h3>
                  <p className="text-xs text-slate-400 mb-3 flex items-center gap-0.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{d.state}, {d.country}</span>
                  </p>
                  
                  <p className="text-slate-400 text-xs leading-relaxed font-light mb-5 flex-grow">
                    {d.description.length > 130 ? `${d.description.substring(0, 130)}...` : d.description}
                  </p>

                  <div className="flex gap-2 border-t border-slate-900/60 pt-4 mt-auto">
                    <Link
                      to={`/details?destination=${encodeURIComponent(d.name)}`}
                      className="flex-grow bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold py-2 rounded-lg text-xs text-center transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/planner?destination=${encodeURIComponent(d.name)}`}
                      className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
