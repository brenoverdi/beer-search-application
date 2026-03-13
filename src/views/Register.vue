<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg">
      <div class="text-center mb-8">
        <img src="/logo.svg" alt="BrewScout" class="w-16 h-16 mx-auto" />
        <h1 class="mt-4 text-3xl font-bold text-gray-900">Join BrewScout</h1>
        <p class="mt-2 text-gray-600">Create your account and start discovering beers</p>
      </div>

      <div class="bg-white shadow rounded-xl p-8">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="you@example.com"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
              placeholder="At least 6 characters"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <!-- Profile Info (Optional) -->
          <div class="border-t border-gray-200 pt-5 mt-5">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Profile Information (Optional)</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  v-model="form.dateOfBirth"
                  type="date"
                  :max="maxDate"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  v-model="form.gender"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                v-model="form.country"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select country</option>
                <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Favorite Beer Styles</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="style in beerStyles"
                  :key="style"
                  type="button"
                  @click="toggleStyle(style)"
                  :class="[
                    'px-3 py-1.5 text-sm rounded-full border transition-colors',
                    form.favoriteStyles.includes(style)
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                  ]"
                >
                  {{ style }}
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-1">Select up to 10 styles</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                v-model="form.bio"
                maxlength="500"
                rows="2"
                placeholder="Tell us about your beer journey..."
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
              <p class="text-xs text-gray-400 mt-1">{{ form.bio.length }}/500</p>
            </div>
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
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const error = ref('')

const beerStyles = [
  'IPA', 'Pale Ale', 'Stout', 'Porter', 'Lager', 'Pilsner', 'Wheat Beer',
  'Sour', 'Belgian', 'Brown Ale', 'Amber Ale', 'Saison', 'Hefeweizen'
]

const countries = [
  'United States', 'United Kingdom', 'Germany', 'Belgium', 'Czech Republic',
  'Netherlands', 'Ireland', 'Canada', 'Australia', 'Brazil', 'Mexico',
  'Japan', 'Denmark', 'Poland', 'Austria', 'France', 'Italy', 'Spain',
  'Portugal', 'Sweden', 'Norway', 'Finland', 'New Zealand', 'South Africa', 'Other'
]

const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18) // Must be 18+
  return date.toISOString().split('T')[0]
})

const form = reactive({
  username: '',
  email: '',
  password: '',
  dateOfBirth: '',
  gender: '',
  country: '',
  bio: '',
  favoriteStyles: []
})

const toggleStyle = (style) => {
  const index = form.favoriteStyles.indexOf(style)
  if (index > -1) {
    form.favoriteStyles.splice(index, 1)
  } else if (form.favoriteStyles.length < 10) {
    form.favoriteStyles.push(style)
  }
}

const handleRegister = async () => {
  error.value = ''
  try {
    const profileData = {}
    if (form.dateOfBirth) profileData.dateOfBirth = form.dateOfBirth
    if (form.gender) profileData.gender = form.gender
    if (form.country) profileData.country = form.country
    if (form.bio) profileData.bio = form.bio
    if (form.favoriteStyles.length > 0) profileData.favoriteStyles = form.favoriteStyles

    const response = await authStore.register(form.username, form.email, form.password, profileData)
    // OTP is disabled - registration returns tokens, go directly to home
    if (response.accessToken) {
      router.push('/')
    } else {
      // Fallback: if OTP re-enabled, go to verify page
      router.push({ name: 'VerifyEmail', query: { email: form.email } })
    }
  } catch (err) {
    error.value = err.message
  }
}
</script>
