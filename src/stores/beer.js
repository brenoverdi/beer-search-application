import { defineStore } from 'pinia'
import apiService from '@/services/api'

export const useBeerStore = defineStore('beer', {
  state: () => ({
    beers: [],
    currentBeer: null,
    searchResults: [],
    popularBeers: [],
    favorites: [],
    loading: false,
    error: null,
    searchQuery: '',
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    }
  }),
  
  getters: {
    isLoading: (state) => state.loading,
    hasResults: (state) => state.searchResults.length > 0,
    isFavorite: (state) => (beerId) => {
      return state.favorites.some(beer => beer.id === beerId)
    }
  },
  
  actions: {
    async searchBeers(query, page = 1) {
      if (!query.trim()) return
      
      this.loading = true
      this.error = null
      this.searchQuery = query
      
      try {
        const response = await apiService.searchBeers(query, page, this.pagination.limit)
        
        this.searchResults = response.beers || response.data || []
        this.pagination.page = page
        this.pagination.total = response.total || 0
        
      } catch (error) {
        this.error = error.message
        this.searchResults = []
      } finally {
        this.loading = false
      }
    },
    
    async getBeerDetails(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiService.getBeerDetails(id)
        this.currentBeer = response.beer || response
        return this.currentBeer
      } catch (error) {
        this.error = error.message
        this.currentBeer = null
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async loadPopularBeers() {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiService.getPopularBeers(20)
        this.popularBeers = response.beers || response.data || []
      } catch (error) {
        this.error = error.message
        this.popularBeers = []
      } finally {
        this.loading = false
      }
    },
    
    async loadFavorites(userId) {
      if (!userId) return
      
      try {
        const response = await apiService.getFavorites(userId)
        this.favorites = response.favorites || response.data || []
      } catch (error) {
        this.error = error.message
        console.error('Failed to load favorites:', error)
      }
    },
    
    async addToFavorites(beer, userId) {
      if (!userId) {
        // Store locally if not authenticated
        this.favorites.push(beer)
        localStorage.setItem('beer-favorites', JSON.stringify(this.favorites))
        return
      }
      
      try {
        await apiService.addFavorite(userId, beer.id)
        this.favorites.push(beer)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    
    async removeFromFavorites(beerId, userId) {
      if (!userId) {
        // Remove locally if not authenticated
        this.favorites = this.favorites.filter(beer => beer.id !== beerId)
        localStorage.setItem('beer-favorites', JSON.stringify(this.favorites))
        return
      }
      
      try {
        await apiService.removeFavorite(userId, beerId)
        this.favorites = this.favorites.filter(beer => beer.id !== beerId)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    
    initializeFavorites() {
      // Load favorites from localStorage as fallback
      const saved = localStorage.getItem('beer-favorites')
      if (saved) {
        this.favorites = JSON.parse(saved)
      }
    },
    
    clearError() {
      this.error = null
    }
  }
})
