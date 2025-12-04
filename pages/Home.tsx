import React, { useContext, useState } from 'react';
import { Search, ArrowRight, Sparkles, Zap, DollarSign } from 'lucide-react';
import { NavContext } from '../App';
import { MOCK_ITEMS } from '../mockData';
import { Badge, Button, ProfitPill, ConfidenceBar } from '../components/UIComponents';

export const Home = () => {
  const { navigateTo, setSearchQuery } = useContext(NavContext);
  const [localQuery, setLocalQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      navigateTo('search');
    }
  };

  const trendingItems = MOCK_ITEMS.slice(0, 4);

  return (
    <div className="space-y-16 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative py-20 text-center animate-fade-in-up">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-50 rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-bold mb-8 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Arbitrage Engine V2.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 leading-tight">
          Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-orange-600 relative">
            Hidden Gems
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-red-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span> <br />
          Before They Vanish.
        </h1>
        
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
          The world's first visual search engine for arbitrage. <br/>
          Search for "old camera" and we'll identify a "Leica M6".
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group z-10">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-[#DC2626] transition-colors duration-300" />
          </div>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="block w-full pl-14 pr-32 py-5 border-2 border-slate-100 rounded-full bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#DC2626] focus:ring-4 focus:ring-red-500/10 transition-all duration-300 shadow-xl shadow-slate-200/50 text-lg font-medium"
            placeholder="What generic item are you looking for?"
          />
          <div className="absolute inset-y-2 right-2">
            <Button size="lg" type="submit" className="rounded-full h-full px-8 shadow-red-500/20">
              Search
            </Button>
          </div>
        </form>
      </section>

      {/* Ticker Section - Continuous Scroll */}
      <section className="w-full overflow-hidden border-y border-slate-100 bg-slate-50/50 py-4 relative">
         <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
         <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>
         
         <div className="flex animate-ticker w-max gap-8 hover:[animation-play-state:paused]">
            {[...MOCK_ITEMS, ...MOCK_ITEMS].map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`} 
                className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm min-w-[300px] cursor-pointer hover:border-red-300 transition-colors"
                onClick={() => navigateTo('detail', item)}
              >
                  <img src={item.imageUrl} className="w-10 h-10 rounded-md object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-slate-900 text-sm truncate max-w-[120px]">{item.realTitle}</span>
                       <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded-sm font-bold">FOUND</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                       <span className="line-through">${item.listingPrice}</span>
                       <ArrowRight className="w-3 h-3 text-red-500" />
                       <span className="font-bold text-slate-900">${item.realValue}</span>
                    </div>
                  </div>
              </div>
            ))}
         </div>
      </section>

      {/* Bento Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Opportunities</h2>
          </div>
          <button onClick={() => navigateTo('search')} className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center group">
            View all
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[340px]">
          {/* Main Feature Card - Spans 2 cols */}
          <div 
            className="md:col-span-2 relative group overflow-hidden rounded-[2rem] glass-card cursor-pointer border-0"
            onClick={() => navigateTo('detail', trendingItems[0])}
          >
             <img 
                src={trendingItems[0].imageUrl} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Main item"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute top-6 left-6">
                 <Badge variant="danger" className="bg-[#DC2626] text-white border-none shadow-lg shadow-red-500/40 animate-pulse-slow">
                   🔥 High Profit Alert
                 </Badge>
              </div>

              <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex justify-between items-end">
                  <div className="text-white">
                    <p className="text-slate-300 text-lg line-through decoration-red-500 decoration-2 mb-1 opacity-80">{trendingItems[0].listingTitle}</p>
                    <h3 className="text-4xl font-extrabold mb-3 text-white text-glow">{trendingItems[0].realTitle}</h3>
                    <div className="flex items-center space-x-4 text-sm font-medium text-slate-200">
                      <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-md">{trendingItems[0].marketplace}</span>
                      <span>•</span>
                      <span>{trendingItems[0].listingDate}</span>
                    </div>
                  </div>
                  <div className="text-right bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                    <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Potential Profit</p>
                    <p className="text-3xl font-extrabold text-[#DC2626]">+${(trendingItems[0].realValue - trendingItems[0].listingPrice).toLocaleString()}</p>
                  </div>
                </div>
              </div>
          </div>

          {/* Secondary Cards */}
          {trendingItems.slice(1).map((item) => (
            <div 
              key={item.id}
              className="relative group overflow-hidden rounded-[2rem] glass-card cursor-pointer flex flex-col p-4 hover:border-red-200"
              onClick={() => navigateTo('detail', item)}
            >
              <div className="relative h-40 overflow-hidden rounded-2xl mb-4">
                <img 
                  src={item.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={item.realTitle}
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                    {item.confidenceScore}% Match
                  </span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                    <p className="text-slate-400 text-xs line-through mb-1">{item.listingTitle}</p>
                    <p className="font-bold text-slate-900 text-lg leading-tight group-hover:text-[#DC2626] transition-colors">{item.realTitle}</p>
                </div>
                
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                      <p className="text-xs text-slate-400">Profit</p>
                      <p className="text-[#DC2626] font-extrabold text-lg">+${(item.realValue - item.listingPrice).toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#DC2626] transition-all duration-300 group-hover:rotate-[-45deg]">
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};