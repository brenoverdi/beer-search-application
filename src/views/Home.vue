<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="hero-gradient py-20">
      <div class="max-w-4xl mx-auto text-center px-4">
        <h1 class="text-5xl font-bold text-white mb-6">
          🍺 Discover Your Perfect Beer
        </h1>
        <p class="text-xl text-gray-200 mb-8">
          Search thousands of craft beers and discover your new favorites
        </p>
        
        <!-- CTA Button -->
        <div class="max-w-2xl mx-auto">
          <button
            @click="router.push('/search')"
            class="btn-primary px-12 py-4 text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            🔍 Start Searching Beers
          </button>
        </div>
      </div>
    </section>
    
    <!-- Popular Beers Section -->
    <section class="py-16">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">🔥 Popular Beers</h2>
        
        <div v-if="beerStore.loading" class="text-center">
          <div class="text-2xl">⏳ Loading beers...</div>
        </div>
        
        <div v-else-if="beerStore.error" class="text-center text-red-600">
          <p>{{ beerStore.error }}</p>
          <button @click="loadPopularBeers" class="btn-primary mt-4">
            Try Again
          </button>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="beer in displayBeers"
            :key="beer.query || beer.id"
            class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
            @click="viewBeerDetails(beer)"
          >
            <!-- Card header band -->
            <div class="bg-amber-50 border-b border-amber-100 px-5 py-4 rounded-t-xl flex items-center justify-between">
              <span class="text-3xl">🍺</span>
              <span v-if="beer.abv" class="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                {{ Number(beer.abv).toFixed(1) }}% ABV
              </span>
            </div>
            <!-- Card body -->
            <div class="p-5 flex flex-col flex-1">
              <h3 class="font-bold text-gray-900 text-base leading-tight mb-1">
                {{ beer.beer_name || beer.name }}
              </h3>
              <p class="text-amber-700 text-sm font-medium mb-0.5">
                {{ beer.brewery?.brewery_name || beer.brewery || 'Unknown Brewery' }}
              </p>
              <p class="text-gray-400 text-xs mb-3">
                {{ beer.beer_style || beer.style || 'Unknown Style' }}
              </p>
              <p v-if="beer.description" class="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                {{ beer.description }}
              </p>
              <div v-else class="flex-1"></div>
              <!-- Footer: rating + favourite -->
              <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <div v-if="beer.rating_score" class="flex items-center gap-1.5">
                  <span class="text-amber-400 text-sm">★</span>
                  <span class="font-semibold text-sm" :class="ratingClass(beer.rating_score)">{{ Number(beer.rating_score).toFixed(2) }}</span>
                  <span v-if="beer.rating_count" class="text-gray-400 text-xs">({{ Number(beer.rating_count).toLocaleString() }})</span>
                </div>
                <div v-else class="text-xs text-gray-400">No rating</div>
                <button
                  @click.stop="toggleFavorite(beer)"
                  class="text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
                >
                  {{ beerStore.isFavorite(beer.query || beer.bid || beer.id) ? '♥' : '♡' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="!beerStore.loading && displayBeers.length === 0" class="text-center py-8">
          <p class="text-gray-600">No popular beers available at the moment.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBeerStore } from '@/stores/beer'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const beerStore = useBeerStore()
    const authStore = useAuthStore()
    
    const displayBeers = computed(() => beerStore.popularBeers.slice(0, 12))
    
    const loadPopularBeers = async () => {
      try {
        await beerStore.loadPopularBeers()
      } catch (error) {
        console.error('Failed to load popular beers:', error)
      }
    }
    
    const toggleFavorite = async (beer) => {
      try {
        const beerId = beer.bid || beer.id
        if (beerStore.isFavorite(beerId)) {
          await beerStore.removeFromFavorites(beerId, authStore.user?.id)
        } else {
          await beerStore.addToFavorites(beer, authStore.user?.id)
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
      }
    }
    
    const viewBeerDetails = (beer) => {
      // Navigate to beer details (when we create that view)
      console.log('View beer details:', beer)
    }
    
    const ratingClass = (score) => {
      if (score >= 4.0) return 'text-green-600'
      if (score >= 3.5) return 'text-amber-500'
      return 'text-red-500'
    }
    
    onMounted(() => {
      loadPopularBeers()
    })
    
    return {
      router,
      displayBeers,
      beerStore,
      authStore,
      loadPopularBeers,
      toggleFavorite,
      viewBeerDetails,
      ratingClass
    }
  }
}
</script>
