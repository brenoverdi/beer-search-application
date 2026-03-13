<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="festivalsStore.loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Loading festival details...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="festivalsStore.error" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="text-4xl mb-4">😕</div>
        <p class="text-red-600 mb-4">{{ festivalsStore.error }}</p>
        <router-link to="/festivals" class="btn-primary">Back to Festivals</router-link>
      </div>
    </div>

    <!-- Festival Content -->
    <template v-else-if="festival">
      <!-- Hero -->
      <div class="h-72 bg-gradient-to-br from-amber-400 to-amber-600 relative">
        <img 
          v-if="festival.imageUrl" 
          :src="festival.imageUrl" 
          :alt="festival.name"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div class="max-w-4xl mx-auto">
            <span class="px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
              {{ festival.continent }}
            </span>
            <h1 class="text-4xl font-bold text-white mt-3">{{ festival.name }}</h1>
            <p class="text-white/90 text-lg mt-2">
              📍 {{ festival.city }}, {{ festival.country }}
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="md:col-span-2 space-y-6">
            <!-- Dates -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 mb-3">📅 Festival Dates</h2>
              <p class="text-gray-700">
                {{ formatDate(festival.startDate) }} - {{ formatDate(festival.endDate) }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ getDaysRemaining(festival.startDate) }}
              </p>
            </div>

            <!-- Description -->
            <div v-if="festival.description" class="bg-white rounded-xl p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 mb-3">About the Festival</h2>
              <p class="text-gray-700 leading-relaxed">{{ festival.description }}</p>
            </div>

            <!-- External Links -->
            <div v-if="festival.website" class="bg-white rounded-xl p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 mb-3">🔗 Links</h2>
              <a 
                :href="festival.website" 
                target="_blank" 
                rel="noopener"
                class="text-amber-600 hover:text-amber-700 font-medium"
              >
                Official Website →
              </a>
            </div>
          </div>

          <!-- Sidebar - Create Itinerary -->
          <div class="space-y-6">
            <div class="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">🗓️ Plan Your Trip</h2>
              
              <template v-if="!authStore.isAuthenticated">
                <p class="text-gray-600 text-sm mb-4">
                  Sign in to create a personalized itinerary with hotel recommendations and beer spots.
                </p>
                <router-link to="/login" class="btn-primary w-full block text-center">
                  Sign in to Continue
                </router-link>
              </template>

              <template v-else>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                    <input
                      v-model="arrivalDate"
                      type="date"
                      :min="today"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                    <input
                      v-model="departureDate"
                      type="date"
                      :min="arrivalDate || today"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  
                  <p v-if="itineraryError" class="text-red-600 text-sm">{{ itineraryError }}</p>
                  
                  <button 
                    @click="generateItinerary"
                    :disabled="festivalsStore.generatingItinerary || !arrivalDate || !departureDate"
                    class="btn-primary w-full disabled:opacity-50"
                  >
                    {{ festivalsStore.generatingItinerary ? 'Generating...' : 'Create Itinerary' }}
                  </button>
                </div>

                <p class="text-xs text-gray-500 mt-4">
                  We'll create a personalized day-by-day plan based on your profile and travel dates.
                </p>
              </template>
            </div>
          </div>
        </div>

        <!-- Generated Itinerary -->
        <div v-if="itinerary" class="mt-8 bg-white rounded-xl p-8 shadow-sm">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">🗺️ Your Itinerary</h2>
          
          <p class="text-gray-700 mb-6">{{ itinerary.generatedPlan.overview }}</p>

          <!-- Days -->
          <div class="space-y-6 mb-8">
            <div 
              v-for="(day, index) in itinerary.generatedPlan.days" 
              :key="day.date"
              class="border-l-4 border-amber-400 pl-4"
            >
              <h3 class="font-semibold text-lg text-gray-900">
                Day {{ index + 1 }} - {{ formatDate(day.date) }}
              </h3>
              <div class="mt-2 space-y-2 text-sm">
                <p><span class="font-medium text-gray-700">🌅 Morning:</span> {{ day.morning }}</p>
                <p><span class="font-medium text-gray-700">☀️ Afternoon:</span> {{ day.afternoon }}</p>
                <p><span class="font-medium text-gray-700">🌙 Evening:</span> {{ day.evening }}</p>
                <p v-if="day.notes" class="text-gray-500 italic">💡 {{ day.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Beer Spots -->
          <div v-if="itinerary.generatedPlan.beerSpots?.length" class="mb-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">🍺 Recommended Beer Spots</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div 
                v-for="spot in itinerary.generatedPlan.beerSpots" 
                :key="spot.name"
                class="bg-gray-50 rounded-lg p-4"
              >
                <h4 class="font-medium text-gray-900">{{ spot.name }}</h4>
                <p class="text-sm text-gray-500">{{ spot.address }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ spot.description }}</p>
                <span v-if="spot.rating" class="text-amber-500 text-sm">★ {{ spot.rating }}</span>
              </div>
            </div>
          </div>

          <!-- Hotels -->
          <div v-if="itinerary.generatedPlan.hotels?.length" class="mb-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">🏨 Hotel Recommendations</h3>
            <div class="grid md:grid-cols-3 gap-4">
              <div 
                v-for="hotel in itinerary.generatedPlan.hotels" 
                :key="hotel.name"
                class="bg-gray-50 rounded-lg p-4"
              >
                <h4 class="font-medium text-gray-900">{{ hotel.name }}</h4>
                <span class="text-xs text-amber-600 font-medium">{{ hotel.priceRange }}</span>
                <p class="text-sm text-gray-600 mt-1">{{ hotel.description }}</p>
                <a 
                  :href="hotel.bookingUrl" 
                  target="_blank"
                  class="inline-block mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Book on Booking.com →
                </a>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div v-if="itinerary.generatedPlan.tips?.length">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">💡 Pro Tips</h3>
            <ul class="space-y-2">
              <li v-for="tip in itinerary.generatedPlan.tips" :key="tip" class="flex items-start gap-2">
                <span class="text-amber-500">✓</span>
                <span class="text-gray-700">{{ tip }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFestivalsStore } from '@/stores/festivals'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const festivalsStore = useFestivalsStore()
const authStore = useAuthStore()

const arrivalDate = ref('')
const departureDate = ref('')
const itineraryError = ref('')

const festival = computed(() => festivalsStore.currentFestival)
const itinerary = computed(() => festivalsStore.currentItinerary)
const today = computed(() => new Date().toISOString().split('T')[0])

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const getDaysRemaining = (startDate) => {
  const start = new Date(startDate)
  const now = new Date()
  const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Festival has started!'
  if (diff === 0) return 'Starts today!'
  if (diff === 1) return 'Starts tomorrow!'
  return `Starts in ${diff} days`
}

const generateItinerary = async () => {
  if (!arrivalDate.value || !departureDate.value) {
    itineraryError.value = 'Please select both arrival and departure dates'
    return
  }
  
  if (new Date(arrivalDate.value) >= new Date(departureDate.value)) {
    itineraryError.value = 'Departure must be after arrival'
    return
  }
  
  itineraryError.value = ''
  
  try {
    await festivalsStore.createItinerary(
      festival.value.id,
      arrivalDate.value,
      departureDate.value
    )
  } catch (error) {
    itineraryError.value = error.message
  }
}

onMounted(async () => {
  const festivalId = Number(route.params.id)
  if (festivalId) {
    await festivalsStore.loadFestival(festivalId)
    
    // Pre-fill dates based on festival dates
    if (festivalsStore.currentFestival) {
      const start = new Date(festivalsStore.currentFestival.startDate)
      const end = new Date(festivalsStore.currentFestival.endDate)
      
      // Suggest arriving a day before and leaving a day after
      const arrival = new Date(start)
      arrival.setDate(arrival.getDate() - 1)
      const departure = new Date(end)
      departure.setDate(departure.getDate() + 1)
      
      arrivalDate.value = arrival.toISOString().split('T')[0]
      departureDate.value = departure.toISOString().split('T')[0]
    }
  }
})
</script>
