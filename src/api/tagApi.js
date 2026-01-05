/**
 * ============================================
 * 文件名：tagApi.js
 * 作用：标签相关 API
 * ============================================
 * 前端调用标签相关接口的统一封装
 */

import { get, post, put, del } from './httpClient';

/**
 * 获取所有标签
 */
export const getAllTags = async () => {
  return await get('/api/tags');
};

/**
 * 根据 ID 获取标签
 */
export const getTagById = async (id) => {
  return await get(`/api/tags/${id}`);
};

/**
 * 根据 slug 获取标签
 */
export const getTagBySlug = async (slug) => {
  return await get(`/api/tags/slug/${slug}`);
};

/**
 * 创建标签
 */
export const createTag = async (tagData) => {
  return await post('/api/tags', tagData);
};

/**
 * 更新标签
 */
export const updateTag = async (id, tagData) => {
  return await put(`/api/tags/${id}`, tagData);
};

/**
 * 删除标签
 */
export const deleteTag = async (id) => {
  return await del(`/api/tags/${id}`);
};

/**
 * 获取热门标签
 */
export const getPopularTags = async (limit = 10) => {
  return await get(`/api/tags/popular?limit=${limit}`);
};

/**
 * 搜索标签
 */
export const searchTags = async (keyword) => {
  return await get(`/api/tags/search?keyword=${encodeURIComponent(keyword)}`);
};

/**
 * 根据标签获取文章列表
 */
export const getPostsByTag = async (slug, page = 1, pageSize = 10) => {
  return await get(`/api/tags/${slug}/posts?page=${page}&pageSize=${pageSize}`);
};

/**
 * 获取文章的所有标签
 */
export const getPostTags = async (postId) => {
  return await get(`/api/posts/${postId}/tags`);
};

/**
 * 批量设置文章的标签
 */
export const setPostTags = async (postId, tagIds) => {
  return await put(`/api/posts/${postId}/tags`, { tagIds });
};

/**
 * 为文章添加标签
 */
export const addTagToPost = async (postId, tagId) => {
  return await post(`/api/posts/${postId}/tags/${tagId}`);
};

/**
 * 从文章移除标签
 */
export const removeTagFromPost = async (postId, tagId) => {
  return await del(`/api/posts/${postId}/tags/${tagId}`);
};

