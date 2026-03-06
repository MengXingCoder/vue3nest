<template>
  <div>
    <div class="sidebar" :class="{ 'is-collapse': useMenuCollapse.isCollapse }">
      <div class="logo-container">
        <img class="logo-img" src="@/assets/icon.webp" alt="logo" />
        <span
          class="logo-text"
          :class="{ 'is-collapse': useMenuCollapse.isCollapse }"
          >通用系统</span
        >
      </div>
      <el-menu
        :collapse="useMenuCollapse.isCollapse"
        :collapse-transition="false"
        :default-active="activeMenu"
        :default-openeds="defaultOpeneds"
        :unique-opened="true"
        router
        background-color="#FFFFFF"
        text-color="#29343D"
        active-text-color="#1d84ff"
      >
        <MenuItem
          style="margin: 3px; border-radius: 8px"
          v-for="item in menuStore.treeMenu"
          :key="item.id"
          :item="item"
        />
      </el-menu>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore,useMenuCollapseStore } from '@/stores/menu';
import MenuItem from './MenuItem.vue';


const menuStore = useMenuStore();
const route = useRoute();
const useMenuCollapse = useMenuCollapseStore();

// 当前激活的菜单路径
const activeMenu = computed(() => route.path);

// 默认展开的菜单（根据当前路由计算）
const defaultOpeneds = computed(() => {
  const openKeys: string[] = [];
  function findParentPaths(
    nodes: any[],
    targetPath: string,
    parents: string[] = []
  ) {
    for (const node of nodes) {
      if (node.path === targetPath) {
        openKeys.push(...parents);
        return true;
      }
      if (node.children && node.children.length) {
        if (
          findParentPaths(node.children, targetPath, [...parents, node.path])
        ) {
          return true;
        }
      }
    }
    return false;
  }
  findParentPaths(menuStore.treeMenu, route.path);
  return openKeys;
});
</script>

<style lang="scss" scoped>
.topTitleSty {
  height: 60px;
  width: 230px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.el-menu {
  border: none;
}
.el-menu-item:hover {
  background-color: #3a3939;
}
.el-menu-item.is-active {
  background-color: #ac8585;
}
.sidebar {
  width: 250px;
  //   background-color: #304156;
  transition: width 0.3s ease;
  overflow-x: hidden;
  height: 100vh; /* 确保侧边栏占满全高 */
}

.sidebar.is-collapse {
  width: 64px; /* 必须与 el-menu 折叠宽度一致 */
}

.logo-img {
  width: 36px;
  height: 36px;
  flex-shrink: 0; /* 防止图片被压缩 */
  margin: 0 12px;
}
.logo-container {
  display: flex;
  align-items: center;
  height: 60px; /* 固定高度，避免抖动 */
  padding: 0 6px;
  overflow: hidden; /* 防止文字溢出造成滚动条 */
}
.logo-text {
  font-size: 22px;
  color: #383853;
  white-space: nowrap; /* 文字不换行 */
  transition:
    opacity 0.2s ease,
    width 0.2s ease; /* 添加过渡 */
  opacity: 1;
  width: auto; /* 初始宽度由内容决定 */
  overflow: hidden; /* 隐藏溢出的文字 */
}

/* 折叠时文字隐藏 */
.logo-text.is-collapse {
  opacity: 0;
  width: 0; 
  margin-left: 0;
}
/* 菜单背景透明（继承父级背景） */
.el-menu-vertical {
  border-right: none;
  background-color: transparent !important;
}

/* 折叠时隐藏菜单文字 */
:deep(.el-menu--collapse) .el-menu-item span,
:deep(.el-menu--collapse) .el-sub-menu .el-sub-menu__title span {
  display: none;
}

:deep(.el-menu--collapse) .el-menu-item,
:deep(.el-menu--collapse) .el-sub-menu .el-sub-menu__title {
  justify-content: center;
  padding: 0;
}
</style>
