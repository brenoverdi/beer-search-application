import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
const Home = () => import('../views/Home.vue')
const Search = () => import('../views/Search.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const VerifyEmail = () => import('../views/VerifyEmail.vue')
const Favorites = () => import('../views/Favorites.vue')
const Lists = () => import('../views/Lists.vue')
const ListDetail = () => import('../views/ListDetail.vue')
const Festivals = () => import('../views/Festivals.vue')
const FestivalDetail = () => import('../views/FestivalDetail.vue')
const BreweryMap = () => import('../views/BreweryMap.vue')
const Premium = () => import('../views/Premium.vue')
const Activity = () => import('../views/Activity.vue')

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { public: true } },
  { path: '/search', name: 'Search', component: Search },
  { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guest: true } },
  { path: '/verify-email', name: 'VerifyEmail', component: VerifyEmail, meta: { guest: true } },
  { path: '/favorites', name: 'Favorites', component: Favorites },
  { path: '/lists', name: 'Lists', component: Lists },
  { path: '/lists/:listId', name: 'ListDetail', component: ListDetail },
  { path: '/festivals', name: 'Festivals', component: Festivals, meta: { public: true } },
  { path: '/festivals/:id', name: 'FestivalDetail', component: FestivalDetail, meta: { public: true } },
  { path: '/breweries', name: 'BreweryMap', component: BreweryMap, meta: { public: true } },
  { path: '/premium', name: 'Premium', component: Premium },
  { path: '/activity', name: 'Activity', component: Activity },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Global navigation guard
router.beforeEach((to) => {
  const auth = useAuthStore()
  
  // Guest-only routes (login, register) — redirect logged-in users to home
  if (to.meta.guest) {
    if (auth.isLoggedIn) return { name: 'Home' }
    return
  }
  
  // All other routes require auth UNLESS explicitly marked public
  if (!to.meta.public && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})

export default router
