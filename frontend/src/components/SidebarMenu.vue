<template>
  <div>
    <div
      style="height: 60px; width: 230px; border: solid 1px gray; padding: 5px"
    >
      <img style="width: 36px" src="@/assets/icon.webp" />
    </div>
    <div>
      <el-menu
        :default-active="activeMenu"
        :default-openeds="defaultOpeneds"
        :collapse="isCollapse"
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
import { useMenuStore } from '@/stores/menu';
import MenuItem from './MenuItem.vue';

const route = useRoute();
const menuStore = useMenuStore();

const props = defineProps<{
  isCollapse: boolean;
}>();

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
.el-menu:not(.el-menu--collapse) {
  width: 230px;
  background-color: #fdfeff;
}
.el-menu-item:hover {
  background-color: #3a3939;
}
.el-menu-item.is-active {
  background-color: #ac8585;
}
</style>
