/**
 * ============================================
 * 文件名：server/src/controllers/musicController.js
 * 作用：音乐控制器层 (Controller)
 * ============================================
 */

const musicService = require('../services/musicService');
const Response = require('../utils/response');

/**
 * 音乐控制器类
 */
class MusicController {
  /**
   * 获取音乐列表
   * GET /api/music/list
   */
  async getMusicList(req, res, next) {
    try {
      console.log('📥 收到请求: GET /api/music/list');
      
      const musicList = await musicService.getMusicList();
      Response.success(res, musicList, '获取音乐列表成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 根据 ID 获取音乐
   * GET /api/music/:id
   */
  async getMusic(req, res, next) {
    try {
      const { id } = req.params;
      console.log('📥 收到请求: GET /api/music/:id', { id });
      
      const music = await musicService.getMusicById(Number(id));
      Response.success(res, music, '获取音乐成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 上传音乐
   * POST /api/music/upload
   */
  async uploadMusic(req, res, next) {
    try {
      console.log('📥 收到请求: POST /api/music/upload', req.body);
      
      if (!req.file) {
        return Response.error(res, '请上传音乐文件', 400, 400);
      }

      const music = await musicService.uploadMusic(req.file, req.body);
      Response.success(res, music, '音乐上传成功', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 上传音乐封面
   * POST /api/music/:id/cover
   */
  async uploadCover(req, res, next) {
    try {
      const { id } = req.params;
      console.log('📥 收到请求: POST /api/music/:id/cover', { id });
      
      if (!req.file) {
        return Response.error(res, '请上传封面图片', 400, 400);
      }

      const music = await musicService.uploadCover(Number(id), req.file);
      Response.success(res, music, '封面上传成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 更新音乐信息
   * PUT /api/music/:id
   */
  async updateMusic(req, res, next) {
    try {
      const { id } = req.params;
      console.log('📥 收到请求: PUT /api/music/:id', { id, body: req.body });
      
      const music = await musicService.updateMusic(Number(id), req.body);
      Response.success(res, music, '音乐信息更新成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 删除音乐
   * DELETE /api/music/:id
   */
  async deleteMusic(req, res, next) {
    try {
      const { id } = req.params;
      console.log('📥 收到请求: DELETE /api/music/:id', { id });
      
      await musicService.deleteMusic(Number(id));
      Response.success(res, null, '音乐删除成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 记录播放
   * POST /api/music/:id/play
   */
  async recordPlay(req, res, next) {
    try {
      const { id } = req.params;
      console.log('📥 收到请求: POST /api/music/:id/play', { id });
      
      await musicService.recordPlay(Number(id));
      Response.success(res, null, '播放记录成功');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MusicController();

