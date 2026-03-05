<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ collapse: isCollapse }">
      <SidebarMenu :is-collapse="isCollapse" />
    </div>
    <!-- 主内容区 -->
    <div class="main-container">
      <AppHeader />
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SidebarMenu from '@/components/SidebarMenu.vue';
import AppHeader from '@/components/AppHeader.vue';

const isCollapse = ref(false);

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
}
.sidebar-container {
  width: 230px;
  background-color: solid 1px #fdfeff;
  transition: width 0.3s;
  height: 100%; /* 继承父容器高度 */
  overflow-y: auto; /* 如果菜单项过多，左侧内部滚动 */
  &.collapse {
    width: 64px;
  }
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
