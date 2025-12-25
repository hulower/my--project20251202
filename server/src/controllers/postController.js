/**
 * ============================================
 * 文件名：server/src/controllers/postController.js
 * 作用：控制器层 (Controller) - 博客文章（企业级规范版本）
 * ============================================
 */

const postService = require('../services/postService');
const Response = require('../utils/response');

/**
 * 获取所有文章
 * GET /api/posts
 */
async function listPosts(req, res, next) {
  try {
    console.log('📥 收到请求: GET /api/posts');
    const posts = await postService.getAllPosts();
    Response.success(res, posts, '获取文章列表成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 根据 ID 获取单篇文章
 * GET /api/posts/:id
 */
async function getPost(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('📥 收到请求: GET /api/posts/:id', { id });
    
    const post = await postService.getPostById(id);
    Response.success(res, post, '获取文章成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 创建新文章
 * POST /api/posts
 */
async function createPost(req, res, next) {
  try {
    console.log('📥 收到请求: POST /api/posts', req.body);
    const created = await postService.createPost(req.body);
    Response.created(res, created, '文章创建成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 更新文章
 * PUT /api/posts/:id
 */
async function updatePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('📥 收到请求: PUT /api/posts/:id', { id, body: req.body });
    
    const updated = await postService.updatePost(id, req.body);
    Response.success(res, updated, '文章更新成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 删除文章
 * DELETE /api/posts/:id
 */
async function deletePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('📥 收到请求: DELETE /api/posts/:id', { id });
    
    const deleted = await postService.deletePost(id);
    Response.success(res, deleted, '文章删除成功');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};

