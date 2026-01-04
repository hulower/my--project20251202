/**
 * ============================================
 * 文件名：server/src/middleware/authMiddleware.js
 * 作用：认证和授权中间件
 * ============================================
 * 
 * 中间件是什么？
 * - 在请求到达 Controller 之前执行的函数
 * - 可以验证、修改、拒绝请求
 * - 可以向 req 对象添加数据
 * 
 * 本文件包含三个中间件：
 * 1. authenticate - 验证用户身份（必须登录）
 * 2. authorize - 验证用户角色（需要特定角色）
 * 3. optionalAuth - 可选认证（登录与否都可以）
 */

const { verifyToken } = require('../utils/jwt');

// ========================================
// 1. 认证中间件 - 验证 JWT Token
// ========================================

/**
 * 认证中间件（必须登录）
 * 
 * 功能：
 * 1. 从请求头提取 Token
 * 2. 验证 Token 有效性
 * 3. 将用户信息附加到 req.user
 * 
 * 使用方式：
 * router.post('/posts', authenticate, postController.createPost);
 * 
 * 请求头格式：
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express next 函数
 */
async function authenticate(req, res, next) {
  try {
    // 1. 从请求头获取 Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      const error = new Error('未提供认证令牌，请先登录');
      error.statusCode = 401;
      throw error;
    }
    
    // 2. 检查格式是否为 "Bearer <token>"
    if (!authHeader.startsWith('Bearer ')) {
      const error = new Error('认证令牌格式错误，应为: Bearer <token>');
      error.statusCode = 401;
      throw error;
    }
    
    // 3. 提取 Token（去掉 "Bearer " 前缀）
    const token = authHeader.substring(7);
    
    if (!token) {
      const error = new Error('认证令牌不能为空');
      error.statusCode = 401;
      throw error;
    }
    
    // 4. 验证 Token
    const payload = verifyToken(token);
    
    // 5. 将用户信息附加到 req 对象
    // 后续的 Controller 可以通过 req.user 访问用户信息
    req.user = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
    
    console.log(`✅ 认证成功: ${req.user.username} (${req.user.role}) - ${req.method} ${req.originalUrl}`);
    
    // 6. 继续处理请求
    next();
  } catch (err) {
    console.error(`❌ 认证失败: ${req.method} ${req.originalUrl} - ${err.message}`);
    
    // 确保错误有状态码
    if (!err.statusCode) {
      err.statusCode = 401;
    }
    
    // 传递错误到错误处理中间件
    next(err);
  }
}

// ========================================
// 2. 授权中间件 - 验证用户角色
// ========================================

/**
 * 授权中间件（角色检查）
 * 
 * 功能：
 * 1. 检查用户是否有指定角色
 * 2. 必须在 authenticate 之后使用
 * 
 * 使用方式：
 * // 只允许管理员
 * router.delete('/posts/:id', authenticate, authorize(['admin']), postController.deletePost);
 * 
 * // 允许编辑和管理员
 * router.post('/posts', authenticate, authorize(['editor', 'admin']), postController.createPost);
 * 
 * 角色层级（从低到高）：
 * visitor（游客） < user（普通用户） < editor（编辑） < admin（管理员）
 * 
 * @param {string[]} allowedRoles - 允许的角色数组
 * @returns {Function} Express 中间件函数
 */
function authorize(allowedRoles = []) {
  // 返回一个中间件函数
  return (req, res, next) => {
    try {
      // 1. 检查是否已经通过认证
      if (!req.user) {
        const error = new Error('未认证，请先登录');
        error.statusCode = 401;
        throw error;
      }
      
      // 2. 检查角色数组是否有效
      if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
        console.warn('⚠️ authorize 中间件：allowedRoles 为空，将拒绝所有请求');
        const error = new Error('权限配置错误');
        error.statusCode = 500;
        throw error;
      }
      
      // 3. 检查用户角色是否在允许列表中
      if (!allowedRoles.includes(req.user.role)) {
        const error = new Error(
          `权限不足，需要以下角色之一：${allowedRoles.join(', ')}，当前角色：${req.user.role}`
        );
        error.statusCode = 403;  // 403 Forbidden
        throw error;
      }
      
      console.log(`✅ 授权成功: ${req.user.username} (${req.user.role}) 访问 ${req.method} ${req.originalUrl}`);
      
      // 4. 角色验证通过，继续处理
      next();
    } catch (err) {
      console.error(`❌ 授权失败: ${req.user?.username || '未知用户'} - ${err.message}`);
      
      // 确保错误有状态码
      if (!err.statusCode) {
        err.statusCode = 403;
      }
      
      next(err);
    }
  };
}

// ========================================
// 3. 可选认证中间件
// ========================================

/**
 * 可选认证中间件
 * 
 * 功能：
 * - 如果有 Token 则验证并附加用户信息
 * - 如果没有 Token 也不报错，继续处理
 * 
 * 使用场景：
 * - 公开内容，但登录用户可以看到更多信息
 * - 例如：文章列表（游客可以看，但登录用户可以看到是否已点赞）
 * 
 * 使用方式：
 * router.get('/posts/:id', optionalAuth, postController.getPost);
 * 
 * Controller 中判断：
 * if (req.user) {
 *   // 用户已登录
 * } else {
 *   // 用户未登录
 * }
 * 
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express next 函数
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    // 没有 Authorization 头，跳过认证
    if (!authHeader) {
      console.log(`ℹ️ 可选认证: 未提供 Token - ${req.method} ${req.originalUrl}`);
      return next();
    }
    
    // 检查格式
    if (!authHeader.startsWith('Bearer ')) {
      console.warn(`⚠️ 可选认证: Token 格式错误 - ${req.method} ${req.originalUrl}`);
      return next();
    }
    
    // 提取 Token
    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }
    
    // 验证 Token
    const payload = verifyToken(token);
    
    // 附加用户信息
    req.user = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
    
    console.log(`✅ 可选认证成功: ${req.user.username} - ${req.method} ${req.originalUrl}`);
    
    next();
  } catch (err) {
    // 可选认证失败不抛错，继续处理
    console.warn(`⚠️ 可选认证失败（继续处理）: ${req.method} ${req.originalUrl} - ${err.message}`);
    next();
  }
}

// ========================================
// 导出中间件
// ========================================
module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};

// ========================================
// 使用示例
// ========================================

/*
// 在路由中使用（示例）

const express = require('express');
const { authenticate, authorize, optionalAuth } = require('../middleware/authMiddleware');
const postController = require('../controllers/postController');

const router = express.Router();

// 1. 公开路由 - 不需要认证
router.get('/posts', postController.listPosts);

// 2. 可选认证路由 - 登录与否都可以访问
router.get('/posts/:id', optionalAuth, postController.getPost);

// 3. 需要登录 - 所有登录用户都可以访问
router.post('/comments', authenticate, commentController.createComment);

// 4. 需要特定角色 - 只有编辑和管理员可以创建文章
router.post('/posts', authenticate, authorize(['editor', 'admin']), postController.createPost);

// 5. 需要管理员角色 - 只有管理员可以删除用户
router.delete('/users/:id', authenticate, authorize(['admin']), userController.deleteUser);

module.exports = router;
*/


