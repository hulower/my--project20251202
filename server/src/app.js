const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/healthRoutes');
const postRoutes = require('./routes/postRoutes');

function createApp() {
  const app = express();

  // 全局中間件 - CORS 配置
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://你的前端域名.vercel.app', 'https://你的自定义域名.com'] // 生产环境：替换为实际前端域名
      : ['http://localhost:3000'], // 开发环境
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(express.json());

  // 健康檢查 / 基礎接口
  app.use('/api', healthRoutes);

  // 博客相關接口
  app.use('/api/posts', postRoutes);

  // 統一錯誤處理
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
}

module.exports = createApp;


