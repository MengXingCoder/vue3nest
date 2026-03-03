import axios, { type AxiosRequestConfig, AxiosError } from 'axios';
import { useUserStore } from '@/stores/user';
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000,
});

service.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    const token = userStore.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 响应拦截器：处理 401
service.interceptors.response.use(
  response => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
    }
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
