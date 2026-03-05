<template>
  <!-- 有子菜单且非隐藏 -->
  <el-sub-menu
    v-if="item.children && item.children.length && !item.hidden"
    :index="item.path"
    style="border-radius: 8px"
  >
    <template #title>
      <el-icon v-if="item.icon">
        <component :is="item.icon.replace('el-icon-', '')" />
      </el-icon>
      <span>{{ item.name }}</span>
    </template>
    <MenuItem v-for="child in item.children" :key="child.id" :item="child" />
  </el-sub-menu>

  <!-- 叶子菜单且非隐藏 -->
  <el-menu-item
    v-else-if="!item.hidden"
    :index="item.path"
    style="margin: 3px 0; border-radius: 8px"
  >
    <el-icon v-if="item.icon">
      <component :is="item.icon.replace('el-icon-', '')" />
    </el-icon>
    <template #title>{{ item.name }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/stores/menu';

defineProps<{
  item: MenuItem;
}>();
</script>
<style lang="scss" scoped>
.el-menu .el-menu--vertical .el-menu-design > .el-sub-menu:hover {
  border-radius: 8px;
}
.el-menu .el-menu--inline > .el-menu-item {
  transition:
    border-radius 0.2s ease,
    background-color 0.2s ease;
}
.el-menu .el-menu--inline > .el-menu-item:hover {
  border-radius: 8px;
}
.el-menu el-menu--vertical > .el-sub-menu:hover {
  border-radius: 8px;
}
.el-menu-item.is-active {
  background-color: #e8f2ff;
  border-radius: 8px;
}
</style>
