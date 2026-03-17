<!-- eslint-disable no-unused-vars -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

const mapElement = ref(null)
const map = ref(null)
const placesService = ref(null)
const markers = ref([])
const infoWindow = ref(null)
const geocoder = ref(null)
const PlacesServiceStatus = ref(null)

const breweries = ref([])
const loading = ref(false)
const error = ref(null)
const searchCity = ref('')
const searchQuery = ref('brewery')

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Configure Google Maps API options once (outside initMap to avoid multiple calls)
if (GOOGLE_MAPS_API_KEY) {
  setOptions({
    apiKey: GOOGLE_MAPS_API_KEY,
    version: 'weekly'
  })
}

// Initialize Google Maps
const initMap = async () => {
  if (!GOOGLE_MAPS_API_KEY) {
    error.value = 'Google Maps API key not configured'
    return
  }

  try {
    // Import required libraries
    const { Map } = await importLibrary('maps')
    const { InfoWindow } = await importLibrary('maps')
    const { PlacesService, PlacesServiceStatus: PSS } = await importLibrary('places')
    const { Geocoder } = await importLibrary('geocoding')

    // Store references for use in other functions
    PlacesServiceStatus.value = PSS
    geocoder.value = new Geocoder()

    // Default to NYC, will update with user location or search
    map.value = new Map(mapElement.value, {
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 12,
      mapId: 'brewery-map'
    })

    infoWindow.value = new InfoWindow()

    // Initialize Places service
    placesService.value = new PlacesService(map.value)

    // Try to get user location
    getUserLocation()
  } catch (err) {
    console.error('Failed to load Google Maps:', err)
    error.value = 'Failed to load map. Please refresh the page.'
  }
}

// Clear existing markers
const clearMarkers = () => {
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []
  breweries.value = []
}

// Create marker for brewery
const createMarker = async (place) => {
  const { AdvancedMarkerElement } = await importLibrary('marker')
  
  const marker = new AdvancedMarkerElement({
    map: map.value,
    position: place.geometry.location,
    title: place.name
  })

  marker.addListener('click', () => {
    const content = `
      <div class="p-3 min-w-[250px]">
        <h3 class="font-bold text-gray-900 text-lg mb-2">${place.name}</h3>
        ${place.rating ? `<div class="text-sm text-amber-600 mb-2">⭐ ${place.rating} (${place.user_ratings_total || 0} reviews)</div>` : ''}
        ${place.vicinity ? `<p class="text-sm text-gray-600 mb-2">📍 ${place.vicinity}</p>` : ''}
        ${place.opening_hours ? `<p class="text-sm ${place.opening_hours.open_now ? 'text-green-600' : 'text-red-600'} mb-2">${place.opening_hours.open_now ? '✓ Open now' : '✗ Closed'}</p>` : ''}
        ${place.website ? `<a href="${place.website}" target="_blank" class="text-sm text-amber-600 hover:text-amber-800 font-medium">🌐 Visit Website →</a>` : ''}
      </div>
    `
    infoWindow.value.setContent(content)
    infoWindow.value.open(map.value, marker)
  })

  markers.value.push(marker)
  
  return {
    id: place.place_id,
    name: place.name,
    address: place.vicinity || '',
    rating: place.rating || null,
    total_ratings: place.user_ratings_total || 0,
    open_now: place.opening_hours?.open_now || null,
    location: {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    }
  }
}

// Get user's location
const getUserLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        map.value.setCenter(pos)
        searchNearby(pos)
      },
      (err) => {
        console.error('Geolocation error:', err)
      }
    )
  }
}

// Search breweries nearby
const searchNearby = (location) => {
  if (!placesService.value || !location) return

  loading.value = true
  error.value = null
  clearMarkers()

  const request = {
    location: location,
    radius: 10000, // 10km
    keyword: 'brewery',
    type: 'bar'
  }

  placesService.value.nearbySearch(request, async (results, status) => {
    loading.value = false

    if (status === PlacesServiceStatus.value.OK && results) {
      breweries.value = await Promise.all(results.map(place => createMarker(place)))
      
      if (breweries.value.length === 0) {
        error.value = 'No breweries found nearby.'
      }
    } else {
      error.value = 'Failed to find breweries. Try a different location.'
    }
  })
}

