/**
 * ============================================
 * 文件名：server/src/models/postRepository.js
 * 作用：数据访问层（Repository Pattern）
 * ============================================
 * 
 * 这个文件负责：
 * 1. 直接与数据库交互
 * 2. 执行 SQL 查询（增删改查）
 * 3. 将数据库字段名转换为前端友好的驼峰命名
 * 
 * 为什么叫 Repository（仓库）？
 * - 把数据库想象成一个仓库
 * - 这个文件就是管理员，负责从仓库存取数据
 * - 上层（Service）只需要告诉管理员要什么数据，不用关心怎么取
 * 
 * 设计模式：Repository Pattern（仓库模式）
 * 好处：
 * - 数据库操作集中管理
 * - 如果要换数据库（比如从 MySQL 换成 PostgreSQL），只需要修改这一个文件
 * - 上层代码不需要知道数据是怎么存储的
 */

// 引入数据库连接池
const db = require('../config/db');

// ========================================
// 查询操作（Read）
// ========================================

/**
 * 获取所有文章列表
 * @returns {Promise<Array>} 文章数组，按创建时间倒序排列
 * 
 * SQL 说明：
 * - SELECT: 查询指定字段
 * - AS: 字段别名（created_at as createdAt 将数据库的下划线命名转为驼峰命名）
 * - ORDER BY created_at DESC: 按创建时间倒序（最新的在前面）
 * 
 * 返回格式：
 * [
 *   { id: 1, title: "标题", content: "内容", createdAt: "2024-...", updatedAt: "2024-..." },
 *   { id: 2, ... }
 * ]
 */
async function listPosts() {
  // 执行查询
  // db.query() 返回 [rows, fields]，我们只需要 rows（查询结果）
  const [rows] = await db.query(
    'SELECT id, title, content, created_at as createdAt, updated_at as updatedAt FROM posts ORDER BY created_at DESC'
  );
  return rows;
}

/**
 * 根据 ID 查询单篇文章
 * @param {number} id - 文章 ID
 * @returns {Promise<Object|null>} 文章对象，如果不存在返回 null
 * 
 * SQL 说明：
 * - WHERE id = ?: 查询条件（? 是占位符，防止 SQL 注入攻击）
 * - [id]: 占位符的值（mysql2 会自动转义，确保安全）
 * 
 * 什么是 SQL 注入？
 * 不安全的写法：`WHERE id = ${id}` - 如果 id 是 "1 OR 1=1"，会查出所有数据
 * 安全的写法：`WHERE id = ?` + [id] - mysql2 会自动处理特殊字符
 */
async function findPostById(id) {
  const [rows] = await db.query(
    'SELECT id, title, content, created_at as createdAt, updated_at as updatedAt FROM posts WHERE id = ?',
    [id] // 参数数组，对应 SQL 中的 ?
  );
  
  // rows 是数组，即使只有一条结果
  // rows[0] 是第一条（也是唯一一条）
  // 如果没有结果，rows[0] 是 undefined，返回 null
  return rows[0] || null;
}

// ========================================
// 创建操作（Create）
// ========================================

/**
 * 创建新文章
 * @param {Object} params - 文章信息
 * @param {string} params.title - 文章标题
 * @param {string} params.content - 文章内容
 * @returns {Promise<Object>} 新创建的文章对象（包含自动生成的 id 和时间戳）
 * 
 * SQL 说明：
 * - INSERT INTO posts (...) VALUES (?, ?): 插入新记录
 * - created_at 和 updated_at 由数据库自动生成（默认值 CURRENT_TIMESTAMP）
 * 
 * 工作流程：
 * 1. 执行 INSERT 语句
 * 2. 获取数据库自动生成的 id（result.insertId）
 * 3. 再查询一次，获取完整的文章信息（包括时间戳）
 * 4. 返回完整的文章对象
 */
async function createPost({ title, content }) {
  // 执行插入操作
  const [result] = await db.query(
    'INSERT INTO posts (title, content) VALUES (?, ?)',
    [title, content]
  );
  
  // result.insertId: 数据库自动生成的文章 ID
  // 例如：如果这是第 5 篇文章，insertId 就是 5
  
  // 查询并返回新创建的完整文章信息
  return findPostById(result.insertId);
}

// ========================================
// 更新操作（Update）
// ========================================

/**
 * 更新文章
 * @param {number} id - 文章 ID
 * @param {Object} params - 要更新的字段
 * @param {string} params.title - 新标题
 * @param {string} params.content - 新内容
 * @returns {Promise<Object|null>} 更新后的文章对象，如果文章不存在返回 null
 * 
 * SQL 说明：
 * - UPDATE posts SET ...: 更新指定字段
 * - WHERE id = ?: 只更新指定 ID 的记录
 * - updated_at 会自动更新为当前时间（数据库配置了 ON UPDATE CURRENT_TIMESTAMP）
 * 
 * result.affectedRows: 受影响的行数
 * - 如果文章存在并更新成功，affectedRows = 1
 * - 如果文章不存在，affectedRows = 0
 */
async function updatePost(id, { title, content }) {
  // 执行更新操作
  const [result] = await db.query(
    'UPDATE posts SET title = ?, content = ? WHERE id = ?',
    [title, content, id]
  );
  
  // 检查是否更新成功
  if (result.affectedRows === 0) {
    return null; // 文章不存在
  }
  
  // 查询并返回更新后的完整文章信息
  return findPostById(id);
}

// ========================================
// 删除操作（Delete）
// ========================================

/**
 * 删除文章
 * @param {number} id - 文章 ID
 * @returns {Promise<Object|null>} 被删除的文章对象，如果文章不存在返回 null
 * 
 * 为什么要先查询再删除？
 * - 删除操作不返回被删除的数据
 * - 但前端可能需要知道删除了什么（比如显示"已删除《标题》"）
 * - 所以先查出来，再删除，最后返回被删除的数据
 */
async function deletePost(id) {
  // 1. 先查询文章是否存在
  const post = await findPostById(id);
  if (!post) {
    return null; // 文章不存在，直接返回 null
  }
  
  // 2. 执行删除操作
  await db.query('DELETE FROM posts WHERE id = ?', [id]);
  
  // 3. 返回被删除的文章信息
  return post;
}

// ========================================
// 导出所有函数
// ========================================

/**
 * 导出的函数会被 Service 层调用
 * Service 不需要知道这些函数内部是怎么查询数据库的
 * 只需要调用相应的函数，就能得到数据
 */
module.exports = {
  listPosts,      // 查询所有
  findPostById,   // 查询单个
  createPost,     // 创建
  updatePost,     // 更新
  deletePost,     // 删除
};

