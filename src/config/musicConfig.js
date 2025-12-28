/**
 * 音乐播放列表配置
 * 
 * 如何添加音乐：
 * 1. 将音乐文件放到 public/music/ 目录下
 * 2. 在下面的 playlist 数组中添加音乐信息
 * 3. 可以使用网络 URL 或本地文件
 */

export const musicPlaylist = [
  {
    id: 1,
    title: '晴天',
    artist: '周杰伦',
    url: '/music/sunny-day.mp3',  // 本地文件路径（需要放到 public/music/ 目录）
    cover: '/music/covers/sunny-day.jpg',  // 封面图片（可选）
  },
  {
    id: 2,
    title: 'Lemon',
    artist: '米津玄師',
    url: 'https://example.com/music/lemon.mp3',  // 或使用网络 URL
    cover: null,  // 如果没有封面，会显示默认图标
  },
  {
    id: 3,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    url: '/music/blinding-lights.mp3',
    cover: '/music/covers/blinding-lights.jpg',
  },
  // 添加更多音乐...
];

/**
 * 音乐播放器配置
 */
export const musicPlayerConfig = {
  autoPlay: false,  // 是否自动播放
  loop: true,       // 是否循环播放
  shuffle: false,   // 是否随机播放
  defaultVolume: 0.7,  // 默认音量（0-1）
};

/**
 * 示例：如何使用免费音乐资源
 * 
 * 1. YouTube Audio Library（免费无版权音乐）
 *    https://www.youtube.com/audiolibrary
 * 
 * 2. Free Music Archive
 *    https://freemusicarchive.org/
 * 
 * 3. Pixabay Music
 *    https://pixabay.com/music/
 * 
 * 4. Bensound
 *    https://www.bensound.com/
 * 
 * 注意：请确保你有权使用这些音乐文件
 */

