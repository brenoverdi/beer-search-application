<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-5xl">🍺</span>
        <h1 class="mt-4 text-3xl font-bold text-gray-900">Sign in</h1>
        <p class="mt-2 text-gray-600">Welcome back to Beer Search</p>
      </div>

      <div class="bg-white shadow rounded-xl p-8 space-y-5">
        <div v-if="authStore.error" class="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ authStore.error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              :disabled="authStore.loading"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="Your password"
              :disabled="authStore.loading"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-50"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading || !email || !password"
            class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {{ authStore.loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-600">
          Don't have an account?
          <router-link to="/register" class="text-amber-600 hover:underline font-medium">Register</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch {
    // Error handled by store
  }
}
</script>
