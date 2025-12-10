'use client'

import { createContext } from 'react'
import type { Item, View, NavContextType } from '@/types'

export const NavContext = createContext<NavContextType>({
  currentView: 'home',
  navigateTo: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  marketplaceFilter: null,
  setMarketplaceFilter: () => {},
  selectedItem: null,
  savedItems: [],
  toggleSaveItem: () => {},
  isAuthenticated: false,
  userEmail: null,
  logout: () => {},
})
