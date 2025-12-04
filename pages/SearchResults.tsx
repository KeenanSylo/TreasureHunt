import React, { useContext, useEffect, useState } from 'react';
import { Filter, ChevronDown, Heart, SlidersHorizontal } from 'lucide-react';
import { NavContext } from '../App';
import { MOCK_ITEMS } from '../mockData';
import { Badge, Button, ConfidenceBar } from '../components/UIComponents';
import { Item } from '../types';

export const SearchResults = () => {
  const { navigateTo, searchQuery, toggleSaveItem, savedItems } = useContext(NavContext);
  const [filteredItems, setFilteredItems] = useState<Item[]>(MOCK_ITEMS);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (!searchQuery) {
      setFilteredItems(MOCK_ITEMS);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    
    const results = MOCK_ITEMS.filter(item => {
      return (
        item.listingTitle.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.realTitle.toLowerCase().includes(lowerQuery)
      );
    });
    
    setFilteredItems(results);
  }, [searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
      {/* Filters Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-6 hidden lg:block overflow-y-auto pr-4 custom-scrollbar">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </h3>
          
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <label className="text-xs font-bold text-slate-700 mb-3 block">Price Range</label>
              <div className="flex items-center space-x-2">
                <input type="number" placeholder="Min" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" />
                <span className="text-slate-400">-</span>
                <input type="number" placeholder="Max" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <label className="text-xs font-bold text-slate-700 mb-3 block">Marketplace</label>
              <div className="space-y-3">
                {['eBay', 'FB Marketplace', 'Vinted', 'Craigslist'].map(m => (
                  <label key={m} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input type="checkbox" className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm transition-all checked:border-red-500 checked:bg-red-500 hover:shadow-md" defaultChecked />
                        <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{m}</span>
                  </label>
                ))}
              </div>
            </div>
            
             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <label className="text-xs font-bold text-slate-700 mb-3 block">Min. Confidence</label>
               <input type="range" min="0" max="100" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#DC2626]" />
               <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                 <span>0%</span>
                 <span>100%</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Feed */}
      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar pr-2">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/90 backdrop-blur-md py-4 z-20 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {searchQuery ? (
                <span>
                    Found <span className="text-[#DC2626]">{filteredItems.length}</span> Hidden Gems
                </span>
            ) : 'Trending Opportunities'}
          </h2>
          <div className="flex space-x-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
            {['All', 'High Profit', 'Newest'].map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeFilter === filter 
                    ? 'bg-white text-[#DC2626] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {filteredItems.map((item, idx) => {
            const isSaved = savedItems.includes(item.id);
            return (
              <div 
                key={item.id} 
                className="group relative flex flex-col sm:flex-row bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-[0_10px_40px_-10px_rgba(220,38,38,0.1)] hover:border-red-200 transition-all duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Image Section */}
                <div className="sm:w-64 h-56 sm:h-auto relative flex-shrink-0 cursor-pointer overflow-hidden" onClick={() => navigateTo('detail', item)}>
                  <img src={item.imageUrl} alt={item.realTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-3 left-3">
                     <Badge variant="secondary" className="backdrop-blur-md bg-white/90 shadow-sm font-bold">{item.marketplace}</Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between cursor-pointer" onClick={() => navigateTo('detail', item)}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-slate-400 text-sm font-medium line-through decoration-red-300">{item.listingTitle}</h4>
                        <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-1">
                          {item.realTitle}
                          <span className="text-[#DC2626] text-[10px] px-1.5 py-0.5 border border-red-100 rounded-md bg-red-50 uppercase tracking-wide">Verified</span>
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl font-black text-slate-900">${item.listingPrice}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">List Price</span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">{item.description}</p>
                    
                    <ConfidenceBar score={item.confidenceScore} />
                  </div>
                  
                  <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
                       <span>{item.condition}</span>
                       <span className="text-slate-200">•</span>
                       <span>{item.category}</span>
                       <span className="text-slate-200">•</span>
                       <span>{item.listingDate}</span>
                     </div>
                     <div className="font-mono text-[#DC2626] font-bold text-lg">
                       +${(item.realValue - item.listingPrice).toLocaleString()}
                     </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveItem(item.id);
                    }}
                    className={`p-2.5 rounded-full backdrop-blur-md border transition-all shadow-sm ${
                      isSaved 
                        ? 'bg-red-50 border-red-100 text-red-600' 
                        : 'bg-white/80 border-slate-100 text-slate-400 hover:text-red-500 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};