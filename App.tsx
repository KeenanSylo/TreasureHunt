import React, { useState, createContext } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SearchResults } from './pages/SearchResults';
import { ItemDetail } from './pages/ItemDetail';
import { NavContextType, ViewState, Item } from './types';
import { MOCK_ITEMS } from './mockData';
import { ArrowRight } from 'lucide-react';

// Context definition
export const NavContext = createContext<NavContextType>({
  currentView: 'home',
  navigateTo: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  selectedItem: null,
  savedItems: [],
  toggleSaveItem: () => {},
});

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [savedItems, setSavedItems] = useState<string[]>(['2', '5']); // Pre-save some items for demo

  const navigateTo = (view: ViewState, data?: any) => {
    if (view === 'detail' && data) {
      setSelectedItem(data);
    }
    // If navigating to search without data, keep existing query
    if (view === 'search' && data && data.query) {
      setSearchQuery(data.query);
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const toggleSaveItem = (id: string) => {
    setSavedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'search':
        return <SearchResults />;
      case 'detail':
        return <ItemDetail />;
      case 'saved':
        return (
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-extrabold text-slate-900">Your Watchlist</h1>
            {savedItems.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">No saved items yet. Start searching to find gems!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_ITEMS.filter(i => savedItems.includes(i.id)).map((item, idx) => (
                   <div 
                      key={item.id} 
                      className="group bg-white rounded-3xl overflow-hidden cursor-pointer border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.2)] hover:border-red-100 transition-all duration-300 hover:-translate-y-2"
                      onClick={() => navigateTo('detail', item)}
                      style={{ animationDelay: `${idx * 100}ms` }}
                   >
                      <div className="h-48 relative overflow-hidden">
                         <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <div className="absolute top-3 right-3 bg-white text-red-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            +${(item.realValue - item.listingPrice).toLocaleString()}
                         </div>
                      </div>
                      <div className="p-6">
                         <h3 className="font-bold text-slate-900 text-lg mb-1 truncate group-hover:text-[#DC2626] transition-colors">{item.realTitle}</h3>
                         <p className="text-xs text-slate-400 mb-4 line-through">Listed as: {item.listingTitle}</p>
                         
                         <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                            <div>
                                <span className="text-slate-900 font-bold">${item.listingPrice}</span>
                                <span className="text-slate-300 text-xs ml-1">Buy Price</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#DC2626] transition-colors">
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <Home />;
    }
  };

  return (
    <NavContext.Provider value={{ 
      currentView, 
      navigateTo, 
      searchQuery, 
      setSearchQuery, 
      selectedItem,
      savedItems,
      toggleSaveItem
    }}>
      <Layout>
        {renderView()}
      </Layout>
    </NavContext.Provider>
  );
};

export default App;