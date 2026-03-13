<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-5xl mx-auto px-4">

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Beer Lookup</h1>
        <p class="text-gray-500 mt-1">Search multiple beers at once by text list or photo.</p>
      </div>

      <!-- Tab switcher -->
      <div class="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-8 w-fit">
        <button
          @click="activeTab = 'batch'"
          :class="['px-5 py-2 rounded-md text-sm font-medium transition-colors', activeTab === 'batch' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900']"
        >
          📋 Text List
        </button>
        <button
          @click="activeTab = 'image'"
          :class="['px-5 py-2 rounded-md text-sm font-medium transition-colors', activeTab === 'image' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900']"
        >
          📷 Image Scan
        </button>
      </div>

      <!-- ── TAB: Batch text search ── -->
      <div v-if="activeTab === 'batch'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">Enter Beer Names</h2>
        <p class="text-sm text-gray-500 mb-4">One beer per line. We'll find the best Untappd match for each.</p>

        <textarea
          v-model="beerListText"
          rows="8"
          placeholder="Heady Topper&#10;Pliny the Elder&#10;Kentucky Breakfast Stout&#10;Sierra Nevada Pale Ale"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
          :disabled="loading"
        />

        <div class="flex items-center justify-between mt-4">
          <span class="text-xs text-gray-400">
            {{ beerLines.length }} beer{{ beerLines.length !== 1 ? 's' : '' }} · max 50
          </span>
          <button
            @click="runBatchSearch"
            :disabled="loading || beerLines.length === 0"
            class="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">🔍 Searching…</span>
            <span v-else>🔍 Search All</span>
          </button>
        </div>
      </div>

      <!-- ── TAB: Image search ── -->
      <div v-if="activeTab === 'image'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">Upload a Beer Photo</h2>
        <p class="text-sm text-gray-500 mb-4">
          Upload a photo of a shelf, tap list, menu, or bottles.
        </p>

        <!-- Drop zone -->
        <div
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="onDrop"
          @click="$refs.fileInput.click()"
          :class="['border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors', dragging ? 'border-amber-400 bg-amber-50' : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50']"
        >
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelect" />

          <div v-if="!imagePreview">
            <div class="text-4xl mb-2">📷</div>
            <p class="text-gray-600 font-medium">Drop an image here or click to browse</p>
            <p class="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 10 MB</p>
          </div>

          <div v-else class="relative">
            <img :src="imagePreview" alt="Preview" class="max-h-64 mx-auto rounded-lg object-contain shadow" />
            <button
              @click.stop="clearImage"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              title="Remove image"
            >✕</button>
          </div>
        </div>

        <!-- Extracted names preview (after AI returns) -->
        <div v-if="extractedNames.length > 0" class="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p class="text-sm font-medium text-amber-800 mb-1">🍺 Detected beers:</p>
          <ul class="text-sm text-amber-700 list-disc list-inside space-y-0.5">
            <li v-for="name in extractedNames" :key="name">{{ name }}</li>
          </ul>
        </div>

        <div class="flex justify-end mt-4">
          <button
            @click="runImageSearch"
            :disabled="loading || !selectedFile"
            class="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">🤖 Analyzing…</span>
            <span v-else>🤖 Scan &amp; Search</span>
          </button>
        </div>
      </div>

      <!-- ── Error banner ── -->
      <div v-if="error" class="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
        {{ error }}
      </div>

      <!-- ── Results table ── -->
      <div v-if="results.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">
            Results
            <span class="text-sm font-normal text-gray-500 ml-2">
              {{ foundCount }} found · {{ notFoundCount }} not found
            </span>
          </h2>
          <button @click="exportCsv" class="btn-secondary text-sm px-3 py-1.5">
            ⬇ Export CSV
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-semibold text-gray-600 w-6">#</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600">Beer Name</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600">Brewery</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600">Style</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600">Avg Rating</th>
                <th class="text-right px-4 py-3 font-semibold text-gray-600">Reviews</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in results"
                :key="idx"
                :class="['border-b border-gray-100 transition-colors', row.beer ? 'hover:bg-gray-50' : 'bg-red-50']"
              >
                <td class="px-4 py-3 text-gray-400 text-xs">{{ idx + 1 }}</td>

                <!-- Not found -->
                <template v-if="!row.beer">
                  <td class="px-4 py-3" colspan="5">
                    <span class="text-gray-400 italic">{{ row.query }}</span>
                    <span class="ml-2 text-xs text-red-400 font-medium">— not found</span>
                  </td>
                </template>

                <!-- Found -->
                <template v-else>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <img
                        v-if="row.beer.label_url"
                        :src="row.beer.label_url"
                        :alt="row.beer.beer_name"
                        class="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                      <div>
                        <p class="font-medium text-gray-900 leading-tight">{{ row.beer.beer_name }}</p>
                        <p v-if="row.query !== row.beer.beer_name" class="text-xs text-gray-400">searched: {{ row.query }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-gray-700">
                    {{ row.beer.brewery?.brewery_name || '—' }}
                    <span v-if="row.beer.brewery?.brewery_state" class="text-gray-400 text-xs ml-1">
                      {{ row.beer.brewery.brewery_city ? row.beer.brewery.brewery_city + ', ' : '' }}{{ row.beer.brewery.brewery_state }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-600">{{ row.beer.beer_style || '—' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span v-if="row.beer.rating_score" class="inline-flex items-center gap-1">
                      <span :class="ratingClass(row.beer.rating_score)" class="font-bold text-base">
                        {{ Number(row.beer.rating_score).toFixed(2) }}
                      </span>
                      <span class="text-yellow-400 text-xs">★</span>
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td class="px-4 py-3 text-right text-gray-600">
                    {{ row.beer.rating_count ? Number(row.beer.rating_count).toLocaleString() : '—' }}
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty state after search -->
      <div v-else-if="searched && !loading" class="text-center py-16 text-gray-500">
        No results to display. Try adjusting your input.
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import apiService from '@/services/api'

export default {
  name: 'BatchSearch',
  setup() {
    const activeTab = ref('batch')
    const loading = ref(false)
    const error = ref(null)
    const searched = ref(false)
    const results = ref([])

    // Batch text state
    const beerListText = ref('')
    const beerLines = computed(() =>
      beerListText.value
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 50)
    )

    // Image state
    const selectedFile = ref(null)
    const imagePreview = ref(null)
    const extractedNames = ref([])
    const dragging = ref(false)

    // Derived stats
    const foundCount = computed(() => results.value.filter((r) => r.beer).length)
    const notFoundCount = computed(() => results.value.filter((r) => !r.beer).length)

    // ── Actions ──────────────────────────────────────────────────────────────

    const runBatchSearch = async () => {
      if (beerLines.value.length === 0) return
      loading.value = true
      error.value = null
      searched.value = true
      results.value = []
      try {
        const data = await apiService.batchSearch(beerLines.value)
        results.value = data.results
      } catch (e) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    }

    const runImageSearch = async () => {
      if (!selectedFile.value) return
      loading.value = true
      error.value = null
      searched.value = true
      extractedNames.value = []
      results.value = []
      try {
        const data = await apiService.imageSearch(selectedFile.value)
        extractedNames.value = data.beerNames || []
        results.value = data.results
      } catch (e) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    }

    // ── Image helpers ─────────────────────────────────────────────────────────

    const setFile = (file) => {
      if (!file) return
      selectedFile.value = file
      const reader = new FileReader()
      reader.onload = (e) => { imagePreview.value = e.target.result }
      reader.readAsDataURL(file)
      // Reset previous results
      extractedNames.value = []
      results.value = []
      searched.value = false
    }

    const onFileSelect = (e) => setFile(e.target.files[0])
    const onDrop = (e) => {
      dragging.value = false
      setFile(e.dataTransfer.files[0])
    }
    const clearImage = () => {
      selectedFile.value = null
      imagePreview.value = null
      extractedNames.value = []
    }

    // ── CSV export ────────────────────────────────────────────────────────────

    const exportCsv = () => {
      const header = 'Query,Beer Name,Brewery,Style,Avg Rating,Reviews'
      const rows = results.value.map((r) => {
        if (!r.beer) return `"${r.query}","NOT FOUND","","","",""`
        const b = r.beer
        const brewery = b.brewery?.brewery_name || ''
        return [
          `"${r.query}"`,
          `"${b.beer_name || ''}"`,
          `"${brewery}"`,
          `"${b.beer_style || ''}"`,
          b.rating_score ? Number(b.rating_score).toFixed(2) : '',
          b.rating_count || '',
        ].join(',')
      })
      const csv = [header, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'beer-search-results.csv'
      a.click()
      URL.revokeObjectURL(url)
    }

    // ── Rating color ──────────────────────────────────────────────────────────

    const ratingClass = (score) => {
      const n = Number(score)
      if (n >= 4.2) return 'text-green-600'
      if (n >= 3.5) return 'text-amber-500'
      return 'text-red-400'
    }

    return {
      activeTab, loading, error, searched, results,
      beerListText, beerLines,
      selectedFile, imagePreview, extractedNames, dragging,
      foundCount, notFoundCount,
      runBatchSearch, runImageSearch,
      onFileSelect, onDrop, clearImage,
      exportCsv, ratingClass,
    }
  },
}
</script>
