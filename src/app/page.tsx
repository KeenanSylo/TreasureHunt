'use client'

import { Home } from '@/pages/Home'
import { SearchResults } from '@/pages/SearchResults'
import { ItemDetail } from '@/pages/ItemDetail'
import { Layout } from '@/components/Layout'
import { NavContext } from './context'
import { useState } from 'react'
import type { Item, View } from '@/types'

export default function Page() {
  const [currentView, setCurrentView] = useState<View>('home')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const navigateTo = (view: View, item?: Item) => {
    setCurrentView(view)
    if (item) setSelectedItem(item)
    window.scrollTo(0, 0)
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home />
      case 'search':
        return <SearchResults />
      case 'detail':
        return selectedItem ? <ItemDetail item={selectedItem} /> : <Home />
      default:
        return <Home />
    }
  }

  return (
    <NavContext.Provider value={{ currentView, navigateTo, searchQuery, setSearchQuery }}>
      <Layout>{renderView()}</Layout>
    </NavContext.Provider>
  )
}
