import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  
  const token = ref(localStorage.getItem('token') || ''); 

  // 设置 token
  function setToken(newToken:string) {
    token.value = newToken;
    localStorage.setItem('token', newToken); 
  }

  // 清除 token（登出时调用）
  function removeToken() {
    token.value = '';
    localStorage.removeItem('token');
  }

  return {
    token,
    setToken,
    removeToken,
  };
});
