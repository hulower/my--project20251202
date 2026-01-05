/**
 * ============================================
 * 文件名：server/index.js
 * 作用：后端服务的入口文件
 * ============================================
 * 
 * 这是整个后端服务启动的起点，负责：
 * 1. 加载环境变量
 * 2. 引入并创建 Express 应用
 * 3. 初始化数据库连接
 * 4. 启动 HTTP 服务器，监听指定端口
 * 
 * 启动命令：npm run server
 * 或者：node server/index.js
 */

// 加载环境变量（必须在最开始）
require('dotenv').config();

// 引入创建 Express 应用的工厂函数
const createApp = require('./src/app');

// 引入数据库连接配置（虽然这里没直接使用，但引入后会自动执行连接测试）
const db = require('./src/config/db');

// 设置服务器端口
// 优先使用环境变量 PORT，如果没有则默认使用 5001
const PORT = process.env.PORT || 5001;

// 调用工厂函数创建 Express 应用实例
const app = createApp();

// 启动 HTTP 服务器，监听指定端口
app.listen(PORT, () => {
  console.log(`✅ 服务器正在运行，端口：${PORT}`);
  console.log(`🌐 访问地址：http://localhost:${PORT}`);
  console.log(`💾 数据库连接池已初始化`);
});
