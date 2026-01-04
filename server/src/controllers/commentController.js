/**
 * ============================================
 * 文件名：server/src/controllers/commentController.js
 * 作用：评论控制器层 (Controller)
 * ============================================
 */

const commentService = require('../services/commentService');
const Response = require('../utils/response');
const { getClientIP, getLocationByIP } = require('../utils/geoip');

/**
 * 获取文章的所有评论
 * GET /api/posts/:postId/comments
 */
async function getComments(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    console.log('📥 获取评论:', { postId });
    
    const comments = await commentService.getCommentsByPostId(postId);
    
    Response.success(res, comments, '获取评论成功');
  } catch (err) {
    console.error('❌ 获取评论失败:', err);
    next(err);
  }
}

/**
 * 创建评论
 * POST /api/posts/:postId/comments
 * 
 * 请求体：
 * {
 *   "content": "评论内容",
 *   "parentId": 1  // 可选，回复评论时提供
 * }
 */
async function createComment(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;  // 从认证中间件获取
    const { content, parentId, os, browser } = req.body;
    
    // 获取客户端 IP 地址
    const clientIP = getClientIP(req);
    
    // 通过 IP 获取地理位置
    const geoLocation = getLocationByIP(clientIP);
    const location = geoLocation ? geoLocation.display : null;
    
    console.log('📥 创建评论:', { postId, userId, parentId, os, browser, ip: clientIP, location });
    
    const comment = await commentService.createComment({
      postId,
      userId,
      content,
      parentId: parentId ? Number(parentId) : null,
      os,
      browser,
      location,
    });
    
    Response.success(res, comment, '评论发布成功', 201);
  } catch (err) {
    console.error('❌ 创建评论失败:', err);
    next(err);
  }
}

/**
 * 更新评论
 * PUT /api/comments/:id
 * 
 * 请求体：
 * {
 *   "content": "新的评论内容"
 * }
 */
async function updateComment(req, res, next) {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user.id;
    const { content } = req.body;
    
    console.log('📥 更新评论:', { commentId, userId });
    
    const comment = await commentService.updateComment(commentId, userId, content);
    
    Response.success(res, comment, '评论更新成功');
  } catch (err) {
    console.error('❌ 更新评论失败:', err);
    next(err);
  }
}

/**
 * 删除评论
 * DELETE /api/comments/:id
 */
async function deleteComment(req, res, next) {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('📥 删除评论:', { commentId, userId, userRole });
    
    await commentService.deleteComment(commentId, userId, userRole);
    
    Response.success(res, null, '评论删除成功');
  } catch (err) {
    console.error('❌ 删除评论失败:', err);
    next(err);
  }
}

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};

