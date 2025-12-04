import React, { useContext } from 'react';
import { ArrowLeft, ExternalLink, Heart, Share2, AlertCircle, CheckCircle2, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { NavContext } from '../App';
import { Badge, Button, ProfitPill } from '../components/UIComponents';

export const ItemDetail = () => {
  const { selectedItem, navigateTo, toggleSaveItem, savedItems } = useContext(NavContext);

  if (!selectedItem) {
    return <div className="text-center py-20 text-slate-400">Item not found.</div>;
  }

  const isSaved = savedItems.includes(selectedItem.id);
  const profit = selectedItem.realValue - selectedItem.listingPrice;
  const roi = Math.round((profit / selectedItem.listingPrice) * 100);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-10">
      <button 
        onClick={() => navigateTo('search')} 
        className="flex items-center text-slate-500 hover:text-[#DC2626] mb-8 transition-colors font-medium text-sm group backdrop-blur-sm px-3 py-1.5 rounded-full bg-white/30 w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      {/* Header Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2">
           <div className="flex items-center space-x-3 mb-4">
              <Badge variant="danger" className="animate-pulse-slow bg-red-600 text-white border-none shadow-lg shadow-red-500/30">
                 {selectedItem.confidenceScore}% MATCH
              </Badge>
              <Badge variant="outline" className="bg-white/60 backdrop-blur">{selectedItem.category}</Badge>
           </div>
           <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 leading-tight drop-shadow-sm">
             {selectedItem.realTitle}
           </h1>
           <p className="text-slate-500 font-medium">Verified by AI analysis of {selectedItem.marketplace} listing.</p>
        </div>
        
        <div className="flex flex-col items-start lg:items-end justify-center glass-panel p-6 rounded-2xl">
            <div className="text-right">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Estimated Profit</span>
                <p className="text-5xl font-black text-[#DC2626] tracking-tight my-1">+${profit.toLocaleString()}</p>
                <div className="flex items-center justify-end gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{roi}% ROI</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: The Listing */}
        <div className="glass-panel bg-white/60 rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full bg-slate-50/80 backdrop-blur-md border-b border-slate-100 p-3 text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest z-10">
            Original Listing
          </div>
          
          <div className="p-8 pt-16">
            <div className="aspect-square rounded-2xl overflow-hidden mb-8 bg-slate-100/50 relative shadow-inner">
               <img src={selectedItem.imageUrl} className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105" alt="Listing" />
               <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-slate-900 text-sm font-bold shadow-sm">
                 Via {selectedItem.marketplace}
               </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Listing Title</span>
                <h3 className="text-xl font-bold text-slate-700 line-through decoration-red-300 decoration-2">{selectedItem.listingTitle}</h3>
              </div>
              
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-2">Seller Description</span>
                <p className="text-slate-600 italic bg-white/60 p-4 rounded-xl border border-slate-100/50 leading-relaxed text-sm">
                  "{selectedItem.description}"
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100/50">
                <div>
                   <span className="text-slate-400 text-xs font-bold uppercase">Listed Price</span>
                   <p className="text-3xl font-black text-slate-900">${selectedItem.listingPrice}</p>
                </div>
                <Button variant="outline" icon={ExternalLink} onClick={() => window.open('https://google.com', '_blank')} className="bg-white/80 hover:bg-white">
                   Open Listing
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Reality (AI Analysis) */}
        <div className="glass-panel bg-white/70 rounded-3xl overflow-hidden border-red-100/50 relative flex flex-col">
           <div className="absolute top-0 left-0 w-full bg-red-50/80 backdrop-blur-md border-b border-red-100/50 p-3 text-center text-red-600 text-xs font-extrabold uppercase tracking-widest z-10 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3" />
            AI Identification Analysis
          </div>

          <div className="p-8 pt-16 flex-1 flex flex-col">
             {/* Match Reason Box */}
             <div className="bg-gradient-to-br from-red-50/80 to-white/60 border border-red-100/50 p-6 rounded-2xl mb-8 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-24 h-24 text-red-600" />
                </div>
                <div className="flex items-start gap-4 relative z-10">
                   <div className="p-2 bg-white rounded-lg shadow-sm text-red-600">
                        <Zap className="w-5 h-5" fill="currentColor" />
                   </div>
                   <div>
                      <h4 className="text-slate-900 font-bold text-sm mb-2">Why we matched this:</h4>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {selectedItem.matchReason}
                      </p>
                   </div>
                </div>
             </div>

             <div className="space-y-8 flex-1">
                <div>
                   <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-2">True Item Identity</span>
                   <h3 className="text-3xl font-black text-slate-900">{selectedItem.realTitle}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Market Value</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">${selectedItem.realValue}</p>
                   </div>
                   <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Condition</span>
                      <p className="text-2xl font-black text-amber-500 mt-1">{selectedItem.condition}</p>
                   </div>
                </div>

                {/* Checklist */}
                <div className="space-y-4 bg-white/60 p-6 rounded-2xl border border-slate-100/50">
                   <h4 className="text-sm font-bold text-slate-900">Verification Steps</h4>
                   <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Visual fingerprint match confirmed</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Undervalued by &gt;50% margin</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm text-slate-600">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span>Seller has low feedback count</span>
                   </div>
                </div>
             </div>

             <div className="mt-10 pt-8 border-t border-slate-100/50 flex gap-4">
                <Button 
                   variant={isSaved ? 'secondary' : 'primary'} 
                   className={`flex-1 text-lg py-4 shadow-xl ${isSaved ? '' : 'shadow-red-500/20'}`}
                   icon={Heart}
                   onClick={() => toggleSaveItem(selectedItem.id)}
                >
                   {isSaved ? 'Saved to Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button variant="outline" icon={Share2} className="px-4 border-slate-200 bg-white/50 hover:bg-white">
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};