import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Import stores for initialization
import { useAuthStore } from './stores/auth'
import { useBeerStore } from './stores/beer'

import i18n from './i18n'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(router)

// Initialize stores after Pinia is installed
const authStore = useAuthStore()
const beerStore = useBeerStore()

// Initialize favorites from localStorage
beerStore.initializeFavorites()

// Initialize authentication state (async session check)
authStore.initializeAuth()

app.mount('#app')
