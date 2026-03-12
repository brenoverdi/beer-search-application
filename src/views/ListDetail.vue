<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Back -->
      <router-link to="/lists" class="inline-flex items-center gap-1 text-amber-600 hover:underline text-sm mb-6">
        ← Back to lists
      </router-link>

      <!-- Loading -->
      <div v-if="listsStore.loading" class="flex justify-center py-16">
        <div class="animate-spin text-4xl">🍺</div>
      </div>

      <template v-else-if="listsStore.currentList">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ listsStore.currentList.name }}</h1>
              <span
                v-if="listsStore.currentList.isPublic"
                class="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
              >Public</span>
            </div>
            <p v-if="listsStore.currentList.description" class="mt-1 text-gray-500">
              {{ listsStore.currentList.description }}
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button
              @click="showEdit = true"
              class="px-4 py-2 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg font-medium transition"
            >
              Edit
            </button>
          </div>
        </div>

        <!-- Empty items -->
        <div v-if="listsStore.currentItems.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm">
          <div class="text-5xl mb-3">🍺</div>
          <p class="text-gray-500">No beers in this list yet.</p>
          <router-link to="/search" class="mt-4 inline-block text-amber-600 hover:underline text-sm">
            Search for beers →
          </router-link>
        </div>

        <!-- Items -->
        <div v-else class="space-y-3">
          <div
            v-for="item in listsStore.currentItems"
            :key="item.id ?? item.beerId"
            class="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center justify-between gap-4"
          >
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ item.beer?.beerName ?? item.beerId }}</p>
              <p class="text-sm text-gray-500 truncate">{{ item.beer?.brewery }} · {{ item.beer?.style }}</p>
              <p v-if="item.notes" class="text-xs text-gray-400 mt-0.5 truncate">{{ item.notes }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span v-if="item.beer?.ratingScore" class="text-sm font-medium text-amber-600">
                ★ {{ item.beer.ratingScore.toFixed(1) }}
              </span>
              <button
                v-if="isOwner"
                @click="removeItem(item.beerId ?? item.beer?.id)"
                class="text-red-400 hover:text-red-600 transition"
                title="Remove"
              >✕</button>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="text-center py-16 text-gray-500">List not found.</div>
    </div>

    <!-- Edit modal -->
    <div
      v-if="showEdit"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      @click.self="showEdit = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Edit list</h2>
        <form @submit.prevent="handleEdit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              v-model="editForm.name"
              required
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="editForm.description"
              rows="2"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="editForm.isPublic" type="checkbox" class="accent-amber-500 w-4 h-4" />
            <span class="text-sm text-gray-700">Public</span>
          </label>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showEdit = false" class="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" class="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'

const route = useRoute()
const authStore = useAuthStore()
const listsStore = useListsStore()

const showEdit = ref(false)
const editForm = reactive({ name: '', description: '', isPublic: false })

const listId = computed(() => Number(route.params.listId))
const isOwner = computed(
  () => authStore.isLoggedIn && listsStore.currentList?.userId === authStore.currentUser?.id,
)

onMounted(async () => {
  const userId = authStore.currentUser?.id
  try {
    await listsStore.loadListById(userId, listId.value)
    if (listsStore.currentList) {
      editForm.name = listsStore.currentList.name
      editForm.description = listsStore.currentList.description || ''
      editForm.isPublic = listsStore.currentList.isPublic
    }
  } catch {
    // will show "not found" message
  }
})

const handleEdit = async () => {
  try {
    await listsStore.updateList(authStore.currentUser.id, listId.value, { ...editForm })
    showEdit.value = false
  } catch (err) {
    alert(err.message)
  }
}

const removeItem = async (beerId) => {
  if (!confirm('Remove this beer from the list?')) return
  await listsStore.removeBeerFromList(authStore.currentUser.id, listId.value, beerId)
}
</script>
