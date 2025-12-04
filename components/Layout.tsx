import React, { useContext, useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Search, 
  Heart, 
  TrendingUp, 
  Settings, 
  Bell,
  Menu,
  Zap
} from 'lucide-react';
import { NavContext } from '../App';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ElementType, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        active 
          ? 'bg-[#DC2626] text-white shadow-lg shadow-red-500/30 translate-x-1' 
          : 'text-slate-500 hover:bg-red-50 hover:text-[#DC2626]'
      }`}
    >
      <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-semibold text-sm relative z-10">{label}</span>
      
      {/* Subtle hover splash effect for inactive items */}
      {!active && (
        <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentView, navigateTo } = useContext(NavContext);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Small delay for smoother feel
      requestAnimationFrame(() => {
        setMousePosition({ x: event.clientX, y: event.clientY });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden bg-white font-sans relative selection:bg-red-100 selection:text-red-600">
      
      {/* --- NEW FLUID BACKGROUND DESIGN --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* 1. Base Paper Texture - Noise Overlay */}
        <div className="absolute inset-0 bg-noise bg-noise-texture z-[10] opacity-50"></div>

        {/* 2. Technical Grid - Micro crosshairs */}
        <div className="absolute inset-0 bg-grid-tech opacity-30 z-0"></div>

        {/* 3. The "Scanner" - Tight, Prominent Red Glow following mouse */}
        <div 
          className="absolute inset-0 transition-opacity duration-75 will-change-transform z-10 mix-blend-multiply"
          style={{
            // Reduced radius from 600px to 200px, increased opacity from 0.15 to 0.5
            background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(220, 38, 38, 0.5), rgba(255, 255, 255, 0) 100%)`,
          }}
        />
        
        {/* 4. Fluid Moving Shapes */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-r from-red-50 to-orange-50 blur-[100px] opacity-40 animate-flow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-l from-slate-100 to-red-50 blur-[80px] opacity-60 animate-flow" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
        <div className="absolute top-[30%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-slate-50 blur-[60px] opacity-30 animate-flow" style={{ animationDuration: '25s' }}></div>
        
      </div>

      {/* Sidebar - Glass */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white/70 backdrop-blur-xl border-r border-white/40 z-40 hidden md:flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.02)]">
        <div className="p-8">
          <div 
            className="flex items-center space-x-3 mb-10 cursor-pointer group" 
            onClick={() => navigateTo('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#DC2626] flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:rotate-12 transition-transform duration-300">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#DC2626] transition-colors">
              Treasure<span className="text-[#DC2626]">Hunt</span>
            </span>
          </div>

          <nav className="space-y-2">
            <SidebarItem 
              icon={LayoutGrid} 
              label="Overview" 
              active={currentView === 'home'} 
              onClick={() => navigateTo('home')} 
            />
            <SidebarItem 
              icon={TrendingUp} 
              label="Trending Gems" 
              active={currentView === 'search'} 
              onClick={() => navigateTo('search')} 
            />
            <SidebarItem 
              icon={Heart} 
              label="Saved Items" 
              active={currentView === 'saved'} 
              onClick={() => navigateTo('saved')} 
            />
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={false} 
            onClick={() => {}} 
          />
          <div className="pt-6 border-t border-slate-200/50">
            <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://picsum.photos/id/64/100/100" alt="User" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">Alex Reseller</p>
                <p className="text-xs text-red-600 font-medium">Pro Member</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative z-10">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 bg-white/40 backdrop-blur-xl border-b border-white/30 transition-all duration-300 supports-[backdrop-filter]:bg-white/20">
          <div className="md:hidden flex items-center space-x-2">
            <Menu className="w-6 h-6 text-slate-700" />
            <span className="font-bold text-slate-900">TreasureHunt</span>
          </div>

          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            {currentView !== 'home' && (
               <div className="relative group animate-fade-in-up">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#DC2626] transition-colors" />
                 </div>
                 <input
                   type="text"
                   placeholder="Search..."
                   className="block w-full pl-11 pr-4 py-3 border border-slate-200/60 rounded-full leading-5 bg-white/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626] focus:border-transparent focus:shadow-[0_0_20px_rgba(220,38,38,0.15)] sm:text-sm transition-all duration-300"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       navigateTo('search', { query: (e.target as HTMLInputElement).value });
                     }
                   }}
                 />
               </div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-400 hover:text-[#DC2626] transition-colors group">
              <Bell className="w-6 h-6 group-hover:animate-bell-shake" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#DC2626] rounded-full border-2 border-white animate-pulse"></span>
            </button>
          </div>
        </header>

        <div className="p-8 pb-20 relative">
          {children}
        </div>
      </main>
    </div>
  );
};