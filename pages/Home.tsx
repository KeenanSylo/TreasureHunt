import React, { useContext, useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { NavContext } from '../App';
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
  const { navigateTo, setSearchQuery } = useContext(NavContext);
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
      navigateTo('search');
    }
  };

  return (
    <div className="relative min-h-screen">
      
      {/* Hero Section Content */}
      <section className="relative pt-32 pb-16 text-center z-20 px-4 min-h-[75vh] flex flex-col justify-center overflow-hidden">
        
        {/* Waves Background - Localized to Hero, placed absolutely behind content */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <Waves
            lineColor="rgba(220, 38, 38, 0.08)"
            backgroundColor="transparent"
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />
          {/* Gradient Fade Out at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>

        <div className="relative z-20">
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 text-slate-900 leading-tight">
              Find{' '} 
              <HiddenGemsReveal />
              <br />
              Before They Vanish.
            </h1>
            
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              The world's first visual search engine for arbitrage. <br/>
              Search for vague titles, discover real value.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto relative group z-20 mb-12">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400 group-focus-within:text-[#DC2626] transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="block w-full pl-16 pr-36 py-6 border border-slate-200 rounded-full bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-lg hover:shadow-xl text-xl font-medium"
                  placeholder={`Try searching: ${placeholderText}`}
                />
                <div className="absolute inset-y-2 right-2">
                  <Button size="lg" type="submit" className="rounded-full h-full px-8 shadow-red-500/30 text-lg">
                    Search
                  </Button>
                </div>
              </form>

              {/* Quick Tags */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className="text-sm font-bold text-slate-400 mr-2 py-2">Trending:</span>
                {['Cameras', 'Furniture', 'Watches', 'Sneakers', 'Vinyl'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      navigateTo('search');
                    }}
                    className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-600 text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Pill - Moved to Bottom */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-red-100 shadow-sm text-red-600 text-sm font-bold animate-float-slow mx-auto">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Arbitrage Engine V2.0</span>
            </div>
        </div>
      </section>

      {/* Ticker Section */}
      <section className="w-full overflow-hidden border-t border-slate-100 bg-slate-50/50 py-4 relative group z-10">
         <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
         <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
         
         <div className="flex animate-ticker w-max gap-6 hover:[animation-play-state:paused]">
            {[...MOCK_ITEMS, ...MOCK_ITEMS, ...MOCK_ITEMS].map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`} 
                className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm min-w-[320px] cursor-pointer hover:border-red-300 transition-all hover:shadow-md hover:-translate-y-1"
                onClick={() => navigateTo('detail', item)}
              >
                  <img src={item.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                       <span className="font-bold text-slate-900 text-sm truncate">{item.realTitle}</span>
                       <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">FOUND</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                       <span className="line-through opacity-70">${item.listingPrice}</span>
                       <div className="flex items-center text-green-600 font-bold">
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
      <section className="py-20 px-8 bg-white relative z-20 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Opportunities</h2>
          </div>
          <button 
            onClick={() => navigateTo('search')} 
            className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center group bg-white px-4 py-2 rounded-full border border-red-100 hover:border-red-200 shadow-sm"
          >
            View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[650px]">
          {/* Main Large Item */}
          <div 
            onClick={() => navigateTo('detail', MOCK_ITEMS[0])}
            className="md:col-span-2 md:row-span-2 relative group rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-500 border border-slate-100"
          >
            <div className="absolute inset-0 bg-slate-900 group-hover:bg-red-950 transition-colors duration-500"></div>
            <img 
              src={MOCK_ITEMS[0].imageUrl} 
              alt={MOCK_ITEMS[0].realTitle} 
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            <div className="absolute top-6 left-6 flex gap-2">
               <Badge variant="primary" className="bg-red-600 text-white border-none shadow-lg animate-pulse-slow">
                 98% MATCH
               </Badge>
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