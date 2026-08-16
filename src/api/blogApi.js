import { get, post, put, del, upload, API_BASE } from './httpClient';
import { authStorage } from '../utils/auth';

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

/**
 * 上传文章封面图片
 * @param {number} id - 文章 ID
 * @param {FormData} formData - 包含封面图片的 FormData 对象
 * @returns {Promise} - 上传结果
 */
export function uploadCoverImage(id, formData) {
  return upload(`/api/posts/${id}/cover`, formData);
}

/**
 * 删除文章封面图片
 * @param {number} id - 文章 ID
 * @returns {Promise} - 删除结果
 */
export function removeCoverImage(id) {
  return del(`/api/posts/${id}/cover`);
}

/**
 * 增加文章浏览量
 * @param {number} id - 文章 ID
 * @returns {Promise} - 更新后的文章对象
 */
export function incrementViewCount(id) {
  return post(`/api/posts/${id}/view`);
}

/**
 * 获取归档数据
 * @returns {Promise} - 归档数据（按年月分组）
 */
export function fetchArchives() {
  return get('/api/posts/archives');
}

/**
 * 搜索文章
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 返回结果数量限制
 * @returns {Promise} - 搜索结果
 */
/**
 * AI 生成文章摘要
 * @param {number} id - 文章 ID
 * @returns {Promise} - { summary: string }
 */
export function generateSummary(id) {
  return post(`/api/posts/${id}/generate-summary`);
}

/**
 * AI 流式生成文章摘要（SSE，打字机效果）
 * @param {number} id - 文章 ID
 * @param {function} onToken - 每收到一个 token 回调
 * @param {function} onDone - 生成完成回调
 * @param {function} onError - 错误回调
 */
export async function generateSummaryStream(id, onToken, onDone, onError) {
  const token = authStorage.getAccessToken();
  const url = `${API_BASE}/api/posts/${id}/generate-summary-stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 最后一行可能不完整

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'token') {
            onToken(data.content);
          } else if (data.type === 'done') {
            onDone(data.summary);
          } else if (data.error) {
            onError(new Error(data.error));
          }
        } catch (e) {
          // 跳过解析失败的行
        }
      }
    }
  }
}

export function searchPosts(keyword, limit = 10) {
  const params = new URLSearchParams();
  params.append('q', keyword);
  params.append('limit', limit);
  return get(`/api/posts/search?${params.toString()}`);
}

