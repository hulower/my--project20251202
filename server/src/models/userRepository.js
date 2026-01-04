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
 * @returns {Promise<Object|null>} 用户对象（不包含密码）
 */
async function findUserById(userId) {
  const [rows] = await db.query(
    'SELECT id, username, email, avatar_url as avatarUrl, bio, role, is_active as isActive, refresh_token as refreshToken, last_login as lastLogin, created_at as createdAt FROM users WHERE id = ?',
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
 * @param {Object} data - 要更新的数据（只更新传递的字段）
 * @returns {Promise<Object>} 更新后的用户信息
 */
async function updateUser(userId, data) {
  // 动态构建 SQL 语句，只更新传递的字段
  const updates = [];
  const values = [];
  
  if (data.username !== undefined) {
    updates.push('username = ?');
    values.push(data.username);
  }
  
  if (data.email !== undefined) {
    updates.push('email = ?');
    values.push(data.email);
  }
  
  if (data.bio !== undefined) {
    updates.push('bio = ?');
    values.push(data.bio);
  }
  
  // 如果没有要更新的字段，直接返回用户信息
  if (updates.length === 0) {
    return findUserById(userId);
  }
  
  // 添加 userId 到参数列表
  values.push(userId);
  
  // 执行更新
  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  const [result] = await db.query(sql, values);

  if (result.affectedRows === 0) {
    return null;
  }

  return findUserById(userId);
}

// ========================================
// 认证相关方法
// ========================================

/**
 * 根据邮箱查询用户（不包含密码）
 * @param {string} email - 邮箱
 * @returns {Promise<Object|null>} 用户对象
 */
async function findByEmail(email) {
  const [rows] = await db.query(
    'SELECT id, username, email, avatar_url as avatarUrl, bio, role, is_active as isActive, created_at as createdAt FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

/**
 * 根据邮箱查询用户（包含密码）
 * ⚠️ 仅用于登录验证
 * @param {string} email - 邮箱
 * @returns {Promise<Object|null>} 用户对象（包含密码）
 */
async function findByEmailWithPassword(email) {
  const [rows] = await db.query(
    'SELECT id, username, email, password, avatar_url as avatarUrl, bio, role, is_active as isActive, created_at as createdAt FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

/**
 * 根据用户名查询用户
 * @param {string} username - 用户名
 * @returns {Promise<Object|null>} 用户对象
 */
async function findByUsername(username) {
  const [rows] = await db.query(
    'SELECT id, username, email, role FROM users WHERE username = ?',
    [username]
  );
  return rows[0] || null;
}

/**
 * 创建用户
 * @param {Object} params - 用户信息
 * @param {string} params.username - 用户名
 * @param {string} params.email - 邮箱
 * @param {string} params.password - 加密后的密码
 * @param {string} params.role - 用户角色
 * @returns {Promise<Object>} 创建的用户信息
 */
async function createUser({ username, email, password, role = 'user' }) {
  const [result] = await db.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, password, role]
  );
  
  // 返回创建的用户信息
  return findUserById(result.insertId);
}

/**
 * 更新 Refresh Token
 * @param {number} userId - 用户 ID
 * @param {string|null} refreshToken - Refresh Token（null 表示清除）
 * @returns {Promise<void>}
 */
async function updateRefreshToken(userId, refreshToken) {
  await db.query(
    'UPDATE users SET refresh_token = ? WHERE id = ?',
    [refreshToken, userId]
  );
}

/**
 * 更新最后登录时间
 * @param {number} userId - 用户 ID
 * @returns {Promise<void>}
 */
async function updateLastLogin(userId) {
  await db.query(
    'UPDATE users SET last_login = NOW() WHERE id = ?',
    [userId]
  );
}

/**
 * 更新用户密码
 * @param {number} userId - 用户 ID
 * @param {string} hashedPassword - 加密后的新密码
 * @returns {Promise<void>}
 */
async function updatePassword(userId, hashedPassword) {
  await db.query(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, userId]
  );
}

/**
 * 删除用户
 * @param {number} userId - 用户 ID
 * @returns {Promise<void>}
 */
async function deleteUser(userId) {
  await db.query(
    'DELETE FROM users WHERE id = ?',
    [userId]
  );
}

module.exports = {
  findUserById,
  updateAvatar,
  updateUser,
  // 认证相关
  findByEmail,
  findByEmailWithPassword,
  findByUsername,
  createUser,
  updateRefreshToken,
  updateLastLogin,
  updatePassword,
  deleteUser,
};

