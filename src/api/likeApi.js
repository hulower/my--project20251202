/**
 * ============================================
 * 文件名：src/api/likeApi.js
 * 作用：点赞相关的 API 调用
 * ============================================
 */

import { get, post } from './httpClient';

/**
 * 切换点赞状态（点赞/取消点赞）
 * @param {number} postId - 文章 ID
 * @returns {Promise<Object>} { liked: boolean, likesCount: number }
 */
export function toggleLike(postId) {
  return post(`/api/posts/${postId}/like`);
}

/**
 * 获取点赞状态
 * @param {number} postId - 文章 ID
 * @returns {Promise<Object>} { liked: boolean, likesCount: number }
 */
export function getLikeStatus(postId) {
  return get(`/api/posts/${postId}/like`);
}

/**
 * 获取用户点赞的文章列表
 * @param {number} userId - 用户 ID
 * @returns {Promise<Array<number>>} 文章 ID 列表
 */
export function getUserLikedPosts(userId) {
  return get(`/api/users/${userId}/liked-posts`);
}

