/**
 * ============================================
 * 文件名：server/src/services/authService.js
 * 作用：认证服务 - 业务逻辑层
 * ============================================
 * 
 * Service 层职责：
 * 1. 实现核心业务逻辑
 * 2. 数据验证和处理
 * 3. 调用 Repository 层访问数据库
 * 4. 处理业务异常
 * 
 * 这一层是整个认证系统的核心！
 */

const userRepository = require('../models/userRepository');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');

class AuthService {
  // ========================================
  // 1. 用户注册
  // ========================================
  
  /**
   * 用户注册
   * 
   * 流程：
   * 1. 检查用户是否已存在
   * 2. 加密密码
   * 3. 创建用户
   * 4. 生成 Token
   * 5. 返回用户信息和 Token
   * 
   * @param {Object} params - 注册参数
   * @param {string} params.username - 用户名
   * @param {string} params.email - 邮箱
   * @param {string} params.password - 密码（明文）
   * @returns {Promise<Object>} { user, accessToken, refreshToken }
   */
  async register({ username, email, password }) {
    try {
      console.log('🔄 开始注册流程:', { username, email });
      
      // ========================================
      // 1. 检查邮箱是否已被注册
      // ========================================
      const existingUserByEmail = await userRepository.findByEmail(email);
      if (existingUserByEmail) {
        const error = new Error('该邮箱已被注册');
        error.statusCode = 409;  // 409 Conflict
        throw error;
      }
      
      // ========================================
      // 2. 检查用户名是否已被占用
      // ========================================
      const existingUserByUsername = await userRepository.findByUsername(username);
      if (existingUserByUsername) {
        const error = new Error('该用户名已被占用');
        error.statusCode = 409;
        throw error;
      }
      
      // ========================================
      // 3. 加密密码
      // ========================================
      console.log('🔐 正在加密密码...');
      const hashedPassword = await hashPassword(password);
      
      // ========================================
      // 4. 创建用户
      // ========================================
      console.log('📝 正在创建用户...');
      const user = await userRepository.createUser({
        username,
        email,
        password: hashedPassword,
        role: 'user',  // 新用户默认角色为普通用户
      });
      
      console.log('✅ 用户创建成功:', user.username);
      
      // ========================================
      // 5. 生成 Token
      // ========================================
      console.log('🎫 正在生成 Token...');
      const accessToken = generateAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
      
      const refreshToken = generateRefreshToken({
        id: user.id,
      });
      
      // ========================================
      // 6. 保存 Refresh Token 到数据库
      // ========================================
      await userRepository.updateRefreshToken(user.id, refreshToken);
      
      console.log('✅ 注册流程完成:', user.username);
      
      // ========================================
      // 7. 返回结果（不包含密码）
      // ========================================
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      };
    } catch (err) {
      console.error('❌ 注册失败:', err.message);
      throw err;
    }
  }
  
  // ========================================
  // 2. 用户登录
  // ========================================
  
  /**
   * 用户登录
   * 
   * 流程：
   * 1. 查找用户
   * 2. 验证密码
   * 3. 检查账号状态
   * 4. 生成 Token
   * 5. 更新最后登录时间
   * 6. 返回用户信息和 Token
   * 
   * @param {Object} params - 登录参数
   * @param {string} params.email - 邮箱
   * @param {string} params.password - 密码（明文）
   * @returns {Promise<Object>} { user, accessToken, refreshToken }
   */
  async login({ email, password }) {
    try {
      console.log('🔄 开始登录流程:', { email });
      
      // ========================================
      // 1. 根据邮箱查找用户（包含密码）
      // ========================================
      const user = await userRepository.findByEmailWithPassword(email);
      
      if (!user) {
        // ⚠️ 安全提示：不要告诉用户具体是邮箱不存在还是密码错误
        // 这样可以防止攻击者枚举用户账号
        const error = new Error('邮箱或密码错误');
        error.statusCode = 401;  // 401 Unauthorized
        throw error;
      }
      
      console.log('✅ 找到用户:', user.username);
      
      // ========================================
      // 2. 验证密码
      // ========================================
      console.log('🔐 正在验证密码...');
      const isPasswordValid = await verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        const error = new Error('邮箱或密码错误');
        error.statusCode = 401;
        throw error;
      }
      
      console.log('✅ 密码验证成功');
      
      // ========================================
      // 3. 检查账号是否被禁用
      // ========================================
      if (!user.isActive) {
        const error = new Error('账号已被禁用，请联系管理员');
        error.statusCode = 403;  // 403 Forbidden
        throw error;
      }
      
      // ========================================
      // 4. 生成 Token
      // ========================================
      console.log('🎫 正在生成 Token...');
      const accessToken = generateAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
      
      const refreshToken = generateRefreshToken({
        id: user.id,
      });
      
      // ========================================
      // 5. 保存 Refresh Token 和更新登录时间
      // ========================================
      await userRepository.updateRefreshToken(user.id, refreshToken);
      await userRepository.updateLastLogin(user.id);
      
      console.log('✅ 登录流程完成:', user.username);
      
      // ========================================
      // 6. 返回结果（不包含密码）
      // ========================================
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          createdAt: user.createdAt,
          lastLogin: new Date(),
        },
        accessToken,
        refreshToken,
      };
    } catch (err) {
      console.error('❌ 登录失败:', err.message);
      throw err;
    }
  }
  
  // ========================================
  // 3. 刷新 Token
  // ========================================
  
  /**
   * 刷新 Access Token
   * 
   * 流程：
   * 1. 验证 Refresh Token
   * 2. 从数据库验证 Refresh Token
   * 3. 生成新的 Access Token
   * 
   * @param {string} refreshToken - Refresh Token
   * @returns {Promise<Object>} { accessToken }
   */
  async refreshToken(refreshToken) {
    try {
      console.log('🔄 开始刷新 Token 流程');
      
      // ========================================
      // 1. 验证 Refresh Token 格式和有效期
      // ========================================
      const payload = verifyToken(refreshToken);
      console.log('✅ Refresh Token 验证成功, 用户 ID:', payload.id);
      
      // ========================================
      // 2. 从数据库查找用户并验证 Refresh Token
      // ========================================
      const user = await userRepository.findUserById(payload.id);
      
      if (!user) {
        const error = new Error('用户不存在');
        error.statusCode = 404;
        throw error;
      }
      
      // 验证数据库中的 Refresh Token 是否匹配
      if (user.refreshToken !== refreshToken) {
        const error = new Error('Refresh Token 无效或已失效');
        error.statusCode = 401;
        throw error;
      }
      
      // 检查账号是否被禁用
      if (!user.isActive) {
        const error = new Error('账号已被禁用');
        error.statusCode = 403;
        throw error;
      }
      
      console.log('✅ 数据库验证通过:', user.username);
      
      // ========================================
      // 3. 生成新的 Access Token
      // ========================================
      const newAccessToken = generateAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
      
      console.log('✅ 刷新 Token 流程完成');
      
      // ========================================
      // 4. 返回新的 Access Token
      // ========================================
      return {
        accessToken: newAccessToken,
      };
    } catch (err) {
      console.error('❌ 刷新 Token 失败:', err.message);
      throw err;
    }
  }
  
  // ========================================
  // 4. 用户登出
  // ========================================
  
  /**
   * 用户登出
   * 
   * 流程：
   * 1. 清除数据库中的 Refresh Token
   * 2. 前端需要删除本地存储的 Token
   * 
   * @param {number} userId - 用户 ID
   * @returns {Promise<void>}
   */
  async logout(userId) {
    try {
      console.log('🔄 开始登出流程, 用户 ID:', userId);
      
      // ========================================
      // 清除数据库中的 Refresh Token
      // ========================================
      await userRepository.updateRefreshToken(userId, null);
      
      console.log('✅ 登出流程完成');
    } catch (err) {
      console.error('❌ 登出失败:', err.message);
      throw err;
    }
  }
  
  // ========================================
  // 5. 获取用户信息
  // ========================================
  
  /**
   * 根据 ID 获取用户信息
   * 
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} 用户信息（不包含密码）
   */
  async getUserById(userId) {
    try {
      const user = await userRepository.findUserById(userId);
      
      if (!user) {
        const error = new Error('用户不存在');
        error.statusCode = 404;
        throw error;
      }
      
      return user;
    } catch (err) {
      console.error('❌ 获取用户信息失败:', err.message);
      throw err;
    }
  }
  
  // ========================================
  // 6. 修改密码
  // ========================================
  
  /**
   * 修改密码
   * 
   * 流程：
   * 1. 验证当前密码
   * 2. 加密新密码
   * 3. 更新密码
   * 4. 清除 Refresh Token（强制重新登录）
   * 
   * @param {number} userId - 用户 ID
   * @param {string} currentPassword - 当前密码（明文）
   * @param {string} newPassword - 新密码（明文）
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      console.log('🔄 开始修改密码流程, 用户 ID:', userId);
      
      // ========================================
      // 1. 获取用户信息（包含密码）
      // ========================================
      const user = await userRepository.findUserById(userId);
      
      if (!user) {
        const error = new Error('用户不存在');
        error.statusCode = 404;
        throw error;
      }
      
      // 从数据库获取用户的完整信息（包括密码）
      const [rows] = await require('../config/db').query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );
      
      if (!rows || rows.length === 0) {
        const error = new Error('用户不存在');
        error.statusCode = 404;
        throw error;
      }
      
      const userPassword = rows[0].password;
      
      // ========================================
      // 2. 验证当前密码
      // ========================================
      console.log('🔐 正在验证当前密码...');
      const isPasswordValid = await verifyPassword(currentPassword, userPassword);
      
      if (!isPasswordValid) {
        const error = new Error('当前密码不正确');
        error.statusCode = 401;
        throw error;
      }
      
      console.log('✅ 当前密码验证成功');
      
      // ========================================
      // 3. 加密新密码
      // ========================================
      console.log('🔐 正在加密新密码...');
      const hashedNewPassword = await hashPassword(newPassword);
      
      // ========================================
      // 4. 更新密码
      // ========================================
      await userRepository.updatePassword(userId, hashedNewPassword);
      
      // ========================================
      // 5. 清除 Refresh Token（强制重新登录）
      // ========================================
      await userRepository.updateRefreshToken(userId, null);
      
      console.log('✅ 密码修改成功');
    } catch (err) {
      console.error('❌ 修改密码失败:', err.message);
      throw err;
    }
  }
  
  // ========================================
  // 7. 删除账号
  // ========================================
  
  /**
   * 删除账号
   * 
   * 流程：
   * 1. 验证用户存在
   * 2. 删除用户数据
   * 
   * ⚠️ 注意：这是一个危险操作，会永久删除用户数据
   * 
   * @param {number} userId - 用户 ID
   * @returns {Promise<void>}
   */
  async deleteAccount(userId) {
    try {
      console.log('🔄 开始删除账号流程, 用户 ID:', userId);
      
      // ========================================
      // 1. 验证用户存在
      // ========================================
      const user = await userRepository.findUserById(userId);
      
      if (!user) {
        const error = new Error('用户不存在');
        error.statusCode = 404;
        throw error;
      }
      
      console.log('⚠️ 正在删除用户:', user.username);
      
      // ========================================
      // 2. 删除用户
      // ========================================
      await userRepository.deleteUser(userId);
      
      console.log('✅ 账号删除成功');
    } catch (err) {
      console.error('❌ 删除账号失败:', err.message);
      throw err;
    }
  }

  // ========================================
  // 8. 重置密码
  // ========================================

  /**
   * 重置密码（直接邮箱 + 新密码，无需邮件验证）
   *
   * 流程：
   * 1. 根据邮箱查找用户
   * 2. 加密新密码并更新
   * 3. 清除 Refresh Token（强制重新登录）
   *
   * @param {string} email - 用户邮箱
   * @param {string} newPassword - 新密码（明文）
   * @returns {Promise<void>}
   */
  async resetPassword(email, newPassword) {
    try {
      console.log('🔄 开始重置密码流程:', { email });

      const user = await userRepository.findByEmailWithPassword(email);

      if (!user) {
        const error = new Error('该邮箱未注册');
        error.statusCode = 404;
        throw error;
      }

      // 校验新密码不能与旧密码相同
      const isSamePassword = await verifyPassword(newPassword, user.password);
      if (isSamePassword) {
        const error = new Error('新密码不能与旧密码相同');
        error.statusCode = 400;
        throw error;
      }

      const hashedPassword = await hashPassword(newPassword);
      await userRepository.updatePassword(user.id, hashedPassword);

      // 清除 Refresh Token，强制重新登录
      await userRepository.updateRefreshToken(user.id, null);

      console.log('✅ 重置密码流程完成:', user.username);
    } catch (err) {
      console.error('❌ 重置密码失败:', err.message);
      throw err;
    }
  }
}

// ========================================
// 导出服务实例（单例模式）
// ========================================
module.exports = new AuthService();


