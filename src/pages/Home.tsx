import React, { useContext, useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { NavContext } from '../app/context';
import { MOCK_ITEMS } from '../mockData';
import { Badge, Button, ProfitPill, ConfidenceBar } from '../components/UIComponents';
import Waves from '../components/Waves';

const HiddenGemsReveal = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 }); // Start far off-screen
  const containerRef = useRef<HTMLSpanElement>(null);
  
  // Global proximity detection
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, []);

  return (
     <span 
       ref={containerRef}
       className="relative inline-block cursor-crosshair align-bottom px-2 select-none"
     >
        {/* Base Layer - Standard Red/Orange Gradient */}
        <span 
           className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-orange-600 block"
           style={{
             WebkitMaskImage: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, transparent 30%, black 70%)`,
             maskImage: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, transparent 30%, black 70%)`
           }}
        >
          Hidden Gems
        </span>

        {/* Reveal Layer */}
        <span 
           className="absolute inset-0 z-20 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 block pointer-events-none"
           style={{
              fontFamily: 'inherit',
              fontWeight: 800,
              textShadow: '0px 2px 4px rgba(180, 83, 9, 0.4)',
              transform: 'scale(1.0)',
              WebkitMaskImage: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 70%)`,
              maskImage: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 70%)`
           }}
        >
          Hidden Gems
        </span>
     </span>
  );
};

