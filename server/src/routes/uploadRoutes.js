// server/src/routes/uploadRoutes.js
/**
 * ============================================
 * 文件名：server/src/routes/uploadRoutes.js
 * 作用：路由层 - 文件上传
 * ============================================
 */

const express = require('express');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

/**
 * 上传头像
 * URL: POST /api/upload/avatar
 */
router.post('/avatar', uploadController.uploadAvatar);

module.exports = router;

