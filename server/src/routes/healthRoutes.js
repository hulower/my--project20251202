/**
 * ============================================
 * 文件名：server/src/routes/healthRoutes.js
 * 作用：健康检查路由
 * ============================================
 * 
 * 这个文件负责：
 * 1. 提供一个简单的测试接口
 * 2. 用于检查后端服务是否正常运行
 * 3. 用于调试和排查问题
 * 
 * 什么是健康检查（Health Check）？
 * - 一个简单的 API 接口，返回固定的响应
 * - 用于测试服务器是否正常工作
 * - 生产环境中，监控系统会定期调用这个接口
 * - 如果接口无响应，说明服务器出问题了
 * 
 * 使用场景：
 * 1. 开发时：测试前后端是否连通
 * 2. 部署后：验证服务是否启动成功
 * 3. 生产环境：监控系统定期检查服务状态
 */

const express = require('express');

// 创建路由实例
const router = express.Router();

// ========================================
// 健康检查接口
// ========================================

/**
 * Hello 测试接口
 * @route GET /api/hello
 * @description 返回一个简单的问候消息，用于测试服务器是否正常
 * @access Public
 * 
 * 完整 URL：http://localhost:5001/api/hello
 * 
 * 响应示例：
 * {
 *   "message": "Hello from Node.js backend!"
 * }
 * 
 * 用途：
 * 1. 测试后端服务是否启动
 * 2. 测试前后端是否能正常通信
 * 3. 测试 CORS 配置是否正确
 * 
 * 测试方法：
 * - 浏览器：http://localhost:5001/api/hello
 * - 命令行：curl http://localhost:5001/api/hello
 * - 前端：fetch('http://localhost:5001/api/hello')
 */
router.get('/hello', (req, res) => {
  // 记录请求日志（方便调试）
  console.log('📥 收到请求: GET /api/hello');
  
  // 返回 JSON 响应
  // res.json() 会自动设置 Content-Type: application/json
  res.json({ 
    message: 'Hello from Node.js backend!',
    timestamp: new Date().toISOString(), // 添加时间戳
    status: 'OK' // 服务状态
  });
});

// ========================================
// 扩展：其他健康检查接口
// ========================================

/**
 * 服务器状态接口（可选）
 * @route GET /api/status
 * @description 返回服务器运行状态信息
 * 
 * 可以返回：
 * - 运行时间
 * - 内存使用情况
 * - 数据库连接状态
 * - 等等
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(), // 服务器运行时间（秒）
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(), // 内存使用情况
    version: '1.0.0'
  });
});

// ========================================
// 导出路由
// ========================================

/**
 * 导出路由，由 app.js 挂载到 /api 路径
 * app.use('/api', healthRoutes);
 * 
 * 所以：
 * - /hello -> /api/hello
 * - /status -> /api/status
 */
module.exports = router;


