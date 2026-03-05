import '@/styles/reset.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// import { initRouter } from './router'
import router from './router';
import { useUserStore } from './stores/user';
import { useMenuStore } from './stores/menu';
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
const pinia = createPinia()
app.use(pinia);
app.use(router);
app.use(ElementPlus);

 const userStore = useUserStore(pinia)
  const menuStore = useMenuStore(pinia)

  // 如果已登录且动态路由未加载，则预加载
  if (userStore.token && menuStore.dynamicRoutes.length === 0) {
    console.log('预加载动态路由...')
    const routes = await menuStore.fetchMenu()
    routes.forEach(route => router.addRoute(route))
      console.log('动态路由添加完成')
      router.addRoute({
  path: '/:pathMatch(.*)*',
  redirect: '/404',
  meta: { hidden: true },
})
  }

app.mount('#app');
