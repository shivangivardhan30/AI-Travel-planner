import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, IndianRupee, Users, Compass, 
  Sun, Sunset, Plane, ArrowRight, ArrowLeft, Sparkles, Navigation 
} from 'lucide-react';

const interestOptions = [
  'Adventure', 'Nature', 'Mountains', 'Beaches', 'Historical Places', 
  'Food', 'Shopping', 'Nightlife', 'Relaxation', 'Religious/Spiritual'
];

export default function PlannerPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Form State
  const [origin, setOrigin] = useState('');
  const [suggestDestination, setSuggestDestination] = useState(true);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('25000');
  const [travellers, setTravellers] = useState('1');
  const [travelStyle, setTravelStyle] = useState('Solo'); // Solo, Couple, Friends, Family
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [preferredWeather, setPreferredWeather] = useState('Pleasant'); // Cold, Pleasant, Warm, Any
  const [transportPreference, setTransportPreference] = useState('Any'); // Flight, Train, Bus, Car, Any
  const [stayPreference, setStayPreference] = useState('Hotel'); // Hotel, Hostel, Resort, Homestay

  const handleInterestToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => {
    // Basic step validation
    if (currentStep === 1) {
      if (!origin.trim()) return;
      if (!suggestDestination && !destination.trim()) return;
    }
    if (currentStep === 2) {
      if (!startDate || !endDate) return;
      if (new Date(startDate) > new Date(endDate)) return;
    }
    if (currentStep === 3) {
      if (!budget || parseFloat(budget) <= 0) return;
    }
    if (currentStep === 4) {
      if (!travellers || parseInt(travellers) <= 0) return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage(suggestDestination ? 'Finding the best destinations for you...' : 'Analyzing weather, costs, and generating custom itinerary...');

    // Save preferences in sessionStorage to fetch them in results page
    const plannerSession = {
      origin,
      suggestDestination,
      destinationName: suggestDestination ? '' : destination,
      startDate,
      endDate,
      budget: parseFloat(budget),
      numberOfTravellers: parseInt(travellers),
      travelStyle,
      interests: selectedInterests,
      preferredWeather,
      transportPreference,
      stayPreference
    };
    
    sessionStorage.setItem('plannerPreferences', JSON.stringify(plannerSession));

    // Simulate standard 1.5s thinking screen
    setTimeout(() => {
      setLoading(false);
      if (suggestDestination) {
        navigate('/results');
      } else {
        navigate(`/results?destination=${encodeURIComponent(destination)}`);
      }
    }, 1800);
  };

  const progressPercentage = Math.round(((currentStep - 1) / 7) * 100);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 bg-navy-950 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <Compass className="h-16 w-16 text-brand-400 animate-spin" style={{ animationDuration: '3s' }} />
            <Sparkles className="absolute h-6 w-6 text-indigo-400 animate-pulse top-0 right-0" />
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white">TripMate Thinking...</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto animate-pulse">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow py-12 px-4 relative bg-navy-950">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl mx-auto">
        {/* Progress indicators */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
            <span>Step {currentStep} of 8</span>
            <span>{progressPercentage}% Complete</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-teal-400 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-panel rounded-2xl p-8 border border-slate-900 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: Origin & Destination */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-400" />
                  <span>Where are you starting from?</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">Starting City</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Mumbai, Delhi, Bangalore"
                      className="w-full glass-input text-sm"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                  </div>
                  
                  <div className="border-t border-slate-900 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-slate-400 text-sm font-semibold">Do you have a specific destination?</label>
                      <input 
                        type="checkbox" 
                        id="suggestDest"
                        className="sr-only"
                        checked={suggestDestination}
                        onChange={() => setSuggestDestination(!suggestDestination)}
                      />
                      <label 
                        htmlFor="suggestDest"
                        className={`relative w-12 h-6 bg-slate-900 rounded-full border border-slate-800 cursor-pointer transition-colors duration-300 flex items-center ${suggestDestination ? 'bg-brand-500/20' : ''}`}
                      >
                        <span 
                          className={`absolute w-4 h-4 rounded-full bg-slate-300 transition-transform duration-300 ${suggestDestination ? 'translate-x-7 bg-brand-400' : 'translate-x-1'}`}
                        />
                      </label>
                    </div>

                    {suggestDestination ? (
                      <div className="p-3 bg-brand-500/5 rounded-xl border border-brand-500/10 text-brand-300 text-xs flex items-center gap-2">
                        <Sparkles className="h-4 w-4 shrink-0 text-brand-400" />
                        <span>Our AI will analyze your dates, budget and interests to recommend the top 3 spots!</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-slate-400 text-xs font-medium">Preferred Destination</label>
                        <input 
                          type="text"
                          required={!suggestDestination}
                          placeholder="e.g. Goa, Manali, Jaipur"
                          className="w-full glass-input text-sm"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Dates */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-400" />
                  <span>When do you want to travel?</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">Start Date</label>
                    <input 
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full glass-input text-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">End Date</label>
                    <input 
                      type="date"
                      required
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full glass-input text-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Budget */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-brand-400" />
                  <span>What's your total budget?</span>
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm font-semibold">₹</span>
                    <input 
                      type="number"
                      required
                      className="w-full glass-input pl-7 text-sm font-semibold"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <button 
                      type="button" 
                      onClick={() => setBudget('15000')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${budget === '15000' ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      ₹15,000 (Budget)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setBudget('35000')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${budget === '35000' ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      ₹35,000 (Standard)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setBudget('75000')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${budget === '75000' ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      ₹75,000+ (Premium)
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px] text-center italic">Total trip pool budget in Indian Rupees for all travellers combined.</p>
                </div>
              </div>
            )}

            {/* STEP 4: Travellers Count & Style */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-400" />
                  <span>Who are you travelling with?</span>
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-2">Number of Travellers</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="number"
                        required
                        min="1"
                        className="w-full glass-input pl-10 text-sm font-semibold"
                        value={travellers}
                        onChange={(e) => setTravellers(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-3">Travel Style</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Solo', desc: 'Single traveler exploration' },
                        { name: 'Couple', desc: 'Romantic getaway for two' },
                        { name: 'Friends', desc: 'Group or buddy dynamic' },
                        { name: 'Family', desc: 'Kid & elder-friendly comfort' }
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setTravelStyle(item.name)}
                          className={`p-4 text-left rounded-xl border transition-all flex flex-col ${travelStyle === item.name ? 'bg-brand-500/20 border-brand-500 text-brand-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                        >
                          <span className="text-white text-sm font-bold">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal mt-1 leading-normal">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Interests */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  <Compass className="h-5 w-5 text-brand-400" />
                  <span>What are your trip interests?</span>
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {interestOptions.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`py-2 px-4 text-xs rounded-full border transition-all ${isSelected ? 'bg-brand-500/20 border-brand-500 text-brand-400 font-medium' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6: Weather Preference */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  <Sun className="h-5 w-5 text-brand-400" />
                  <span>Preferred weather environment?</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Cold / Snow', value: 'Cold', desc: 'Snowy mountains & cold winds' },
                    { label: 'Pleasant', value: 'Pleasant', desc: 'Mild temp, comfortable skies' },
                    { label: 'Warm / Tropical', value: 'Warm', desc: 'Sunny beaches, desert sands' },
                    { label: 'Any Weather', value: 'Any', desc: 'Open to explore regardless' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPreferredWeather(item.value)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col ${preferredWeather === item.value ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-slate-900 border-slate-800/80 text-slate-400'}`}
                    >
                      <span className="font-bold text-sm text-white mb-1">{item.label}</span>
                      <span className="text-[10px] text-slate-400 leading-normal">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Preferred Transport */}
            {currentStep === 7 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  <Plane className="h-5 w-5 text-brand-400" />
                  <span>How do you prefer to travel?</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Flight', desc: 'Fastest transit' },
                    { name: 'Train', desc: 'Scenic budget track' },
                    { name: 'Bus', desc: 'Intercity links' },
                    { name: 'Car', desc: 'Flexible roadtrip' },
                    { name: 'Any', desc: 'Best match' }
                  ].map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setTransportPreference(item.name)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col ${transportPreference === item.name ? 'bg-brand-500/20 border-brand-500 text-brand-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      <span className="text-white text-sm font-bold">{item.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-normal">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 8: Preferred Stay (New) */}
            {currentStep === 8 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  <Compass className="h-5 w-5 text-brand-400" />
                  <span>What is your stay preference?</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Hotel', desc: 'Comfortable premium hotel stay' },
                    { name: 'Hostel', desc: 'Budget-friendly shared backpacker setup' },
                    { name: 'Resort', desc: 'Luxury resort and retreat amenities' },
                    { name: 'Homestay', desc: 'Cozy authentic local residency' }
                  ].map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setStayPreference(item.name)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col ${stayPreference === item.name ? 'bg-brand-500/20 border-brand-500 text-brand-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      <span className="text-white text-sm font-bold">{item.name}</span>
                      <span className="text-[10px] text-slate-400 mt-1 leading-normal">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-900 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              )}

              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-grow glow-btn bg-brand-500 hover:bg-brand-600 text-slate-950 font-extrabold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span>Generate AI Plan</span>
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
