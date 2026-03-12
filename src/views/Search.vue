<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-1">Beer Search 🍺</h1>
        <p class="text-gray-500 text-sm">Powered by Gemini AI — all searches go in one batch call</p>
      </div>

      <!-- Mode tabs -->
      <div class="flex border-b border-gray-200 mb-6">
        <button
          v-for="m in modes"
          :key="m.id"
          @click="mode = m.id"
          :class="[
            'px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            mode === m.id
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ m.label }}
        </button>
      </div>

      <!-- Single Beer input -->
      <div v-if="mode === 'single'" class="mb-6">
        <input
          v-model="singleName"
          @keyup.enter="run"
          type="text"
          placeholder="e.g. Pliny the Elder"
          class="input-field w-full"
        />
      </div>

      <!-- List input -->
      <div v-else-if="mode === 'list'" class="mb-6">
        <textarea
          v-model="listText"
          rows="6"
          placeholder="One beer per line, e.g.&#10;Heady Topper&#10;Westvleteren 12&#10;Founders KBS"
          class="input-field w-full font-mono text-sm resize-y"
        />
      </div>

      <!-- Image input -->
      <div v-else-if="mode === 'image'" class="mb-6">
        <label
          class="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-amber-400 transition-colors"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <input type="file" accept="image/*" class="hidden" @change="onFileChange" ref="fileInput" />
          <div v-if="!imageFile" class="text-center">
            <div class="text-4xl mb-2">📷</div>
            <p class="text-gray-500 text-sm">Click or drag & drop an image</p>
          </div>
          <div v-else class="text-center">
            <img :src="imagePreview" class="max-h-40 rounded mb-2 mx-auto" />
            <p class="text-gray-600 text-sm">{{ imageFile.name }}</p>
          </div>
        </label>
        <button
          v-if="imageFile"
          @click="clearImage"
          class="mt-2 text-xs text-red-500 hover:text-red-700"
        >
          Remove image
        </button>
      </div>

      <!-- Action row -->
      <div class="flex gap-3 mb-8">
        <button
          @click="run"
          :disabled="loading || !canRun"
          class="btn-primary px-8 disabled:opacity-50"
        >
          {{ loading ? 'Searching…' : 'Search' }}
        </button>
        <button
          v-if="results.length"
          @click="exportCsv"
          class="btn-secondary px-5 text-sm"
        >
          Export CSV
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
        {{ error }}
      </div>

      <!-- Results table -->
      <div v-if="results.length" class="bg-white rounded-xl shadow overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">
            {{ results.length }} result{{ results.length !== 1 ? 's' : '' }}
            <span v-if="source" class="ml-2 text-xs text-gray-400">({{ source }})</span>
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th class="px-5 py-3 text-left font-medium">#</th>
                <th class="px-5 py-3 text-left font-medium">Beer Name</th>
                <th class="px-5 py-3 text-left font-medium">Brewery</th>
                <th class="px-5 py-3 text-left font-medium">Style</th>
                <th class="px-5 py-3 text-right font-medium">Avg Rating</th>
                <th class="px-5 py-3 text-right font-medium">Check-ins</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(r, idx) in results"
                :key="idx"
                class="hover:bg-amber-50 transition-colors"
              >
                <td class="px-5 py-3 text-gray-400">{{ idx + 1 }}</td>
                <td class="px-5 py-3 font-medium text-gray-900">{{ r.beer_name }}</td>
                <td class="px-5 py-3 text-gray-600">{{ r.brewery }}</td>
                <td class="px-5 py-3 text-gray-500">{{ r.style }}</td>
                <td class="px-5 py-3 text-right">
                  <span
                    v-if="r.rating_score !== null"
                    :class="ratingClass(r.rating_score)"
                    class="font-semibold"
                  >
                    {{ Number(r.rating_score).toFixed(2) }}
                  </span>
                  <span v-else class="text-gray-300">—</span>
                </td>
                <td class="px-5 py-3 text-right text-gray-600">
                  {{ r.rating_count !== null ? r.rating_count.toLocaleString() : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && !error" class="text-center py-16 text-gray-400">
        <div class="text-5xl mb-3">🍺</div>
        <p>Enter a beer name, paste a list, or upload an image to get started.</p>
      </div>
        
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import apiService from '@/services/api'

const modes = [
  { id: 'single', label: '🍺 Single Beer' },
  { id: 'list',   label: '📋 List' },
  { id: 'image',  label: '📷 Image' },
]

const mode       = ref('single')
const singleName = ref('')
const listText   = ref('')
const imageFile  = ref(null)
const imagePreview = ref(null)
const fileInput  = ref(null)

const loading = ref(false)
const error   = ref(null)
const results = ref([])
const source  = ref(null)

const canRun = computed(() => {
  if (mode.value === 'single') return singleName.value.trim().length > 0
  if (mode.value === 'list')   return listText.value.trim().length > 0
  if (mode.value === 'image')  return imageFile.value !== null
  return false
})

const run = async () => {
  if (!canRun.value) return
  loading.value = true
  error.value   = null
  results.value = []
  source.value  = null
  try {
    let payload = {}
    if (mode.value === 'single') {
      payload.beers = singleName.value.trim()
    } else if (mode.value === 'list') {
      payload.beers = listText.value.trim()
    } else {
      payload.image = imageFile.value
    }
    const data = await apiService.search(payload)
    results.value = data.results || []
    source.value  = data.source || null
  } catch (err) {
    error.value = err.message || 'Search failed'
  } finally {
    loading.value = false
  }
}

const ratingClass = (score) => {
  if (score >= 4.5) return 'text-green-600'
  if (score >= 3.5) return 'text-amber-500'
  return 'text-red-500'
}

const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  imageFile.value    = file
  imagePreview.value = URL.createObjectURL(file)
}

const onDrop = (e) => {
  const file = e.dataTransfer.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  imageFile.value    = file
  imagePreview.value = URL.createObjectURL(file)
}

const clearImage = () => {
  imageFile.value    = null
  imagePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const exportCsv = () => {
  const header = 'Beer Name,Brewery,Style,Avg Rating,Check-ins'
  const rows   = results.value.map((r) =>
    [r.beer_name, r.brewery, r.style, r.rating_score ?? '', r.rating_count ?? '']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )
  const csv  = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'beer-search.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
