/**
 * ============================================
 * 文件名：tagRepository.js
 * 作用：标签数据访问层
 * ============================================
 * 负责与 tags 和 post_tags 表的数据交互
 */

const pool = require('../config/db');

const tagRepository = {
  /**
   * 获取所有标签（按文章数量排序）
   */
  async findAll() {
    const [rows] = await pool.query(
      `SELECT 
        id,
        name,
        slug,
        description,
        color,
        posts_count as postsCount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM tags
      ORDER BY posts_count DESC, name ASC`
    );
    return rows;
  },

  /**
   * 根据 ID 获取标签
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT 
        id,
        name,
        slug,
        description,
        color,
        posts_count as postsCount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM tags
      WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  /**
   * 根据 slug 获取标签
   */
  async findBySlug(slug) {
    const [rows] = await pool.query(
      `SELECT 
        id,
        name,
        slug,
        description,
        color,
        posts_count as postsCount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM tags
      WHERE slug = ?`,
      [slug]
    );
    return rows[0];
  },

  /**
   * 根据名称获取标签
   */
  async findByName(name) {
    const [rows] = await pool.query(
      `SELECT 
        id,
        name,
        slug,
        description,
        color,
        posts_count as postsCount
      FROM tags
      WHERE name = ?`,
      [name]
    );
    return rows[0];
  },

  /**
   * 创建标签
   */
  async create({ name, slug, description, color }) {
    const [result] = await pool.query(
      `INSERT INTO tags (name, slug, description, color)
      VALUES (?, ?, ?, ?)`,
      [name, slug, description, color || '#3B82F6']
    );
    return this.findById(result.insertId);
  },

  /**
   * 更新标签
   */
  async update(id, { name, slug, description, color }) {
    await pool.query(
      `UPDATE tags
      SET name = ?, slug = ?, description = ?, color = ?
      WHERE id = ?`,
      [name, slug, description, color, id]
    );
    return this.findById(id);
  },

  /**
   * 删除标签（会自动删除所有关联）
   */
  async delete(id) {
    await pool.query('DELETE FROM tags WHERE id = ?', [id]);
  },

  /**
   * 获取文章的所有标签
   */
  async findByPostId(postId) {
    const [rows] = await pool.query(
      `SELECT 
        t.id,
        t.name,
        t.slug,
        t.description,
        t.color,
        t.posts_count as postsCount
      FROM tags t
      INNER JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
      ORDER BY t.name ASC`,
      [postId]
    );
    return rows;
  },

  /**
   * 为文章添加标签
   */
  async addToPost(postId, tagId) {
    try {
      await pool.query(
        'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
        [postId, tagId]
      );
      return true;
    } catch (error) {
      // 如果是重复键错误，忽略
      if (error.code === 'ER_DUP_ENTRY') {
        return false;
      }
      throw error;
    }
  },

  /**
   * 从文章移除标签
   */
  async removeFromPost(postId, tagId) {
    const [result] = await pool.query(
      'DELETE FROM post_tags WHERE post_id = ? AND tag_id = ?',
      [postId, tagId]
    );
    return result.affectedRows > 0;
  },

  /**
   * 批量设置文章的标签（先删除所有，再添加新的）
   */
  async setPostTags(postId, tagIds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 删除该文章的所有标签
      await connection.query('DELETE FROM post_tags WHERE post_id = ?', [postId]);
      
      // 添加新标签
      if (tagIds && tagIds.length > 0) {
        const values = tagIds.map(tagId => [postId, tagId]);
        await connection.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ?',
          [values]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 获取热门标签（Top N）
   */
  async findPopular(limit = 10) {
    const [rows] = await pool.query(
      `SELECT 
        id,
        name,
        slug,
        description,
        color,
        posts_count as postsCount
      FROM tags
      ORDER BY posts_count DESC, name ASC
      LIMIT ?`,
      [limit]
    );
    return rows;
  },

  /**
   * 搜索标签
   */
  async search(keyword) {
    const [rows] = await pool.query(
      `SELECT 
        id,
        name,
        slug,
        description,
        color,
        posts_count as postsCount
      FROM tags
      WHERE name LIKE ? OR description LIKE ?
      ORDER BY posts_count DESC, name ASC
      LIMIT 20`,
      [`%${keyword}%`, `%${keyword}%`]
    );
    return rows;
  },
};

module.exports = tagRepository;

