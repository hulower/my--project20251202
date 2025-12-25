// server/src/routes/userRoutes.js
/**
 * ============================================
 * 文件名：server/src/routes/userRoutes.js
 * 作用：路由层 - 用户
 * ============================================
 */

const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * 获取用户信息
 * URL: GET /api/users/:id
 */
router.get('/:id', userController.getUser);

/**
 * 更新用户信息
 * URL: PUT /api/users/:id
 */
router.put('/:id', userController.updateUser);

module.exports = router;

