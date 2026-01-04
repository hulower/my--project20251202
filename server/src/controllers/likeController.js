/**
 * ============================================
 * 文件名：server/src/controllers/likeController.js
 * 作用：点赞控制器层 (Controller)
 * ============================================
 */

const likeService = require('../services/likeService');
const Response = require('../utils/response');

/**
 * 切换点赞状态
 * POST /api/posts/:postId/like
 */
async function toggleLike(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;
    
    console.log('📥 切换点赞:', { postId, userId });
    
    const result = await likeService.toggleLike(postId, userId);
    
    Response.success(res, result, result.liked ? '点赞成功' : '取消点赞成功');
  } catch (err) {
    console.error('❌ 点赞操作失败:', err);
    next(err);
  }
}

/**
 * 获取点赞状态
 * GET /api/posts/:postId/like
 */
async function getLikeStatus(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user?.id;  // 可能未登录
    
    console.log('📥 获取点赞状态:', { postId, userId });
    
    const result = await likeService.getLikeStatus(postId, userId);
    
    Response.success(res, result, '获取点赞状态成功');
  } catch (err) {
    console.error('❌ 获取点赞状态失败:', err);
    next(err);
  }
}

/**
 * 获取用户点赞的文章列表
 * GET /api/users/:userId/liked-posts
 */
async function getUserLikedPosts(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    
    console.log('📥 获取用户点赞列表:', { userId });
    
    const postIds = await likeService.getUserLikedPosts(userId);
    
    Response.success(res, postIds, '获取点赞列表成功');
  } catch (err) {
    console.error('❌ 获取点赞列表失败:', err);
    next(err);
  }
}

module.exports = {
  toggleLike,
  getLikeStatus,
  getUserLikedPosts,
};

