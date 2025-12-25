// server/src/controllers/uploadController.js
/**
 * ============================================
 * 文件名：server/src/controllers/uploadController.js
 * 作用：控制器层 (Controller) - 文件上传
 * ============================================
 */

const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;
const uploadService = require('../services/uploadService');
const { success, error: errorResponse, CODE } = require('../utils/response');

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 使用绝对路径，相对于 server 目录
    cb(null, path.join(__dirname, '../../uploads/avatars/')); // 存储目录
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳 + 随机数 + 扩展名
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只接受图片
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只能上传图片文件（jpg, png, gif, webp）'), false);
  }
};

// 创建 multer 实例
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制 5MB
  }
});

/**
 * 上传头像
 * POST /api/upload/avatar
 */
async function uploadAvatar(req, res, next) {
  console.log('📥 收到上传请求: POST /api/upload/avatar');
  
  // 使用 multer 中间件处理上传
  upload.single('avatar')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // Multer 错误
      console.error('❌ Multer 错误:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return errorResponse(res, '文件大小不能超过 5MB', CODE.BAD_REQUEST, 400);
      }
      return errorResponse(res, err.message, CODE.BAD_REQUEST, 400);
    } else if (err) {
      // 其他错误
      console.error('❌ 上传错误:', err);
      return errorResponse(res, err.message, CODE.BAD_REQUEST, 400);
    }

    try {
      if (!req.file) {
        return errorResponse(res, '未选择文件', CODE.BAD_REQUEST, 400);
      }

      console.log('📥 收到文件上传:', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      // 图片处理：压缩和调整大小
      const originalPath = req.file.path;
      const optimizedFilename = 'optimized-' + req.file.filename;
      const optimizedPath = path.join(__dirname, '../../uploads/avatars', optimizedFilename);

      await sharp(originalPath)
        .resize(300, 300, { // 调整为 300x300
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 }) // 压缩为 JPEG，质量 85%
        .toFile(optimizedPath);

      // 删除原始文件
      await fs.unlink(originalPath);

      // 构建文件 URL
      const avatarUrl = `/uploads/avatars/${optimizedFilename}`;
      
      // 保存到数据库（默认用户 ID 为 1）
      const userId = 1; // TODO: 实际应该从 session/token 获取
      const user = await uploadService.handleAvatarUpload(userId, avatarUrl);

      console.log('✅ 头像上传成功:', avatarUrl);

      // 返回统一格式响应
      success(res, { url: avatarUrl, user }, '头像上传成功', CODE.CREATED);
    } catch (error) {
      // 如果处理失败，尝试删除已上传的文件
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('删除文件失败:', unlinkError);
        }
      }
      next(error);
    }
  });
}

module.exports = {
  uploadAvatar
};

