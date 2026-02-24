import type { RouteRecordRaw } from 'vue-router';

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login/index.vue'),
    meta: { title: '登录页面', isHideTab: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/register/index.vue'),
    meta: { title: '注册页面', isHideTab: true },
  },
  {
    path: '/403',
    name: 'Exception403',
    component: () => import('@/views/exception/403/index.vue'),
    meta: { title: '403', isHideTab: true },
  },

  {
    path: '/500',
    name: 'Exception500',
    component: () => import('@/views/exception/500/index.vue'),
    meta: { title: '500', isHideTab: true },
    },
     {
    path: '/:pathMatch(.*)',
    name: 'Exception404',
    component: () => import('@/views/exception/404/index.vue'),
    meta: { title: '404', isHideTab: true }
  }
];
