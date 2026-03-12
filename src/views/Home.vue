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
        
        <!-- Quick Search -->
        <div class="max-w-2xl mx-auto">
          <div class="flex bg-white rounded-lg overflow-hidden shadow-lg">
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Search for beers..."
              class="flex-1 px-6 py-4 text-lg focus:outline-none"
            />
            <button
              @click="handleSearch"
              :disabled="!searchQuery.trim()"
              class="btn-primary px-8 rounded-none disabled:opacity-50"
            >
              Search
            </button>
          </div>
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
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="beer in displayBeers"
            :key="beer.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewBeerDetails(beer)"
          >
            <img
              :src="beer.label_url || beer.image || '/placeholder-beer.png'"
              :alt="beer.beer_name || beer.name"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-1">
                {{ beer.beer_name || beer.name }}
              </h3>
              <p class="text-gray-600 text-sm mb-2">
                {{ beer.brewery?.brewery_name || beer.brewery || 'Unknown Brewery' }}
              </p>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">
                  {{ beer.beer_style || beer.style || 'Unknown Style' }}
                </span>
                <button
                  @click.stop="toggleFavorite(beer)"
                  class="text-red-500 hover:text-red-700"
                >
                  {{ beerStore.isFavorite(beer.bid || beer.id) ? '♥' : '♡' }}
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
    const searchQuery = ref('')
    
    const displayBeers = computed(() => beerStore.popularBeers.slice(0, 12))
    
    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ 
          name: 'Search', 
          query: { q: searchQuery.value.trim() } 
        })
      }
    }
    
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
    
    onMounted(() => {
      loadPopularBeers()
    })
    
    return {
      searchQuery,
      displayBeers,
      beerStore,
      authStore,
      handleSearch,
      loadPopularBeers,
      toggleFavorite,
      viewBeerDetails
    }
  }
}
</script>
