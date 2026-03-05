import { http } from './axios';

// 定义接口数据类型（统一管理）
export interface User {
  id: number;
  username: string;
  profile: { gender: number } | null;
  roles: { id: number; name: string }[];
}

export interface LoginReq {
  username: string;
  password: string;
}

export interface LoginToken {
  access_token: string;
}
export interface refreshToken {
  refresh_token: string;
}

// 刷新 token

export const getRefreshToken = (data: refreshToken) =>
  http.post<LoginToken & refreshToken>('/auth/refresh', data);
export const getUsers = (params?: Record<string, unknown>) =>
  http.get<User[]>('/user', params);
export const login = (data: LoginReq) =>
  http.post<LoginToken & refreshToken>('/auth/login', data);
export const getMenuList = () => http.get('/menus/tree');


// 上传文件场景
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.instance.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // 也可以加其他配置，比如：
    //  timeout: 60000, // 60秒超时（覆盖全局10秒）
    // onUploadProgress: (progressEvent) => {
    //   const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
    //   console.log('上传进度:', percent + '%');
    // },

    // signal: abortController.signal,
    // headers: { 'X-Custom-Header': 'upload' }
  });
};
