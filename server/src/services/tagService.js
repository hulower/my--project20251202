/**
 * ============================================
 * 文件名：tagService.js
 * 作用：标签业务逻辑层
 * ============================================
 * 处理标签相关的业务逻辑
 */

const tagRepository = require('../models/tagRepository');
const postRepository = require('../models/postRepository');

const tagService = {
  /**
   * 获取所有标签
   */
  async getAllTags() {
    return await tagRepository.findAll();
  },

  /**
   * 根据 ID 获取标签
   */
  async getTagById(id) {
    const tag = await tagRepository.findById(id);
    if (!tag) {
      throw new Error('标签不存在');
    }
    return tag;
  },

  /**
   * 根据 slug 获取标签
   */
  async getTagBySlug(slug) {
    const tag = await tagRepository.findBySlug(slug);
    if (!tag) {
      throw new Error('标签不存在');
    }
    return tag;
  },

  /**
   * 创建标签
   */
  async createTag({ name, slug, description, color }) {
    // 检查名称是否已存在
    const existingByName = await tagRepository.findByName(name);
    if (existingByName) {
      throw new Error('标签名称已存在');
    }

    // 检查 slug 是否已存在
    const existingBySlug = await tagRepository.findBySlug(slug);
    if (existingBySlug) {
      throw new Error('标签 slug 已存在');
    }

    return await tagRepository.create({ name, slug, description, color });
  },

  /**
   * 更新标签
   */
  async updateTag(id, { name, slug, description, color }) {
    // 检查标签是否存在
    await this.getTagById(id);

    // 检查名称是否与其他标签重复
    const existingByName = await tagRepository.findByName(name);
    if (existingByName && existingByName.id !== parseInt(id)) {
      throw new Error('标签名称已被使用');
    }

    // 检查 slug 是否与其他标签重复
    const existingBySlug = await tagRepository.findBySlug(slug);
    if (existingBySlug && existingBySlug.id !== parseInt(id)) {
      throw new Error('标签 slug 已被使用');
    }

    return await tagRepository.update(id, { name, slug, description, color });
  },

  /**
   * 删除标签
   */
  async deleteTag(id) {
    // 检查标签是否存在
    await this.getTagById(id);

    // 删除标签（会自动删除所有关联）
    await tagRepository.delete(id);
  },

  /**
   * 获取文章的所有标签
   */
  async getPostTags(postId) {
    // 检查文章是否存在
    const post = await postRepository.findPostById(postId);
    if (!post) {
      throw new Error('文章不存在');
    }
    
    return await tagRepository.findByPostId(postId);
  },

  /**
   * 为文章添加标签
   */
  async addTagToPost(postId, tagId) {
    // 检查文章是否存在
    const post = await postRepository.findPostById(postId);
    if (!post) {
      throw new Error('文章不存在');
    }

    // 检查标签是否存在
    await this.getTagById(tagId);

    return await tagRepository.addToPost(postId, tagId);
  },

  /**
   * 从文章移除标签
   */
  async removeTagFromPost(postId, tagId) {
    // 检查文章是否存在
    const post = await postRepository.findPostById(postId);
    if (!post) {
      throw new Error('文章不存在');
    }

    return await tagRepository.removeFromPost(postId, tagId);
  },

  /**
   * 批量设置文章的标签
   */
  async setPostTags(postId, tagIds) {
    // 检查文章是否存在
    const post = await postRepository.findPostById(postId);
    if (!post) {
      throw new Error('文章不存在');
    }

    // 检查所有标签是否存在
    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await this.getTagById(tagId);
      }
    }

    return await tagRepository.setPostTags(postId, tagIds);
  },

  /**
   * 获取热门标签
   */
  async getPopularTags(limit = 10) {
    return await tagRepository.findPopular(limit);
  },

  /**
   * 搜索标签
   */
  async searchTags(keyword) {
    if (!keyword || keyword.trim() === '') {
      return [];
    }
    return await tagRepository.search(keyword.trim());
  },

  /**
   * 根据标签获取文章列表
   */
  async getPostsByTag(tagSlug, page = 1, pageSize = 10) {
    // 检查标签是否存在
    const tag = await tagRepository.findBySlug(tagSlug);
    if (!tag) {
      throw new Error('标签不存在');
    }

    // 获取该标签下的所有文章（带分页）
    const pool = require('../config/db');
    const offset = (page - 1) * pageSize;

    const [posts] = await pool.query(
      `SELECT 
        p.id,
        p.title,
        p.content,
        p.category,
        p.slug,
        p.cover_image as coverImage,
        p.view_count as viewCount,
        p.likes_count as likesCount,
        p.comments_count as commentsCount,
        p.created_at as createdAt,
        p.updated_at as updatedAt
      FROM posts p
      INNER JOIN post_tags pt ON p.id = pt.post_id
      WHERE pt.tag_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [tag.id, pageSize, offset]
    );

    // 获取总数
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total
      FROM posts p
      INNER JOIN post_tags pt ON p.id = pt.post_id
      WHERE pt.tag_id = ?`,
      [tag.id]
    );

    // 为文章加载标签（关键修复）
    const postsWithTags = await postRepository.loadTagsForPosts(posts);

    return {
      tag,
      list: postsWithTags,  // 返回带标签的文章列表
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },
};

module.exports = tagService;

