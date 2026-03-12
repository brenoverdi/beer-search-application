<template>
  <div id="app" class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navigation — hidden on auth pages -->
    <nav v-if="!route.meta.public" class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2 shrink-0">
            <span class="text-2xl">🍺</span>
            <span class="text-xl font-bold text-gray-900 hidden sm:inline">Beer Search</span>
          </router-link>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-1">
            <router-link to="/" exact-active-class="nav-link-active" class="nav-link">Home</router-link>
            <router-link to="/search" active-class="nav-link-active" class="nav-link">Search</router-link>
            <router-link to="/favorites" active-class="nav-link-active" class="nav-link">Favorites</router-link>
            <router-link to="/lists" active-class="nav-link-active" class="nav-link">Lists</router-link>
          </div>

          <!-- Desktop auth -->
          <div class="hidden md:flex items-center gap-3">
            <template v-if="authStore.isLoggedIn">
              <span class="text-sm text-gray-600">{{ authStore.currentUser?.username }}</span>
              <button @click="handleLogout" class="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                Logout
              </button>
            </template>
            <template v-else>
              <router-link to="/login" class="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition">Sign in</router-link>
              <router-link to="/register" class="text-sm px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition font-medium">Register</router-link>
            </template>
          </div>

          <!-- Mobile hamburger -->
          <button
            @click="mobileOpen = !mobileOpen"
            class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <transition name="slide">
        <div v-if="mobileOpen" class="md:hidden border-t border-gray-100 bg-white">
          <div class="px-4 pt-2 pb-4 space-y-1">
            <router-link @click="mobileOpen = false" to="/" exact-active-class="nav-link-active" class="nav-link block">Home</router-link>
            <router-link @click="mobileOpen = false" to="/search" active-class="nav-link-active" class="nav-link block">Search</router-link>
            <router-link @click="mobileOpen = false" to="/favorites" active-class="nav-link-active" class="nav-link block">Favorites</router-link>
            <router-link @click="mobileOpen = false" to="/lists" active-class="nav-link-active" class="nav-link block">Lists</router-link>
            <div class="pt-2 border-t border-gray-100">
              <template v-if="authStore.isLoggedIn">
                <p class="text-sm text-gray-500 px-3 py-1.5">{{ authStore.currentUser?.username }}</p>
                <button @click="handleLogout" class="w-full text-left nav-link text-red-500">Logout</button>
              </template>
              <template v-else>
                <router-link @click="mobileOpen = false" to="/login" class="nav-link block">Sign in</router-link>
                <router-link @click="mobileOpen = false" to="/register" class="nav-link block text-amber-600 font-medium">Register</router-link>
              </template>
            </div>
          </div>
        </div>
      </transition>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer — hidden on auth pages -->
    <footer v-if="!route.meta.public" class="bg-gray-800 text-white py-8 mt-auto">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <p class="text-gray-300">&copy; 2024 Beer Search. Discover your perfect beer! 🍺</p>
        <p class="text-gray-500 text-sm mt-1">Powered by Gemini AI — Drink responsibly</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const mobileOpen = ref(false)

const handleLogout = async () => {
  mobileOpen.value = false
  await authStore.logout()
  router.push('/')
}
</script>

<style>
.nav-link {
  @apply text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors;
}
.nav-link-active {
  @apply text-amber-600 font-semibold;
}
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease;
  overflow: hidden;
  max-height: 400px;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
