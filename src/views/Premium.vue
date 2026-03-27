<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
      
      <!-- Value Prop -->
      <div class="md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-amber-400 to-amber-600 text-white flex flex-col justify-center">
        <h2 class="text-3xl font-bold mb-4">Unlimited Craft Discovery</h2>
        <p class="text-amber-50 mb-8">Join CraftScout Premium and never let a good beer pass you by. Unlimited searches, totally ad-free.</p>
        
        <ul class="space-y-4">
          <li class="flex items-center gap-3 text-white">
            <span class="bg-white/20 p-1.5 rounded-full text-sm">✅</span>
            <span>Unlimited AI Beer Searches</span>
          </li>
          <li class="flex items-center gap-3 text-white">
            <span class="bg-white/20 p-1.5 rounded-full text-sm">✅</span>
            <span>Completely Ad-Free Experience</span>
          </li>
          <li class="flex items-center gap-3 text-white">
            <span class="bg-white/20 p-1.5 rounded-full text-sm">✅</span>
            <span>Priority Personalized Recommendations</span>
          </li>
          <li class="flex items-center gap-3 text-white">
            <span class="bg-white/20 p-1.5 rounded-full text-sm">✅</span>
            <span>Unlimited Festival Itineraries</span>
          </li>
        </ul>
      </div>

      <!-- Payment details -->
      <div class="md:w-1/2 p-8 md:p-12">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Premium Membership</h2>
          <div class="mt-4 flex items-baseline justify-center gap-1">
            <span class="text-5xl font-extrabold text-gray-900">$3</span>
            <span class="text-gray-500 font-medium">/month</span>
          </div>
        </div>

        <div v-if="success" class="bg-green-50 text-green-700 p-4 rounded-xl text-center mb-6 border border-green-200">
          <p class="font-bold text-lg mb-1">🎉 You are now Premium!</p>
          <p class="text-sm">Enjoy your unlimited, ad-free experience.</p>
          <button @click="$router.push('/search')" class="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition">
            Start Searching
          </button>
        </div>

        <form v-else @submit.prevent="handleUpgrade" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Card details (Mock)</label>
            <div class="relative">
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 font-mono tracking-widest text-sm outline-none"
                required
              />
              <div class="absolute right-3 top-3 text-2xl">💳</div>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-3">
              <input type="text" placeholder="MM/YY" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
              <input type="text" placeholder="CVC" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span v-if="loading">Processing...</span>
            <template v-else>
              <span>Pay $3.00 & Upgrade</span>
              <span>🔒</span>
            </template>
          </button>
          
          <p v-if="error" class="text-red-500 text-sm font-medium text-center mt-2">{{ error }}</p>
          
          <p class="text-xs text-center text-gray-400 mt-4">
            Secure mock payment. You can cancel anytime. No real credit card needed.
          </p>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const success = ref(false)
const error = ref(null)

const handleUpgrade = async () => {
  loading.value = true
  error.value = null
  try {
    await authStore.upgradeToPremium()
    success.value = true
  } catch (err) {
    error.value = err.message || 'Upgrade failed'
  } finally {
    loading.value = false
  }
}
</script>
