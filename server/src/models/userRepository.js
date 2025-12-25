// server/src/models/userRepository.js
/**
 * ============================================
 * 文件名：server/src/models/userRepository.js
 * 作用：数据访问层 (Repository) - 用户
 * ============================================
 */

const db = require('../config/db');

/**
 * 根据 ID 查询用户
 * @param {number} userId - 用户 ID
 * @returns {Promise<Object|null>} 用户对象
 */
async function findUserById(userId) {
  const [rows] = await db.query(
    'SELECT id, username, email, avatar_url as avatarUrl, bio, created_at as createdAt FROM users WHERE id = ?',
    [userId]
  );
  return rows[0] || null;
}

/**
 * 更新用户头像
 * @param {number} userId - 用户 ID
 * @param {string} avatarUrl - 头像 URL 路径
 * @returns {Promise<Object>} 更新后的用户信息
 */
async function updateAvatar(userId, avatarUrl) {
  const [result] = await db.query(
    'UPDATE users SET avatar_url = ? WHERE id = ?',
    [avatarUrl, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findUserById(userId);
}

/**
 * 更新用户信息
 * @param {number} userId - 用户 ID
 * @param {Object} data - 要更新的数据
 * @returns {Promise<Object>} 更新后的用户信息
 */
async function updateUser(userId, { username, email, bio }) {
  const [result] = await db.query(
    'UPDATE users SET username = ?, email = ?, bio = ? WHERE id = ?',
    [username, email, bio, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findUserById(userId);
}

module.exports = {
  findUserById,
  updateAvatar,
  updateUser,
};

