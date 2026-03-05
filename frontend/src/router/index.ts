import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes} from './routes/staticRoutes'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
})

const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const menuStore = useMenuStore()

  if (userStore.token) {
    if (to.path === '/login') {
      next('/')
    } else {
      // 如果动态路由还没加载（比如在 bootstrap 中加载失败），则尝试加载
      if (menuStore.dynamicRoutes.length === 0) {
        try {
          const routes = await menuStore.fetchMenu()
          routes.forEach(route => router.addRoute(route))
          // 重试当前导航
          next({ ...to, replace: true })
        } catch {
          userStore.removeToken()
          next(`/login?redirect=${to.path}`)
        }
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router