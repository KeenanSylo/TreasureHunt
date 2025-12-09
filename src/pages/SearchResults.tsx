import React, { useContext, useEffect, useState } from 'react';
import { Filter, ChevronDown, Heart, SlidersHorizontal, Loader2 } from 'lucide-react';
import { NavContext } from '../app/context';
import { Badge, Button, ConfidenceBar } from '../components/UIComponents';
import { Item } from '../types';
import { searchItems } from '@/lib/api';

interface SearchResultsProps {
  authToken: string | null;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ authToken }) => {
  const { navigateTo, searchQuery, toggleSaveItem, savedItems } = useContext(NavContext);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setFilteredItems([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await searchItems({ q: searchQuery, max_price: 1000 }, authToken || undefined);
        
        // Transform API response to Item format
        const items: Item[] = response.results.map((result, index) => ({
          id: result.external_id || `item-${index}`,
          listingTitle: result.title_vague,
          realTitle: result.title_real || result.title_vague,
          listingPrice: result.price_listed || 0,
          realValue: result.price_estimated || 0,
          confidenceScore: result.confidence === 'high' ? 90 : result.confidence === 'medium' ? 70 : 50,
          marketplace: 'eBay' as any,
          imageUrl: result.image_url || '/placeholder.jpg',
          category: 'General',
          listingDate: 'Today',
          condition: 'Used',
          description: result.reasoning || 'AI-analyzed item',
          matchReason: result.reasoning || 'Identified by AI'
        }));

        setFilteredItems(items);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Failed to search items');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, authToken]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
          <p className="text-lg font-bold text-slate-700">Hunting for treasures...</p>
          <p className="text-sm text-slate-500 mt-2">AI is analyzing thousands of listings</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-bold mb-2">Search Failed</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Filters Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-5 hidden lg:block">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </h3>
          
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl">
              <label className="text-xs font-bold text-slate-700 mb-3 block">Price Range</label>
              <div className="flex items-center space-x-2">
                <input type="number" placeholder="Min" className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" />
                <span className="text-slate-400">-</span>
                <input type="number" placeholder="Max" className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl">
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
            
             <div className="glass-panel p-5 rounded-2xl">
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
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {searchQuery ? (
                <span>
                    Found <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">{filteredItems.length}</span> Results
                </span>
            ) : '🔍 All Opportunities'}
          </h2>
          <div className="flex space-x-2 bg-white/70 backdrop-blur-sm p-1 rounded-xl border border-slate-200 shadow-sm">
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
                className="group relative flex flex-col sm:flex-row glass-card rounded-3xl overflow-hidden hover:shadow-[0_10px_40px_-10px_rgba(220,38,38,0.15)] hover:border-red-200 transition-all duration-300 scroll-reveal spotlight"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-red-500/5 to-orange-500/5"></div>
                
                {/* Image Section */}
                <div className="sm:w-64 h-56 sm:h-auto relative flex-shrink-0 cursor-pointer overflow-hidden" onClick={() => navigateTo('detail', item)}>
                  <img src={item.imageUrl} alt={item.realTitle} className="w-full h-full object-cover image-zoom" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-3 left-3">
                     <Badge variant="secondary" className="backdrop-blur-md bg-white/90 shadow-md font-bold border border-white">{item.marketplace}</Badge>
                  </div>
                  {/* Corner Accent */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between cursor-pointer relative z-10" onClick={() => navigateTo('detail', item)}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-4">
                        <h4 className="text-slate-400 text-sm font-medium line-through decoration-red-300 mb-1">{item.listingTitle}</h4>
                        <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-1 group-hover:text-red-600 transition-colors">
                          {item.realTitle}
                          <span className="text-[#DC2626] text-[10px] px-2 py-0.5 border border-red-200 rounded-md bg-gradient-to-r from-red-50 to-orange-50 uppercase tracking-wide font-black shadow-sm">Verified</span>
                        </h3>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="block text-2xl font-black text-slate-900">${item.listingPrice}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">List Price</span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">{item.description}</p>
                    
                    <ConfidenceBar score={item.confidenceScore} />
                  </div>
                  
                  <div className="mt-5 pt-5 border-t border-slate-100/50 flex items-center justify-between">
                     <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
                       <span>{item.condition}</span>
                       <span className="text-slate-300">•</span>
                       <span>{item.category}</span>
                       <span className="text-slate-300">•</span>
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
                        : 'bg-white/40 border-slate-100 text-slate-400 hover:text-red-500 hover:bg-white'
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
      )}
    </div>
    </div>
  );
};