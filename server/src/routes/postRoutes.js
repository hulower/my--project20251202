/**
 * ============================================
 * 文件名：server/src/routes/postRoutes.js
 * 作用：博客文章路由配置
 * ============================================
 * 
 * 这个文件负责：
 * 1. 定义 API 路由规则（URL 路径和 HTTP 方法）
 * 2. 将路由映射到对应的控制器函数
 * 3. 提供清晰的 RESTful API 设计
 * 
 * 什么是路由（Route）？
 * - 路由就是 URL 和处理函数的映射关系
 * - 例如：GET /api/posts -> 调用 listPosts 函数
 * - 就像地图：告诉 Express"当收到这个请求时，去找那个函数处理"
 * 
 * 什么是 RESTful API？
 * - REST 是一种 API 设计风格
 * - 使用 HTTP 方法表示操作类型：
 *   - GET: 查询（读取数据）
 *   - POST: 创建（新增数据）
 *   - PUT: 更新（修改数据）
 *   - DELETE: 删除（删除数据）
 * - 使用 URL 表示资源：/api/posts 表示"文章"这个资源
 */

const express = require('express');
const postController = require('../controllers/postController');

// 创建路由实例
// Router 是 Express 提供的路由管理器
const router = express.Router();

// ========================================
// RESTful API 路由定义
// ========================================

/**
 * 查询所有文章
 * @route GET /api/posts
 * @description 获取所有文章列表
 * @access Public（公开，不需要登录）
 * 
 * 完整 URL：http://localhost:5001/api/posts
 * 
 * 注意：这里的路径是 '/'，因为在 app.js 中已经定义了 '/api/posts' 前缀
 * app.use('/api/posts', postRoutes);
 * 所以这里的 '/' 实际上是 '/api/posts'
 */
router.get('/', postController.listPosts);

/**
 * 根据 slug 查询单篇文章
 * @route GET /api/posts/slug/:slug
 * @description 根据 slug（URL 友好的唯一标识符）获取单篇文章
 * @param {string} slug - 文章 slug（路径参数）
 * @access Public
 * 
 * 完整 URL：http://localhost:5001/api/posts/slug/my-first-post
 * 
 * 为什么要加 /slug/ 前缀？
 * - 避免和数字 ID 路由冲突
 * - 明确标识这是通过 slug 查询
 * - 让 API 更清晰易懂
 * 
 * ⚠️ 注意：这个路由必须放在 /:id 路由之前
 * 如果放在后面，/slug/xxx 会被 /:id 路由拦截（把 "slug" 当作 ID）
 */
router.get('/slug/:slug', postController.getPostBySlug);

/**
 * 查询单篇文章
 * @route GET /api/posts/:id
 * @description 根据 ID 获取单篇文章
 * @param {number} id - 文章 ID（路径参数）
 * @access Public
 * 
 * 完整 URL：http://localhost:5001/api/posts/1
 * 
 * :id 是路径参数，会被提取到 req.params.id
 * 例如：访问 /api/posts/123，则 req.params.id = "123"
 */
router.get('/:id', postController.getPost);

/**
 * 创建新文章
 * @route POST /api/posts
 * @description 创建一篇新文章
 * @body {Object} { title: string, content: string }
 * @access Public
 * 
 * 完整 URL：http://localhost:5001/api/posts
 * 请求体示例：{ "title": "新文章", "content": "内容..." }
 * 
 * POST 用于创建新资源
 * 数据通过请求体（body）传递，而不是 URL
 */
router.post('/', postController.createPost);

/**
 * 更新文章
 * @route PUT /api/posts/:id
 * @description 更新指定 ID 的文章
 * @param {number} id - 文章 ID（路径参数）
 * @body {Object} { title: string, content: string }
 * @access Public
 * 
 * 完整 URL：http://localhost:5001/api/posts/1
 * 请求体示例：{ "title": "更新标题", "content": "更新内容" }
 * 
 * PUT 用于更新已存在的资源
 * 需要同时提供 ID（路径参数）和更新数据（请求体）
 */
router.put('/:id', postController.updatePost);

/**
 * 删除文章
 * @route DELETE /api/posts/:id
 * @description 删除指定 ID 的文章
 * @param {number} id - 文章 ID（路径参数）
 * @access Public
 * 
 * 完整 URL：http://localhost:5001/api/posts/1
 * 
 * DELETE 用于删除资源
 * 只需要提供 ID，不需要请求体
 */
router.delete('/:id', postController.deletePost);

/**
 * 上传文章封面
 * @route POST /api/posts/:id/cover
 * @description 为指定文章上传封面图片
 * @param {number} id - 文章 ID（路径参数）
 * @body {File} cover - 封面图片文件
 * @access Public
 * 
 * 完整 URL：http://localhost:5001/api/posts/1/cover
 * 
 * POST 用于上传文件
 * 使用 multipart/form-data 格式传递文件
 */
router.post('/:id/cover', postController.uploadCover);

/**
 * 删除文章封面
 * @route DELETE /api/posts/:id/cover
 * @description 删除指定文章的封面图片
 * @param {number} id - 文章 ID（路径参数）
 * @access Public
 * 
 * 完整 URL：http://localhost:5001/api/posts/1/cover
 * 
 * DELETE 用于删除封面
 * 将文章的 cover_image 字段设置为 NULL
 */
router.delete('/:id/cover', postController.removeCover);

/**
 * 增加文章浏览量
 * @route POST /api/posts/:id/view
 * @description 增加指定文章的浏览量
 * @param {number} id - 文章 ID（路径参数）
 * @access Public
 * 
 * 完整 URL：http://localhost:5001/api/posts/1/view
 * 
 * POST 用于增加浏览量
 * 每次访问文章详情页时，前端自动调用此接口
 * 浏览量会自动 +1
 */
router.post('/:id/view', postController.incrementView);

// ========================================
// 导出路由
// ========================================

/**
 * 导出配置好的路由
 * app.js 会引入这个路由并挂载到 /api/posts 路径下
 * 
 * 完整的请求流程：
 * 1. 前端发起请求：GET http://localhost:5001/api/posts
 * 2. Express 接收请求
 * 3. 匹配到 /api/posts 路径 -> postRoutes
 * 4. 在 postRoutes 中匹配到 GET / -> postController.listPosts
 * 5. 执行 listPosts 函数
 * 6. 返回响应给前端
 */
module.exports = router;


