/**
 * ============================================
 * 文件名：tagRoutes.js
 * 作用：标签路由
 * ============================================
 * 定义标签相关的 API 路由
 */

const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// ============================================
// 公开路由（无需登录）
// ============================================

// 获取所有标签
router.get('/', tagController.getAllTags);

// 获取热门标签
router.get('/popular', tagController.getPopularTags);

// 搜索标签
router.get('/search', tagController.searchTags);

// 根据 slug 获取标签
router.get('/slug/:slug', tagController.getTagBySlug);

// 根据标签获取文章列表
router.get('/:slug/posts', tagController.getPostsByTag);

// 根据 ID 获取标签
router.get('/:id', tagController.getTagById);

// ============================================
// 需要认证的路由
// ============================================

// 创建标签（需要 editor 或 admin 权限）
router.post('/', authenticate, authorize(['editor', 'admin']), tagController.createTag);

// 更新标签（需要 editor 或 admin 权限）
router.put('/:id', authenticate, authorize(['editor', 'admin']), tagController.updateTag);

// 删除标签（需要 admin 权限）
router.delete('/:id', authenticate, authorize(['admin']), tagController.deleteTag);

module.exports = router;

