/**
 * ============================================
 * 文件名：server/src/services/commentService.js
 * 作用：评论业务逻辑层 (Service)
 * ============================================
 */

const commentRepository = require('../models/commentRepository');
const postRepository = require('../models/postRepository');
const userRepository = require('../models/userRepository');

class CommentService {
  /**
   * 获取文章的所有评论（树形结构）
   * @param {number} postId - 文章 ID
   * @returns {Promise<Array>} 评论树
   */
  async getCommentsByPostId(postId) {
    // 1. 验证文章是否存在
    const post = await postRepository.findPostById(postId);
    if (!post) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }
    
    // 2. 获取所有评论
    const comments = await commentRepository.findCommentsByPostId(postId);
    
    // 3. 构建树形结构
    const commentMap = new Map();
    const rootComments = [];
    
    // 先将所有评论放入 Map
    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });
    
    // 构建树形结构
    comments.forEach(comment => {
      if (comment.parentId) {
        // 这是一个回复
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        // 这是一个顶级评论
        rootComments.push(comment);
      }
    });
    
    return rootComments;
  }
  
  /**
   * 创建评论
   * @param {Object} params - 评论参数
   * @returns {Promise<Object>} 创建的评论
   */
  async createComment({ postId, userId, content, parentId, os, browser, location }) {
    // 1. 验证文章是否存在
    const post = await postRepository.findPostById(postId);
    if (!post) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }
    
    // 2. 验证用户是否存在
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error('用户不存在');
      error.statusCode = 404;
      throw error;
    }
    
    // 3. 如果是回复，验证父评论是否存在
    if (parentId) {
      const parentComment = await commentRepository.findCommentById(parentId);
      if (!parentComment) {
        const error = new Error('父评论不存在');
        error.statusCode = 404;
        throw error;
      }
      
      // 验证父评论是否属于同一篇文章
      if (parentComment.postId !== postId) {
        const error = new Error('父评论不属于该文章');
        error.statusCode = 400;
        throw error;
      }
    }
    
    // 4. 验证评论内容
    if (!content || content.trim().length === 0) {
      const error = new Error('评论内容不能为空');
      error.statusCode = 400;
      throw error;
    }
    
    if (content.length > 1000) {
      const error = new Error('评论内容不能超过1000个字符');
      error.statusCode = 400;
      throw error;
    }
    
    // 5. 创建评论
    const comment = await commentRepository.createComment({
      postId,
      userId,
      content: content.trim(),
      parentId,
      os,
      browser,
      location,
    });
    
    console.log('✅ 评论创建成功:', comment.id);
    return comment;
  }
  
  /**
   * 更新评论
   * @param {number} commentId - 评论 ID
   * @param {number} userId - 用户 ID（用于权限验证）
   * @param {string} content - 新内容
   * @returns {Promise<Object>} 更新后的评论
   */
  async updateComment(commentId, userId, content) {
    // 1. 验证评论是否存在
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) {
      const error = new Error('评论不存在');
      error.statusCode = 404;
      throw error;
    }
    
    // 2. 验证权限（只能修改自己的评论）
    if (comment.userId !== userId) {
      const error = new Error('没有权限修改此评论');
      error.statusCode = 403;
      throw error;
    }
    
    // 3. 验证内容
    if (!content || content.trim().length === 0) {
      const error = new Error('评论内容不能为空');
      error.statusCode = 400;
      throw error;
    }
    
    if (content.length > 1000) {
      const error = new Error('评论内容不能超过1000个字符');
      error.statusCode = 400;
      throw error;
    }
    
    // 4. 更新评论
    const updatedComment = await commentRepository.updateComment(commentId, content.trim());
    
    console.log('✅ 评论更新成功:', commentId);
    return updatedComment;
  }
  
  /**
   * 删除评论
   * @param {number} commentId - 评论 ID
   * @param {number} userId - 用户 ID（用于权限验证）
   * @param {string} userRole - 用户角色
   * @returns {Promise<void>}
   */
  async deleteComment(commentId, userId, userRole) {
    // 1. 验证评论是否存在
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) {
      const error = new Error('评论不存在');
      error.statusCode = 404;
      throw error;
    }
    
    // 2. 验证权限（只能删除自己的评论，或者管理员可以删除任何评论）
    const isOwner = comment.userId === userId;
    const isAdmin = userRole === 'admin' || userRole === 'editor';
    
    if (!isOwner && !isAdmin) {
      const error = new Error('没有权限删除此评论');
      error.statusCode = 403;
      throw error;
    }
    
    // 3. 删除评论（CASCADE 会自动删除子评论）
    await commentRepository.deleteComment(commentId);
    
    console.log('✅ 评论删除成功:', commentId);
  }
}

module.exports = new CommentService();

