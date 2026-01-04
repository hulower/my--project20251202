/**
 * ============================================
 * 文件名：server/src/services/likeService.js
 * 作用：点赞业务逻辑层 (Service)
 * ============================================
 */

const likeRepository = require('../models/likeRepository');
const postRepository = require('../models/postRepository');

class LikeService {
  /**
   * 切换点赞状态（点赞/取消点赞）
   * @param {number} postId - 文章 ID
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} { liked: boolean, likesCount: number }
   */
  async toggleLike(postId, userId) {
    // 1. 验证文章是否存在
    const post = await postRepository.findPostById(postId);
    if (!post) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }
    
    // 2. 检查用户是否已点赞
    const hasLiked = await likeRepository.hasUserLiked(postId, userId);
    
    let liked;
    if (hasLiked) {
      // 取消点赞
      await likeRepository.removeLike(postId, userId);
      liked = false;
      console.log('✅ 取消点赞:', { postId, userId });
    } else {
      // 添加点赞
      await likeRepository.addLike(postId, userId);
      liked = true;
      console.log('✅ 点赞成功:', { postId, userId });
    }
    
    // 3. 获取最新的点赞数
    const likesCount = await likeRepository.getLikesCount(postId);
    
    return {
      liked,
      likesCount,
    };
  }
  
  /**
   * 获取文章的点赞状态和数量
   * @param {number} postId - 文章 ID
   * @param {number} [userId] - 用户 ID（可选）
   * @returns {Promise<Object>} { liked: boolean, likesCount: number }
   */
  async getLikeStatus(postId, userId) {
    // 1. 验证文章是否存在
    const post = await postRepository.findPostById(postId);
    if (!post) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }
    
    // 2. 获取点赞数
    const likesCount = await likeRepository.getLikesCount(postId);
    
    // 3. 如果提供了用户 ID，检查是否已点赞
    let liked = false;
    if (userId) {
      liked = await likeRepository.hasUserLiked(postId, userId);
    }
    
    return {
      liked,
      likesCount,
    };
  }
  
  /**
   * 获取用户点赞的所有文章 ID
   * @param {number} userId - 用户 ID
   * @returns {Promise<Array<number>>} 文章 ID 列表
   */
  async getUserLikedPosts(userId) {
    return await likeRepository.getUserLikedPostIds(userId);
  }
}

module.exports = new LikeService();

