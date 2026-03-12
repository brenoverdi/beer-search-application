import { defineStore } from 'pinia'
import apiService from '@/services/api'

export const useListsStore = defineStore('lists', {
  state: () => ({
    lists: [],
    currentList: null,
    currentItems: [],
    favorites: [],
    loading: false,
    error: null,
  }),

  getters: {
    isFavorite: (state) => (beerId) =>
      state.favorites.some((f) => f.beerId === beerId || f.beer?.id === beerId),
  },

  actions: {
    // ── Favorites ──────────────────────────────────────────────────────────

    async loadFavorites(userId) {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.getFavorites(userId)
        this.favorites = response.favorites || []
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async addFavorite(userId, beerId) {
      try {
        const response = await apiService.addFavorite(userId, beerId)
        this.favorites.push(response.favorite)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async removeFavorite(userId, beerId) {
      try {
        await apiService.removeFavorite(userId, beerId)
        this.favorites = this.favorites.filter(
          (f) => f.beerId !== beerId && f.beer?.id !== beerId,
        )
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async toggleFavorite(userId, beerId) {
      if (this.isFavorite(beerId)) {
        await this.removeFavorite(userId, beerId)
      } else {
        await this.addFavorite(userId, beerId)
      }
    },

    // ── Lists ──────────────────────────────────────────────────────────────

    async loadLists(userId) {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.getLists(userId)
        this.lists = response.lists || []
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createList(userId, data) {
      try {
        const response = await apiService.createList(userId, data)
        this.lists.unshift(response.list)
        return response.list
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async loadListById(userId, listId) {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.getListById(userId, listId)
        this.currentList = response.list
        this.currentItems = response.items || []
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateList(userId, listId, data) {
      try {
        const response = await apiService.updateList(userId, listId, data)
        const idx = this.lists.findIndex((l) => l.id === listId)
        if (idx !== -1) this.lists[idx] = response.list
        if (this.currentList?.id === listId) this.currentList = response.list
        return response.list
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteList(userId, listId) {
      try {
        await apiService.deleteList(userId, listId)
        this.lists = this.lists.filter((l) => l.id !== listId)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async addBeerToList(userId, listId, beerId, notes) {
      try {
        const response = await apiService.addBeerToList(userId, listId, beerId, notes)
        this.currentItems.push(response.item)
        const list = this.lists.find((l) => l.id === listId)
        if (list?._count) list._count.items++
        return response.item
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async removeBeerFromList(userId, listId, beerId) {
      try {
        await apiService.removeBeerFromList(userId, listId, beerId)
        this.currentItems = this.currentItems.filter((i) => i.beerId !== beerId && i.beer?.id !== beerId)
        const list = this.lists.find((l) => l.id === listId)
        if (list?._count) list._count.items--
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
  },
})
