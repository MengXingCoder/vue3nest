<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container">
      <SidebarMenu />
    </div>
    <!-- 主内容区 -->
    <div class="main-container">
      <AppHeader :collapse="isCollapse" @toggle-collapse="toggleCollapse" />
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="refreshKey"/>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarMenu from '@/components/menu/SidebarMenu.vue';
import AppHeader from '@/components/menu/AppHeader.vue';
import { ref ,provide} from 'vue';
// 侧边栏折叠状态
const isCollapse = ref(false)


// 切换折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 刷新路由的key
const refreshKey = ref(0)

// 刷新当前路由视图的方法
const refreshView = () => {
  refreshKey.value = Date.now() // 改变 key 触发重新渲染
}

// 给后代组件提供刷新方法
provide('refreshView', refreshView)
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgb(250, 251, 252);

  height: 100%; /* 同样占满高度 */
  overflow-y: auto; /* 右侧内容过多时出现滚动条 */
}
.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
