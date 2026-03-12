<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-5xl">📬</span>
        <h1 class="mt-4 text-3xl font-bold text-gray-900">Verify your email</h1>
        <p class="mt-2 text-gray-600">
          We sent a 6-digit code to <strong>{{ email }}</strong>
        </p>
      </div>

      <div class="bg-white shadow rounded-xl p-8">
        <form @submit.prevent="handleVerify" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
            <input
              v-model="code"
              type="text"
              required
              minlength="6"
              maxlength="6"
              pattern="[0-9]{6}"
              placeholder="123456"
              class="w-full text-center text-3xl tracking-widest px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autocomplete="one-time-code"
              inputmode="numeric"
            />
          </div>

          <p v-if="error" class="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{{ error }}</p>
          <p v-if="success" class="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">{{ success }}</p>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {{ authStore.loading ? 'Verifying…' : 'Verify email' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-600">
          Wrong email?
          <router-link to="/register" class="text-amber-600 hover:underline font-medium">Go back</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = computed(() => route.query.email || authStore.pendingVerificationEmail || '')
const code = ref('')
const error = ref('')
const success = ref('')

const handleVerify = async () => {
  error.value = ''
  success.value = ''
  try {
    await authStore.verifyEmail(email.value, code.value)
    success.value = 'Email verified! Redirecting…'
    setTimeout(() => router.push('/'), 800)
  } catch (err) {
    error.value = err.message
  }
}
</script>
