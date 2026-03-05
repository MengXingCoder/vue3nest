import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMenuList } from '@/api/http'

// 预加载所有视图组件
export const viewModules = import.meta.glob('@/views/**/*.vue')

export interface MenuItem {
  id: number
  name: string
  path: string
  component: string
  icon: string
  sort: number
  hidden: boolean
  permissionCodes: string[]
  children: MenuItem[]
}

export interface GeneratedRoute {
  path: string
  name: string
  component: any
  meta: {
    title: string
    icon: string
    hidden: boolean
    permissionCodes: string[]
    id: number
    sort: number
  }
  children?: GeneratedRoute[]
  redirect?: string
}

export const useMenuStore = defineStore('menu', () => {
  const treeMenu = ref<MenuItem[]>([])
  const dynamicRoutes = ref<GeneratedRoute[]>([])
  let isFetched = false // 防止重复获取

  function generateRoutes(menuTree: MenuItem[]): GeneratedRoute[] {
    if (!Array.isArray(menuTree)) return []

    const convert = (nodes: MenuItem[]): GeneratedRoute[] => {
      return nodes.map(node => {
        const hasChildren = node.children && node.children.length > 0
        const route: GeneratedRoute = {
          path: node.path,
          name: node.name,
          meta: {
            title: node.name,
            icon: node.icon,
            hidden: node.hidden,
            permissionCodes: node.permissionCodes,
            id: node.id,
            sort: node.sort,
          },
        }

        if (hasChildren) {
          route.component = () => import('@/layouts/index.vue')
          route.children = convert(node.children)
          if (route.children.length > 0) {
            route.redirect = route.children[0].path
          }
        } else {
          const fullPath = `/src/views/${node.component}.vue`
          const loader = viewModules[fullPath]
          if (loader) {
            route.component = loader
          } else {
            console.warn(`组件 ${fullPath} 不存在，使用 404 替代`)
            route.component = () => import('@/views/exception/404/index.vue')
          }
        }
        return route
      })
    }

    const routes = convert(menuTree)

    // 修正子路由路径为相对路径
    const fixChildPaths = (routes: GeneratedRoute[]) => {
      routes.forEach(route => {
        if (route.children) {
          route.children = route.children.map(child => {
            if (child.path.startsWith(route.path)) {
              child.path = child.path.slice(route.path.length).replace(/^\//, '')
            }
            return child
          })
          fixChildPaths(route.children)
        }
      })
    }
    fixChildPaths(routes)

    return routes
  }

  async function fetchMenu(): Promise<GeneratedRoute[]> {
    if (isFetched) return dynamicRoutes.value
    try {
      const res = await getMenuList()
      let menuData: MenuItem[] = Array.isArray(res) ? res : res.data || []
      treeMenu.value = menuData
      const routes = generateRoutes(menuData)
      dynamicRoutes.value = routes
      isFetched = true
      return routes
    } catch (error) {
      console.error('获取菜单失败', error)
      return []
    }
  }

  return { treeMenu, dynamicRoutes, fetchMenu }
})


export const useMenuCollapseStore = defineStore('menuCollapse', () => {
  const isCollapse = ref(false); // 默认为 false

  // 直接设置折叠状态
  const setCollapse = (value: any) => {
    isCollapse.value = value;
  };

  return { isCollapse, setCollapse };
});