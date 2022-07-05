import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../views/AuthView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/auth', component: Auth, alias: '/' },
  ],
  linkActiveClass: 'active',
  linkExactActiveClass: 'active'
})

export default router