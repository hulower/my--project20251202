import { authStorage } from '../utils/auth';

// 根据环境自动切换 API 地址
const API_BASE = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'http://82.156.185.63' // 生产环境：你的服务器 IP
    : 'http://localhost:5001'); // 开发环境

// 正在刷新 Token 的 Promise（防止并发刷新）
let refreshingPromise = null;

/**
 * 刷新 Access Token
 */
async function refreshAccessToken() {
  const refreshToken = authStorage.getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  
  // 如果已经在刷新中，等待现有的刷新完成
  if (refreshingPromise) {
    return refreshingPromise;
  }
  
  refreshingPromise = fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Token refresh failed');
      }
      
      // 保存新的 Access Token
      authStorage.setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    })
    .finally(() => {
      refreshingPromise = null;
    });
  
  return refreshingPromise;
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  
  // 公开接口不需要 token（登录、注册、刷新等）
  const publicPaths = ['/auth/login', '/auth/register', '/auth/refresh'];
  const isPublicPath = publicPaths.some(p => path.includes(p));
  
  // 自动添加 Authorization header（公开接口除外）
  if (!isPublicPath) {
    const token = authStorage.getAccessToken();
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  
  let res = await fetch(url, options);
  
  // 如果返回 401 且不是公开接口，尝试刷新 Token
  if (res.status === 401 && !isPublicPath) {
    try {
      const newToken = await refreshAccessToken();
      
      // 使用新 Token 重试请求
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      };
      res = await fetch(url, options);
    } catch (err) {
      // 刷新失败，清除认证信息并跳转登录
      console.error('Token 刷新失败:', err);
      authStorage.clear();
      
      // 如果不在登录页，跳转到登录页
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
      
      throw new Error('登录已过期，请重新登录');
    }
  }
  
  const contentType = res.headers.get('content-type') || '';
  let responseData;
  
  if (contentType.includes('application/json')) {
    responseData = await res.json();
  } else {
    responseData = await res.text();
  }
  
  // 检查响应格式
  if (responseData && typeof responseData === 'object' && 'code' in responseData) {
    // 统一格式响应：{ code, success, message, data, timestamp }
    if (!responseData.success) {
      // 业务错误
      const error = new Error(responseData.message || '请求失败');
      error.code = responseData.code;
      error.httpStatus = res.status;
      throw error;
    }
    // 返回 data 字段
    return responseData.data;
  }
  
  // 旧格式或其他格式，直接返回
  if (!res.ok) {
    const error = new Error(responseData.message || responseData.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.body = responseData;
    throw error;
  }
  
  return responseData;
}

export function get(path) {
  return request(path);
}

export function post(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function put(path, body) {
  return request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function del(path) {
  return request(path, { method: 'DELETE' });
}

// 文件上传专用（支持 FormData）
export function upload(path, formData) {
  const url = `${API_BASE}${path}`;
  
  // 添加 Authorization header
  const headers = {};
  const token = authStorage.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    // 不设置 Content-Type，让浏览器自动设置（包含 boundary）
  }).then(async (res) => {
    const responseData = await res.json();
    
    // 检查统一格式响应
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      if (!responseData.success) {
        // 业务错误
        const error = new Error(responseData.message || '上传失败');
        error.code = responseData.code;
        error.httpStatus = res.status;
        throw error;
      }
      // 返回 data 字段
      return responseData.data;
    }
    
    // 旧格式兼容
    if (!res.ok) {
      const error = new Error(responseData.message || responseData.error || `Upload failed with status ${res.status}`);
      error.status = res.status;
      error.body = responseData;
      throw error;
    }
    
    return responseData;
  });
}

export { API_BASE };


