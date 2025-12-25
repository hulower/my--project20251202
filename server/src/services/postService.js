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
  // 查询业务
  // ========================================
  
  /**
   * 获取所有文章
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

  // ========================================
  // 创建业务
  // ========================================
  
  /**
   * 创建新文章
   * @param {Object} params - 文章信息
   * @param {string} params.title - 文章标题
   * @param {string} params.content - 文章内容
   * @returns {Promise<Object>} 新创建的文章对象
   * @throws {Error} 如果标题或内容为空，抛出 400 错误
   * 
   * 业务逻辑：
   * 1. 验证标题和内容不能为空
   * 2. 如果验证失败，抛出 400 错误（Bad Request）
   * 3. 如果验证通过，调用 Repository 创建文章
   * 
   * 为什么要在这里验证？
   * - Repository 不关心业务规则，只负责存数据
   * - Service 负责确保数据符合业务要求
   * - 这样如果业务规则改变（比如标题不能超过 100 字），只需要改 Service
   */
  async createPost({ title, content }) {
    // 数据验证
    if (!title || !content) {
      const error = new Error('标题和内容不能为空');
      error.statusCode = 400; // 400 = Bad Request（请求参数错误）
      throw error;
    }
    
    // 验证通过，调用 Repository 创建文章
    return await postRepository.createPost({ title, content });
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
   * @returns {Promise<Object>} 更新后的文章对象
   * @throws {Error} 如果文章不存在，抛出 404 错误
   * 
   * 业务逻辑：
   * 1. 调用 Repository 更新文章
   * 2. 如果返回 null（文章不存在），抛出 404 错误
   * 3. 否则返回更新后的文章
   * 
   * 注意：这里没有验证 title 和 content 是否为空
   * 如果需要，可以添加和 createPost 一样的验证逻辑
   */
  async updatePost(id, { title, content }) {
    const updated = await postRepository.updatePost(id, { title, content });
    
    // 文章不存在时的处理
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
