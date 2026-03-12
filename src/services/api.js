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

  async register(username, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
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
}

export default new ApiService()
export { getAccessToken, setTokens, clearTokens }
