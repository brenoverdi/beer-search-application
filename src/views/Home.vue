<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="hero-gradient py-20">
      <div class="max-w-4xl mx-auto text-center px-4">
        <div class="flex items-center justify-center gap-3 mb-6">
          <img src="/logo.png" alt="CraftScout" class="w-20 h-20 drop-shadow-lg" />
          <h1 class="text-5xl font-bold text-white drop-shadow">CraftScout</h1>
        </div>
        <p class="text-xl text-gray-200 mb-8">
          Discover craft beers, explore festivals, and find breweries near you
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
        <!-- Beer of the Day + Popular Beers Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <!-- Beer of the Day (takes 1 column) -->
          <div class="lg:col-span-1">
            <BeerOfTheDay />
          </div>
          
          <!-- Featured Popular Beers (takes 2 columns) -->
          <div class="lg:col-span-2">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">🔥 Trending Now</h2>
            <div v-if="!beerStore.loading && displayBeers.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="beer in displayBeers.slice(0, 4)"
                :key="beer.query || beer.id"
                class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex"
                @click="viewBeerDetails(beer)"
              >
                <div class="bg-amber-50 border-r border-amber-100 px-4 flex items-center justify-center rounded-l-xl">
                  <span class="text-2xl">🍺</span>
                </div>
                <div class="p-4 flex-1">
                  <h3 class="font-bold text-gray-900 text-sm leading-tight mb-1">
                    {{ beer.beer_name || beer.name }}
                  </h3>
                  <p class="text-amber-700 text-xs font-medium">
                    {{ beer.brewery?.brewery_name || beer.brewery || 'Unknown Brewery' }}
                  </p>
                  <div v-if="beer.rating_score" class="flex items-center gap-1 mt-2">
                    <span class="text-amber-400 text-xs">★</span>
                    <span class="font-semibold text-xs" :class="ratingClass(beer.rating_score)">{{ Number(beer.rating_score).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="beerStore.loading" class="py-4">
              <InteractiveLoading />
            </div>
          </div>
        </div>
        
        <!-- Personalized Recommendations -->
        <template v-if="authStore.isLoggedIn && recommendedBeers.length > 0">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <span class="text-2xl">✨</span>
              <h2 class="text-2xl font-bold text-gray-900">Recommended for You</h2>
            </div>
            <router-link to="/search" class="text-amber-600 hover:text-amber-700 text-sm font-medium">Explore more &rarr;</router-link>
          </div>
          <p class="text-gray-500 mb-6 -mt-4 text-sm">Based on your favorite styles</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="beer in recommendedBeers"
              :key="'rec-' + (beer.query || beer.id)"
              class="bg-white rounded-xl shadow-sm border border-amber-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col relative overflow-hidden"
              @click="viewBeerDetails(beer)"
            >
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              <!-- Card header band -->
              <div class="bg-amber-50/50 border-b border-amber-100 px-5 py-4 flex items-center justify-between">
                <span class="text-3xl">🍺</span>
                <div class="flex items-center gap-1.5">
                  <span v-if="beer.abv" class="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    {{ Number(beer.abv).toFixed(1) }}% ABV
                  </span>
                </div>
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
                <div class="flex-1"></div>
                <!-- Footer -->
                <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div v-if="beer.rating_score" class="flex items-center gap-1.5">
                    <span class="text-amber-400 text-sm">★</span>
                    <span class="font-semibold text-sm" :class="ratingClass(beer.rating_score)">{{ Number(beer.rating_score).toFixed(2) }}</span>
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
        </template>
        
        <h2 class="text-3xl font-bold text-gray-900 mb-8 mt-16 pt-12 border-t border-gray-100">🍻 All Popular Beers</h2>
        
        <div v-if="beerStore.loading" class="py-4">
          <InteractiveLoading />
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
              <div class="flex items-center gap-1.5">
                <span v-if="beer.abv" class="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                  {{ Number(beer.abv).toFixed(1) }}% ABV
                </span>
                <span v-if="beer.ibu" class="text-xs font-semibold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                  {{ beer.ibu }} IBU
                </span>
              </div>
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
                  <span v-if="beer.check_ins" class="text-gray-400 text-xs">({{ Number(beer.check_ins).toLocaleString() }} check-ins)</span>
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

    <!-- Monetized Affiliate Section -->
    <div class="max-w-6xl mx-auto px-4 pb-16">
      <OnlineShops />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBeerStore } from '@/stores/beer'
import { useAuthStore } from '@/stores/auth'
import BeerOfTheDay from '@/components/BeerOfTheDay.vue'
import OnlineShops from '@/components/OnlineShops.vue'
import InteractiveLoading from '@/components/InteractiveLoading.vue'

export default {
  name: 'Home',
  components: {
    BeerOfTheDay,
    OnlineShops,
    InteractiveLoading
  },
  setup() {
    const router = useRouter()
    const beerStore = useBeerStore()
    const authStore = useAuthStore()
    
    const displayBeers = computed(() => beerStore.popularBeers.slice(0, 12))
    
    const recommendedBeers = computed(() => {
      if (!authStore.isLoggedIn || !authStore.currentUser?.favoriteStyles?.length) return []
      const styles = authStore.currentUser.favoriteStyles.map(s => s.toLowerCase())
      return beerStore.popularBeers.filter(b => {
        if (!b.style && !b.beer_style) return false
        const bs = (b.style || b.beer_style).toLowerCase()
        return styles.some(s => bs.includes(s))
      }).slice(0, 6)
    })
    
    const loadPopularBeers = async () => {
      try {
        await beerStore.loadPopularBeers()
      } catch (error) {
        console.error('Failed to load popular beers:', error)
      }
    }
    
    const toggleFavorite = async (beer) => {
      if (!authStore.isLoggedIn) {
        router.push({ name: 'Login' })
        return
      }
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
      recommendedBeers,
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
