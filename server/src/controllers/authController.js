/**
 * ============================================
 * 文件名：server/src/controllers/authController.js
 * 作用：认证控制器 - 处理注册、登录、登出等请求
 * ============================================
 * 
 * Controller 层职责：
 * 1. 接收 HTTP 请求
 * 2. 验证请求参数
 * 3. 调用 Service 层处理业务逻辑
 * 4. 返回统一格式的响应
 * 
 * ⚠️ Controller 不应该包含业务逻辑，只负责请求/响应处理
 */

const authService = require('../services/authService');
const Response = require('../utils/response');

// ========================================
// 1. 用户注册
// ========================================

/**
 * 用户注册
 * POST /api/auth/register
 * 
 * 请求体：
 * {
 *   "username": "张三",
 *   "email": "zhangsan@example.com",
 *   "password": "myPassword123"
 * }
 * 
 * 响应：
 * {
 *   "code": 201,
 *   "success": true,
 *   "message": "注册成功",
 *   "data": {
 *     "user": { id, username, email, role },
 *     "accessToken": "eyJhbGci...",
 *     "refreshToken": "eyJhbGci..."
 *   }
 * }
 */
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    
    console.log('📥 收到注册请求:', { username, email });
    
    // ========================================
    // 参数验证
    // ========================================
    
    // 1. 检查必需字段
    if (!username || !email || !password) {
      const error = new Error('用户名、邮箱和密码不能为空');
      error.statusCode = 400;
      throw error;
    }
    
    // 2. 验证用户名格式
    if (username.trim().length < 2) {
      const error = new Error('用户名至少2个字符');
      error.statusCode = 400;
      throw error;
    }
    
    if (username.trim().length > 50) {
      const error = new Error('用户名最多50个字符');
      error.statusCode = 400;
      throw error;
    }
    
    // 3. 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('邮箱格式不正确');
      error.statusCode = 400;
      throw error;
    }
    
    // 4. 验证密码强度
    if (password.length < 6) {
      const error = new Error('密码至少6个字符');
      error.statusCode = 400;
      throw error;
    }
    
    if (password.length > 100) {
      const error = new Error('密码最多100个字符');
      error.statusCode = 400;
      throw error;
    }
    
    // ========================================
    // 调用 Service 处理业务逻辑
    // ========================================
    const result = await authService.register({
      username: username.trim(),
      email: email.trim().toLowerCase(),  // 邮箱转小写
      password,
    });
    
    console.log('✅ 注册成功:', result.user.username);
    
    // ========================================
    // 返回响应
    // ========================================
    Response.success(res, result, '注册成功', 201);
  } catch (err) {
    console.error('❌ 注册失败:', err.message);
    next(err);
  }
}

// ========================================
// 2. 用户登录
// ========================================

