import React, { useContext, useState, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  Bell,
  Menu,
  Zap,
  X,
  Sparkles
} from 'lucide-react';
import { NavContext } from '../app/context';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentView, navigateTo, userEmail, logout } = useContext(NavContext);
  
  const isHome = currentView === 'home';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  const navItems = [
    { id: 'home', label: 'Discover', icon: Sparkles },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'saved', label: 'Saved', icon: Heart, count: 2 },
  ];

  return (
    <div className="min-h-screen font-sans relative selection:bg-red-100 selection:text-red-600">
      <>
        {/* Top Navigation - Floating Pill */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-full max-w-5xl px-4">
        <div className={`transition-all duration-500 rounded-full ${
          scrolled || !isHome
            ? 'bg-white/95 backdrop-blur-2xl shadow-2xl border border-slate-200/60'
            : 'bg-white/80 backdrop-blur-xl shadow-xl border border-white/40'
        }`}>
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer group" 
              onClick={() => navigateTo('home')}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-red-600 via-red-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
                </div>
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tight">
                <span className="text-slate-900">Treasure</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Hunt</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as any)}
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    currentView === item.id
                      ? 'text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {currentView === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 rounded-full shadow-md shadow-red-500/30"></div>
                  )}
                  <item.icon className={`w-4 h-4 relative z-10 ${currentView === item.id ? '' : 'opacity-70'}`} />
                  <span className="relative z-10">{item.label}</span>
                  {item.count && (
                    <span className="relative z-10 px-1.5 py-0.5 text-[10px] font-bold bg-white/20 rounded-full">
                      {item.count}
                    </span>
                  )}
              {/* User Avatar */}
              <div className="hidden sm:block relative user-menu-container">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-2 py-1 rounded-full hover:bg-slate-100/60 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {userEmail?.[0].toUpperCase() || 'U'}
                  </div>
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{userEmail}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div></div>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-red-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-5xl px-4">
            <div className="md:hidden rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-2xl shadow-xl">
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTo(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.count && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>

      {/* Main Content */}
      <main className="relative pt-20">
        {children}
      </main>
    </div>
  );
};