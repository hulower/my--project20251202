/**
 * ============================================
 * 文件名：server/src/routes/likeRoutes.js
 * 作用：点赞路由配置
 * ============================================
 */

const express = require('express');
const likeController = require('../controllers/likeController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// ========================================
// 点赞路由
// ========================================

/**
 * 切换点赞状态（点赞/取消点赞）
 * POST /api/posts/:postId/like
 * 
 * 需要登录
 */
router.post('/posts/:postId/like', authenticate, likeController.toggleLike);

/**
 * 获取点赞状态
 * GET /api/posts/:postId/like
 * 
 * 可选登录（登录后显示用户是否点赞）
 */
router.get('/posts/:postId/like', optionalAuth, likeController.getLikeStatus);

/**
 * 获取用户点赞的文章列表
 * GET /api/users/:userId/liked-posts
 * 
 * 公开接口
 */
router.get('/users/:userId/liked-posts', likeController.getUserLikedPosts);

module.exports = router;

