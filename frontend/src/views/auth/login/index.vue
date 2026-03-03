<template>
  <div class="container">
    <div class="login-container">
      <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
        <h2 class="title">通用管理系统</h2>
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { login, getMenus } from '@/api/http';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const form = reactive({
  username: 'root',
  password: '123456',
});
const loading = ref(false);
const formRef = ref<FormInstance>();

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const handleLogin = async () => {
  await formRef.value?.validate();
  loading.value = true;
  try {
    const res = await login(form);
    userStore.setToken(res.data.access_token);
    const res1 = await getMenus();
    ElMessage.success('登录成功');
  } catch (error) {
    if (error instanceof Error) {
      // console.log(error.code)
    } else {
      // 处理非 HttpError
      // ElMessage.error('登录失败，请稍后重试')
      console.error('[Login] Unexpected error:', error);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.container {
  height: 100vh;
  width: 100vw;
}
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d3a4b;
}
.login-form {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
}
.title {
  text-align: center;
  margin-bottom: 30px;
}
</style>
