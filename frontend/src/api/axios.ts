import axios, {
  type AxiosRequestConfig,
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useUserStore } from '@/stores/user';
import router from '@/router';
import { getRefreshToken } from '@/api/http';
import { ElMessage } from 'element-plus';

// 用于标记是否为刷新 token 的请求
declare module 'axios' {
  export interface AxiosRequestConfig {
    _isRefreshTokenRequest?: boolean;
    _retry?: boolean;
  }
}

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000,
});

// 请求拦截器：添加 token
service.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    const token = userStore.token;
    // 如果不是刷新 token 的请求，才添加 token（避免把旧的 access_token 发给刷新接口）
    if (token && !config._isRefreshTokenRequest) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 全局变量：是否正在刷新 token
let isRefreshing = false;
// 等待重试的请求队列
let pendingRequests: Array<{
  config: InternalAxiosRequestConfig;
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// 响应拦截器：处理 401
service.interceptors.response.use(
  response => response.data, // 返回数据
  async error => {
    const originalConfig = error.config as InternalAxiosRequestConfig;

    //  如果不是 401 错误，直接提示并拒绝
    if (!error.response || error.response.status !== 401) {
      ElMessage.error(error.message || '网络错误');
      return Promise.reject(error);
    }

    //如果是刷新 token 的请求本身返回 401，说明 refresh_token 也失效了，直接登出
    if (originalConfig._isRefreshTokenRequest) {
      const userStore = useUserStore();
      userStore.removeToken();
      router.push('/login');
      ElMessage.error('登录已过期，请重新登录');
      return Promise.reject(error);
    }

    // 3. 处理普通请求的 401
    const userStore = useUserStore();
    const refreshToken = userStore.refreshToken;

    // 如果没有 refresh_token，只能登出
    if (!refreshToken) {
      userStore.removeToken();
      router.push('/login');
      ElMessage.error('登录信息不存在，请重新登录');
      return Promise.reject(error);
    }

    // 如果已经在刷新 token，则将当前请求加入队列，等待刷新完成后重试
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ config: originalConfig, resolve, reject });
      });
    }

    // 开始刷新 token
    isRefreshing = true;
    try {
      // 调用刷新 token 接口
      const res = await getRefreshToken(
        { refresh_token: refreshToken },
        {
          _isRefreshTokenRequest: true, // 标记为刷新请求，避免携带旧 token 和再次被拦截
        }
      );
     
      console.log('axios res',res) 
      // 更新 store 中的 token
      userStore.setToken(res.data.access_token, res.data.refresh_token);

      // 刷新成功后，重试所有等待的请求
      pendingRequests.forEach(({ config, resolve, reject }) => {
        service(config).then(resolve).catch(reject);
      });
      pendingRequests = []; // 清空队列

      // 重试当前请求
      return service(originalConfig);
    } catch (refreshError) {
      // 刷新失败，清空队列并跳转登录
      pendingRequests.forEach(({ reject }) => reject(refreshError));
      pendingRequests = [];
      userStore.removeToken();
      router.push('/login');
      ElMessage.error('登录已过期，请重新登录');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// 导出 http 方法
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
