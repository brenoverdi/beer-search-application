<!-- eslint-disable no-unused-vars -->
<script setup>
import { ref, onMounted, watch } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
import api from '../services/api'
import { useGeocoding } from '../composables/useGeocoding'
import { COUNTRIES } from '../data/countries'
import 'leaflet/dist/leaflet.css'

const mapRef = ref(null)
const center = ref([40.7128, -74.0060]) // Default: NYC
const zoom = ref(12)
const breweries = ref([])
const loading = ref(false)
const error = ref(null)
const userLocation = ref(null)
const searchCity = ref('')
const searchCountry = ref('')
const showCitySuggestions = ref(false)

// Geocoding composable
const { state: geocodingState, searchCities, clearSuggestions } = useGeocoding()

// Watch city input for autocomplete
let cityInputTimer = null
watch(searchCity, (newValue) => {
  if (newValue && newValue.length >= 2) {
    searchCities(newValue)
    showCitySuggestions.value = true
  } else {
    clearSuggestions()
    showCitySuggestions.value = false
  }
})

// Select a city from suggestions
const selectCity = (suggestion) => {
  searchCity.value = suggestion.city
  searchCountry.value = suggestion.country
  center.value = [suggestion.lat, suggestion.lng]
  showCitySuggestions.value = false
  clearSuggestions()
  // Auto-search after selection
  searchByLocation(suggestion.lat, suggestion.lng)
}

// Close suggestions when clicking outside
const closeSuggestions = () => {
  showCitySuggestions.value = false
}

// Brewery type icons/colors
const breweryTypeColors = {
  micro: '#16a34a',      // green
  brewpub: '#2563eb',    // blue
  regional: '#9333ea',   // purple
  large: '#dc2626',      // red
  contract: '#f59e0b',   // amber
  proprietor: '#0891b2', // cyan
  planning: '#6b7280',   // gray
  nano: '#84cc16',       // lime
  closed: '#374151',     // dark gray
}

const getBreweryColor = (type) => {
  return breweryTypeColors[type] || '#d97706'
}

// Get user's location
const getUserLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        center.value = [position.coords.latitude, position.coords.longitude]
        searchNearby()
      },
      (err) => {
        console.error('Geolocation error:', err)
        error.value = 'Could not get your location. Try searching by city instead.'
      }
    )
  } else {
    error.value = 'Geolocation is not supported by your browser.'
  }
}

// Search breweries near coordinates
const searchNearby = async () => {
  if (!userLocation.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await api.getBreweries({
      lat: userLocation.value.lat,
      lng: userLocation.value.lng,
      limit: 100
    })
    breweries.value = response.breweries
    
    if (breweries.value.length === 0) {
      error.value = 'No breweries found nearby. Try a different location.'
    }
  } catch (err) {
    console.error('Failed to fetch breweries:', err)
    error.value = 'Failed to load breweries. Please try again.'
  } finally {
    loading.value = false
  }
}

// Search breweries by city/country
const searchByLocation = async (lat = null, lng = null) => {
  if (!searchCity.value && !searchCountry.value && !lat && !lng) {
    error.value = 'Please enter a city or select a country to search.'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const params = {
      limit: 100
    }
    
    // If coordinates provided (from city selection), use them
    if (lat && lng) {
      params.lat = lat
      params.lng = lng
      params.radius = 50 // 50km radius
    }
    
    // Add city if provided
    if (searchCity.value) {
      params.city = searchCity.value
    }
    
    // Add country if provided and not "All Countries"
    if (searchCountry.value) {
      params.country = searchCountry.value
    }
    
    const response = await api.getBreweries(params)
    breweries.value = response.breweries
    
    if (breweries.value.length > 0) {
      // Center map on first result if we didn't get coordinates from city selection
      if (!lat && !lng) {
        center.value = [breweries.value[0].latitude, breweries.value[0].longitude]
        zoom.value = 11
      } else {
        zoom.value = 12
      }
    } else {
      error.value = 'No breweries found in this location. Try a different city.'
    }
  } catch (err) {
    console.error('Failed to fetch breweries:', err)
    error.value = 'Failed to load breweries. Please try again.'
  } finally {
    loading.value = false
  }
}

// Open website in new tab
const openWebsite = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

