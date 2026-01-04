// server/src/routes/uploadRoutes.js
/**
 * ============================================
 * 文件名：server/src/routes/uploadRoutes.js
 * 作用：路由层 - 文件上传
 * ============================================
 */

const express = require('express');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * 上传头像
 * URL: POST /api/upload/avatar
 * 需要登录才能上传
 */
router.post('/avatar', authenticate, uploadController.uploadAvatar);

/**
 * 上传文章内容图片
 * URL: POST /api/upload/content-image
 * 需要登录才能上传
 */
router.post('/content-image', authenticate, uploadController.uploadContentImage);

module.exports = router;

