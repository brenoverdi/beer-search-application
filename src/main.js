import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Import stores for initialization
import { useAuthStore } from './stores/auth'
import { useBeerStore } from './stores/beer'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores after Pinia is installed
const authStore = useAuthStore()
const beerStore = useBeerStore()

// Initialize favorites from localStorage
beerStore.initializeFavorites()

// Initialize authentication state (async session check)
authStore.initializeAuth()

app.mount('#app')
