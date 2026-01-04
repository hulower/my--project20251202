// src/api/userApi.js
/**
 * ============================================
 * 用户相关的 API 调用
 * ============================================
 */

import { get, put, upload, post, del } from './httpClient';

/**
 * 获取用户信息
 * @param {number} userId - 用户 ID
 * @returns {Promise<Object>} 用户信息
 */
export function fetchUserById(userId) {
  return get(`/api/users/${userId}`);
}

/**
 * 更新用户信息
 * @param {number} userId - 用户 ID
 * @param {Object} payload - 用户信息 { username, email, bio }
 * @returns {Promise<Object>} 更新后的用户信息
 */
export function updateUser(userId, payload) {
  return put(`/api/users/${userId}`, payload);
}

/**
 * 上传用户头像
 * @param {File} file - 图片文件
 * @returns {Promise<Object>} 上传结果 { success, url, user, message }
 */
export function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  return upload('/api/upload/avatar', formData);
}

/**
 * 修改密码
 * @param {Object} payload - 密码信息
 * @param {string} payload.currentPassword - 当前密码
 * @param {string} payload.newPassword - 新密码
 * @returns {Promise<Object>} 修改结果
 */
export function changePassword(payload) {
  return post('/api/auth/change-password', payload);
}

/**
 * 删除账号
 * @returns {Promise<Object>} 删除结果
 */
export function deleteAccount() {
  return del('/api/auth/delete-account');
}

