<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">My Favorites ❤️</h1>
        <span class="text-sm text-gray-500">{{ listsStore.favorites.length }} beers</span>
      </div>

      <!-- Loading -->
      <div v-if="listsStore.loading" class="flex justify-center py-16">
        <div class="animate-spin text-4xl">🍺</div>
      </div>

      <!-- Not logged in -->
      <div v-else-if="!authStore.isLoggedIn" class="text-center py-16">
        <div class="text-6xl mb-4">🔒</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Sign in to see favorites</h3>
        <router-link to="/login" class="inline-block mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition">
          Sign in
        </router-link>
      </div>

      <!-- Empty -->
      <div v-else-if="listsStore.favorites.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">🍺</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
        <p class="text-gray-500 mb-6">Start exploring to save your favorite beers!</p>
        <router-link to="/search" class="inline-block px-6 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition">
          Search Beers
        </router-link>
      </div>

      <!-- Favorites grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="fav in listsStore.favorites"
          :key="fav.id"
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col gap-2"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-gray-900 leading-tight">{{ fav.beer?.beerName ?? fav.beerId }}</h3>
            <span v-if="fav.beer?.ratingScore" class="shrink-0 text-sm font-medium text-amber-600">
              ★ {{ fav.beer.ratingScore.toFixed(1) }}
            </span>
          </div>
          <p class="text-sm text-gray-500">{{ fav.beer?.brewery }}</p>
          <p class="text-xs text-gray-400">{{ fav.beer?.style }}</p>
          <button
            @click="removeFav(fav.beerId ?? fav.beer?.id)"
            class="mt-auto text-sm text-red-500 hover:text-red-700 transition text-left"
          >
            ♥ Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'

const authStore = useAuthStore()
const listsStore = useListsStore()

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await listsStore.loadFavorites(authStore.currentUser.id)
  }
})

const removeFav = async (beerId) => {
  await listsStore.removeFavorite(authStore.currentUser.id, beerId)
}
</script>