export const Home = () => {
  const { navigateTo, setSearchQuery, setMarketplaceFilter } = useContext(NavContext);
  const [localQuery, setLocalQuery] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const phrases = ["Old Film Camera...", "Mid-Century Chair...", "Vintage Rolex...", "Designer Lamp..."];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setPlaceholderText(
        isDeleting 
          ? fullText.substring(0, placeholderText.length - 1) 
          : fullText.substring(0, placeholderText.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000); // Pause at end
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum, phrases, typingSpeed]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      setMarketplaceFilter(null); // Reset filter for "Hunt All"
      navigateTo('search');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-red-50">
      
      {/* Animated Gradient Background - covers from top, ends before ticker */}
      <div className="absolute inset-0 pointer-events-none" style={{ height: '1100px' }}>
        <div className="absolute inset-0 opacity-60">
          <div className="absolute -top-20 left-0 w-[500px] h-[500px] bg-gradient-to-br from-red-200/40 to-orange-200/30 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/30 to-pink-200/40 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-gradient-to-br from-rose-200/40 to-red-200/30 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '4s' }}></div>
        </div>
        {/* Smooth fade to white at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-white"></div>
      </div>
      
      {/* Hero Section Content */}
      <section className="relative pt-24 sm:pt-32 pb-16 px-4 min-h-[85vh] flex flex-col justify-center">

        <div className="relative z-20 max-w-5xl mx-auto text-center">
            {/* Animated Badge Above Title */}
            <div className="mb-8 animate-bounce-in">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold shadow-xl shadow-red-500/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span>2,847 gems discovered in the last 24h</span>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-reveal">
              <span className="text-slate-900">Uncover</span>{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-gradient">Hidden Gems</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 2 150 2 198 10" stroke="url(#paint0_linear)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="200" y2="0">
                      <stop stopColor="#DC2626"/>
                      <stop offset="0.5" stopColor="#F97316"/>
                      <stop offset="1" stopColor="#DC2626"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              <span className="text-slate-900">Before Everyone Else</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed slide-in-left">
              AI-powered visual search that finds undervalued treasures hiding in plain sight.{' '}
              <span className="text-red-600 font-bold">Turn $100 into $500</span> by spotting what others miss.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group z-20 mb-10 slide-in-right">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center bg-white/90 backdrop-blur-xl rounded-full border border-slate-200 hover:border-red-300 focus-within:border-red-500 transition-all shadow-lg hover:shadow-xl focus-within:shadow-2xl">
                  <Search className="ml-5 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors flex-shrink-0" />
                  <input
                    type="text"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    className="flex-1 px-4 py-3.5 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-base font-medium"
                    placeholder={placeholderText || "Search for vintage watches, cameras, furniture..."}
                  />
                  <button
                    type="submit"
                    className="mr-1.5 px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Hunt All</span>
                  </button>
                </div>
              </form>
              
              {/* Marketplace Specific Hunt Buttons */}
              <div className="flex gap-3 justify-center mt-4">
                <button
                  onClick={() => {
                    if (localQuery.trim()) {
                      setSearchQuery(localQuery);
                      setMarketplaceFilter(new Set(['eBay']));
                      navigateTo('search');
                    }
                  }}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2 shadow-sm hover:shadow-md text-sm"
                >
                  <span>🛒</span>
                  <span>Hunt on eBay</span>
                </button>
                <button
                  onClick={() => {
                    if (localQuery.trim()) {
                      setSearchQuery(localQuery);
                      setMarketplaceFilter(new Set(['Vinted']));
                      navigateTo('search');
                    }
                  }}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700 font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2 shadow-sm hover:shadow-md text-sm"
                >
                  <span>👕</span>
                  <span>Hunt on Vinted</span>
                </button>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap justify-center gap-2.5 stagger-fade-in mt-8">
                {['Cameras', 'Furniture', 'Watches', 'Sneakers', 'Vinyl', 'Art'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      navigateTo('search');
                    }}
                    className="px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200 hover:border-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 text-slate-700 hover:text-red-600 text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
        </div>
      </section>

      {/* Ticker Section */}
      <section className="relative overflow-hidden py-8 mx-auto max-w-7xl">
         <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
         <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
         
         <div className="flex animate-ticker w-max gap-4 hover:[animation-play-state:paused]">
            {[...MOCK_ITEMS, ...MOCK_ITEMS, ...MOCK_ITEMS].map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`} 
                className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-md border border-slate-200 min-w-[320px] cursor-pointer hover:border-red-300 hover:shadow-xl hover:-translate-y-1 transition-all"
                onClick={() => navigateTo('detail', item)}
              >
                  <div className="relative flex-shrink-0">
                    <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                       <span className="font-black text-slate-900 text-sm truncate">{item.realTitle}</span>
                       <span className="flex-shrink-0 ml-2 text-[10px] bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-0.5 rounded-md font-black shadow-sm">HOT</span>
                    </div>
                    <div className="text-xs flex items-center justify-between">
                       <span className="text-slate-400 line-through">${item.listingPrice}</span>
                       <div className="flex items-center text-emerald-600 font-black">
                         <TrendingUp className="w-3 h-3 mr-1" />
                         +${item.realValue - item.listingPrice}
                       </div>
                    </div>
                  </div>
              </div>
            ))}
         </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 relative z-20 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4 scroll-reveal">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              🔥 Hottest Finds
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              AI-curated opportunities with highest profit potential
            </p>
          </div>
          <button 
            onClick={() => navigateTo('search')} 
            className="text-sm font-bold text-white bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all flex items-center group px-6 py-3 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:-translate-y-0.5"
          >
            Explore All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 stagger-fade-in">
          {/* Main Large Item */}
          <div 
            onClick={() => navigateTo('detail', MOCK_ITEMS[0])}
            className="md:col-span-2 md:row-span-2 relative group rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-slate-200 hover:border-red-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-red-900"></div>
            <img 
              src={MOCK_ITEMS[0].imageUrl} 
              alt={MOCK_ITEMS[0].realTitle} 
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>
            
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex gap-2">
               <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black shadow-lg">
                 98% MATCH
               </div>
               <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-bold">
                 {MOCK_ITEMS[0].category}
               </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8">
               <div className="mb-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-black text-white mb-2 leading-tight">{MOCK_ITEMS[0].realTitle}</h3>
                  <p className="text-slate-300 text-sm line-through">Listed as: {MOCK_ITEMS[0].listingTitle}</p>
               </div>
               
               <div className="flex items-center justify-between border-t border-white/20 pt-4">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Profit</span>
                    <p className="text-2xl font-bold text-[#10B981]">+${(MOCK_ITEMS[0].realValue - MOCK_ITEMS[0].listingPrice).toLocaleString()}</p>
                  </div>
                  <Button variant="primary" className="rounded-full px-6">View Details</Button>
               </div>
            </div>
          </div>

          {/* Secondary Tall Item */}
          <div 
            onClick={() => navigateTo('detail', MOCK_ITEMS[1])}
            className="md:col-span-1 md:row-span-2 relative group rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 bg-white"
          >
             <div className="h-1/2 overflow-hidden relative">
                <img src={MOCK_ITEMS[1].imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4">
                  <ProfitPill price={MOCK_ITEMS[1].listingPrice} value={MOCK_ITEMS[1].realValue} />
                </div>
             </div>
             <div className="p-6 h-1/2 flex flex-col justify-between">
                <div>
                   <h4 className="font-bold text-slate-900 text-lg mb-1 leading-snug">{MOCK_ITEMS[1].realTitle}</h4>
                   <p className="text-xs text-slate-400">Found on {MOCK_ITEMS[1].marketplace}</p>
                </div>
                <div className="mt-4">
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Confidence</span>
                      <span className="font-bold text-slate-900">{MOCK_ITEMS[1].confidenceScore}%</span>
                   </div>
                   <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[88%]"></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Small Items */}
          {MOCK_ITEMS.slice(2, 4).map((item) => (
            <div 
              key={item.id}
              onClick={() => navigateTo('detail', item)}
              className="md:col-span-1 md:row-span-1 bg-white p-5 rounded-3xl relative group cursor-pointer flex flex-col justify-between shadow-sm border border-slate-200 hover:shadow-lg transition-all"
            >
               <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                     <img src={item.imageUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-right">
                     <span className="block font-bold text-green-600">+${item.realValue - item.listingPrice}</span>
                  </div>
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                    {item.realTitle}
                  </h4>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">
                    {item.marketplace}
                  </p>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};