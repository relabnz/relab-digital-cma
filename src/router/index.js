import { createRouter, createWebHistory } from 'vue-router'
import CMALanding from '../views/CMALanding.vue'
import CMAPreview from '../views/CMAPreview.vue'

const routes = [
  {
    path: '/',
    name: 'CMALanding',
    component: CMALanding
  },
  {
    path: '/debug',
    name: 'CMADebug',
    component: CMAPreview
  },
  {
    path: '/:shareCode',
    name: 'CMAShare',
    component: CMAPreview,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
