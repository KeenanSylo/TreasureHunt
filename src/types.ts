export interface Item {
  id: string;
  listingTitle: string; // The vague title found on marketplace
  realTitle: string;    // The actual valuable item identity
  listingPrice: number;
  realValue: number;
  confidenceScore: number; // 0-100
  marketplace: 'eBay' | 'FB Marketplace' | 'Vinted' | 'Craigslist';
  imageUrl: string;
  marketUrl: string;    // Link to the actual listing
  category: string;
  listingDate: string;
  condition: string;
  description: string;
  matchReason: string; // Why the AI matched this
}

export type View = 'home' | 'search' | 'detail' | 'saved' | 'login';

export interface NavContextType {
  currentView: View;
  navigateTo: (view: View, data?: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  marketplaceFilter: Set<string> | null;
  setMarketplaceFilter: (filter: Set<string> | null) => void;
  selectedItem: Item | null;
  savedItems: string[]; // List of IDs
  toggleSaveItem: (id: string) => void;
  isAuthenticated: boolean;
  userEmail: string | null;
  logout: () => void;
}
