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
          <el-popover
            v-model:visible="popoverVisible"
            placement="bottom-start"
            :width="600"
            trigger="hover"
            :offset="0"
            popper-class="common-pages-popover"
          >
            <template #reference>
              <el-icon class="grid-icon">
                <Grid />
              </el-icon>
            </template>
            <!-- 卡片内容：左右分栏 -->
            <div class="popover-content">
              <!-- 左侧：常用入口网格 -->
              <div class="left-grid">
                <div
                  v-for="item in commonPages"
                  :key="item.meta.id"
                  class="grid-item"
                  @click="goToPage(item.path)"
                >
                  <el-icon
                    ><component :is="item.meta.icon.replace('el-icon-', '')"
                  /></el-icon>
                  <span>{{ item.name }}</span>
                </div>
              </div>
              <!-- 右侧：预留空白区（可后续扩展） -->
              <div class="right-blank">
                <div
                  v-for="item in profile"
                  :key="item.meta.id"
                  class="grid-item"
                  @click="goToPage(item.path)"
                >
                  <el-icon
                    ><component :is="item.meta.icon.replace('el-icon-', '')"
                  /></el-icon>
                  <span>{{ item.name }}</span>
                </div>
              </div>
            </div>
          </el-popover>
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
          <el-select
            v-model="value"
            placeholder="后续功能开发中..."
            style="width: 200px"
          >
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
          <el-popover
            placement="bottom"
            :width="360"
            trigger="click"
            popper-class="message-pages-popover"
          >
            <template #reference>
              <el-icon><ChatSquare /></el-icon>
            </template>
            <!-- 卡片内容：左右分栏 -->
            <div>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  margin-left: 20px;
                "
              >
                <div style="margin: 16px; font-size: 20px; font-weight: 400">
                  通知中心
                </div>
                <div style="margin: 16px; font-size: 16px; font-weight: 300">
                  全部已读
                </div>
              </div>
              <div>
                <el-tabs
                  v-model="activeName"
                  class="demo-tabs"
                  @tab-click="handleClick"
                >
                  <el-tab-pane label="通知(3)" name="first">
                    <div
                      style="
                        margin-left: 10px;
                        padding: 6px;
                        height: 30px;
                        font-size: 16px;
                      "
                    >
                      1、公司将于xxxx年xx月xx日举办活动
                    </div>
                    <div
                      style="
                        margin: 10px;
                        padding: 6px;
                        height: 30px;
                        font-size: 16px;
                      "
                    >
                      2、公司将于xxxx年xx月xx日举办活动
                    </div>
                    <div
                      style="
                        margin-left: 10px;
                        padding: 6px;
                        height: 30px;
                        font-size: 16px;
                      "
                    >
                      3、公司将于xxxx年xx月xx日举办活动
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="审批(1)" name="second">
                    <div
                      style="
                        margin-left: 10px;
                        padding: 6px;
                        height: 30px;
                        font-size: 16px;
                      "
                    >
                      1、你有一个流程审批申请 请注意查看。
                    </div> </el-tab-pane>
                </el-tabs>
              </div>
            </div>
          </el-popover>
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
import { onBeforeMount, onMounted, inject, ref, computed } from 'vue';
import { useMenuCollapseStore } from '@/stores/menu';
import { useRouter } from 'vue-router';
onBeforeMount(() => {});
onMounted(() => {});
const router = useRouter();
const isCollapse = ref(false); // 折叠状态
const popoverVisible = ref(false);
const useMenuCollapse = useMenuCollapseStore();

import type { TabsPaneContext } from 'element-plus';

const activeName = ref('first');

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event);
};
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
    value: '功能开发中...',
    label: '功能开发中...',
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
const goToPage = (path: string) => {
  popoverVisible.value = false;
  router.push(path);
};
//常用入口功能示例
const commonPages = [
  {
    path: '/notice/company',
    name: '公司公告',
    meta: {
      title: '公司公告',
      icon: 'el-icon-office-building',
      hidden: false,
      permissionCodes: ['notice:company'],
      id: 11,
      sort: 1,
    },
  },
  {
    path: '/notice/dept',
    name: '部门公告',
    meta: {
      title: '部门公告',
      icon: 'el-icon-office-building',
      hidden: false,
      permissionCodes: ['notice:dept'],
      id: 12,
      sort: 2,
    },
  },

  {
    path: '/function/file',
    name: '文件处理',
    meta: {
      title: '文件处理',
      icon: 'el-icon-files',
      hidden: false,
      permissionCodes: ['function:file'],
      id: 13,
      sort: 1,
    },
  },
  {
    path: '/function/text',
    name: '文本编辑',
    meta: {
      title: '文本编辑',
      icon: 'el-icon-edit',
      hidden: false,
      permissionCodes: ['function:text'],
      id: 14,
      sort: 2,
    },
  },
  {
    path: '/function/qrcode',
    name: '二维码',
    meta: {
      title: '二维码',
      icon: 'el-icon-menu',
      hidden: false,
      permissionCodes: ['function:qrcode'],
      id: 15,
      sort: 3,
    },
  },

  {
    path: '/component/chart',
    name: '图表',
    meta: {
      title: '图表',
      icon: 'el-icon-pie-chart',
      hidden: false,
      permissionCodes: ['component:chart'],
      id: 16,
      sort: 1,
    },
  },
];
const profile = [
  {
    name: '密码修改',
    path: '/profile/password',
    meta: {
      hidden: false,
      icon: 'el-icon-key',
      id: 20,
      permissionCodes: ['profile:password'],
      sort: 2,
      title: '密码修改',
    },
  },
  {
    name: '信息查看',
    path: '/profile/info',
    meta: {
      hidden: false,
      icon: 'el-icon-ChatLineRound',
      id: 19,
      permissionCodes: ['profile:info'],
      sort: 1,
      title: '信息查看',
    },
  },
  {
    name: '功能开发中...',
    path: '',
    meta: {
      hidden: false,
      icon: 'el-icon-MoreFilled',
      id: 19,
      permissionCodes: ['profile:info'],
      sort: 1,
      title: '信息查看',
    },
  },
];
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
.common-pages-grid {
  height: 280px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 8px;
}
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #f5f7fa;
  }
  .el-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }
  span {
    font-size: 12px;
    color: #333;
  }
}
</style>
<style lang="scss">
.common-pages-popover {
  padding: 0 !important;
  width: 600px;
  height: 280px;
  overflow: hidden;
}
.popover-content {
  display: flex;
  width: 100%;
  height: 100%;
  .left-grid {
    width: 66.666%; // 2/3
    height: 100%;
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    overflow-y: auto; // 内容超出可滚动
    .grid-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
      &:hover {
        background-color: #f5f7fa;
      }
      .el-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }
      span {
        font-size: 12px;
        color: #333;
      }
    }
  }
  .right-blank {
    padding: 16px;
    display: grid;
    width: 33.333%;
    height: 100%;
    background-color: #fafafa;
    border-left: 1px solid #eee;
  }
}
.message-pages-popover {
  padding: 0 !important;
  width: 360px;
  height: 400px;
  overflow: hidden;
  border-radius: 6px;
  .el-tabs__header .is-top > .el-tabs__nav-scroll {
    margin-left: 30px;
  }
}
</style>
