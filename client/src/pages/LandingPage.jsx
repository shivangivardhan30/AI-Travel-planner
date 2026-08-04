import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, Sparkles, Shield, Calendar, ArrowRight, ArrowUpRight, 
  HelpCircle, Search, Star, Smile, ChevronDown, ChevronUp, MapPin, 
  DollarSign, CloudSun, Briefcase, Plane, Heart, Award, ArrowRightCircle
} from 'lucide-react';
import heroImg from '../assets/hero_dashboard.jpg';

const popularPicks = [
  {
    name: 'Goa',
    state: 'Goa',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    desc: 'Golden sands, Portuguese architecture, and energetic coastal vibes.',
    rating: '4.8',
    price: '₹7,500/person'
  },
  {
    name: 'Manali',
    state: 'Himachal Pradesh',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
    desc: 'Breathtaking snow peaks, mountain air, and valley hiking treks.',
    rating: '4.9',
    price: '₹8,200/person'
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1477584322904-486a247a30d5?auto=format&fit=crop&w=400&q=80',
    desc: 'Majestic forts, pink palaces, and rich Rajasthani heritage details.',
    rating: '4.7',
    price: '₹6,400/person'
  },
  {
    name: 'Kerala',
    state: 'Kerala',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=400&q=80',
    desc: 'Tranquil houseboats, wellness Ayurveda spas, and emerald hills.',
    rating: '4.9',
    price: '₹9,500/person'
  }
];

const trendingDestinations = [
  {
    name: 'Ladakh',
    state: 'Jammu & Kashmir',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
    visitors: '12.4k planned recently',
    match: '98% match score',
    tag: 'Mountain Trek',
    price: '₹14,500'
  },
  {
    name: 'Udaipur',
    state: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=400&q=80',
    visitors: '9.8k planned recently',
    match: '95% match score',
    tag: 'Royal Lakes',
    price: '₹12,200'
  },
  {
    name: 'Munnar',
    state: 'Kerala',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=400&q=80',
    visitors: '8.3k planned recently',
    match: '92% match score',
    tag: 'Tea Valleys',
    price: '₹9,800'
  },
  {
    name: 'Andaman Islands',
    state: 'Andaman & Nicobar',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=400&q=80',
    visitors: '6.5k planned recently',
    match: '97% match score',
    tag: 'Scuba Paradise',
    price: '₹22,400'
  }
];

