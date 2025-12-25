// server/src/services/userService.js
/**
 * ============================================
 * 文件名：server/src/services/userService.js
 * 作用：业务逻辑层 (Service) - 用户
 * ============================================
 */

const userRepository = require('../models/userRepository');

class UserService {
  /**
   * 获取用户信息
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} 用户对象
   */
  async getUserById(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error('用户不存在');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * 更新用户头像
   * @param {number} userId - 用户 ID
   * @param {string} avatarUrl - 头像 URL
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async updateUserAvatar(userId, avatarUrl) {
    const user = await userRepository.updateAvatar(userId, avatarUrl);
    if (!user) {
      const error = new Error('用户不存在');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户 ID
   * @param {Object} data - 要更新的数据
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async updateUser(userId, data) {
    // 数据验证
    if (data.username && data.username.trim().length < 2) {
      const error = new Error('用户名至少2个字符');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.updateUser(userId, data);
    if (!user) {
      const error = new Error('用户不存在');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new UserService();

