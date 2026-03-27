const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3001/api').replace(/\/$/, '')

// Token storage helpers
const getAccessToken = () => localStorage.getItem('access_token')
const getRefreshToken = () => localStorage.getItem('refresh_token')
const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
}
const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

let refreshing = null // prevent concurrent refresh calls

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`
    const accessToken = getAccessToken()

    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

    let response = await fetch(url, { ...options, headers })

    // Auto-refresh on 401
    if (response.status === 401 && getRefreshToken()) {
      if (!refreshing) {
        refreshing = this._doRefresh().finally(() => { refreshing = null })
      }
      const refreshed = await refreshing
      if (refreshed) {
        const newToken = getAccessToken()
        headers['Authorization'] = `Bearer ${newToken}`
        response = await fetch(url, { ...options, headers })
      } else {
        clearTokens()
        window.location.href = '/login'
        throw new Error('Session expired')
      }
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      throw new Error(err.error || `HTTP ${response.status}`)
    }

    const text = await response.text()
    return text ? JSON.parse(text) : {}
  }

  async _doRefresh() {
    try {
      const refreshToken = getRefreshToken()
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return false
      const data = await res.json()
      setTokens(data.accessToken, data.refreshToken)
      return true
    } catch {
      return false
    }
  }

  // ── Auth ─────────────────────────────────────────────────────────────────

  async register(username, email, password, profileData = {}) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, ...profileData }),
    })
    // Store tokens if registration returns them (OTP disabled flow)
    if (data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  }

  async verifyEmail(email, code) {
    const data = await this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
    setTokens(data.accessToken, data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setTokens(data.accessToken, data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async logout() {
    const refreshToken = getRefreshToken()
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    } catch (_) { /* ignore */ }
    clearTokens()
  }

  async getMe() {
    return this.request('/auth/me')
  }

  async googleAuth(idToken) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    })
    setTokens(data.accessToken, data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  // ── Beers ─────────────────────────────────────────────────────────────────

  async getPopularBeers() {
    return this.request('/beers/popular')
  }

  async search({ beers, image } = {}) {
    const form = new FormData()
    if (image) form.append('image', image)
    if (beers) {
      const names = Array.isArray(beers) ? beers : [beers]
      names.forEach((n) => form.append('beers', n))
    }
    const accessToken = getAccessToken()
    const headers = {}
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
    const response = await fetch(`${API_BASE}/beers/search`, {
      method: 'POST',
      headers,
      body: form,
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(err.error || `HTTP ${response.status}`)
    }
    return response.json()
  }

  // ── Activity ─────────────────────────────────────────────────────────────
  
  async getActivityFeed(limit = 20) {
    return this.request(`/activity?limit=${limit}`)
  }
  
  async postActivity(action, beerId, review = null, rating = null) {
    return this.request('/activity', {
      method: 'POST',
      body: JSON.stringify({ action, beerId, review, rating })
    })
  }
  
  // ── Users & Premium ──────────────────────────────────────────────────────
  
  async upgradePremium() {
    return this.request('/users/premium', { method: 'POST' })
  }

  async searchFromUrl(url) {
    return this.request('/beers/search-from-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  }

  // ── Favorites ─────────────────────────────────────────────────────────────

  async getFavorites(userId) {
    return this.request(`/users/${userId}/favorites`)
  }

  async addFavorite(userId, beerId) {
    return this.request(`/users/${userId}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ beerId }),
    })
  }

  async removeFavorite(userId, beerId) {
    return this.request(`/users/${userId}/favorites/${beerId}`, { method: 'DELETE' })
  }

  // ── Lists ─────────────────────────────────────────────────────────────────

  async getLists(userId) {
    return this.request(`/users/${userId}/lists`)
  }

  async createList(userId, { name, description, isPublic }) {
    return this.request(`/users/${userId}/lists`, {
      method: 'POST',
      body: JSON.stringify({ name, description, isPublic }),
    })
  }

  async getListById(userId, listId) {
    return this.request(`/users/${userId}/lists/${listId}`)
  }

  async updateList(userId, listId, data) {
    return this.request(`/users/${userId}/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteList(userId, listId) {
    return this.request(`/users/${userId}/lists/${listId}`, { method: 'DELETE' })
  }

  async addBeerToList(userId, listId, beerId, notes) {
    return this.request(`/users/${userId}/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify({ beerId, notes }),
    })
  }

  async removeBeerFromList(userId, listId, beerId) {
    return this.request(`/users/${userId}/lists/${listId}/items/${beerId}`, { method: 'DELETE' })
  }

  // ── Festivals ─────────────────────────────────────────────────────────────

  async getFestivals(continent = 'all') {
    return this.request(`/festivals?continent=${continent}`)
  }

  async getFestival(id) {
    return this.request(`/festivals/${id}`)
  }

  async createItinerary(festivalId, arrivalDate, departureDate) {
    return this.request('/festivals/itinerary', {
      method: 'POST',
      body: JSON.stringify({ festivalId, arrivalDate, departureDate }),
    })
  }

  // ── Beer of the Day ───────────────────────────────────────────────────────

  async getBeerOfTheDay() {
    return this.request('/beer-of-the-day')
  }

  // ── Breweries ─────────────────────────────────────────────────────────

  async getBreweries({ lat, lng, radius = 25, city, state, country, limit = 100 } = {}) {
    const params = new URLSearchParams()
    if (lat != null && lng != null) {
      params.set('lat', lat)
      params.set('lng', lng)
      params.set('radius', radius)
    }
    if (city) params.set('city', city)
    if (state) params.set('state', state)
    if (country) params.set('country', country)
    if (limit) params.set('limit', limit)
    return this.request(`/breweries/search?${params.toString()}`)
  }
}

export default new ApiService()
export { getAccessToken, setTokens, clearTokens }