const seasonalPicks = {
  summer: [
    { name: 'Leh Ladakh', temp: '15°C to 25°C', desc: 'Sunny high-mountain passes and deep blue salt lakes.', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80' },
    { name: 'Ooty Hills', temp: '12°C to 20°C', desc: 'Lush tea plantations, botanical reserves, and cool valley breeze.', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=300&q=80' },
    { name: 'Shimla Heights', temp: '15°C to 28°C', desc: 'Colonial pathways, toy-train adventures, and panoramic ridges.', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' }
  ],
  monsoon: [
    { name: 'Valley of Flowers', temp: '10°C to 18°C', desc: 'Unreal blossoming alpine meadows in high Himalayas.', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Lonavala waterfalls', temp: '18°C to 24°C', desc: 'Mist-clad waterfalls, Sahyadri hiking valleys, and forts.', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=300&q=80' },
    { name: 'Munnar Spices', temp: '16°C to 22°C', desc: 'Cascading spice plantation gardens and emerald streams.', img: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=300&q=80' }
  ],
  winter: [
    { name: 'Manali Resort', temp: '-2°C to 8°C', desc: 'Thick valley snowfall, Solang ski activities, and cozy fireplaces.', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80' },
    { name: 'Jaisalmer Camps', temp: '10°C to 24°C', desc: 'Golden sands desert safaris, folk dance nights, and fort trails.', img: 'https://images.unsplash.com/photo-1477584322904-486a247a30d5?auto=format&fit=crop&w=300&q=80' },
    { name: 'Auli Slopes', temp: '-4°C to 6°C', desc: 'Premium white snow ski slopes, cable cars, and Nanda Devi views.', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=300&q=80' }
  ]
};

const budgetPicks = {
  pocket: [
    { name: 'Rishikesh', cost: '₹5,500', duration: '3 Days', style: 'Rafting & Camping', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=300&q=80' },
    { name: 'Jaipur heritage', cost: '₹8,400', duration: '4 Days', style: 'Culture & Sightseeing', img: 'https://images.unsplash.com/photo-1477584322904-486a247a30d5?auto=format&fit=crop&w=300&q=80' },
    { name: 'Gokarna Beaches', cost: '₹6,800', duration: '3 Days', style: 'Cliffs & Sunset Treks', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' }
  ],
  explorer: [
    { name: 'Manali Solang', cost: '₹18,500', duration: '5 Days', style: 'Paragliding & Treks', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kerala Backwaters', cost: '₹22,000', duration: '6 Days', style: 'Houseboat Stays', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=300&q=80' },
    { name: 'Goa Beaches', cost: '₹16,500', duration: '4 Days', style: 'Watersports & Shacks', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' }
  ],
  luxury: [
    { name: 'Andaman Scuba', cost: '₹42,000', duration: '6 Days', style: 'Scuba & Resort Luxury', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=300&q=80' },
    { name: 'Ladakh Safaris', cost: '₹38,500', duration: '7 Days', style: 'Premium Nubra Camps', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80' },
    { name: 'Udaipur Taj Palace', cost: '₹48,000', duration: '5 Days', style: 'Royal Lake Dining', img: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=300&q=80' }
  ]
};

const reviewsList = [
  {
    name: 'Aakash Sharma',
    trip: 'Manali Solang Explorer',
    score: 5,
    text: 'TripMate made my trek planning unbelievably simple! The seasonal weather advisory told me exactly what woolens to pack, and the budget estimator was spot on.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
  },
  {
    name: 'Priyanka Sen',
    trip: 'Kerala Houseboat Tour',
    score: 5,
    text: 'My family was shocked at how organized the itinerary was. Morning/Afternoon schedules matched our interests perfectly, and the emergency grid gave me peace of mind.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
  },
  {
    name: 'Rohan Malhotra',
    trip: 'Goa Beach Resort',
    score: 5,
    text: 'Being able to add taxi and restaurant bills directly into the expense ledger saved us so much time! Custom SVG graphs showed our cost splits dynamically.',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80'
  }
];

function AnimatedCounter({ value, duration = 1.2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    const totalFrames = duration * 60;
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = Math.round(end * progress);
      
      if (frame >= totalFrames) {
        clearInterval(counter);
        setCount(value);
      } else {
        setCount('₹' + currentCount.toLocaleString());
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [value, duration]);

  return <span>{count}</span>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [activeSeason, setActiveSeason] = useState('winter');
  const [activeBudgetTier, setActiveBudgetTier] = useState('pocket');
  const [openFaq, setOpenFaq] = useState(null);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    const x = (e.clientX - window.innerWidth / 2) / 36;
    const y = (e.clientY - window.innerHeight / 2) / 36;
    setMousePos({ x, y });
  };

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const rotateX = (yc - y) / 8;
    const rotateY = (x - xc) / 8;
    
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchVal)}`);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  if (pageLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-navy-950 flex flex-col items-center justify-center text-white">
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [0.85, 1.08, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="flex items-center gap-3"
        >
          <span className="p-3.5 rounded-2xl bg-teal-500/10 text-brand-400 border border-brand-500/25 shadow-lg shadow-brand-500/10">
            <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: '3s' }} />
          </span>
          <span className="font-outfit font-extrabold text-3xl tracking-tight">
            Trip<span className="text-brand-400">Mate</span>
          </span>
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 140 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeInOut" }}
          className="h-1 bg-brand-500 rounded-full mt-6 shadow-glow shadow-brand-500/50"
        />
      </div>
    );
  }

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-grow flex flex-col bg-navy-950 text-white min-h-screen transition-all duration-300"
    >
      
      {/* 1. Full-Screen Hero Section with Destination Search */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-900">
        
        {/* Floating Particles in Hero Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[
            { top: '15%', left: '8%', size: 'w-2 h-2', delay: '0s' },
            { top: '35%', left: '85%', size: 'w-3 h-3', delay: '2s' },
            { top: '68%', left: '12%', size: 'w-1.5 h-1.5', delay: '1s' },
            { top: '78%', left: '80%', size: 'w-4 h-4', delay: '3s' },
            { top: '22%', left: '52%', size: 'w-2.5 h-2.5', delay: '4s' }
          ].map((part, pIdx) => (
            <div 
              key={pIdx} 
              className={`absolute rounded-full bg-brand-400/20 blur-[1px] animate-float-slow ${part.size}`}
              style={{ 
                top: part.top, 
                left: part.left, 
                animationDelay: part.delay,
                animationDuration: `${10 + pIdx * 3}s`
              }}
            />
          ))}
        </div>

        {/* Glowing Blurred Accents with interactive mouse parallax */}
        <div 
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-500/10 rounded-full blur-[130px] pointer-events-none transition-transform duration-300 ease-out z-0" 
          style={{ transform: `translate3d(${-mousePos.x * 1.6}px, ${-mousePos.y * 1.6}px, 0)` }}
        />
        <div 
          className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none transition-transform duration-300 ease-out z-0" 
          style={{ transform: `translate3d(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px, 0)` }}
        />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text & Search Block */}
          <div className="lg:col-span-7 text-left space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider border border-brand-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen AI Travel Intelligence</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-outfit text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
            >
              Design Your Perfect <br />
              <span className="gradient-text">Custom Escape.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed font-light"
            >
              Skip hours of manual research. Enter your dates, budget style, and starting city. TripMate structures daily timelines, hotel recommendations, transit tables, and interactive maps in seconds.
            </motion.p>

            {/* Glassmorphic Search Bar */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              onSubmit={handleSearchSubmit} 
              className="relative max-w-xl group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-indigo-500 rounded-2xl opacity-30 blur-md group-focus-within:opacity-65 transition-all" />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Where do you want to go? (e.g. Goa, Manali, Jaipur)"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-12 pr-28 py-4.5 bg-slate-950/70 border border-slate-850 focus:border-brand-500 focus:outline-none rounded-2xl text-sm font-medium text-white transition-all shadow-xl placeholder-slate-500"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Find Sights
                </button>
              </div>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center gap-3 pt-3"
            >
              <Link
                to="/planner"
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-250 hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Compass className="h-4 w-4 text-brand-400" />
                <span>Launch AI Trip Planner Wizard</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Hero Dashboard Render with Parallax float */}
          <div 
            className="lg:col-span-5 relative flex justify-center items-center transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)` }}
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-teal-400 to-indigo-500 opacity-25 blur-lg animate-pulse" style={{ animationDuration: '6s' }} />
            
            <div className="relative glass-panel p-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-lg lg:max-w-full">
              <img 
                src={heroImg} 
                alt="TripMate App Dashboard mockup" 
                className="w-full h-auto rounded-xl object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Destination Cards */}
      <section className="py-24 px-4 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-3">Featured Destinations</h2>
              <p className="text-slate-400 text-sm">Discover handpicked travel inspirations with complete local guides.</p>
            </div>
            <Link to="/explore" className="text-brand-400 hover:text-brand-300 font-bold inline-flex items-center gap-1 transition-colors mt-4 sm:mt-0 text-sm">
              <span>View all destinations</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularPicks.map((pick) => (
              <div 
                key={pick.name} 
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="glass-panel rounded-2xl overflow-hidden border border-slate-900 group relative flex flex-col justify-between hover-card-premium cursor-pointer"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={pick.image}
                    alt={pick.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Rating badge */}
                  <span className="absolute top-3 right-4 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-955/70 border border-slate-800 text-brand-400">
                    ★ {pick.rating}
                  </span>

                  <span className="absolute bottom-3 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 uppercase tracking-wide">
                    {pick.state}
                  </span>
                </div>
                
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-outfit text-xl font-bold text-white mb-1.5">{pick.name}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-light">{pick.desc}</p>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-slate-900/60 pt-4">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Starting cost</span>
                      <span className="text-sm font-extrabold text-white font-outfit">{pick.price}</span>
                    </div>
                    <Link
                      to={`/explore?search=${pick.name}`}
                      className="text-xs text-brand-400 font-bold inline-flex items-center gap-1 group-hover:text-brand-300 transition-all"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Trending Destinations Section */}
      <section className="py-24 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold">Trending Safaris & Escapes</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">These spots are seeing a heavy surge in travel planning this week.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingDestinations.map((pick, idx) => (
              <div 
                key={pick.name} 
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="relative rounded-2xl border border-slate-900 bg-slate-955/40 p-4 space-y-4 group hover-card-premium cursor-pointer"
              >
                <div className="h-44 rounded-xl overflow-hidden relative">
                  <img src={pick.image} alt={pick.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                  <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider bg-slate-955/80 px-2 py-0.5 rounded border border-slate-800 text-brand-400">
                    #{idx + 1} Trending
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold uppercase">{pick.state}</span>
                      <h4 className="font-outfit font-bold text-white text-base mt-0.5">{pick.name}</h4>
                    </div>
                    <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded font-semibold">{pick.match}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Smile className="h-4 w-4 text-brand-400" />
                    <span>{pick.visitors}</span>
                  </div>

                  <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">{pick.tag}</span>
                    <span className="font-bold text-white font-outfit">
                      <AnimatedCounter value={pick.price} />/person
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Seasonal Travel Recommendations */}
      <section className="py-24 px-4 bg-slate-950/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold">Climate Smart Recommendations</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Weather-optimized destination matching designed around India's seasonal changes.</p>
            
            {/* Season tabs */}
            <div className="inline-flex gap-1 bg-slate-950 border border-slate-900 rounded-xl p-1.5 mt-6">
              {[
                { id: 'summer', label: 'Summer (Apr - Jun)', icon: CloudSun },
                { id: 'monsoon', label: 'Monsoon (Jul - Sep)', icon: Compass },
                { id: 'winter', label: 'Winter (Oct - Mar)', icon: Calendar }
              ].map((season) => {
                const Icon = season.icon;
                const active = activeSeason === season.id;
                return (
                  <button
                    key={season.id}
                    onClick={() => setActiveSeason(season.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${active ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{season.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {seasonalPicks[activeSeason].map((pick) => (
              <div 
                key={pick.name} 
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="glass-panel border border-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between hover-card-premium cursor-pointer"
              >
                <div className="h-44 overflow-hidden relative">
                  <img src={pick.img} alt={pick.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-955 via-transparent to-transparent opacity-85" />
                  <span className="absolute bottom-3 left-4 text-xs font-bold text-brand-400 bg-slate-955/70 border border-slate-800 px-2 py-0.5 rounded">Avg Temp: {pick.temp}</span>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <h4 className="font-outfit font-bold text-white text-lg">{pick.name}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed font-light">{pick.desc}</p>
                  </div>
                  <Link
                    to={`/explore?search=${pick.name}`}
                    className="text-xs text-brand-400 font-bold inline-flex items-center gap-1 hover:text-brand-300 transition-all mt-auto"
                  >
                    <span>View Seasonal Guide</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Budget-Based Trip Suggestions */}
      <section className="py-24 px-4 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold">Suggestions by Budget</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Curated experiences mapped to match specific spend profiles.</p>
            
            {/* Budget tabs */}
            <div className="inline-flex gap-1 bg-slate-950 border border-slate-900 rounded-xl p-1.5 mt-6">
              {[
                { id: 'pocket', label: 'Pocket Friendly (<₹15k)' },
                { id: 'explorer', label: 'Explorer (₹15k - ₹35k)' },
                { id: 'luxury', label: 'Premium Luxury (>₹35k)' }
              ].map((tier) => {
                const active = activeBudgetTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setActiveBudgetTier(tier.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${active ? 'bg-brand-500 text-slate-955 shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {budgetPicks[activeBudgetTier].map((pick) => (
              <div 
                key={pick.name} 
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="glass-panel border border-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between hover-card-premium cursor-pointer"
              >
                <div className="h-44 overflow-hidden relative">
                  <img src={pick.img} alt={pick.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-955 via-transparent to-transparent opacity-85" />
                  <span className="absolute bottom-3 left-4 text-xs font-bold text-white bg-slate-955/70 border border-slate-800 px-2 py-0.5 rounded font-outfit">
                    <AnimatedCounter value={pick.cost} />/person
                  </span>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <span className="text-[9px] text-brand-400 font-bold uppercase tracking-wider">{pick.style}</span>
                    <h4 className="font-outfit font-bold text-white text-lg">{pick.name}</h4>
                    <p className="text-slate-400 text-xs leading-normal font-light">Optimized duration: {pick.duration} plan profile.</p>
                  </div>
                  <Link
                    to="/planner"
                    className="text-xs text-brand-400 font-bold inline-flex items-center gap-1 hover:text-brand-300 transition-all mt-auto"
                  >
                    <span>Configure Budget Plan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Popular Experience Categories */}
      <section className="py-24 px-4 bg-slate-955/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold">Experiential Travel Niches</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Match trips directly to your personal lifestyle hobbies and active pursuits.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Beach Escapes', icon: Compass, desc: 'Scuba diving, sunset cliff walks, and warm coastal vibes.', count: '4 Destinations', color: 'border-cyan-500/10 text-cyan-400' },
              { title: 'Mountain Adventures', icon: Award, desc: 'Skiing, high-altitude trekking, paragliding, and snow peaks.', count: '5 Destinations', color: 'border-indigo-500/10 text-indigo-400' },
              { title: 'Cultural Heritage', icon: Sparkles, desc: 'Fort trails, royal palaces, temple walks, and history guides.', count: '3 Destinations', color: 'border-brand-500/10 text-brand-400' },
              { title: 'Culinary Pathways', icon: Smile, desc: 'Street food trails, tea plantations, and local dining hubs.', count: '3 Destinations', color: 'border-orange-500/10 text-orange-400' }
            ].map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <div key={idx} className={`glass-panel border rounded-2xl p-6 relative flex flex-col justify-between ${exp.color} hover-card-premium`}>
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center border border-slate-850 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-outfit font-bold text-white text-base">{exp.title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed font-light">{exp.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider mt-6 font-semibold">{exp.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Travelers Testimonials */}
      <section className="py-24 px-4 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold">Loved by Vagabonds</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">See how travelers are using TripMate to optimize their itineraries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviewsList.map((rev, idx) => (
              <div key={idx} className="glass-panel border border-slate-900 rounded-2xl p-6 flex flex-col justify-between relative hover-card-premium">
                <div className="space-y-4">
                  <div className="flex gap-1 text-brand-400">
                    {[...Array(rev.score)].map((_, sIdx) => (
                      <Star key={sIdx} className="h-4.5 w-4.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-305 text-xs leading-relaxed font-light italic">"{rev.text}"</p>
                </div>

                <div className="flex items-center gap-3 border-t border-slate-900/60 pt-4 mt-6">
                  <img src={rev.avatar} alt={rev.name} className="w-10 h-10 rounded-full border border-slate-800 shrink-0" />
                  <div>
                    <span className="text-white text-xs font-bold block">{rev.name}</span>
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase tracking-wide mt-0.5">{rev.trip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions (FAQ) Accordion */}
      <section className="py-24 px-4 bg-slate-950/50 border-t border-slate-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold">Planning Questions?</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Frequently asked queries about our interactive layout matching algorithms.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: 'How does the TripMate planning engine work?', a: 'TripMate is fueled by climate matrices, average transit costs (rail fares, flight coefficients), hotel lists, and attraction databases. When you choose preferences, it computes matching coordinates to build clean itineraries.' },
              { q: 'Can I track my real-time spending on the app?', a: 'Yes! If you save your travel plan to your dashboard, you unlock the Interactive Expense Ledger. This lets you enter custom logs (food, taxi, shopping) and tracks your spending using responsive SVG Area Line graphs.' },
              { q: 'Can I recalculate my budget mid-way?', a: 'Absolutely. You can toggle between Budget, Standard, and Premium pricing profiles on the details dashboard. It instantly adjusts stay tariffs, dining estimates, and sightseeing pools.' },
              { q: 'Is there a Google Maps integration built-in?', a: 'Yes, each recommended attraction card in the timeline has a Google Maps Directions launcher button to get route instructions instantly.' }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="glass-panel border border-slate-900 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-5 text-left text-xs font-semibold hover:bg-slate-900/20 transition-colors cursor-pointer text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-brand-400" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-450" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-[11px] leading-relaxed text-slate-400 font-light border-t border-slate-900/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </motion.div>
  );
}
