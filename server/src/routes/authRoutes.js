/**
 * ============================================
 * 文件名：server/src/routes/authRoutes.js
 * 作用：认证路由配置
 * ============================================
 * 
 * 这个文件定义了所有认证相关的 API 路由：
 * - 注册
 * - 登录
 * - 登出
 * - 刷新 Token
 * - 获取当前用户信息
 */

const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// ========================================
// 公开路由 - 不需要认证
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
 */
router.post('/register', authController.register);

/**
 * 用户登录
 * POST /api/auth/login
 * 
 * 请求体：
 * {
 *   "email": "zhangsan@example.com",
 *   "password": "myPassword123"
 * }
 */
router.post('/login', authController.login);

/**
 * 刷新 Token
 * POST /api/auth/refresh
 * 
 * 请求体：
 * {
 *   "refreshToken": "eyJhbGci..."
 * }
 */
router.post('/refresh', authController.refreshToken);

/**
 * 重置密码
 * POST /api/auth/reset-password
 *
 * 请求体：
 * {
 *   "email": "zhangsan@example.com",
 *   "newPassword": "newPass456"
 * }
 */
router.post('/reset-password', authController.resetPassword);

// ========================================
// 保护路由 - 需要认证
// ========================================

/**
 * 用户登出
 * POST /api/auth/logout
 * 
 * 请求头：
 * Authorization: Bearer <accessToken>
 * 
 * ⚠️ 必须先通过 authenticate 中间件
 */
router.post('/logout', authenticate, authController.logout);

/**
 * 获取当前登录用户信息
 * GET /api/auth/me
 * 
 * 请求头：
 * Authorization: Bearer <accessToken>
 * 
 * 使用场景：
 * - 前端初始化时获取用户信息
 * - 刷新页面后恢复用户状态
 * - 检查登录状态
 */
router.get('/me', authenticate, authController.getCurrentUser);

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
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * 删除账号
 * DELETE /api/auth/delete-account
 * 
 * 请求头：
 * Authorization: Bearer <accessToken>
 * 
 * ⚠️ 危险操作：会永久删除用户数据
 */
router.delete('/delete-account', authenticate, authController.deleteAccount);

// ========================================
// 导出路由
// ========================================
module.exports = router;

// ========================================
// API 端点总结
// ========================================
/*
| 方法   | 路径                | 说明           | 认证要求 |
|--------|---------------------|----------------|----------|
| POST   | /api/auth/register  | 用户注册       | 公开     |
| POST   | /api/auth/login     | 用户登录       | 公开     |
| POST   | /api/auth/refresh   | 刷新 Token     | 公开     |
| POST   | /api/auth/logout    | 用户登出       | 需要认证 |
| GET    | /api/auth/me        | 获取当前用户   | 需要认证 |
*/

// ========================================
// 使用示例（前端调用）
// ========================================
/*
// 1. 注册
const response = await fetch('http://localhost:5001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: '张三',
    email: 'zhangsan@example.com',
    password: 'myPassword123'
  })
});

// 2. 登录
const response = await fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'zhangsan@example.com',
    password: 'myPassword123'
  })
});

// 3. 获取当前用户（需要 Token）
const response = await fetch('http://localhost:5001/api/auth/me', {
  headers: {
    'Authorization': 'Bearer eyJhbGci...'
  }
});

// 4. 登出
const response = await fetch('http://localhost:5001/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGci...'
  }
});

// 5. 刷新 Token
const response = await fetch('http://localhost:5001/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: 'eyJhbGci...'
  })
});
*/


