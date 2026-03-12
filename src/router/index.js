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
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/verify-email', name: 'VerifyEmail', component: VerifyEmail },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresAuth: true },
  },
  {
    path: '/lists',
    name: 'Lists',
    component: Lists,
    meta: { requiresAuth: true },
  },
  {
    path: '/lists/:listId',
    name: 'ListDetail',
    component: ListDetail,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Navigation guard
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }
  }
})

export default router
