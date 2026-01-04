/**
 * ============================================
 * 文件名：src/api/uploadApi.js
 * 作用：文件上传相关 API
 * ============================================
 */

import { upload } from './httpClient';

/**
 * 上传文章内容图片
 * @param {File} file - 图片文件
 * @returns {Promise<{url: string}>} 返回图片 URL
 */
export async function uploadContentImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  // upload 函数已经返回 responseData.data，不需要再访问 .data
  const data = await upload('/api/upload/content-image', formData);
  return data;
}

/**
 * 上传头像
 * @param {File} file - 图片文件
 * @returns {Promise<{url: string, user: object}>} 返回头像 URL 和用户信息
 */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);

  // upload 函数已经返回 responseData.data，不需要再访问 .data
  const data = await upload('/api/upload/avatar', formData);
  return data;
}

