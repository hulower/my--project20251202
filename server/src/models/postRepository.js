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
const tagRepository = require('./tagRepository');

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
    'SELECT id, title, slug, content, category, cover_image as coverImage, music_id as musicId, view_count as viewCount, likes_count as likesCount, comments_count as commentsCount, created_at as createdAt, updated_at as updatedAt FROM posts ORDER BY created_at DESC'
  );
  return rows;
}

/**
 * 分页查询文章列表（支持分类筛选）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从 1 开始）
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.category - 分类筛选（可选）
 * @returns {Promise<Object>} 分页结果
 * 
 * 返回格式：
 * {
 *   list: [...],
 *   pagination: {
 *     total: 100,
 *     page: 1,
 *     pageSize: 10,
 *     totalPages: 10
 *   }
 * }
 */
async function listPostsWithPagination({ page = 1, pageSize = 10, category = null }) {
  // 1. 构建 WHERE 条件
  let whereClause = '';
  const queryParams = [];
  
  if (category) {
    whereClause = 'WHERE category = ?';
    queryParams.push(category);
  }
  
  // 2. 查询总数
  const countSql = `SELECT COUNT(*) as total FROM posts ${whereClause}`;
  const [countResult] = await db.query(countSql, queryParams);
  const total = countResult[0].total;
  
  // 3. 计算分页参数
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  
  // 4. 查询当前页数据
  const dataSql = `
    SELECT id, title, slug, content, category, cover_image as coverImage, music_id as musicId, view_count as viewCount, likes_count as likesCount, comments_count as commentsCount, created_at as createdAt, updated_at as updatedAt 
    FROM posts 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  const dataParams = [...queryParams, pageSize, offset];
  const [rows] = await db.query(dataSql, dataParams);
  
  // 5. 返回分页结果
  return {
    list: rows,
    pagination: {
      total,
      page,
      pageSize,
      totalPages
    }
  };
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
    'SELECT id, title, slug, content, category, cover_image as coverImage, music_id as musicId, view_count as viewCount, likes_count as likesCount, comments_count as commentsCount, created_at as createdAt, updated_at as updatedAt FROM posts WHERE id = ?',
    [id] // 参数数组，对应 SQL 中的 ?
  );
  
  // rows 是数组，即使只有一条结果
  // rows[0] 是第一条（也是唯一一条）
  // 如果没有结果，rows[0] 是 undefined，返回 null
  return rows[0] || null;
}

/**
 * 根据 slug 查询单篇文章
 * @param {string} slug - 文章 slug（URL 友好的唯一标识符）
 * @returns {Promise<Object|null>} 文章对象，如果不存在返回 null
 * 
 * 什么是 slug？
 * - slug 是 URL 友好的唯一标识符，例如："my-first-post"
 * - 比数字 ID 更易读，SEO 友好
 * - 例如：/blog/post/my-first-post（slug）比 /blog/post/123（ID）更友好
 */
async function findPostBySlug(slug) {
  const [rows] = await db.query(
    'SELECT id, title, slug, content, category, cover_image as coverImage, music_id as musicId, view_count as viewCount, likes_count as likesCount, comments_count as commentsCount, created_at as createdAt, updated_at as updatedAt FROM posts WHERE slug = ?',
    [slug]
  );
  
  return rows[0] || null;
}

/**
 * 检查 slug 是否已存在
 * @param {string} slug - 要检查的 slug
 * @param {number} excludeId - 排除的文章 ID（用于更新时检查，排除自己）
 * @returns {Promise<boolean>} 如果存在返回 true，否则返回 false
 */
async function checkSlugExists(slug, excludeId = null) {
  let sql = 'SELECT COUNT(*) as count FROM posts WHERE slug = ?';
  const params = [slug];
  
  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }
  
  const [rows] = await db.query(sql, params);
  return rows[0].count > 0;
}

// ========================================
// 创建操作（Create）
// ========================================

/**
 * 创建新文章
 * @param {Object} params - 文章信息
 * @param {string} params.title - 文章标题
 * @param {string} params.slug - 文章 slug（URL 友好的唯一标识符）
 * @param {string} params.content - 文章内容
 * @param {string} params.category - 文章分类（技术博客、说说、学习笔记）
 * @returns {Promise<Object>} 新创建的文章对象（包含自动生成的 id 和时间戳）
 * 
 * SQL 说明：
 * - INSERT INTO posts (...) VALUES (?, ?, ?, ?): 插入新记录
 * - created_at 和 updated_at 由数据库自动生成（默认值 CURRENT_TIMESTAMP）
 * 
 * 工作流程：
 * 1. 执行 INSERT 语句
 * 2. 获取数据库自动生成的 id（result.insertId）
 * 3. 再查询一次，获取完整的文章信息（包括时间戳）
 * 4. 返回完整的文章对象
 */
async function createPost({ title, slug, content, category = '技术博客', musicId = null }) {
  // 执行插入操作
  const [result] = await db.query(
    'INSERT INTO posts (title, slug, content, category, music_id) VALUES (?, ?, ?, ?, ?)',
    [title, slug, content, category, musicId]
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
 * @param {string} params.slug - 新 slug
 * @param {string} params.content - 新内容
 * @param {string} params.category - 文章分类（技术博客、说说、学习笔记）
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
async function updatePost(id, { title, slug, content, category, musicId }) {
  // 执行更新操作
  const [result] = await db.query(
    'UPDATE posts SET title = ?, slug = ?, content = ?, category = ?, music_id = ? WHERE id = ?',
    [title, slug, content, category, musicId, id]
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

/**
 * 更新文章封面
 * @param {number} id - 文章 ID
 * @param {string} coverPath - 封面图片路径
 * @returns {Promise<Object>} 更新后的文章对象
 */
async function updatePostCover(id, coverPath) {
  await db.query(
    'UPDATE posts SET cover_image = ? WHERE id = ?',
    [coverPath, id]
  );
  
  // 返回更新后的文章
  return findPostById(id);
}

/**
 * 增加文章浏览量
 * @param {number} id - 文章 ID
 * @returns {Promise<Object|null>} 更新后的文章对象，如果文章不存在返回 null
 * 
 * SQL 说明：
 * - view_count = view_count + 1: 浏览量加 1
 * - 使用原子操作，避免并发问题
 */
async function incrementViewCount(id) {
  // 执行浏览量 +1 操作
  const [result] = await db.query(
    'UPDATE posts SET view_count = view_count + 1 WHERE id = ?',
    [id]
  );
  
  // 检查是否更新成功
  if (result.affectedRows === 0) {
    return null; // 文章不存在
  }
  
  // 查询并返回更新后的完整文章信息
  return findPostById(id);
}

// ========================================
// 导出所有函数
// ========================================

// ========================================
// 辅助函数：为文章加载标签
// ========================================

/**
 * 为单个文章加载标签
 * @param {Object} post - 文章对象
 * @returns {Promise<Object>} 带标签的文章对象
 */
async function loadTagsForPost(post) {
  if (!post) return post;
  try {
    const tags = await tagRepository.findByPostId(post.id);
    return { ...post, tags };
  } catch (error) {
    console.error(`加载文章 ${post.id} 的标签失败:`, error);
    return { ...post, tags: [] };
  }
}

/**
 * 为多个文章加载标签
 * @param {Array} posts - 文章数组
 * @returns {Promise<Array>} 带标签的文章数组
 */
async function loadTagsForPosts(posts) {
  if (!posts || posts.length === 0) return posts;
  
  // 并行加载所有文章的标签
  const postsWithTags = await Promise.all(
    posts.map(post => loadTagsForPost(post))
  );
  
  return postsWithTags;
}

/**
 * 获取归档数据（按年月分组）
 * @returns {Promise<Array>} 归档数据
 * 
 * 返回格式：
 * [
 *   { 
 *     year: 2024, 
 *     months: [
 *       { month: 1, count: 5, posts: [{id, title, slug, createdAt}, ...] },
 *       { month: 2, count: 3, posts: [{id, title, slug, createdAt}, ...] }
 *     ] 
 *   },
 *   { year: 2023, months: [...] }
 * ]
 */
async function getArchives() {
  // 查询所有文章的基本信息（按时间倒序）
  const [posts] = await db.query(`
    SELECT 
      id, 
      title, 
      slug,
      category,
      YEAR(created_at) as year,
      MONTH(created_at) as month,
      created_at as createdAt
    FROM posts 
    ORDER BY created_at DESC
  `);
  
  // 按年月分组
  const archiveMap = {};
  
  posts.forEach(post => {
    const { year, month, ...postInfo } = post;
    
    if (!archiveMap[year]) {
      archiveMap[year] = {};
    }
    
    if (!archiveMap[year][month]) {
      archiveMap[year][month] = [];
    }
    
    archiveMap[year][month].push(postInfo);
  });
  
  // 转换为数组格式
  const archives = Object.keys(archiveMap)
    .sort((a, b) => b - a) // 年份倒序
    .map(year => ({
      year: parseInt(year),
      months: Object.keys(archiveMap[year])
        .sort((a, b) => b - a) // 月份倒序
        .map(month => ({
          month: parseInt(month),
          count: archiveMap[year][month].length,
          posts: archiveMap[year][month]
        }))
    }));
  
  return archives;
}

/**
 * 去除HTML标签，提取纯文本
 * @param {string} html - HTML字符串
 * @returns {string} 纯文本
 */
function stripHtmlTags(html) {
  if (!html) return '';
  
  // 去除HTML标签
  let text = html.replace(/<[^>]*>/g, '');
  
  // 解码HTML实体
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // 去除多余空白
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * 搜索文章
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 返回结果数量限制（默认10）
 * @returns {Promise<Array>} 搜索结果
 * 
 * 搜索范围：标题、内容
 * 返回格式：[{id, title, slug, category, excerpt, createdAt}, ...]
 */
async function searchPosts(keyword, limit = 10) {
  if (!keyword || keyword.trim() === '') {
    return [];
  }
  
  // 使用 LIKE 进行模糊搜索
  const searchPattern = `%${keyword}%`;
  
  const [rows] = await db.query(
    `SELECT 
      id, 
      title, 
      slug, 
      category,
      content,
      created_at as createdAt
    FROM posts 
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY created_at DESC
    LIMIT ?`,
    [searchPattern, searchPattern, limit]
  );
  
  // 处理每个结果：去除HTML标签并截取摘要
  const results = rows.map(row => {
    const plainText = stripHtmlTags(row.content);
    const excerpt = plainText.length > 150 
      ? plainText.substring(0, 150) + '...' 
      : plainText;
    
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category,
      excerpt: excerpt,
      createdAt: row.createdAt
    };
  });
  
  return results;
}

// ========================================
// 导出所有方法
// ========================================

/**
 * 导出的函数会被 Service 层调用
 * Service 不需要知道这些函数内部是怎么查询数据库的
 * 只需要调用相应的函数，就能得到数据
 */
module.exports = {
  listPosts,                  // 查询所有（不分页）
  listPostsWithPagination,    // 查询所有（分页）
  findPostById,               // 通过 ID 查询单个
  findPostBySlug,             // 通过 slug 查询单个
  checkSlugExists,            // 检查 slug 是否存在
  createPost,                 // 创建
  updatePost,                 // 更新
  deletePost,                 // 删除
  updatePostCover,            // 更新封面
  incrementViewCount,         // 增加浏览量
  loadTagsForPost,            // 为单个文章加载标签
  loadTagsForPosts,           // 为多个文章加载标签
  getArchives,                // 获取归档数据
  searchPosts,                // 搜索文章
};

