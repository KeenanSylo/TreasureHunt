'use client'

import { Home } from '@/pages/Home'
import { SearchResults } from '@/pages/SearchResults'
import { ItemDetail } from '@/pages/ItemDetail'
import { Login } from '@/pages/Login'
import { Layout } from '@/components/Layout'
import { NavContext } from './context'
import { useState, useEffect } from 'react'
import type { Item, View } from '@/types'
import { createClient } from '@/lib/supabase'
import { saveItem, deleteItem, getSavedItems } from '@/lib/api'

export default function Page() {
  const [currentView, setCurrentView] = useState<View>('login')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [marketplaceFilter, setMarketplaceFilter] = useState<Set<string> | null>(null)
  const [savedItems, setSavedItems] = useState<string[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const supabase = createClient()

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setIsAuthenticated(true)
        setUserEmail(session.user.email || null)
        setAuthToken(session.access_token)
        setCurrentView('home')
        
        // Load saved items
        try {
          const response = await getSavedItems(session.access_token)
          if (response.items) {
            setSavedItems(response.items.map((item: any) => item.external_id))
          }
        } catch (error) {
          console.error('Failed to load saved items:', error)
        }
      } else {
        setIsAuthenticated(false)
        setCurrentView('login')
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true)
        setUserEmail(session.user.email || null)
        setAuthToken(session.access_token)
        if (currentView === 'login') {
          setCurrentView('home')
        }
      } else {
        setIsAuthenticated(false)
        setUserEmail(null)
        setAuthToken(null)
        setCurrentView('login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const navigateTo = (view: View, item?: Item) => {
    setCurrentView(view)
    if (item) setSelectedItem(item)
    window.scrollTo(0, 0)
  }

  const toggleSaveItem = async (id: string) => {
    if (!authToken) return

    if (savedItems.includes(id)) {
      // Remove from saved
      setSavedItems(savedItems.filter(itemId => itemId !== id))
      try {
        await deleteItem(id, authToken)
      } catch (error) {
        console.error('Failed to delete item:', error)
        // Revert on error
        setSavedItems([...savedItems, id])
      }
    } else {
      // Add to saved
      setSavedItems([...savedItems, id])
      // Note: Actual save will happen when user clicks save on detail page
      // This is just for UI state
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUserEmail(null)
    setAuthToken(null)
    setSavedItems([])
    setCurrentView('login')
  }

  const handleLoginSuccess = () => {
    navigateTo('home')
  }

  const renderView = () => {
    if (!isAuthenticated) {
      return <Login onSuccess={handleLoginSuccess} />
    }

    switch (currentView) {
      case 'home':
        return <Home />
      case 'search':
        return <SearchResults authToken={authToken} />
      case 'detail':
        return selectedItem ? <ItemDetail item={selectedItem} authToken={authToken} /> : <Home />
      case 'login':
        return <Login onSuccess={handleLoginSuccess} />
      default:
        return <Home />
    }
  }

  return (
    <NavContext.Provider value={{ 
      currentView, 
      navigateTo, 
      searchQuery, 
      setSearchQuery,
      marketplaceFilter,
      setMarketplaceFilter,
      selectedItem,
      savedItems,
      toggleSaveItem,
      isAuthenticated,
      userEmail,
      logout
    }}>
      {isAuthenticated ? <Layout>{renderView()}</Layout> : renderView()}
    </NavContext.Provider>
  )
}
