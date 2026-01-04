/**
 * ============================================
 * 文件名：server/src/services/postService.js
 * 作用：业务逻辑层（Service Layer）
 * ============================================
 * 
 * 这个文件负责：
 * 1. 处理业务逻辑（比如数据验证、权限检查）
 * 2. 调用 Repository 层获取或保存数据
 * 3. 处理异常情况（比如文章不存在）
 * 4. 返回处理结果给 Controller 层
 * 
 * 为什么需要 Service 层？
 * - Repository 只负责数据存取，不管业务规则
 * - Controller 只负责接收请求和返回响应，不管业务逻辑
 * - Service 是核心，负责"思考"和"决策"
 * 
 * 例子：创建文章
 * - Repository: 往数据库插一条记录（不管内容是什么）
 * - Service: 检查标题和内容是否为空，如果为空就拒绝创建
 * - Controller: 接收前端请求，调用 Service，返回结果
 * 
 * 设计模式：Service Pattern（服务模式）
 * 三层架构：Controller -> Service -> Repository
 */

// 引入数据访问层
const postRepository = require('../models/postRepository');

/**
 * 博客文章业务逻辑类
 * 使用 class 定义，方便管理相关的业务方法
 */
class PostService {
  
  // ========================================
  // Slug 生成与验证
  // ========================================
  
  /**
   * 生成 URL 友好的 slug
   * @param {string} title - 文章标题
   * @returns {string} slug
   * 
   * 生成规则：
   * 1. 转为小写
   * 2. 移除特殊字符
   * 3. 空格和连续的特殊字符替换为单个连字符
   * 4. 如果标题是纯中文，使用时间戳生成唯一 slug
   * 
   * 示例：
   * "My First Post!" -> "my-first-post"
   * "React 入门教程" -> "react-ru-men-jiao-cheng" 或 "post-1234567890"
   */
  generateSlug(title) {
    if (!title) {
      return `post-${Date.now()}`;
    }
    
    let slug = title
      .toLowerCase()
      .trim()
      // 将空格和常见标点符号替换为连字符
      .replace(/[\s\t\n\r，。！？、；：""''（）《》【】…—·]+/g, '-')
      // 移除不安全的字符
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
      // 移除连续的连字符
      .replace(/-+/g, '-')
      // 移除首尾的连字符
      .replace(/^-+|-+$/g, '');
    
    // 如果生成的 slug 为空或只包含中文（URL 不友好），使用时间戳
    if (!slug || /^[\u4e00-\u9fa5]+$/.test(slug)) {
      slug = `post-${Date.now()}`;
    }
    
    // 限制长度（最多 200 个字符）
    if (slug.length > 200) {
      slug = slug.substring(0, 200);
    }
    
    return slug;
  }
  
