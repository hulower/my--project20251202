// server/src/controllers/userController.js
/**
 * ============================================
 * 文件名：server/src/controllers/userController.js
 * 作用：控制器层 (Controller) - 用户（企业级规范版本）
 * ============================================
 */

const userService = require('../services/userService');
const { success, CODE } = require('../utils/response');
const Response = require('../utils/response');

/**
 * 获取用户信息
 * GET /api/users/:id
 */
async function getUser(req, res, next) {
  try {
    const userId = Number(req.params.id);
    console.log('📥 收到请求: GET /api/users/:id', { userId });

    const user = await userService.getUserById(userId);
    Response.success(res, user, '获取用户信息成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 更新用户信息
 * PUT /api/users/:id
 */
async function updateUser(req, res, next) {
  try {
    const userId = Number(req.params.id);
    console.log('📥 收到请求: PUT /api/users/:id', { userId, body: req.body });

    const user = await userService.updateUser(userId, req.body);
    Response.success(res, user, '用户信息更新成功');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUser,
  updateUser,
};

