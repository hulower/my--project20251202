/**
 * ============================================
 * 文件名：server/src/models/likeRepository.js
 * 作用：点赞数据访问层 (Repository)
 * ============================================
 */

const db = require('../config/db');

/**
 * 检查用户是否已点赞
 * @param {number} postId - 文章 ID
 * @param {number} userId - 用户 ID
 * @returns {Promise<boolean>} 是否已点赞
 */
async function hasUserLiked(postId, userId) {
  const [rows] = await db.query(
    'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
    [postId, userId]
  );
  return rows.length > 0;
}

/**
 * 获取文章的点赞数
 * @param {number} postId - 文章 ID
 * @returns {Promise<number>} 点赞数
 */
async function getLikesCount(postId) {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
    [postId]
  );
  return rows[0].count;
}

/**
 * 添加点赞
 * @param {number} postId - 文章 ID
 * @param {number} userId - 用户 ID
 * @returns {Promise<Object>} 点赞记录
 */
async function addLike(postId, userId) {
  try {
    const [result] = await db.query(
      'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
      [postId, userId]
    );
    
    return {
      id: result.insertId,
      postId,
      userId,
      createdAt: new Date(),
    };
  } catch (err) {
    // 如果违反唯一约束（已经点赞过），返回 null
    if (err.code === 'ER_DUP_ENTRY') {
      return null;
    }
    throw err;
  }
}

/**
 * 取消点赞
 * @param {number} postId - 文章 ID
 * @param {number} userId - 用户 ID
 * @returns {Promise<boolean>} 是否成功取消
 */
async function removeLike(postId, userId) {
  const [result] = await db.query(
    'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
    [postId, userId]
  );
  
  return result.affectedRows > 0;
}

/**
 * 获取用户点赞的所有文章 ID
 * @param {number} userId - 用户 ID
 * @returns {Promise<Array<number>>} 文章 ID 列表
 */
async function getUserLikedPostIds(userId) {
  const [rows] = await db.query(
    'SELECT post_id as postId FROM likes WHERE user_id = ?',
    [userId]
  );
  return rows.map(row => row.postId);
}

module.exports = {
  hasUserLiked,
  getLikesCount,
  addLike,
  removeLike,
  getUserLikedPostIds,
};

