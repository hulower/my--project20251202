/**
 * ============================================
 * 文件名：src/api/authApi.js
 * 作用：认证相关的 API 调用
 * ============================================
 * 
 * 包含以下 API：
 * - 用户注册
 * - 用户登录
 * - 刷新 Token
 * - 用户登出
 * - 获取当前用户信息
 */

import { get, post } from './httpClient';

/**
 * 用户注册
 * 
 * @param {Object} userData - 注册信息
 * @param {string} userData.username - 用户名
 * @param {string} userData.email - 邮箱
 * @param {string} userData.password - 密码
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 * 
 * @example
 * const result = await register({
 *   username: '张三',
 *   email: 'zhangsan@example.com',
 *   password: 'myPassword123'
 * });
 */
export function register(userData) {
  return post('/api/auth/register', userData);
}

/**
 * 用户登录
 * 
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.email - 邮箱
 * @param {string} credentials.password - 密码
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 * 
 * @example
 * const result = await login({
 *   email: 'zhangsan@example.com',
 *   password: 'myPassword123'
 * });
 */
export function login(credentials) {
  return post('/api/auth/login', credentials);
}

/**
 * 刷新 Access Token
 * 
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<Object>} { accessToken }
 * 
 * @example
 * const result = await refreshToken(oldRefreshToken);
 * console.log('新的 Access Token:', result.accessToken);
 */
export function refreshToken(refreshToken) {
  return post('/api/auth/refresh', { refreshToken });
}

/**
 * 用户登出
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * await logout();
 * console.log('登出成功');
 * 
 * ⚠️ 注意：调用前需要先通过 httpClient 自动添加 Authorization header
 */
export function logout() {
  return post('/api/auth/logout');
}

/**
 * 获取当前登录用户信息
 * 
 * @returns {Promise<Object>} 用户信息
 * 
 * @example
 * const user = await getCurrentUser();
 * console.log('当前用户:', user.username);
 * 
 * ⚠️ 注意：调用前需要先通过 httpClient 自动添加 Authorization header
 */
export function getCurrentUser() {
  return get('/api/auth/me');
}

/**
 * 重置密码（直接邮箱 + 新密码，无需邮件验证）
 *
 * @param {string} email - 注册邮箱
 * @param {string} newPassword - 新密码
 * @returns {Promise<void>}
 *
 * @example
 * await resetPassword('zhangsan@example.com', 'newPass456');
 */
export function resetPassword(email, newPassword) {
  return post('/api/auth/reset-password', { email, newPassword });
}


