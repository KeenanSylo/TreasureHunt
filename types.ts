export interface Item {
  id: string;
  listingTitle: string; // The vague title found on marketplace
  realTitle: string;    // The actual valuable item identity
  listingPrice: number;
  realValue: number;
  confidenceScore: number; // 0-100
  marketplace: 'eBay' | 'FB Marketplace' | 'Vinted' | 'Craigslist';
  imageUrl: string;
  category: string;
  listingDate: string;
  condition: string;
  description: string;
  matchReason: string; // Why the AI matched this
}

export type ViewState = 'home' | 'search' | 'detail' | 'saved';

export interface NavContextType {
  currentView: ViewState;
  navigateTo: (view: ViewState, data?: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedItem: Item | null;
  savedItems: string[]; // List of IDs
  toggleSaveItem: (id: string) => void;
}
