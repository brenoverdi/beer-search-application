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

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/search', name: 'Search', component: Search },
  { path: '/login', name: 'Login', component: Login, meta: { public: true } },
  { path: '/register', name: 'Register', component: Register, meta: { public: true } },
  { path: '/verify-email', name: 'VerifyEmail', component: VerifyEmail, meta: { public: true } },
  { path: '/favorites', name: 'Favorites', component: Favorites },
  { path: '/lists', name: 'Lists', component: Lists },
  { path: '/lists/:listId', name: 'ListDetail', component: ListDetail },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Global navigation guard
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.public) {
    // Already logged in — skip past login/register to home
    if (auth.isLoggedIn) return { name: 'Home' }
    return
  }
  // All other routes require auth
  if (!auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})

export default router
