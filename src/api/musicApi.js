/**
 * 音乐相关 API
 */

import { get, post, put, del, upload } from './httpClient';

/**
 * 获取音乐列表
 * @returns {Promise<Array>} 音乐列表
 */
export function fetchMusicList() {
  return get('/api/music/list');
}

/**
 * 根据 ID 获取音乐
 * @param {number} id - 音乐ID
 * @returns {Promise<Object>} 音乐对象
 */
export function fetchMusicById(id) {
  return get(`/api/music/${id}`);
}

/**
 * 上传音乐
 * @param {FormData} formData - 表单数据（包含文件和元信息）
 * @returns {Promise<Object>} 新创建的音乐对象
 * 
 * 示例：
 * const formData = new FormData();
 * formData.append('music', file);
 * formData.append('title', '歌曲名');
 * formData.append('artist', '艺术家');
 */
export function uploadMusic(formData) {
  return upload('/api/music/upload', formData);
}

/**
 * 上传音乐封面
 * @param {number} id - 音乐ID
 * @param {FormData} formData - 表单数据（包含封面文件）
 * @returns {Promise<Object>} 更新后的音乐对象
 */
export function uploadMusicCover(id, formData) {
  return upload(`/api/music/${id}/cover`, formData);
}

/**
 * 更新音乐信息
 * @param {number} id - 音乐ID
 * @param {Object} data - 要更新的数据
 * @returns {Promise<Object>} 更新后的音乐对象
 */
export function updateMusic(id, data) {
  return put(`/api/music/${id}`, data);
}

/**
 * 删除音乐
 * @param {number} id - 音乐ID
 * @returns {Promise<void>}
 */
export function deleteMusic(id) {
  return del(`/api/music/${id}`);
}

/**
 * 记录播放次数
 * @param {number} id - 音乐ID
 * @returns {Promise<void>}
 */
export function recordPlay(id) {
  return post(`/api/music/${id}/play`);
}

