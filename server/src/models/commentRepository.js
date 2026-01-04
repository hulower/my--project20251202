/**
 * ============================================
 * 文件名：server/src/models/commentRepository.js
 * 作用：评论数据访问层 (Repository)
 * ============================================
 */

const db = require('../config/db');

/**
 * 获取文章的所有评论（包含用户信息）
 * @param {number} postId - 文章 ID
 * @returns {Promise<Array>} 评论列表
 */
async function findCommentsByPostId(postId) {
  const [rows] = await db.query(
    `SELECT 
      c.id,
      c.post_id as postId,
      c.user_id as userId,
      c.parent_id as parentId,
      c.content,
      c.os,
      c.browser,
      c.location,
      c.created_at as createdAt,
      c.updated_at as updatedAt,
      u.username,
      u.avatar_url as avatarUrl
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC`,
    [postId]
  );
  return rows;
}

/**
 * 根据 ID 获取评论
 * @param {number} commentId - 评论 ID
 * @returns {Promise<Object|null>} 评论对象
 */
async function findCommentById(commentId) {
  const [rows] = await db.query(
    `SELECT 
      c.id,
      c.post_id as postId,
      c.user_id as userId,
      c.parent_id as parentId,
      c.content,
      c.os,
      c.browser,
      c.location,
      c.created_at as createdAt,
      c.updated_at as updatedAt,
      u.username,
      u.avatar_url as avatarUrl
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?`,
    [commentId]
  );
  return rows[0] || null;
}

/**
 * 创建评论
 * @param {Object} params - 评论信息
 * @param {number} params.postId - 文章 ID
 * @param {number} params.userId - 用户 ID
 * @param {string} params.content - 评论内容
 * @param {number} [params.parentId] - 父评论 ID（可选）
 * @param {string} [params.os] - 操作系统
 * @param {string} [params.browser] - 浏览器
 * @param {string} [params.location] - 地理位置
 * @returns {Promise<Object>} 创建的评论
 */
async function createComment({ postId, userId, content, parentId = null, os = null, browser = null, location = null }) {
  const [result] = await db.query(
    'INSERT INTO comments (post_id, user_id, content, parent_id, os, browser, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [postId, userId, content, parentId, os, browser, location]
  );
  
  return findCommentById(result.insertId);
}

/**
 * 更新评论内容
 * @param {number} commentId - 评论 ID
 * @param {string} content - 新内容
 * @returns {Promise<Object|null>} 更新后的评论
 */
async function updateComment(commentId, content) {
  const [result] = await db.query(
    'UPDATE comments SET content = ? WHERE id = ?',
    [content, commentId]
  );
  
  if (result.affectedRows === 0) {
    return null;
  }
  
  return findCommentById(commentId);
}

/**
 * 删除评论
 * @param {number} commentId - 评论 ID
 * @returns {Promise<void>}
 */
async function deleteComment(commentId) {
  await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
}

/**
 * 获取评论的回复
 * @param {number} parentId - 父评论 ID
 * @returns {Promise<Array>} 回复列表
 */
async function findRepliesByParentId(parentId) {
  const [rows] = await db.query(
    `SELECT 
      c.id,
      c.post_id as postId,
      c.user_id as userId,
      c.parent_id as parentId,
      c.content,
      c.os,
      c.browser,
      c.location,
      c.created_at as createdAt,
      c.updated_at as updatedAt,
      u.username,
      u.avatar_url as avatarUrl
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.parent_id = ?
    ORDER BY c.created_at ASC`,
    [parentId]
  );
  return rows;
}

module.exports = {
  findCommentsByPostId,
  findCommentById,
  createComment,
  updateComment,
  deleteComment,
  findRepliesByParentId,
};

