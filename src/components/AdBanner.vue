<template>
  <div v-if="!authStore.isLoggedIn || !authStore.currentUser?.isPremium" class="bg-gray-100 border-y border-gray-200 py-4 mb-6">
    <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="text-xs font-bold uppercase text-gray-400 tracking-wider">Advertisement</span>
        <div>
          <h4 class="font-bold text-gray-900 leading-tight">🍺 Discover the Perfect Homebrew Kit</h4>
          <p class="text-sm text-gray-600">Start brewing your own craft beer today with 20% off all starter kits.</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3 shrink-0">
        <a href="#" class="btn-primary text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700">Shop Now</a>
        <button v-if="authStore.isLoggedIn" @click="$router.push('/premium')" class="text-xs text-gray-500 hover:text-amber-600 underline">
          Remove Ads ($3/mo)
        </button>
        <button v-else @click="$router.push('/login')" class="text-xs text-gray-500 hover:text-amber-600 underline">
          Log in for Ad-Free
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>
