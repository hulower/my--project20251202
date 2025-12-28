/**
 * ============================================
 * 文件名：server/src/middleware/musicUpload.js
 * 作用：音乐文件上传中间件
 * ============================================
 */

const multer = require('multer');
const path = require('path');

// ========================================
// 音乐文件上传配置
// ========================================

const musicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/music/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：music-时间戳-随机数.扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `music-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const musicFileFilter = (req, file, cb) => {
  // 允许的音频格式
  const allowedMimeTypes = [
    'audio/mpeg',      // .mp3
    'audio/mp3',       // .mp3
    'audio/wav',       // .wav
    'audio/wave',      // .wav
    'audio/ogg',       // .ogg
    'audio/x-m4a',     // .m4a
    'audio/aac',       // .aac
    'audio/flac',      // .flac (无损音频)
    'audio/x-flac',    // .flac (部分浏览器识别)
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的音频格式: ${file.mimetype}，仅支持 MP3, WAV, OGG, M4A, AAC, FLAC`), false);
  }
};

const uploadMusic = multer({
  storage: musicStorage,
  fileFilter: musicFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 限制 100MB（支持高品质音乐文件）
  }
});

// ========================================
// 封面图片上传配置
// ========================================

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/music/covers/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：cover-时间戳-随机数.扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `cover-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const coverFileFilter = (req, file, cb) => {
  // 允许的图片格式
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的图片格式: ${file.mimetype}，仅支持 JPG, PNG, WEBP, GIF`), false);
  }
};

const uploadCover = multer({
  storage: coverStorage,
  fileFilter: coverFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 限制 2MB
  }
});

module.exports = {
  uploadMusic,
  uploadCover,
};

