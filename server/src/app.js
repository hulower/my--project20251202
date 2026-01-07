const express = require('express');
const cors = require('cors');
const path = require('path');

const healthRoutes = require('./routes/healthRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const musicRoutes = require('./routes/musicRoutes');
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const tagRoutes = require('./routes/tagRoutes');

function createApp() {
  const app = express();

  // 全局中間件 - CORS 配置
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'http://82.156.185.63',      // IP 地址（HTTP）
          'https://82.156.185.63',     // IP 地址（HTTPS）- 新增
          'https://www.betsy.cloud',   // 你的域名（HTTPS）
          'http://www.betsy.cloud',    // 你的域名（HTTP）
          'https://betsy.cloud',       // 不带 www 的域名（HTTPS）
          'http://betsy.cloud'         // 不带 www 的域名（HTTP）
        ]
      : ['http://localhost:3000', 'http://localhost:5002', 'http://localhost:5001'], // 开发环境：允许多个端口
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '100mb' })); // 增加 JSON body 大小限制
  app.use(express.urlencoded({ limit: '100mb', extended: true })); // 增加 URL-encoded body 大小限制

  // 静态文件服务 - 提供上传文件的访问
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // 健康檢查 / 基礎接口
  app.use('/api', healthRoutes);

  // 认证相关接口
  app.use('/api/auth', authRoutes);

  // 博客相關接口
  app.use('/api/posts', postRoutes);

  // 用户相关接口
  app.use('/api/users', userRoutes);

  // 文件上传接口
  app.use('/api/upload', uploadRoutes);

  // 音乐相关接口
  app.use('/api/music', musicRoutes);

  // 评论相关接口
  app.use('/api', commentRoutes);

  // 点赞相关接口
  app.use('/api', likeRoutes);

  // 标签相关接口
  app.use('/api/tags', tagRoutes);

  // 統一錯誤處理
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('❌ 错误:', err);
    
    // 根据错误类型设置状态码
    const statusCode = err.statusCode || 500;
    const code = statusCode;
    const message = err.message || 'Internal Server Error';
    
    // 返回统一格式的错误响应
    res.status(statusCode).json({
      code,
      success: false,
      message,
      data: null,
      timestamp: Date.now()
    });
  });

  return app;
}

module.exports = createApp;


