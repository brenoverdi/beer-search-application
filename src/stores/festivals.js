import { defineStore } from 'pinia'
import apiService from '@/services/api'

export const useFestivalsStore = defineStore('festivals', {
  state: () => ({
    festivals: [],
    currentFestival: null,
    currentItinerary: null,
    userItineraries: [],
    loading: false,
    generatingItinerary: false,
    error: null,
    selectedContinent: 'all',
  }),
  
  getters: {
    filteredFestivals: (state) => {
      if (state.selectedContinent === 'all') {
        return state.festivals
      }
      return state.festivals.filter(f => f.continent === state.selectedContinent)
    },
    
    continents: () => [
      { id: 'all', name: 'All' },
      { id: 'Europe', name: 'Europe' },
      { id: 'North America', name: 'North America' },
      { id: 'South America', name: 'South America' },
      { id: 'Asia', name: 'Asia' },
      { id: 'Oceania', name: 'Oceania' },
      { id: 'Africa', name: 'Africa' },
    ],
  },
  
  actions: {
    async loadFestivals(continent = 'all') {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.getFestivals(continent)
        this.festivals = response.festivals || []
        this.selectedContinent = continent
      } catch (error) {
        this.error = error.message
        this.festivals = []
      } finally {
        this.loading = false
      }
    },
    
    async loadFestival(id) {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.getFestival(id)
        this.currentFestival = response.festival
        return this.currentFestival
      } catch (error) {
        this.error = error.message
        this.currentFestival = null
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createItinerary(festivalId, arrivalDate, departureDate) {
      this.generatingItinerary = true
      this.error = null
      try {
        const response = await apiService.createItinerary(festivalId, arrivalDate, departureDate)
        this.currentItinerary = response.itinerary
        return this.currentItinerary
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.generatingItinerary = false
      }
    },
    
    setContinent(continent) {
      this.selectedContinent = continent
      this.loadFestivals(continent)
    },
    
    clearError() {
      this.error = null
    },
  }
})
