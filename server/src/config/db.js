/**
 * ============================================
 * 文件名：server/src/config/db.js
 * 作用：MySQL 数据库连接配置
 * ============================================
 * 
 * 这个文件负责：
 * 1. 创建 MySQL 连接池
 * 2. 配置数据库连接参数
 * 3. 测试数据库连接是否成功
 * 4. 导出 Promise 版本的连接池供其他模块使用
 * 
 * 什么是连接池？
 * - 连接池是预先创建好的多个数据库连接
 * - 当需要查询数据库时，从池中取一个连接使用
 * - 使用完毕后，连接归还到池中，而不是关闭
 * - 这样可以避免频繁创建/关闭连接，提高性能
 */

const mysql = require('mysql2'); // 引入 mysql2 库

// ========================================
// 1. 创建数据库连接池
// ========================================

const pool = mysql.createPool({
  // 数据库服务器地址（从环境变量读取，默认 localhost）
  host: process.env.DB_HOST || '127.0.0.1',
  
  // 数据库用户名（从环境变量读取，默认 root）
  user: process.env.DB_USER || 'my_node-app',
  
  // 数据库密码（⚠️ 必须从环境变量读取，不要硬编码）
  password: process.env.DB_PASSWORD,
  
  // 要连接的数据库名（从环境变量读取，默认 my_node_app）
  database: process.env.DB_NAME || 'my_node-app',
  
  // 连接池配置
  waitForConnections: true, // 当连接池满时，等待而不是立即报错
  connectionLimit: 5,       // ✅ 降低连接数以节省内存（适合2G服务器）
  queueLimit: 0,            // 等待队列的最大长度（0 表示无限制）
  
  // 超时配置（防止连接挂起）
  connectTimeout: 10000,    // 10秒连接超时
  acquireTimeout: 10000,    // 10秒获取连接超时
  timeout: 10000            // 10秒查询超时
});

// ========================================
// 2. 转换为 Promise 版本
// ========================================

/**
 * 为什么要转换为 Promise？
 * 
 * mysql2 默认使用回调函数风格：
 * pool.query('SELECT ...', (err, results) => { ... })
 * 
 * 转换为 Promise 后可以使用 async/await：
 * const [rows] = await pool.query('SELECT ...')
 * 
 * 这样代码更简洁、更易读
 */
const promisePool = pool.promise();

// ========================================
// 3. 测试数据库连接
// ========================================

/**
 * 在应用启动时自动测试连接
 * 作用：
 * 1. 验证数据库配置是否正确
 * 2. 验证数据库服务是否正常运行
 * 3. 在控制台输出连接状态
 */
pool.getConnection((err, connection) => {
  if (err) {
    // 连接失败
    console.error('❌ MySQL 连接失败:', err.message);
    console.error('请检查：');
    console.error('1. MySQL 服务是否已启动');
    console.error('2. 数据库用户名和密码是否正确');
    console.error('3. 数据库 my_node_app 是否已创建');
    return;
  }
  
  // 连接成功
  console.log('✅ MySQL 连接成功！');
  console.log(`📊 数据库：${pool.config.connectionConfig.database}`);
  
  // 释放连接回连接池（重要！）
  // 如果不释放，这个连接会一直被占用
  connection.release();
});

// ========================================
// 4. 导出连接池
// ========================================

/**
 * 导出 Promise 版本的连接池
 * 其他文件通过 require('./config/db') 引入后，可以：
 * 
 * const db = require('./config/db');
 * const [rows] = await db.query('SELECT * FROM posts');
 */
module.exports = promisePool;


