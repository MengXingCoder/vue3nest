import axios, { type AxiosRequestConfig, AxiosError } from 'axios';
import { useUserStore } from '@/stores/user';
import router from '@/router';
import { getRefreshToken } from '@/api/http';
import { ElMessage } from 'element-plus';
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000,
});

service.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    const token = userStore.token;
    if (token) {
      //请求时自动携带token
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

async function handleTokenRefresh() {
  const userStore = useUserStore();
  const refreshToken = userStore.refreshToken;
  //如果没有refresh token，则跳转到登录页
  if (!refreshToken) {
    userStore.removeToken();
    router.push('/login');
    return Promise.reject(new Error('No refresh token'));
  }

  try {
    //获取access token 和 refresh token 并存储起来
    const res = await getRefreshToken({ refresh_token: refreshToken });
    userStore.setToken(res.data.access_token, res.data.refresh_token);
  } catch (error) {
    userStore.removeToken();
    router.push('/login');
    ElMessage.error('登录已过期，请重新登录');
    return Promise.reject(error);
  } finally {
  }
}

// 响应拦截器：处理 401
service.interceptors.response.use(
  response => response.data,
  async error => {
    // 只有在响应状态码为 401 且请求未重试过的情况下才尝试刷新 token
    if (error.response?.status === 401) {
      return handleTokenRefresh();
    }
    ElMessage.error(error.message || '网络错误');
    return Promise.reject(error);
  }
);

export const http = {
  get: <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => service.get<T>(url, { ...config, params }),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => service.post<T>(url, data, config),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => service.put<T>(url, data, config),

  delete: <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => service.delete<T>(url, { ...config, params }),

  instance: service,
};
