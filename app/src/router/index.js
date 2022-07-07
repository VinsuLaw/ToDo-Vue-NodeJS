import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../views/AuthView.vue'
import Home from '../views/HomeView.vue'
import $store from '../store/index'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/auth', component: Auth, name: 'auth', alias: '/', meta: {title: 'Auth', requiresNotAuth: true} },
    { path: '/home', component: Home, name: 'home', meta: {title: 'Dashboard', requiresAuth: true} },
    { path: '/:notFound(.*)', redirect: {name: 'home'} }
  ],
  linkActiveClass: 'active',
  linkExactActiveClass: 'active'
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (!$store.getters.isAuthenticated) {
      next(from)
      return
    }
  }

  if (to.meta.requiresNotAuth) {
    if ($store.getters.isAuthenticated) {
      next({name: 'home'})
      return
    }
  }

  next()
})

export default router