onMounted(() => {
  // Try to get user location on mount
  getUserLocation()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-amber-600 text-white py-8">
      <div class="max-w-7xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-2">🗺️ Brewery Map</h1>
        <p class="text-amber-100">Discover breweries near you or search by city</p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px] relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              v-model="searchCity"
              type="text"
              placeholder="e.g., Porto Alegre, San Diego, London"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              @keyup.enter="searchByLocation"
              @blur="setTimeout(closeSuggestions, 200)"
            />
            
            <!-- City Suggestions Dropdown -->
            <div
              v-if="showCitySuggestions && (geocodingState.suggestions.length > 0 || geocodingState.loading)"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
            >
              <div v-if="geocodingState.loading" class="px-4 py-3 text-gray-500 text-sm">
                Searching cities...
              </div>
              <div
                v-for="(suggestion, index) in geocodingState.suggestions"
                :key="index"
                @click="selectCity(suggestion)"
                class="px-4 py-2 hover:bg-amber-50 cursor-pointer border-b last:border-b-0 transition-colors"
              >
                <div class="font-medium text-gray-900 text-sm">{{ suggestion.city }}</div>
                <div class="text-xs text-gray-500">{{ suggestion.country }}</div>
              </div>
            </div>
          </div>
          
          <div class="w-56">
            <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              v-model="searchCountry"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              <option v-for="country in COUNTRIES" :key="country.code" :value="country.name">
                {{ country.name }}
              </option>
            </select>
          </div>
          
          <button
            @click="searchByLocation()"
            :disabled="loading"
            class="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
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
                  Try Again
                </button>
              </div>
            </div>
            <l-map
              v-else
              ref="mapRef"
              :zoom="zoom"
              :center="center"
              style="height: 500px; width: 100%"
              :use-global-leaflet="false"
            >
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
              />
              
              <!-- User location marker -->
              <l-marker
                v-if="userLocation"
                :lat-lng="[userLocation.lat, userLocation.lng]"
              >
                <l-popup>
                  <strong>📍 You are here</strong>
                </l-popup>
              </l-marker>
              
              <!-- Brewery markers -->
              <l-marker
                v-for="brewery in breweries"
                :key="brewery.id"
                :lat-lng="[brewery.latitude, brewery.longitude]"
              >
                <l-popup>
                  <div class="min-w-[200px]">
                    <h3 class="font-bold text-gray-900">{{ brewery.name }}</h3>
                    <span
                      class="inline-block px-2 py-0.5 text-xs font-medium text-white rounded mt-1"
                      :style="{ backgroundColor: getBreweryColor(brewery.type) }"
                    >
                      {{ brewery.type || 'Brewery' }}
                    </span>
                    <p class="text-sm text-gray-600 mt-2">{{ brewery.address }}</p>
                    <p v-if="brewery.phone" class="text-sm text-gray-500">📞 {{ brewery.phone }}</p>
                    <button
                      v-if="brewery.website"
                      @click="openWebsite(brewery.website)"
                      class="mt-2 text-sm text-amber-600 hover:text-amber-800 font-medium"
                    >
                      🌐 Visit Website →
                    </button>
                  </div>
                </l-popup>
              </l-marker>
            </l-map>
          </div>
          
          <!-- Results info -->
          <div class="mt-4 text-sm text-gray-600">
            <span v-if="loading">Loading breweries...</span>
            <span v-else-if="breweries.length > 0">
              Showing {{ breweries.length }} breweries with coordinates
            </span>
          </div>
        </div>

        <!-- Sidebar: Brewery List -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div class="bg-amber-50 px-4 py-3 border-b border-amber-100">
              <h2 class="font-bold text-amber-900">Breweries</h2>
            </div>
            
            <div class="max-h-[450px] overflow-y-auto">
              <div v-if="loading" class="p-4 text-center text-gray-500">
                Loading...
              </div>
              <div v-else-if="breweries.length === 0" class="p-4 text-center text-gray-500">
                No breweries found. Try searching a different location.
              </div>
              <div v-else>
                <div
                  v-for="brewery in breweries"
                  :key="brewery.id"
                  class="p-3 border-b hover:bg-amber-50 cursor-pointer transition-colors"
                  @click="center = [brewery.latitude, brewery.longitude]; zoom = 15"
                >
                  <h3 class="font-medium text-gray-900 text-sm">{{ brewery.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span
                      class="px-2 py-0.5 text-xs font-medium text-white rounded"
                      :style="{ backgroundColor: getBreweryColor(brewery.type) }"
                    >
                      {{ brewery.type || 'brewery' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ brewery.city }}, {{ brewery.state }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="bg-white rounded-xl shadow-lg border border-gray-200 mt-4 p-4">
            <h3 class="font-bold text-gray-900 mb-3 text-sm">Brewery Types</h3>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div v-for="(color, type) in breweryTypeColors" :key="type" class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: color }"></div>
                <span class="capitalize text-gray-700">{{ type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom map popup styling */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
}

:deep(.leaflet-popup-content) {
  margin: 12px;
}
</style>
