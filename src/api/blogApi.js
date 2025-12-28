import { get, post, put, del } from './httpClient';

/**
 * 获取文章列表（支持分页和分类筛选）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从 1 开始）
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.category - 分类筛选（可选）
 * @returns {Promise} - 文章列表
 */
export function fetchPosts(params = {}) {
  // 构建查询字符串
  const queryParams = new URLSearchParams();
  
  if (params.page) {
    queryParams.append('page', params.page);
  }
  
  if (params.pageSize) {
    queryParams.append('pageSize', params.pageSize);
  }
  
  if (params.category) {
    queryParams.append('category', params.category);
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `/api/posts?${queryString}` : '/api/posts';
  
  return get(url);
}

export function fetchPostById(id) {
  return get(`/api/posts/${id}`);
}

/**
 * 通过 slug 获取文章
 * @param {string} slug - 文章 slug
 * @returns {Promise} - 文章对象
 */
export function fetchPostBySlug(slug) {
  return get(`/api/posts/slug/${slug}`);
}

export function createPost(payload) {
  return post('/api/posts', payload);
}

export function updatePost(id, payload) {
  return put(`/api/posts/${id}`, payload);
}

export function deletePost(id) {
  return del(`/api/posts/${id}`);
}


