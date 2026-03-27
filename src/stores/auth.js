import { defineStore } from 'pinia'
import apiService from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error: null,
    pendingVerificationEmail: null, // email waiting for OTP
    searchesRemaining: parseInt(localStorage.getItem('searchesRemaining') || '5', 10),
  }),

  getters: {
    isLoggedIn: (state) => !!state.user && !!localStorage.getItem('access_token'),
    isAuthenticated: (state) => !!state.user && !!localStorage.getItem('access_token'),
    currentUser: (state) => state.user,
    needsVerification: (state) => !!state.pendingVerificationEmail,
    isPremium: (state) => !!state.user?.isPremium,
  },

  actions: {
    async register(username, email, password, profileData = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.register(username, email, password, profileData)
        // New flow: registration now returns tokens directly (OTP disabled)
        if (response.accessToken) {
          this.user = response.user
          localStorage.setItem('user', JSON.stringify(response.user))
        } else {
          // Fallback for OTP flow if re-enabled
          this.pendingVerificationEmail = email
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async verifyEmail(email, code) {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.verifyEmail(email, code)
        this.user = response.user
        this.pendingVerificationEmail = null
        localStorage.setItem('user', JSON.stringify(response.user))
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.login(email, password)
        this.user = response.user
        localStorage.setItem('user', JSON.stringify(response.user))
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async googleLogin(idToken) {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.googleAuth(idToken)
        this.user = response.user
        localStorage.setItem('user', JSON.stringify(response.user))
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try { await apiService.logout() } catch (_) { /* ignore */ }
      this.user = null
      localStorage.removeItem('user')
    },

    async initializeAuth() {
      if (!this.user || !localStorage.getItem('access_token')) return
      try {
        const response = await apiService.getMe()
        this.user = response.user
        localStorage.setItem('user', JSON.stringify(response.user))
      } catch {
        this.user = null
        localStorage.removeItem('user')
      }
    },

    async fetchUser() {
      if (!this.isLoggedIn) return
      this.loading = true
      try {
        const data = await apiService.getMe()
        this.user = data
        this.searchesRemaining = data.searchesRemaining ?? 5
        localStorage.setItem('user', JSON.stringify(data))
        localStorage.setItem('searchesRemaining', this.searchesRemaining.toString())
      } catch (err) {
        console.error('Failed to fetch profile', err)
      } finally {
        this.loading = false
      }
    },

    decrementSearch() {
      if (this.searchesRemaining > 0) {
        this.searchesRemaining -= 1
        localStorage.setItem('searchesRemaining', this.searchesRemaining.toString())
      }
    },

    async upgradeToPremium() {
      if (this.user) {
        const data = await apiService.upgradePremium()
        this.user = data.user
        this.searchesRemaining = data.user.searchesRemaining
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('searchesRemaining', this.searchesRemaining.toString())
      }
    }
  },
})

