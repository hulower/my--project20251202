# API 响应规范文档

## 📋 统一响应格式

所有 API 接口都遵循以下统一的响应格式：

### ✅ 成功响应格式

```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": { ... },
  "timestamp": 1703500000000
}
```

### ❌ 失败响应格式

```json
{
  "code": 404,
  "success": false,
  "message": "资源不存在",
  "data": null,
  "timestamp": 1703500000000
}
```

---

## 📊 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | number | 业务状态码 |
| `success` | boolean | 请求是否成功 |
| `message` | string | 提示信息 |
| `data` | any | 返回的业务数据 |
| `timestamp` | number | 响应时间戳（毫秒） |

---

## 🔢 状态码规范

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器错误 |

### 业务状态码（code 字段）

| 状态码 | 说明 | 常量名 |
|--------|------|--------|
| 200 | 成功 | CODE.SUCCESS |
| 201 | 创建成功 | CODE.CREATED |
| 400 | 请求参数错误 | CODE.BAD_REQUEST |
| 401 | 未授权 | CODE.UNAUTHORIZED |
| 403 | 禁止访问 | CODE.FORBIDDEN |
| 404 | 资源不存在 | CODE.NOT_FOUND |
| 409 | 资源冲突 | CODE.CONFLICT |
| 500 | 服务器错误 | CODE.INTERNAL_ERROR |

---

## 📖 接口示例

### 1. 获取文章列表

**请求：**
```
GET /api/posts
```

**成功响应：**
```json
{
  "code": 200,
  "success": true,
  "message": "获取文章列表成功",
  "data": [
    {
      "id": 1,
      "title": "我的第一篇博客",
      "content": "这是内容...",
      "createdAt": "2024-12-25T10:00:00.000Z"
    }
  ],
  "timestamp": 1703500000000
}
```

### 2. 获取单篇文章

**请求：**
```
GET /api/posts/1
```

**成功响应：**
```json
{
  "code": 200,
  "success": true,
  "message": "获取文章成功",
  "data": {
    "id": 1,
    "title": "我的第一篇博客",
    "content": "这是内容...",
    "createdAt": "2024-12-25T10:00:00.000Z"
  },
  "timestamp": 1703500000000
}
```

**失败响应（文章不存在）：**
```json
{
  "code": 404,
  "success": false,
  "message": "文章不存在",
  "data": null,
  "timestamp": 1703500000000
}
```

### 3. 创建文章

**请求：**
```
POST /api/posts
Content-Type: application/json

{
  "title": "新文章",
  "content": "内容..."
}
```

**成功响应：**
```json
{
  "code": 201,
  "success": true,
  "message": "文章创建成功",
  "data": {
    "id": 2,
    "title": "新文章",
    "content": "内容...",
    "createdAt": "2024-12-25T10:00:00.000Z"
  },
  "timestamp": 1703500000000
}
```

**失败响应（参数错误）：**
```json
{
  "code": 400,
  "success": false,
  "message": "标题和内容不能为空",
  "data": null,
  "timestamp": 1703500000000
}
```

### 4. 上传头像

**请求：**
```
POST /api/upload/avatar
Content-Type: multipart/form-data

avatar: [图片文件]
```

**成功响应：**
```json
{
  "code": 201,
  "success": true,
  "message": "头像上传成功",
  "data": {
    "url": "/uploads/avatars/optimized-1703500000000-123456789.jpg",
    "user": {
      "id": 1,
      "username": "博主",
      "email": "admin@myblog.com",
      "avatarUrl": "/uploads/avatars/optimized-1703500000000-123456789.jpg",
      "bio": "趁年轻，做自己想做的！"
    }
  },
  "timestamp": 1703500000000
}
```

**失败响应（文件过大）：**
```json
{
  "code": 400,
  "success": false,
  "message": "文件大小不能超过 5MB",
  "data": null,
  "timestamp": 1703500000000
}
```

---

## 🔧 后端使用方式

### 引入响应工具

```javascript
const { success, error, CODE } = require('../utils/response');
```

### 返回成功响应

```javascript
// 基本用法
success(res, data, '操作成功', CODE.SUCCESS);

// 创建资源
success(res, newResource, '创建成功', CODE.CREATED);

// 只返回消息，无数据
success(res, null, '操作成功');
```

### 返回错误响应

```javascript
// 在 Service 层抛出错误
const error = new Error('文章不存在');
error.statusCode = 404;
throw error;

// 全局错误处理中间件会自动格式化
```

---

## 🎨 前端使用方式

### httpClient 自动解包

前端的 `httpClient` 已经实现了自动解包，会直接返回 `data` 字段：

```javascript
import * as blogApi from '@/api/blogApi';

// 调用 API
const posts = await blogApi.fetchPosts();
// posts 直接是文章数组，不需要 posts.data

const post = await blogApi.fetchPostById(1);
// post 直接是文章对象

// 错误会自动抛出
try {
  const post = await blogApi.fetchPostById(999);
} catch (error) {
  console.error(error.message); // "文章不存在"
  console.error(error.code);    // 404
}
```

---

## ✅ 优势

1. **统一规范**：所有接口返回格式一致
2. **易于处理**：前端可以统一处理响应
3. **清晰明确**：code、success、message 字段含义明确
4. **便于调试**：timestamp 字段方便追踪
5. **自动解包**：前端 httpClient 自动提取 data 字段

---

## 📝 版本历史

- v1.0 (2024-12-25): 初始版本，实现统一响应格式

