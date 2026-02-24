<template>
  <div class="container">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      status-icon
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
    >
      <el-form-item label="用户名:" prop="username" style="width: 300px">
        <el-input v-model="ruleForm.username" type="text" />
      </el-form-item>
      <el-form-item label="密码:" prop="password" style="width: 300px">
        <el-input v-model="ruleForm.password" type="password" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)">
          登录
        </el-button>
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue';
import { reactive, ref } from 'vue';

import type { FormInstance, FormRules } from 'element-plus';

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive({
  password: '',
  username: '',
});

const rules = reactive<FormRules<typeof ruleForm>>({
  password: [{ required: true, message: '请输入登录密码', trigger: 'blur' }],
  username: [{ required: true, message: '请输入登录用户名', trigger: 'blur' }],
});

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      console.log('submit!');
    } else {
      console.log('error submit!');
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
onBeforeMount(() => {});
onMounted(() => {});
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  border: solid 1px blue;
  height: 100%;
  width: 100%;
}
</style>
