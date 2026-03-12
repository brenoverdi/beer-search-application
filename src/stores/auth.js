import { defineStore } from 'pinia'
import apiService from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error: null,
    pendingVerificationEmail: null, // email waiting for OTP
  }),

  getters: {
    isLoggedIn: (state) => !!state.user && !!localStorage.getItem('access_token'),
    currentUser: (state) => state.user,
    needsVerification: (state) => !!state.pendingVerificationEmail,
  },

  actions: {
    async register(username, email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await apiService.register(username, email, password)
        this.pendingVerificationEmail = email
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
  },
})

