/**
 * ============================================
 * 文件名：server/src/routes/commentRoutes.js
 * 作用：评论路由配置
 * ============================================
 */

const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// ========================================
// 评论路由
// ========================================

/**
 * 获取文章的所有评论
 * GET /api/posts/:postId/comments
 * 
 * 公开接口，无需登录
 */
router.get('/posts/:postId/comments', commentController.getComments);

/**
 * 创建评论
 * POST /api/posts/:postId/comments
 * 
 * 需要登录
 * 请求体：
 * {
 *   "content": "评论内容",
 *   "parentId": 1  // 可选
 * }
 */
router.post('/posts/:postId/comments', authenticate, commentController.createComment);

/**
 * 更新评论
 * PUT /api/comments/:id
 * 
 * 需要登录，只能修改自己的评论
 */
router.put('/comments/:id', authenticate, commentController.updateComment);

/**
 * 删除评论
 * DELETE /api/comments/:id
 * 
 * 需要登录，只能删除自己的评论（管理员可删除任何评论）
 */
router.delete('/comments/:id', authenticate, commentController.deleteComment);

module.exports = router;

