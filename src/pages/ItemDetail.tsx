import React, { useContext, useState } from 'react';
import { ArrowLeft, ExternalLink, Heart, Share2, AlertCircle, CheckCircle2, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { NavContext } from '../app/context';
import { Badge, Button, ProfitPill } from '../components/UIComponents';
import { saveItem } from '@/lib/api';
import type { Item } from '@/types';

interface ItemDetailProps {
  item: Item;
  authToken: string | null;
}

export const ItemDetail: React.FC<ItemDetailProps> = ({ item: selectedItem, authToken }) => {
  const { navigateTo, toggleSaveItem, savedItems } = useContext(NavContext);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!selectedItem) {
    return <div className="text-center py-20 text-slate-400">Item not found.</div>;
  }

  const isSaved = savedItems.includes(selectedItem.id);
  const profit = selectedItem.realValue - selectedItem.listingPrice;
  const roi = Math.round((profit / selectedItem.listingPrice) * 100);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
      <button 
        onClick={() => navigateTo('search')} 
        className="flex items-center text-slate-600 hover:text-red-600 mb-6 sm:mb-8 transition-all font-semibold text-sm group px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 hover:border-red-300 w-fit shadow-sm hover:shadow-md slide-in-left"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Header Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 text-reveal">
           <div className="flex items-center space-x-3 mb-4">
              <Badge variant="danger" className="badge-pulse bg-gradient-to-r from-red-600 to-orange-600 text-white border-none shadow-lg shadow-red-500/30">
                 {selectedItem.confidenceScore}% MATCH
              </Badge>
              <Badge variant="outline" className="bg-white/60 backdrop-blur border-slate-200">{selectedItem.category}</Badge>
           </div>
           <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 leading-tight drop-shadow-sm">
             {selectedItem.realTitle}
           </h1>
           <p className="text-slate-500 font-medium flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-red-500" />
             Verified by AI analysis of {selectedItem.marketplace} listing.
           </p>
        </div>
        
        <div className="flex flex-col items-start lg:items-end justify-center glass-panel p-8 rounded-2xl shadow-lg slide-in-right relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full"></div>
            <div className="text-right relative z-10">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Estimated Profit</span>
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#EF4444] tracking-tight my-2 animate-float-slow">+${profit.toLocaleString()}</p>
                <div className="flex items-center justify-end gap-2">
                    <span className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-3 py-1 rounded-lg text-sm font-bold border border-green-200 shadow-sm">{roi}% ROI</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-fade-in">
        {/* LEFT COLUMN: The Listing */}
        <div className="glass-card rounded-3xl overflow-hidden relative group shadow-lg">
          <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-slate-50/90 to-slate-100/90 backdrop-blur-md border-b border-slate-200 p-3 text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest z-10">
            <span className="inline-block">Original Listing</span>
          </div>
          
          <div className="p-8 pt-16">
            <div className="aspect-square rounded-2xl overflow-hidden mb-8 bg-slate-100/50 relative shadow-lg border border-slate-200/50 spotlight">
               <img src={selectedItem.imageUrl} className="w-full h-full object-cover mix-blend-multiply opacity-90 image-zoom" alt="Listing" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-slate-900 text-sm font-bold shadow-md border border-white">
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
                <Button variant="outline" icon={ExternalLink} onClick={() => window.open(selectedItem.marketUrl, '_blank')} className="bg-white/80 hover:bg-white">
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

             {/* Save Messages */}
             {saveError && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                 {saveError}
               </div>
             )}
             {saveSuccess && (
               <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                 Successfully saved to your watchlist!
               </div>
             )}

             <div className="mt-10 pt-8 border-t border-slate-100/50 flex gap-4">
                <Button 
                   variant={isSaved || saveSuccess ? 'secondary' : 'primary'} 
                   className={`flex-1 text-lg py-4 shadow-xl ${isSaved || saveSuccess ? '' : 'shadow-red-500/20'}`}
                   icon={Heart}
                   onClick={async () => {
                     if (!authToken) {
                       setSaveError('Please log in to save items');
                       return;
                     }
                     
                     if (isSaved || saveSuccess) {
                       return;
                     }

                     setSaving(true);
                     setSaveError(null);
                     
                     try {
                       await saveItem({
                         external_id: selectedItem.id,
                         title_vague: selectedItem.listingTitle,
                         title_real: selectedItem.realTitle,
                         price_listed: selectedItem.listingPrice,
                         price_estimated: selectedItem.realValue,
                         image_url: selectedItem.imageUrl,
                         market_url: '#',
                         marketplace: 'ebay'
                       }, authToken);
                       
                       setSaveSuccess(true);
                       toggleSaveItem(selectedItem.id);
                       
                       setTimeout(() => setSaveSuccess(false), 3000);
                     } catch (error: any) {
                       setSaveError(error.message || 'Failed to save item');
                     } finally {
                       setSaving(false);
                     }
                   }}
                   disabled={saving || isSaved || saveSuccess}
                >
                   {saving ? 'Saving...' : (isSaved || saveSuccess) ? 'Saved to Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button variant="outline" icon={Share2} className="px-4 border-slate-200 bg-white/50 hover:bg-white">
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};