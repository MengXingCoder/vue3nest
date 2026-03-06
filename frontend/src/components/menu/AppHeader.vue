<template>
  <div>
    <div class="topSty">
      <div class="topLeft">
        <div>
          <div class="collapse-btn" @click="toggleCollapse">
            <el-icon>
              <component :is="collapseIcon" />
            </el-icon>
          </div>
        </div>
        <div>
          <el-icon
            style="margin: 0 20px"
            @click="handleRefresh"
            class="refresh-icon"
            title="刷新"
            ><Refresh
          /></el-icon>
        </div>
        <div>
          <el-icon><Grid /></el-icon>
        </div>
        <div style="height: 17px; margin-left: 20px; white-space: nowrap">
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbs"
              :key="index"
              :to="item.path"
            >
              <span style="color: #7987a1; font-family: 'Microsoft YaHei'">
                {{ item.title }}
              </span>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
      <div
        style="
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 60px;
        "
      >
        <div>
          <el-select v-model="value" placeholder="Select" style="width: 200px">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div style="margin: 0 20px">
          <!-- <el-icon><FullScreen /></el-icon> -->
          <el-tooltip
            :content="isFullscreen ? '退出全屏' : '全屏'"
            placement="bottom"
          >
            <el-icon class="fullscreen-icon" @click="toggle">
              <FullScreen v-if="!isFullscreen" />
              <Aim v-else />
            </el-icon>
          </el-tooltip>
        </div>
        <div>
          <el-icon><ChatSquare /></el-icon>
        </div>
        <div style="margin: 0 20px">
          <el-icon><Setting /></el-icon>
        </div>
        <div style="margin-right: 20px">
          <el-icon><Avatar /></el-icon>
        </div>
      </div>
      <!-- 这是用户点击的菜单记录并展示 -->
    </div>
  </div>
</template>
<script setup lang="ts">
import { Expand, Fold, FullScreen, Aim } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { useFullscreen } from '@vueuse/core';
import { onBeforeMount, onMounted, ref, computed } from 'vue';
import { useMenuCollapseStore } from '@/stores/menu';
import { inject } from 'vue';
onBeforeMount(() => {});
onMounted(() => {});
const isCollapse = ref(false); // 折叠状态
const useMenuCollapse = useMenuCollapseStore();
const collapseIcon = computed(() =>
  useMenuCollapse.isCollapse ? Expand : Fold
);
// 侧边栏菜单切换折叠
const toggleCollapse = () => {
  useMenuCollapse.isCollapse = isCollapse.value = !isCollapse.value;
  console.log(isCollapse.value);
};

defineProps<{
  collapse: boolean;
}>();

const emit = defineEmits(['toggle-collapse']);

const route = useRoute();

const value = ref('');

const options = [
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
  {
    value: 'Option5',
    label: 'Option5',
  },
];
// 计算面包屑
const breadcrumbs = computed(() => {
  // 从当前路由的 matched 数组中提取 meta.title 和 path

  console.log(route.matched);
  console.log(
    route.matched.filter(
      item => item.meta && item.meta.title && !item.meta.hidden
    )
  );
  return route.matched
    .filter(item => item.meta && item.meta.title && !item.meta.hidden) // 只显示有标题且非隐藏的路由
    .map(item => ({
      title: item.meta.title as string,
      path: item.path,
    }));
});

//全屏方法
const { isFullscreen, toggle } = useFullscreen();

// 拿到顶级组件的刷新方法
const refreshView = inject('refreshView') as () => void;

//点击执行刷新方法
const handleRefresh = () => {
  refreshView();
};
</script>
<style lang="scss" scoped>
.topSty {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  .topLeft {
    margin-left: 12px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
