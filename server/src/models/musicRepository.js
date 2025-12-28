/**
 * ============================================
 * 文件名：server/src/models/musicRepository.js
 * 作用：音乐数据访问层（Repository Pattern）
 * ============================================
 */

const db = require('../config/db');

/**
 * 音乐数据访问类
 */
class MusicRepository {
  /**
   * 获取所有音乐
   * @returns {Promise<Array>} 音乐列表
   */
  async findAll() {
    const [rows] = await db.query(`
      SELECT 
        id, title, artist, album, 
        file_path as filePath, 
        cover_path as coverPath, 
        duration, file_size as fileSize, 
        format, play_count as playCount,
        lyrics,
        created_at as createdAt, 
        updated_at as updatedAt
      FROM music 
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);
    return rows;
  }

  /**
   * 根据 ID 查询音乐
   * @param {number} id - 音乐ID
   * @returns {Promise<Object|null>} 音乐对象
   */
  async findById(id) {
    const [rows] = await db.query(`
      SELECT 
        id, title, artist, album, 
        file_path as filePath, 
        cover_path as coverPath, 
        duration, file_size as fileSize, 
        format, play_count as playCount,
        lyrics,
        created_at as createdAt, 
        updated_at as updatedAt
      FROM music 
      WHERE id = ? AND is_active = TRUE
    `, [id]);
    
    return rows[0] || null;
  }

  /**
   * 创建音乐记录
   * @param {Object} musicData - 音乐数据
   * @returns {Promise<Object>} 新创建的音乐对象
   */
  async create(musicData) {
    const { 
      title, 
      artist = '未知艺术家', 
      album = null, 
      filePath, 
      coverPath = null, 
      duration = 0, 
      fileSize = 0, 
      format = 'mp3',
      lyrics = null
    } = musicData;

    const [result] = await db.query(`
      INSERT INTO music 
      (title, artist, album, file_path, cover_path, duration, file_size, format, lyrics)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, artist, album, filePath, coverPath, duration, fileSize, format, lyrics]);
    
    return this.findById(result.insertId);
  }

  /**
   * 更新音乐信息
   * @param {number} id - 音乐ID
   * @param {Object} updates - 要更新的字段
   * @returns {Promise<Object|null>} 更新后的音乐对象
   */
  async update(id, updates) {
    // 构建 SET 子句
    const allowedFields = ['title', 'artist', 'album', 'cover_path', 'duration', 'lyrics'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        // 转换驼峰命名为下划线命名
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    values.push(id);
    
    const [result] = await db.query(
      `UPDATE music SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.findById(id);
  }

  /**
   * 删除音乐（软删除）
   * @param {number} id - 音乐ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async delete(id) {
    const [result] = await db.query(
      'UPDATE music SET is_active = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * 物理删除音乐
   * @param {number} id - 音乐ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async hardDelete(id) {
    const [result] = await db.query('DELETE FROM music WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * 增加播放次数
   * @param {number} id - 音乐ID
   * @returns {Promise<void>}
   */
  async incrementPlayCount(id) {
    await db.query(
      'UPDATE music SET play_count = play_count + 1 WHERE id = ?',
      [id]
    );
  }

  /**
   * 检查音乐是否存在
   * @param {number} id - 音乐ID
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(id) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM music WHERE id = ? AND is_active = TRUE',
      [id]
    );
    return rows[0].count > 0;
  }
}

module.exports = new MusicRepository();