// Search breweries by city
const searchByLocation = async () => {
  if (!searchCity.value && !map.value) {
    error.value = 'Please enter a city to search.'
    return
  }

  loading.value = true
  error.value = null
  clearMarkers()

  try {
    // Use Geocoder to find the city location
    const query = searchQuery.value + ' in ' + searchCity.value
    
    geocoder.value.geocode({ address: searchCity.value }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location
        map.value.setCenter(location)
        map.value.setZoom(12)

        // Search for breweries using text search in this city
        const request = {
          location: location,
          radius: 15000, // 15km radius
          query: query
        }

        placesService.value.textSearch(request, async (results, status) => {
          loading.value = false

          if (status === PlacesServiceStatus.value.OK && results) {
            breweries.value = await Promise.all(results.map(place => createMarker(place)))
            
            if (breweries.value.length === 0) {
              error.value = `No breweries found in ${searchCity.value}.`
            }
          } else {
            error.value = `No breweries found in ${searchCity.value}. Try a different city.`
          }
        })
      } else {
        loading.value = false
        error.value = 'City not found. Please try a different search.'
      }
    })
  } catch (err) {
    loading.value = false
    console.error('Search error:', err)
    error.value = 'Failed to search. Please try again.'
  }
}

// Center map on brewery
const centerOnBrewery = (brewery) => {
  if (brewery.location && map.value) {
    map.value.setCenter(brewery.location)
    map.value.setZoom(16)
  }
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  clearMarkers()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-amber-600 text-white py-8">
      <div class="max-w-7xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-2">🗺️ Brewery Map</h1>
        <p class="text-amber-100">Discover breweries near you or search any city worldwide</p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[250px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              v-model="searchCity"
              type="text"
              placeholder="e.g., Porto Alegre, San Diego, London, Tokyo"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              @keyup.enter="searchByLocation"
            />
          </div>
          
          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search For</label>
            <select
              v-model="searchQuery"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="brewery">Breweries</option>
              <option value="craft brewery">Craft Breweries</option>
              <option value="brewpub">Brewpubs</option>
              <option value="microbrewery">Microbreweries</option>
            </select>
          </div>
          
          <button
            @click="searchByLocation()"
            :disabled="loading || !searchCity"
            class="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Searching...' : 'Search' }}
          </button>
          <button
            @click="getUserLocation"
            :disabled="loading"
            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            📍 Near Me
          </button>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Map -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div v-if="error && breweries.length === 0" class="h-[500px] flex items-center justify-center">
              <div class="text-center px-4">
                <p class="text-gray-600 mb-4">{{ error }}</p>
                <button
                  @click="getUserLocation"
                  class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Try Near Me
                </button>
              </div>
            </div>
            <div v-else ref="mapElement" class="w-full h-[500px]"></div>
          </div>
          
          <!-- Results info -->
          <div class="mt-4 text-sm text-gray-600">
            <span v-if="loading">🔍 Searching for breweries...</span>
            <span v-else-if="breweries.length > 0">
              ✓ Found {{ breweries.length }} {{ breweries.length === 1 ? 'brewery' : 'breweries' }}
            </span>
            <span v-else-if="error">
              {{ error }}
            </span>
          </div>
        </div>

        <!-- Sidebar: Brewery List -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div class="bg-amber-50 px-4 py-3 border-b border-amber-100">
              <h2 class="font-bold text-amber-900">Results</h2>
            </div>
            
            <div class="max-h-[450px] overflow-y-auto">
              <div v-if="loading" class="p-4 text-center text-gray-500">
                <div class="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
              <div v-else-if="breweries.length === 0" class="p-4 text-center text-gray-500">
                <p class="mb-2">🔍 No breweries found</p>
                <p class="text-xs">Try searching a different city or use "Near Me"</p>
              </div>
              <div v-else>
                <div
                  v-for="brewery in breweries"
                  :key="brewery.id"
                  class="p-3 border-b hover:bg-amber-50 cursor-pointer transition-colors"
                  @click="centerOnBrewery(brewery)"
                >
                  <h3 class="font-medium text-gray-900 text-sm">{{ brewery.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="brewery.rating" class="text-xs text-amber-600">
                      ⭐ {{ brewery.rating }}
                    </span>
                    <span v-if="brewery.open_now !== null" 
                      :class="brewery.open_now ? 'text-green-600' : 'text-red-600'"
                      class="text-xs"
                    >
                      {{ brewery.open_now ? '● Open' : '● Closed' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ brewery.address }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Info Box -->
          <div class="bg-blue-50 rounded-xl border border-blue-200 mt-4 p-4">
            <h3 class="font-bold text-blue-900 mb-2 text-sm">💡 Tip</h3>
            <p class="text-xs text-blue-800">
              Click on any brewery marker for details, ratings, and website links. 
              Powered by Google Maps for worldwide coverage!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure Google Maps renders properly */
</style>
