<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">🎉 Beer Festivals</h1>
        <p class="text-gray-600">Discover beer festivals around the world and plan your trip</p>
      </div>

      <!-- Continent Tabs -->
      <div class="flex flex-wrap gap-2 mb-8">
        <button
          v-for="continent in festivalsStore.continents"
          :key="continent.id"
          @click="festivalsStore.setContinent(continent.id)"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            festivalsStore.selectedContinent === continent.id
              ? 'bg-amber-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-400'
          ]"
        >
          {{ continent.name }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="festivalsStore.loading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Loading festivals...</p>
      </div>

      <!-- Error -->
      <div v-else-if="festivalsStore.error" class="text-center py-12">
        <div class="text-4xl mb-4">😕</div>
        <p class="text-red-600 mb-4">{{ festivalsStore.error }}</p>
        <button @click="festivalsStore.loadFestivals()" class="btn-primary">
          Try Again
        </button>
      </div>

      <!-- No results -->
      <div v-else-if="festivalsStore.filteredFestivals.length === 0" class="text-center py-12">
        <div class="text-4xl mb-4">🍺</div>
        <p class="text-gray-600">No upcoming festivals found in this region.</p>
      </div>

      <!-- Festival Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="festival in festivalsStore.filteredFestivals"
          :key="festival.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          @click="goToFestival(festival.id)"
        >
          <!-- Image -->
          <div class="h-48 bg-gradient-to-br from-amber-400 to-amber-600 relative">
            <img 
              v-if="festival.imageUrl" 
              :src="festival.imageUrl" 
              :alt="festival.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="text-6xl">🍺</span>
            </div>
            <div class="absolute top-3 right-3">
              <span class="px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-700">
                {{ festival.continent }}
              </span>
            </div>
          </div>
          
          <!-- Content -->
          <div class="p-5">
            <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
              {{ festival.name }}
            </h3>
            <p class="text-amber-700 text-sm font-medium mb-2">
              📍 {{ festival.city }}, {{ festival.country }}
            </p>
            <p class="text-gray-500 text-sm mb-3">
              📅 {{ formatDateRange(festival.startDate, festival.endDate) }}
            </p>
            <p v-if="festival.description" class="text-gray-600 text-sm line-clamp-2 mb-4">
              {{ festival.description }}
            </p>
            <button 
              class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFestivalsStore } from '@/stores/festivals'

const router = useRouter()
const festivalsStore = useFestivalsStore()

const formatDateRange = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const options = { month: 'short', day: 'numeric' }
  const startStr = startDate.toLocaleDateString('en-US', options)
  const endStr = endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })
  return `${startStr} - ${endStr}`
}

const goToFestival = (id) => {
  router.push(`/festivals/${id}`)
}

onMounted(() => {
  festivalsStore.loadFestivals()
})
</script>
