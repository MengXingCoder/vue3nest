import { createRouter, createWebHistory } from 'vue-router'
import { asyncRoutes } from './routes/asyncRoutes'
import { staticRoutes } from './routes/staticRoutes'
import { type App } from 'vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...staticRoutes,...asyncRoutes
  ],
})

export function initRouter(app: App<Element>) { 
    app.use(router)
}
export default router