/**
 * 用户登录
 * POST /api/auth/login
 * 
 * 请求体：
 * {
 *   "email": "zhangsan@example.com",
 *   "password": "myPassword123"
 * }
 * 
 * 响应：
 * {
 *   "code": 200,
 *   "success": true,
 *   "message": "登录成功",
 *   "data": {
 *     "user": { id, username, email, role, avatarUrl },
 *     "accessToken": "eyJhbGci...",
 *     "refreshToken": "eyJhbGci..."
 *   }
 * }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    console.log('📥 收到登录请求:', { email });
    
    // ========================================
    // 参数验证
    // ========================================
    if (!email || !password) {
      const error = new Error('邮箱和密码不能为空');
      error.statusCode = 400;
      throw error;
    }
    
    // ========================================
    // 调用 Service 处理登录
    // ========================================
    const result = await authService.login({
      email: email.trim().toLowerCase(),
      password,
    });
    
    console.log('✅ 登录成功:', result.user.username);
    
    // ========================================
    // 返回响应
    // ========================================
    Response.success(res, result, '登录成功');
  } catch (err) {
    console.error('❌ 登录失败:', err.message);
    next(err);
  }
}

// ========================================
// 3. 刷新 Token
// ========================================

/**
 * 刷新 Access Token
 * POST /api/auth/refresh
 * 
 * 请求体：
 * {
 *   "refreshToken": "eyJhbGci..."
 * }
 * 
 * 响应：
 * {
 *   "code": 200,
 *   "success": true,
 *   "message": "Token 刷新成功",
 *   "data": {
 *     "accessToken": "eyJhbGci..."
 *   }
 * }
 * 
 * 使用场景：
 * - Access Token 过期时，用 Refresh Token 获取新的 Access Token
 * - 避免用户频繁登录
 */
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    
    console.log('📥 收到刷新 Token 请求');
    
    // ========================================
    // 参数验证
    // ========================================
    if (!refreshToken) {
      const error = new Error('Refresh Token 不能为空');
      error.statusCode = 400;
      throw error;
    }
    
    // ========================================
    // 调用 Service 刷新 Token
    // ========================================
    const result = await authService.refreshToken(refreshToken);
    
    console.log('✅ Token 刷新成功');
    
    // ========================================
    // 返回响应
    // ========================================
    Response.success(res, result, 'Token 刷新成功');
  } catch (err) {
    console.error('❌ Token 刷新失败:', err.message);
    next(err);
  }
}

// ========================================
// 4. 用户登出
// ========================================

/**
 * 用户登出
 * POST /api/auth/logout
 * 
 * 请求头：
 * Authorization: Bearer <accessToken>
 * 
 * 响应：
 * {
 *   "code": 200,
 *   "success": true,
 *   "message": "登出成功",
 *   "data": null
 * }
 * 
 * 工作原理：
 * 1. 从 req.user 获取用户 ID（由 authenticate 中间件提供）
 * 2. 清除数据库中的 refresh_token
 * 3. 前端需要删除本地存储的 Token
 */
async function logout(req, res, next) {
  try {
    const userId = req.user.id;
    
    console.log('📥 收到登出请求:', { userId, username: req.user.username });
    
    // ========================================
    // 调用 Service 处理登出
    // ========================================
    await authService.logout(userId);
    
    console.log('✅ 登出成功:', req.user.username);
    
    // ========================================
    // 返回响应
    // ========================================
    Response.success(res, null, '登出成功');
  } catch (err) {
    console.error('❌ 登出失败:', err.message);
    next(err);
  }
}

// ========================================
// 5. 获取当前用户信息
// ========================================

/**
 * 获取当前登录用户信息
 * GET /api/auth/me
 * 
 * 请求头：
 * Authorization: Bearer <accessToken>
 * 
 * 响应：
 * {
 *   "code": 200,
 *   "success": true,
 *   "message": "获取用户信息成功",
 *   "data": {
 *     "id": 1,
 *     "username": "张三",
 *     "email": "zhangsan@example.com",
 *     "role": "editor",
 *     "avatarUrl": "/uploads/avatars/xxx.jpg",
 *     "bio": "个人简介",
 *     "createdAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 * 
 * 使用场景：
 * - 前端初始化时获取用户信息
 * - 刷新页面后恢复用户状态
 */
async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user.id;
    
    console.log('📥 获取当前用户信息:', { userId, username: req.user.username });
    
    // ========================================
    // 调用 Service 获取完整用户信息
    // ========================================
    const user = await authService.getUserById(userId);
    
    console.log('✅ 获取用户信息成功:', user.username);
    
    // ========================================
    // 返回响应
    // ========================================
    Response.success(res, user, '获取用户信息成功');
  } catch (err) {
    console.error('❌ 获取用户信息失败:', err.message);
    next(err);
  }
}

// ========================================
// 6. 修改密码
// ========================================

