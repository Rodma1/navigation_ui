// src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
    // baseURL: process.env.VUE_APP_BASE_API, // 设置基础 URL
    timeout: 10000, // 设置请求超时
});

// 请求拦截器
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('Authorization'); // 从本地存储中获取 token
    if (token) {
        config.headers['Authorization'] = `${token}`; // 将 token 添加到请求头
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 响应拦截器
instance.interceptors.response.use(response => {
    // 检查响应内容中的 token 验证状态
    if (response.data && (response.data.code === 11012 || response.data.code === 11013)) {
        // 删除浏览器中的 token
        localStorage.removeItem('Authorization');
        // 这里可以选择跳转到登录页面或显示错误信息
        console.log('Token验证失败，已删除存储的token');

    }
    return response;
}, error => {
    // 处理请求错误
    return Promise.reject(error);
});
export default instance;
