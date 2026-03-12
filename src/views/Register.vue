<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-5xl">🍺</span>
        <h1 class="mt-4 text-3xl font-bold text-gray-900">Create account</h1>
        <p class="mt-2 text-gray-600">Join Beer Search today</p>
      </div>

      <div class="bg-white shadow rounded-xl p-8">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              v-model="form.username"
              type="text"
              required
              minlength="3"
              maxlength="50"
              placeholder="hophead42"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
              placeholder="At least 6 characters"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <p v-if="error" class="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{{ error }}</p>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {{ authStore.loading ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-amber-600 hover:underline font-medium">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const error = ref('')

const form = reactive({ username: '', email: '', password: '' })

const handleRegister = async () => {
  error.value = ''
  try {
    await authStore.register(form.username, form.email, form.password)
    router.push({ name: 'VerifyEmail', query: { email: form.email } })
  } catch (err) {
    error.value = err.message
  }
}
</script>