/**
 * 修改密码
 * POST /api/auth/change-password
 * 
 * 请求头：
 * Authorization: Bearer <accessToken>
 * 
 * 请求体：
 * {
 *   "currentPassword": "oldPass123",
 *   "newPassword": "newPass456"
 * }
 * 
 * 响应：
 * {
 *   "code": 200,
 *   "success": true,
 *   "message": "密码修改成功",
 *   "data": null
 * }
 */
async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    console.log('📥 收到修改密码请求:', { userId, username: req.user.username });
    
    // ========================================
    // 参数验证
    // ========================================
    if (!currentPassword || !newPassword) {
      const error = new Error('当前密码和新密码不能为空');
      error.statusCode = 400;
      throw error;
    }
    
    if (newPassword.length < 6) {
      const error = new Error('新密码至少6个字符');
      error.statusCode = 400;
      throw error;
    }
    
    if (newPassword.length > 100) {
      const error = new Error('新密码最多100个字符');
      error.statusCode = 400;
      throw error;
    }
    
    if (currentPassword === newPassword) {
      const error = new Error('新密码不能与当前密码相同');
      error.statusCode = 400;
      throw error;
    }
    
    // ========================================
    // 调用 Service 处理业务逻辑
    // ========================================
    await authService.changePassword(userId, currentPassword, newPassword);
    
    console.log('✅ 密码修改成功:', req.user.username);
    
    // ========================================
    // 返回响应
    // ========================================
    Response.success(res, null, '密码修改成功，请重新登录');
  } catch (err) {
    console.error('❌ 修改密码失败:', err.message);
    next(err);
  }
}

// ========================================
// 7. 删除账号
// ========================================

/**
 * 删除账号
 * DELETE /api/auth/delete-account
 * 
 * 请求头：
 * Authorization: Bearer <accessToken>
 * 
 * 响应：
 * {
 *   "code": 200,
 *   "success": true,
 *   "message": "账号删除成功",
 *   "data": null
 * }
 * 
 * ⚠️ 注意：这是一个危险操作，会永久删除用户数据
 */
async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.id;
    
    console.log('📥 收到删除账号请求:', { userId, username: req.user.username });
    
    // ========================================
    // 调用 Service 处理业务逻辑
    // ========================================
    await authService.deleteAccount(userId);
    
    console.log('✅ 账号删除成功:', req.user.username);
    
    // ========================================
    // 返回响应
    // ========================================
    Response.success(res, null, '账号删除成功');
  } catch (err) {
    console.error('❌ 删除账号失败:', err.message);
    next(err);
  }
}

// ========================================
// 8. 重置密码
// ========================================

/**
 * 重置密码（直接邮箱 + 新密码，无需邮件验证）
 * POST /api/auth/reset-password
 *
 * 请求体：
 * {
 *   "email": "zhangsan@example.com",
 *   "newPassword": "newPass456"
 * }
 *
 * 响应：
 * {
 *   "code": 200,
 *   "success": true,
 *   "message": "密码重置成功，请使用新密码登录",
 *   "data": null
 * }
 */
async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body;

    console.log('📥 收到重置密码请求:', { email });

    // ========================================
    // 参数验证
    // ========================================
    if (!email || !newPassword) {
      const error = new Error('邮箱和新密码不能为空');
      error.statusCode = 400;
      throw error;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('邮箱格式不正确');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('新密码至少6个字符');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length > 100) {
      const error = new Error('新密码最多100个字符');
      error.statusCode = 400;
      throw error;
    }

    // ========================================
    // 调用 Service 处理业务逻辑
    // ========================================
    await authService.resetPassword(email.trim().toLowerCase(), newPassword);

    console.log('✅ 密码重置成功');

    // ========================================
    // 返回响应
    // ========================================
    Response.success(res, null, '密码重置成功，请使用新密码登录');
  } catch (err) {
    console.error('❌ 重置密码失败:', err.message);
    next(err);
  }
}

// ========================================
// 导出控制器函数
// ========================================
module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  changePassword,
  deleteAccount,
  resetPassword,
};


