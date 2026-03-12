<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">My Lists 📋</h1>
        <button
          @click="showCreate = true"
          class="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition"
        >
          <span class="text-lg">+</span> New list
        </button>
      </div>

      <!-- Loading -->
      <div v-if="listsStore.loading" class="flex justify-center py-16">
        <div class="animate-spin text-4xl">🍺</div>
      </div>

      <!-- Empty state -->
      <div v-else-if="listsStore.lists.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">No lists yet</h3>
        <p class="text-gray-500 mb-6">Create your first beer list to organise your discoveries.</p>
        <button
          @click="showCreate = true"
          class="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition"
        >
          Create list
        </button>
      </div>

      <!-- Lists grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="list in listsStore.lists"
          :key="list.id"
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col gap-3"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-gray-900 leading-tight">{{ list.name }}</h3>
            <span
              v-if="list.isPublic"
              class="shrink-0 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
            >Public</span>
          </div>
          <p v-if="list.description" class="text-sm text-gray-500 line-clamp-2">{{ list.description }}</p>
          <p class="text-xs text-gray-400">{{ list._count?.items ?? 0 }} beers</p>
          <div class="flex gap-2 mt-auto">
            <router-link
              :to="`/lists/${list.id}`"
              class="flex-1 text-center py-1.5 text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-medium transition"
            >
              View
            </router-link>
            <button
              @click="deleteList(list)"
              class="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create modal -->
    <div
      v-if="showCreate"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      @click.self="showCreate = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">New list</h2>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              v-model="newList.name"
              required
              placeholder="My IPA collection"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="newList.description"
              rows="2"
              placeholder="Optional description…"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="newList.isPublic" type="checkbox" class="accent-amber-500 w-4 h-4" />
            <span class="text-sm text-gray-700">Make this list public</span>
          </label>
          <p v-if="createError" class="text-red-600 text-sm">{{ createError }}</p>
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="showCreate = false"
              class="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'

const router = useRouter()
const authStore = useAuthStore()
const listsStore = useListsStore()

const showCreate = ref(false)
const createError = ref('')
const newList = reactive({ name: '', description: '', isPublic: false })

onMounted(async () => {
  if (!authStore.isLoggedIn) { router.push('/login'); return }
  await listsStore.loadLists(authStore.currentUser.id)
})

const handleCreate = async () => {
  createError.value = ''
  try {
    await listsStore.createList(authStore.currentUser.id, { ...newList })
    showCreate.value = false
    Object.assign(newList, { name: '', description: '', isPublic: false })
  } catch (err) {
    createError.value = err.message
  }
}

const deleteList = async (list) => {
  if (!confirm(`Delete "${list.name}"?`)) return
  await listsStore.deleteList(authStore.currentUser.id, list.id)
}
</script>