  /**
   * 确保 slug 唯一
   * @param {string} slug - 原始 slug
   * @param {number} excludeId - 排除的文章 ID（用于更新时）
   * @returns {Promise<string>} 唯一的 slug
   * 
   * 如果 slug 已存在，会在后面添加数字后缀
   * 例如：my-post -> my-post-2 -> my-post-3
   */
  async ensureUniqueSlug(slug, excludeId = null) {
    let uniqueSlug = slug;
    let counter = 2;
    
    // 检查 slug 是否已存在，如果存在则添加数字后缀
    while (await postRepository.checkSlugExists(uniqueSlug, excludeId)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return uniqueSlug;
  }
  
  // ========================================
  // 查询业务
  // ========================================
  
  /**
   * 获取所有文章（不分页，保留用于向后兼容）
   * @returns {Promise<Array>} 文章列表
   * 
   * 业务逻辑：
   * 1. 直接调用 Repository 获取数据
   * 2. 这里没有额外的业务逻辑，但如果将来需要（比如只返回已发布的文章），可以在这里添加
   */
  async getAllPosts() {
    return await postRepository.listPosts();
  }

  /**
   * 分页查询文章列表（支持分类筛选）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码（从 1 开始）
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.category - 分类筛选（可选）
   * @returns {Promise<Object>} 分页结果
   * 
   * 业务逻辑：
   * 1. 验证分页参数
   * 2. 如果提供了分类参数，验证分类是否合法
   * 3. 调用 Repository 获取分页数据
   */
  async getPostsWithPagination({ page = 1, pageSize = 10, category = null }) {
    // 验证分页参数
    if (page < 1) {
      const error = new Error('页码必须大于 0');
      error.statusCode = 400;
      throw error;
    }
    
    if (pageSize < 1 || pageSize > 100) {
      const error = new Error('每页数量必须在 1-100 之间');
      error.statusCode = 400;
      throw error;
    }
    
    // 如果提供了分类，验证是否合法
    if (category) {
      const validCategories = ['技术博客', '说说', '学习笔记'];
      if (!validCategories.includes(category)) {
        const error = new Error(`分类必须是以下之一：${validCategories.join('、')}`);
        error.statusCode = 400;
        throw error;
      }
    }
    
    // 调用 Repository 获取分页数据
    return await postRepository.listPostsWithPagination({ page, pageSize, category });
  }

  /**
   * 根据 ID 获取单篇文章
   * @param {number} id - 文章 ID
   * @returns {Promise<Object>} 文章对象
   * @throws {Error} 如果文章不存在，抛出 404 错误
   * 
   * 业务逻辑：
   * 1. 调用 Repository 查询文章
   * 2. 如果文章不存在，抛出自定义错误（带状态码）
   * 3. 这个错误会被 app.js 中的错误处理中间件捕获，返回给前端
   */
  async getPostById(id) {
    const post = await postRepository.findPostById(id);
    
    // 文章不存在时的处理
    if (!post) {
      const error = new Error('文章不存在');
      error.statusCode = 404; // 添加 HTTP 状态码
      throw error; // 抛出错误，会被全局错误处理捕获
    }
    
    return post;
  }
  
  /**
   * 根据 slug 获取单篇文章
   * @param {string} slug - 文章 slug
   * @returns {Promise<Object>} 文章对象
   * @throws {Error} 如果文章不存在，抛出 404 错误
   * 
   * 业务逻辑：
   * 1. 调用 Repository 通过 slug 查询文章
   * 2. 如果文章不存在，抛出 404 错误
   * 3. 返回文章对象
   */
  async getPostBySlug(slug) {
    const post = await postRepository.findPostBySlug(slug);
    
    // 文章不存在时的处理
    if (!post) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }
    
    return post;
  }

  // ========================================
  // 创建业务
  // ========================================
  
  /**
   * 创建新文章
   * @param {Object} params - 文章信息
   * @param {string} params.title - 文章标题
   * @param {string} params.content - 文章内容
   * @param {string} params.category - 文章分类（技术博客、说说、学习笔记）
   * @param {string} params.slug - 自定义 slug（可选，不提供则自动生成）
   * @returns {Promise<Object>} 新创建的文章对象
   * @throws {Error} 如果标题或内容为空，抛出 400 错误
   * 
   * 业务逻辑：
   * 1. 验证标题和内容不能为空
   * 2. 验证分类是否合法
   * 3. 生成或验证 slug
   * 4. 确保 slug 唯一
   * 5. 调用 Repository 创建文章
   * 
   * 为什么要在这里验证？
   * - Repository 不关心业务规则，只负责存数据
   * - Service 负责确保数据符合业务要求
   * - 这样如果业务规则改变（比如标题不能超过 100 字），只需要改 Service
   */
  async createPost({ title, content, category = '技术博客', slug = null, musicId = null }) {
    // 数据验证
    if (!title || !content) {
      const error = new Error('标题和内容不能为空');
      error.statusCode = 400; // 400 = Bad Request（请求参数错误）
      throw error;
    }
    
    // 验证分类是否合法
    const validCategories = ['技术博客', '说说', '学习笔记'];
    if (!validCategories.includes(category)) {
      const error = new Error(`分类必须是以下之一：${validCategories.join('、')}`);
      error.statusCode = 400;
      throw error;
    }
    
    // 生成或使用自定义 slug
    let finalSlug = slug || this.generateSlug(title);
    
    // 确保 slug 唯一
    finalSlug = await this.ensureUniqueSlug(finalSlug);
    
    // 验证通过，调用 Repository 创建文章
    return await postRepository.createPost({ title, slug: finalSlug, content, category, musicId });
  }

  // ========================================
  // 更新业务
  // ========================================
  
