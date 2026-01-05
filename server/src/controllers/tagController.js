/**
 * ============================================
 * 文件名：tagController.js
 * 作用：标签控制器
 * ============================================
 * 处理标签相关的 HTTP 请求
 */

const tagService = require('../services/tagService');
const { success, error } = require('../utils/response');
const { CODE } = require('../utils/response');

const tagController = {
  /**
   * 获取所有标签
   * GET /api/tags
   */
  async getAllTags(req, res) {
    try {
      const tags = await tagService.getAllTags();
      return success(res, tags, '获取标签列表成功');
    } catch (err) {
      console.error('获取标签列表失败:', err);
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 根据 ID 获取标签
   * GET /api/tags/:id
   */
  async getTagById(req, res) {
    try {
      const { id } = req.params;
      const tag = await tagService.getTagById(id);
      return success(res, tag, '获取标签成功');
    } catch (err) {
      console.error('获取标签失败:', err);
      if (err.message === '标签不存在') {
        return error(res, err.message, CODE.NOT_FOUND);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 根据 slug 获取标签
   * GET /api/tags/slug/:slug
   */
  async getTagBySlug(req, res) {
    try {
      const { slug } = req.params;
      const tag = await tagService.getTagBySlug(slug);
      return success(res, tag, '获取标签成功');
    } catch (err) {
      console.error('获取标签失败:', err);
      if (err.message === '标签不存在') {
        return error(res, err.message, CODE.NOT_FOUND);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 创建标签
   * POST /api/tags
   * 权限：editor/admin
   */
  async createTag(req, res) {
    try {
      const { name, slug, description, color } = req.body;

      // 验证必填字段
      if (!name || !slug) {
        return error(res, '标签名称和 slug 不能为空', CODE.BAD_REQUEST);
      }

      const tag = await tagService.createTag({ name, slug, description, color });
      return success(res, tag, '创建标签成功', CODE.CREATED);
    } catch (err) {
      console.error('创建标签失败:', err);
      if (err.message.includes('已存在')) {
        return error(res, err.message, CODE.CONFLICT);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 更新标签
   * PUT /api/tags/:id
   * 权限：editor/admin
   */
  async updateTag(req, res) {
    try {
      const { id } = req.params;
      const { name, slug, description, color } = req.body;

      // 验证必填字段
      if (!name || !slug) {
        return error(res, '标签名称和 slug 不能为空', CODE.BAD_REQUEST);
      }

      const tag = await tagService.updateTag(id, { name, slug, description, color });
      return success(res, tag, '更新标签成功');
    } catch (err) {
      console.error('更新标签失败:', err);
      if (err.message === '标签不存在') {
        return error(res, err.message, CODE.NOT_FOUND);
      }
      if (err.message.includes('已被使用')) {
        return error(res, err.message, CODE.CONFLICT);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 删除标签
   * DELETE /api/tags/:id
   * 权限：admin
   */
  async deleteTag(req, res) {
    try {
      const { id } = req.params;
      await tagService.deleteTag(id);
      return success(res, null, '删除标签成功');
    } catch (err) {
      console.error('删除标签失败:', err);
      if (err.message === '标签不存在') {
        return error(res, err.message, CODE.NOT_FOUND);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 获取文章的所有标签
   * GET /api/posts/:postId/tags
   */
  async getPostTags(req, res) {
    try {
      const { postId } = req.params;
      const tags = await tagService.getPostTags(postId);
      return success(res, tags, '获取文章标签成功');
    } catch (err) {
      console.error('获取文章标签失败:', err);
      if (err.message === '文章不存在') {
        return error(res, err.message, CODE.NOT_FOUND);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 为文章添加标签
   * POST /api/posts/:postId/tags/:tagId
   * 权限：文章作者/admin
   */
  async addTagToPost(req, res) {
    try {
      const { postId, tagId } = req.params;
      const added = await tagService.addTagToPost(postId, tagId);
      
      if (added) {
        return success(res, null, '添加标签成功', CODE.CREATED);
      } else {
        return success(res, null, '标签已存在');
      }
    } catch (err) {
      console.error('添加标签失败:', err);
      if (err.message.includes('不存在')) {
        return error(res, err.message, CODE.NOT_FOUND);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 从文章移除标签
   * DELETE /api/posts/:postId/tags/:tagId
   * 权限：文章作者/admin
   */
  async removeTagFromPost(req, res) {
    try {
      const { postId, tagId } = req.params;
      const removed = await tagService.removeTagFromPost(postId, tagId);
      
      if (removed) {
        return success(res, null, '移除标签成功');
      } else {
        return success(res, null, '标签不存在');
      }
    } catch (err) {
      console.error('移除标签失败:', err);
      if (err.message === '文章不存在') {
        return error(res, err.message, CODE.NOT_FOUND);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 批量设置文章的标签
   * PUT /api/posts/:postId/tags
   * 权限：文章作者/admin
   * Body: { tagIds: [1, 2, 3] }
   */
  async setPostTags(req, res) {
    try {
      const { postId } = req.params;
      const { tagIds } = req.body;

      // 验证 tagIds 格式
      if (!Array.isArray(tagIds)) {
        return error(res, 'tagIds 必须是数组', CODE.BAD_REQUEST);
      }

      await tagService.setPostTags(postId, tagIds);
      const tags = await tagService.getPostTags(postId);
      
      return success(res, tags, '设置文章标签成功');
    } catch (err) {
      console.error('设置文章标签失败:', err);
      if (err.message.includes('不存在')) {
        return error(res, err.message, CODE.NOT_FOUND);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 获取热门标签
   * GET /api/tags/popular?limit=10
   */
  async getPopularTags(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const tags = await tagService.getPopularTags(limit);
      return success(res, tags, '获取热门标签成功');
    } catch (err) {
      console.error('获取热门标签失败:', err);
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 搜索标签
   * GET /api/tags/search?keyword=xxx
   */
  async searchTags(req, res) {
    try {
      const { keyword } = req.query;
      
      if (!keyword) {
        return error(res, '搜索关键词不能为空', CODE.BAD_REQUEST);
      }

      const tags = await tagService.searchTags(keyword);
      return success(res, tags, '搜索标签成功');
    } catch (err) {
      console.error('搜索标签失败:', err);
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },

  /**
   * 根据标签获取文章列表
   * GET /api/tags/:slug/posts?page=1&pageSize=10
   */
  async getPostsByTag(req, res) {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;

      const result = await tagService.getPostsByTag(slug, page, pageSize);
      return success(res, result, '获取标签文章列表成功');
    } catch (err) {
      console.error('获取标签文章列表失败:', err);
      if (err.message === '标签不存在') {
        return error(res, err.message, CODE.NOT_FOUND);
      }
      return error(res, err.message, CODE.INTERNAL_ERROR);
    }
  },
};

module.exports = tagController;

