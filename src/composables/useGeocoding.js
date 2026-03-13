/**
 * Geocoding Composable
 * 
 * Provides city search and geocoding functionality using OpenStreetMap Nominatim API.
 * Features debouncing to respect rate limits (max 1 request per second).
 * 
 * @typedef {Object} CitySuggestion
 * @property {string} displayName - e.g., "Porto Alegre, Rio Grande do Sul, Brazil"
 * @property {string} city - e.g., "Porto Alegre"
 * @property {string} country - e.g., "Brazil"
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * 
 * @typedef {Object} GeocodingState
 * @property {CitySuggestion[]} suggestions
 * @property {boolean} loading
 * @property {string|null} error
 */

import { ref } from 'vue'

// Rate limiting: Nominatim allows 1 request per second
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // ms

export function useGeocoding() {
  const state = ref({
    suggestions: [],
    loading: false,
    error: null,
  })

  let debounceTimer = null
  let abortController = null

  /**
   * Search for city suggestions using Nominatim geocoding API
   * @param {string} query - City name to search for (e.g., "Porto Alegre", "San Diego")
   * @param {number} debounceMs - Debounce delay in milliseconds (default: 300ms)
   */
  const searchCities = async (query, debounceMs = 300) => {
    // Clear previous debounce timer
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }

    // Abort any pending request
    if (abortController) {
      abortController.abort()
    }

    // Clear suggestions if query is too short
    if (!query || query.trim().length < 2) {
      state.value.suggestions = []
      state.value.loading = false
      state.value.error = null
      return
    }

    // Debounce the request
    debounceTimer = setTimeout(async () => {
      state.value.loading = true
      state.value.error = null

      try {
        // Respect rate limit
        const now = Date.now()
        const timeSinceLastRequest = now - lastRequestTime
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
          await new Promise(resolve => 
            setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
          )
        }

        // Create abort controller for this request
        abortController = new AbortController()
        lastRequestTime = Date.now()

        // Call Nominatim API
        // Search for cities, towns, and villages
        const url = new URL('https://nominatim.openstreetmap.org/search')
        url.searchParams.set('q', query.trim())
        url.searchParams.set('format', 'json')
        url.searchParams.set('addressdetails', '1')
        url.searchParams.set('limit', '10')
        url.searchParams.set('featuretype', 'city')
        // Include cities, towns, and villages in results
        url.searchParams.set('class', 'place')

        const response = await fetch(url.toString(), {
          signal: abortController.signal,
          headers: {
            'User-Agent': 'BeerSearchApp/1.0', // Nominatim requires User-Agent
          },
        })

        if (!response.ok) {
          throw new Error(`Geocoding failed: ${response.statusText}`)
        }

        const data = await response.json()

        // Parse results into CitySuggestion format
        const suggestions = data
          .filter((item) => {
            // Filter for cities, towns, and villages
            const type = item.type || item.class
            return ['city', 'town', 'village', 'municipality', 'borough'].includes(type)
          })
          .map((item) => {
            const address = item.address || {}
            const city = address.city || address.town || address.village || 
                        address.municipality || item.name || 'Unknown'
            const country = address.country || 'Unknown'
            
            return {
              displayName: item.display_name,
              city,
              country,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            }
          })
          // Remove duplicates based on city + country
          .filter((item, index, self) => 
            index === self.findIndex(t => 
              t.city === item.city && t.country === item.country
            )
          )
          // Limit to top 8 results
          .slice(0, 8)

        state.value.suggestions = suggestions
        state.value.loading = false
      } catch (error) {
        // Ignore abort errors
        if (error.name === 'AbortError') {
          return
        }

        console.error('Geocoding error:', error)
        state.value.error = error.message || 'Failed to search cities'
        state.value.suggestions = []
        state.value.loading = false
      }
    }, debounceMs)
  }

  /**
   * Clear all suggestions and reset state
   */
  const clearSuggestions = () => {
    state.value.suggestions = []
    state.value.loading = false
    state.value.error = null
    
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  /**
   * Geocode a city name to coordinates
   * @param {string} cityName - City name to geocode
   * @returns {Promise<CitySuggestion|null>} First matching result or null
   */
  const geocodeCity = async (cityName) => {
    await searchCities(cityName, 0) // No debounce for direct geocoding
    return state.value.suggestions[0] || null
  }

  return {
    state,
    searchCities,
    clearSuggestions,
    geocodeCity,
  }
}
