/**
 * ============================================
 * 文件名：server/src/middleware/postCoverUpload.js
 * 作用：文章封面上传中间件
 * ============================================
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads/posts/covers/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ========================================
// 文章封面上传配置
// ========================================

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：cover-时间戳-随机数.扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `post-cover-${uniqueSuffix}${ext}`;
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

const uploadPostCover = multer({
  storage: coverStorage,
  fileFilter: coverFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制 5MB
  }
});

module.exports = {
  uploadPostCover,
};


