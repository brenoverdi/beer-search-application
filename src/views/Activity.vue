<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Community Activity 🍻</h1>
        <button class="text-amber-600 font-medium hover:text-amber-700">Find Friends</button>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feed -->
        <div class="md:col-span-2 space-y-6">
          <div v-for="activity in activities" :key="activity.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold shadow-inner">
                  {{ activity.user.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-sm">
                    {{ activity.user }}
                  </h3>
                  <p class="text-xs text-gray-500">{{ activity.time }}</p>
                </div>
              </div>
              <span class="text-gray-400 text-xs flex items-center gap-1">📍 {{ activity.location }}</span>
            </div>
            
            <p class="text-gray-700 text-sm mb-4">
              <span v-if="activity.action === 'checkin'">Checked in to</span>
              <span v-else-if="activity.action === 'favorite'">Favorited</span>
              <span v-else>Shared</span>
              <strong class="text-gray-900"> {{ activity.beer }} </strong>
              by <span class="text-amber-700 font-medium">{{ activity.brewery }}</span>.
            </p>

            <div v-if="activity.review" class="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 italic border-l-4 border-amber-300 mb-4">
              "{{ activity.review }}"
            </div>
            
            <div class="flex items-center gap-4 pt-3 border-t border-gray-100">
              <button class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 transition">
                <span>🍻</span> Toast ({{ activity.toasts }})
              </button>
              <button class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 transition">
                <span>💬</span> Comment
              </button>
              <button class="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                ↗️ Share
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h3 class="font-bold text-gray-900 mb-4">Top Users This Week</h3>
            <ul class="space-y-4">
              <li class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">A</div>
                  <span class="text-sm font-medium">Alex Brews</span>
                </div>
                <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">42 pts</span>
              </li>
              <li class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs">S</div>
                  <span class="text-sm font-medium">Sarah Hops</span>
                </div>
                <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">38 pts</span>
              </li>
              <li class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">M</div>
                  <span class="text-sm font-medium">Mike Stout</span>
                </div>
                <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">29 pts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiService from '@/services/api'

const activities = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    activities.value = await apiService.getActivityFeed()
  } catch (err) {
    console.error('Failed to load activity feed', err)
  } finally {
    loading.value = false
  }
})
</script>
