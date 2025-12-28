/**
 * ============================================
 * 文件名：server/src/routes/musicRoutes.js
 * 作用：音乐路由配置
 * ============================================
 */

const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { uploadMusic, uploadCover } = require('../middleware/musicUpload');

// ========================================
// 音乐管理 API
// ========================================

/**
 * 获取音乐列表
 * @route GET /api/music/list
 * @description 获取所有启用的音乐列表
 * @access Public
 */
router.get('/list', musicController.getMusicList);

/**
 * 获取单个音乐信息
 * @route GET /api/music/:id
 * @description 根据 ID 获取音乐详情
 * @param {number} id - 音乐 ID
 * @access Public
 */
router.get('/:id', musicController.getMusic);

/**
 * 上传音乐
 * @route POST /api/music/upload
 * @description 上传音乐文件
 * @body {File} music - 音乐文件（multipart/form-data）
 * @body {string} title - 歌曲标题
 * @body {string} artist - 艺术家（可选）
 * @body {string} album - 专辑（可选）
 * @access Public（实际应该添加管理员权限验证）
 */
router.post('/upload', uploadMusic.single('music'), musicController.uploadMusic);

/**
 * 上传音乐封面
 * @route POST /api/music/:id/cover
 * @description 为指定音乐上传封面图片
 * @param {number} id - 音乐 ID
 * @body {File} cover - 封面图片（multipart/form-data）
 * @access Public（实际应该添加管理员权限验证）
 */
router.post('/:id/cover', uploadCover.single('cover'), musicController.uploadCover);

/**
 * 更新音乐信息
 * @route PUT /api/music/:id
 * @description 更新音乐的元信息（标题、艺术家等）
 * @param {number} id - 音乐 ID
 * @body {string} title - 新标题（可选）
 * @body {string} artist - 新艺术家（可选）
 * @body {string} album - 新专辑（可选）
 * @access Public（实际应该添加管理员权限验证）
 */
router.put('/:id', musicController.updateMusic);

/**
 * 删除音乐
 * @route DELETE /api/music/:id
 * @description 删除指定音乐（同时删除文件和数据库记录）
 * @param {number} id - 音乐 ID
 * @access Public（实际应该添加管理员权限验证）
 */
router.delete('/:id', musicController.deleteMusic);

/**
 * 记录播放
 * @route POST /api/music/:id/play
 * @description 记录音乐播放次数
 * @param {number} id - 音乐 ID
 * @access Public
 */
router.post('/:id/play', musicController.recordPlay);

module.exports = router;

