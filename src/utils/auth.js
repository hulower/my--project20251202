/**
 * ============================================
 * 文件名：src/utils/auth.js
 * 作用：认证相关的本地存储管理
 * ============================================
 * 
 * 管理以下数据：
 * - Access Token（访问令牌）
 * - Refresh Token（刷新令牌）
 * - 用户信息
 */

// ========================================
// 存储键名常量
// ========================================
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_info';

// ========================================
// Auth Storage 工具对象
// ========================================
export const authStorage = {
  /**
   * 保存 Token（登录时调用）
   * @param {string} accessToken - Access Token
   * @param {string} refreshToken - Refresh Token
   */
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  
  /**
   * 获取 Access Token
   * @returns {string|null} Access Token
   */
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * 获取 Refresh Token
   * @returns {string|null} Refresh Token
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  /**
   * 更新 Access Token（刷新后调用）
   * @param {string} accessToken - 新的 Access Token
   */
  setAccessToken(accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  },
  
  /**
   * 保存用户信息
   * @param {Object} user - 用户信息对象
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息对象
   */
  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      console.error('解析用户信息失败:', err);
      return null;
    }
  },
  
  /**
   * 清除所有认证信息（登出时调用）
   */
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  /**
   * 检查是否已登录
   * @returns {boolean} 是否存在有效 Token
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  },
};

// ========================================
// 使用示例
// ========================================
/*
// 1. 登录成功后保存
authStorage.setTokens(accessToken, refreshToken);
authStorage.setUser(user);

// 2. 检查登录状态
if (authStorage.isAuthenticated()) {
  console.log('用户已登录');
}

// 3. 获取当前用户
const currentUser = authStorage.getUser();
console.log('当前用户:', currentUser.username);

// 4. 登出
authStorage.clear();
*/


