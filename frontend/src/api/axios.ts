// src/api/http.ts
import axios, { type AxiosRequestConfig, AxiosError } from 'axios'



const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    // baseURL:'http://47.111.171.128:3000/api',
    timeout: 60000,
})

// 请求拦截器：自动加 token
service.interceptors.request.use(
    (config) => {
        // if (storeToken.token) {
        //     config.headers = config.headers || {}
        //     config.headers.Authorization = `Bearer ${storeToken.token}`
        // }

        return config
    },
    (error: AxiosError) => Promise.reject(error)
)

// 响应拦截器：处理 401
service.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
        if (error.response?.status === 401) {

            // 可在 router 中统一跳转登录页
        }
        return Promise.reject(error)
    }
)

// 导出通用方法（不暴露给组件，只给 api/index.ts 用）
export const http = {
    get: <T = unknown>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig) =>
        service.get<T>(url, { ...config, params }),

    post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        service.post<T>(url, data, config),

    put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        service.put<T>(url, data, config),

    delete: <T = unknown>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig) =>
        service.delete<T>(url, { ...config, params }),

    instance: service,
}
