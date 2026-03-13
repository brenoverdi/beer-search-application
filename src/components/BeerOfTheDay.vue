<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const beerOfTheDay = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await api.getBeerOfTheDay()
    beerOfTheDay.value = response
  } catch (err) {
    error.value = 'Failed to load Beer of the Day'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <section class="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 shadow-lg border border-amber-200">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>
      <div>
        <h2 class="text-xl font-bold text-amber-900">Beer of the Day</h2>
        <p v-if="beerOfTheDay" class="text-sm text-amber-700">{{ formatDate(beerOfTheDay.date) }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse">
      <div class="h-6 bg-amber-200 rounded w-3/4 mb-3"></div>
      <div class="h-4 bg-amber-200 rounded w-1/2 mb-2"></div>
      <div class="h-4 bg-amber-200 rounded w-full mb-2"></div>
      <div class="h-4 bg-amber-200 rounded w-2/3"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-4">
      <p class="text-amber-700">{{ error }}</p>
    </div>

    <!-- Beer Content -->
    <div v-else-if="beerOfTheDay" class="space-y-4">
      <!-- Beer Name & Brewery -->
      <div>
        <h3 class="text-2xl font-bold text-amber-900">{{ beerOfTheDay.beer.name }}</h3>
        <p class="text-amber-700 font-medium">
          {{ beerOfTheDay.beer.brewery }}
          <span v-if="beerOfTheDay.beer.country" class="text-amber-600">• {{ beerOfTheDay.beer.country }}</span>
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-3 gap-3">
        <div v-if="beerOfTheDay.beer.style" class="bg-white/60 rounded-lg p-3 text-center">
          <p class="text-xs text-amber-600 uppercase tracking-wide">Style</p>
          <p class="text-sm font-semibold text-amber-900 truncate">{{ beerOfTheDay.beer.style }}</p>
        </div>
        <div v-if="beerOfTheDay.beer.abv" class="bg-white/60 rounded-lg p-3 text-center">
          <p class="text-xs text-amber-600 uppercase tracking-wide">ABV</p>
          <p class="text-sm font-semibold text-amber-900">{{ beerOfTheDay.beer.abv }}%</p>
        </div>
        <div v-if="beerOfTheDay.beer.averageRating" class="bg-white/60 rounded-lg p-3 text-center">
          <p class="text-xs text-amber-600 uppercase tracking-wide">Rating</p>
          <p class="text-sm font-semibold text-amber-900 flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {{ beerOfTheDay.beer.averageRating.toFixed(1) }}
          </p>
        </div>
      </div>

      <!-- Description -->
      <p v-if="beerOfTheDay.beer.description" class="text-amber-800 text-sm leading-relaxed">
        {{ beerOfTheDay.beer.description }}
      </p>

      <!-- Fun Fact -->
      <div class="bg-amber-500/10 border border-amber-300 rounded-xl p-4 mt-4">
        <div class="flex items-start gap-3">
          <div class="text-2xl">💡</div>
          <div>
            <p class="text-xs text-amber-600 uppercase tracking-wide mb-1 font-semibold">Fun Fact</p>
            <p class="text-amber-900 text-sm">{{ beerOfTheDay.funFact }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
