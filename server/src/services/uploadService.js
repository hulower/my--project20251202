// server/src/services/uploadService.js
/**
 * ============================================
 * 文件名：server/src/services/uploadService.js
 * 作用：业务逻辑层 (Service) - 文件上传
 * ============================================
 */

const userService = require('./userService');

class UploadService {
  /**
   * 处理头像上传
   * @param {number} userId - 用户 ID
   * @param {string} avatarPath - 头像相对路径
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async handleAvatarUpload(userId, avatarPath) {
    // 保存头像路径到数据库
    return await userService.updateUserAvatar(userId, avatarPath);
  }
}

module.exports = new UploadService();

