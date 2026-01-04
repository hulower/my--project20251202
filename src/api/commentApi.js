/**
 * ============================================
 * 文件名：src/api/commentApi.js
 * 作用：评论相关的 API 调用
 * ============================================
 */

import { get, post, put, del } from './httpClient';

/**
 * 获取文章的所有评论
 * @param {number} postId - 文章 ID
 * @returns {Promise<Array>} 评论列表（树形结构）
 */
export function fetchComments(postId) {
  return get(`/api/posts/${postId}/comments`);
}

/**
 * 创建评论
 * @param {number} postId - 文章 ID
 * @param {Object} data - 评论数据
 * @param {string} data.content - 评论内容
 * @param {number} [data.parentId] - 父评论 ID（回复时提供）
 * @returns {Promise<Object>} 创建的评论
 */
export function createComment(postId, data) {
  return post(`/api/posts/${postId}/comments`, data);
}

/**
 * 更新评论
 * @param {number} commentId - 评论 ID
 * @param {Object} data - 更新数据
 * @param {string} data.content - 新内容
 * @returns {Promise<Object>} 更新后的评论
 */
export function updateComment(commentId, data) {
  return put(`/api/comments/${commentId}`, data);
}

/**
 * 删除评论
 * @param {number} commentId - 评论 ID
 * @returns {Promise<void>}
 */
export function deleteComment(commentId) {
  return del(`/api/comments/${commentId}`);
}

