'use client'

import { createContext } from 'react'
import type { Item, View } from '@/types'

interface NavContextType {
  currentView: View
  navigateTo: (view: View, item?: Item) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const NavContext = createContext<NavContextType>({
  currentView: 'home',
  navigateTo: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
})