  /**
   * 更新文章
   * @param {number} id - 文章 ID
   * @param {Object} params - 要更新的字段
   * @param {string} params.title - 新标题
   * @param {string} params.content - 新内容
   * @param {string} params.category - 文章分类（技术博客、说说、学习笔记）
   * @param {string} params.slug - 自定义 slug（可选）
   * @returns {Promise<Object>} 更新后的文章对象
   * @throws {Error} 如果文章不存在，抛出 404 错误
   * 
   * 业务逻辑：
   * 1. 验证分类是否合法（如果提供了）
   * 2. 如果标题改变，重新生成 slug（或使用自定义 slug）
   * 3. 确保 slug 唯一
   * 4. 调用 Repository 更新文章
   * 5. 如果返回 null（文章不存在），抛出 404 错误
   * 6. 否则返回更新后的文章
   * 
   * 注意：这里没有验证 title 和 content 是否为空
   * 如果需要，可以添加和 createPost 一样的验证逻辑
   */
  async updatePost(id, { title, content, category, slug = null, musicId }) {
    // 如果提供了分类，验证是否合法
    if (category) {
      const validCategories = ['技术博客', '说说', '学习笔记'];
      if (!validCategories.includes(category)) {
        const error = new Error(`分类必须是以下之一：${validCategories.join('、')}`);
        error.statusCode = 400;
        throw error;
      }
    }
    
    // 获取原文章信息（用于检查标题是否改变）
    const existingPost = await postRepository.findPostById(id);
    if (!existingPost) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }
    
    // 确定最终的 slug
    let finalSlug = existingPost.slug; // 默认保持原 slug
    
    // 如果提供了自定义 slug，使用自定义 slug
    if (slug) {
      finalSlug = slug;
    }
    // 如果标题改变，重新生成 slug
    else if (title && title !== existingPost.title) {
      finalSlug = this.generateSlug(title);
    }
    
    // 如果 slug 改变了，确保新 slug 唯一
    if (finalSlug !== existingPost.slug) {
      finalSlug = await this.ensureUniqueSlug(finalSlug, id);
    }
    
    const updated = await postRepository.updatePost(id, { 
      title: title || existingPost.title,
      slug: finalSlug,
      content: content || existingPost.content,
      category: category || existingPost.category,
      musicId: musicId !== undefined ? musicId : existingPost.musicId
    });
    
    // 文章不存在时的处理（理论上不会走到这里，因为前面已经检查过）
    if (!updated) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }
    
    return updated;
  }

  // ========================================
  // 删除业务
  // ========================================
  
  /**
   * 删除文章
   * @param {number} id - 文章 ID
   * @returns {Promise<Object>} 被删除的文章对象
   * @throws {Error} 如果文章不存在，抛出 404 错误
   * 
   * 业务逻辑：
   * 1. 调用 Repository 删除文章
   * 2. 如果返回 null（文章不存在），抛出 404 错误
   * 3. 否则返回被删除的文章信息
   * 
   * 扩展：如果将来需要权限控制
   * 可以在这里添加：if (post.authorId !== currentUserId) throw new Error('无权删除');
   */
  async deletePost(id) {
    const deleted = await postRepository.deletePost(id);
    
    // 文章不存在时的处理
    if (!deleted) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }
    
    return deleted;
  }

  /**
   * 更新文章封面
   * @param {number} id - 文章 ID
   * @param {string} coverPath - 封面图片路径
   * @returns {Promise<Object>} 更新后的文章对象
   */
  async updatePostCover(id, coverPath) {
    // 检查文章是否存在
    const post = await postRepository.findPostById(id);
    if (!post) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }

    // 更新封面
    const updated = await postRepository.updatePostCover(id, coverPath);
    return updated;
  }

  // ========================================
  // 浏览量统计
  // ========================================
  
  /**
   * 增加文章浏览量
   * @param {number} id - 文章 ID
   * @returns {Promise<Object>} 更新后的文章对象
   * @throws {Error} 如果文章不存在，抛出 404 错误
   * 
   * 业务逻辑：
   * 1. 调用 Repository 增加浏览量
   * 2. 如果文章不存在，抛出 404 错误
   * 3. 返回更新后的文章信息
   * 
   * 扩展：可以添加防刷机制
   * - 同一 IP 或用户在短时间内重复访问不增加浏览量
   * - 可以使用 Redis 存储访问记录，设置过期时间（如 30 分钟）
   */
  async incrementViewCount(id) {
    const updated = await postRepository.incrementViewCount(id);
    
    // 文章不存在时的处理
    if (!updated) {
      const error = new Error('文章不存在');
      error.statusCode = 404;
      throw error;
    }
    
    return updated;
  }
}

// ========================================
// 导出单例
// ========================================

/**
 * 导出 PostService 的单例实例
 * 
 * 为什么用单例？
 * - Service 层通常是无状态的（不保存数据）
 * - 创建多个实例没有意义，只需要一个实例就够了
 * - 使用 new PostService() 直接创建实例并导出
 * 
 * 其他文件使用：
 * const postService = require('./services/postService');
 * const posts = await postService.getAllPosts();
 */
module.exports = new PostService();
