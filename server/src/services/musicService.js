/**
 * ============================================
 * 文件名：server/src/services/musicService.js
 * 作用：音乐业务逻辑层（Service Layer）
 * ============================================
 */

const musicRepository = require('../models/musicRepository');
const fs = require('fs').promises;
const path = require('path');

/**
 * 音乐业务逻辑类
 */
class MusicService {
  /**
   * 获取音乐列表（返回完整 URL）
   * @returns {Promise<Array>} 音乐列表
   */
  async getMusicList() {
    const musicList = await musicRepository.findAll();
    
    // 返回相对路径，让前端自动拼接当前访问的域名
    // 这样无论是通过 IP 还是域名访问都能正常工作
    return musicList.map(music => ({
      id: music.id,
      title: music.title,
      artist: music.artist,
      album: music.album,
      url: music.filePath,  // 相对路径：/uploads/music/xxx.flac
      cover: music.coverPath || null,  // 相对路径：/uploads/music/covers/xxx.jpg
      duration: music.duration,
      fileSize: music.fileSize,
      format: music.format,
      playCount: music.playCount,
      lyrics: music.lyrics || null,
      createdAt: music.createdAt,
    }));
  }

  /**
   * 根据 ID 获取音乐
   * @param {number} id - 音乐ID
   * @returns {Promise<Object>} 音乐对象
   */
  async getMusicById(id) {
    const music = await musicRepository.findById(id);
    
    if (!music) {
      const error = new Error('音乐不存在');
      error.statusCode = 404;
      throw error;
    }
    
    // 返回相对路径
    return {
      id: music.id,
      title: music.title,
      artist: music.artist,
      album: music.album,
      url: music.filePath,  // 相对路径
      cover: music.coverPath || null,  // 相对路径
      duration: music.duration,
      fileSize: music.fileSize,
      format: music.format,
      playCount: music.playCount,
      lyrics: music.lyrics || null,
      createdAt: music.createdAt,
    };
  }

  /**
   * 上传音乐
   * @param {Object} fileData - 文件数据
   * @param {Object} metadata - 元数据
   * @returns {Promise<Object>} 新创建的音乐对象
   */
  async uploadMusic(fileData, metadata) {
    const { title, artist, album, lyrics } = metadata;
    const { filename, size, mimetype } = fileData;

    // 验证数据
    if (!title) {
      const error = new Error('歌曲标题不能为空');
      error.statusCode = 400;
      throw error;
    }

    // 提取文件格式
    const format = mimetype.split('/')[1] || 'mp3';

    const musicData = {
      title,
      artist: artist || '未知艺术家',
      album: album || null,
      filePath: `/uploads/music/${filename}`,
      coverPath: null, // 封面单独上传
      duration: 0, // 实际应该提取音频时长，这里暂时为 0
      fileSize: size,
      format,
      lyrics: lyrics || null,
    };

    const newMusic = await musicRepository.create(musicData);
    
    // 返回带完整 URL 的对象
    return this.getMusicById(newMusic.id);
  }

  /**
   * 上传音乐封面
   * @param {number} id - 音乐ID
   * @param {Object} fileData - 文件数据
   * @returns {Promise<Object>} 更新后的音乐对象
   */
  async uploadCover(id, fileData) {
    const exists = await musicRepository.exists(id);
    if (!exists) {
      const error = new Error('音乐不存在');
      error.statusCode = 404;
      throw error;
    }

    const { filename } = fileData;
    const coverPath = `/uploads/music/covers/${filename}`;

    // 删除旧封面（如果存在）
    const music = await musicRepository.findById(id);
    if (music.coverPath) {
      const oldCoverPath = path.join(__dirname, '../../', music.coverPath);
      try {
        await fs.unlink(oldCoverPath);
      } catch (err) {
        console.error('删除旧封面失败:', err);
      }
    }

    // 注意：这里必须使用下划线格式 cover_path，因为 repository 的 allowedFields 中是这个格式
    await musicRepository.update(id, { cover_path: coverPath });
    return this.getMusicById(id);
  }

  /**
   * 更新音乐信息
   * @param {number} id - 音乐ID
   * @param {Object} updates - 要更新的字段
   * @returns {Promise<Object>} 更新后的音乐对象
   */
  async updateMusic(id, updates) {
    const exists = await musicRepository.exists(id);
    if (!exists) {
      const error = new Error('音乐不存在');
      error.statusCode = 404;
      throw error;
    }

    await musicRepository.update(id, updates);
    return this.getMusicById(id);
  }

  /**
   * 删除音乐（同时删除文件）
   * @param {number} id - 音乐ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteMusic(id) {
    const music = await musicRepository.findById(id);
    
    if (!music) {
      const error = new Error('音乐不存在');
      error.statusCode = 404;
      throw error;
    }

    // 删除音乐文件
    const filePath = path.join(__dirname, '../../', music.filePath);
    try {
      await fs.unlink(filePath);
      console.log('音乐文件已删除:', filePath);
    } catch (err) {
      console.error('删除音乐文件失败:', err);
    }

    // 删除封面文件
    if (music.coverPath) {
      const coverPath = path.join(__dirname, '../../', music.coverPath);
      try {
        await fs.unlink(coverPath);
        console.log('封面文件已删除:', coverPath);
      } catch (err) {
        console.error('删除封面文件失败:', err);
      }
    }

    // 从数据库删除记录（软删除）
    await musicRepository.delete(id);
    
    return true;
  }

  /**
   * 记录播放
   * @param {number} id - 音乐ID
   * @returns {Promise<void>}
   */
  async recordPlay(id) {
    const exists = await musicRepository.exists(id);
    if (!exists) {
      const error = new Error('音乐不存在');
      error.statusCode = 404;
      throw error;
    }

    await musicRepository.incrementPlayCount(id);
  }
}

module.exports = new MusicService();

