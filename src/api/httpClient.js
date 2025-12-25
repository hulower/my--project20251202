// 根据环境自动切换 API 地址
const API_BASE = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://你的后端域名.onrender.com' // 生产环境：部署后替换为实际后端域名
    : 'http://localhost:5001'); // 开发环境

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, options);
  
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
  return fetch(url, {
    method: 'POST',
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


