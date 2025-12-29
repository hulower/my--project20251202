/**
 * ============================================
 * 文件名：server/src/controllers/postController.js
 * 作用：控制器层 (Controller) - 博客文章（企业级规范版本）
 * ============================================
 */

const postService = require('../services/postService');
const Response = require('../utils/response');
const { uploadPostCover } = require('../middleware/postCoverUpload');

/**
 * 获取文章列表（支持分页和分类筛选）
 * GET /api/posts?page=1&pageSize=10&category=说说
 */
async function listPosts(req, res, next) {
  try {
    const { page, pageSize, category } = req.query;
    
    console.log('📥 收到请求: GET /api/posts', { 
      page, 
      pageSize, 
      category 
    });
    
    // 如果有分页参数，使用分页查询
    if (page || pageSize) {
      const params = {
        page: page ? parseInt(page) : 1,
        pageSize: pageSize ? parseInt(pageSize) : 10,
        category: category || null
      };
      
      const result = await postService.getPostsWithPagination(params);
      Response.success(res, result, '获取文章列表成功');
    } else {
      // 否则返回所有文章（向后兼容）
      const posts = await postService.getAllPosts();
      Response.success(res, posts, '获取文章列表成功');
    }
  } catch (err) {
    next(err);
  }
}

/**
 * 根据 ID 获取单篇文章
 * GET /api/posts/:id
 */
async function getPost(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('📥 收到请求: GET /api/posts/:id', { id });
    
    const post = await postService.getPostById(id);
    Response.success(res, post, '获取文章成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 根据 slug 获取单篇文章
 * GET /api/posts/slug/:slug
 * 
 * 示例：
 * GET /api/posts/slug/my-first-post
 * GET /api/posts/slug/react-tutorial
 */
async function getPostBySlug(req, res, next) {
  try {
    const slug = req.params.slug;
    console.log('📥 收到请求: GET /api/posts/slug/:slug', { slug });
    
    const post = await postService.getPostBySlug(slug);
    Response.success(res, post, '获取文章成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 创建新文章
 * POST /api/posts
 */
async function createPost(req, res, next) {
  try {
    console.log('📥 收到请求: POST /api/posts', req.body);
    const created = await postService.createPost(req.body);
    Response.created(res, created, '文章创建成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 更新文章
 * PUT /api/posts/:id
 */
async function updatePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('📥 收到请求: PUT /api/posts/:id', { id, body: req.body });
    
    const updated = await postService.updatePost(id, req.body);
    Response.success(res, updated, '文章更新成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 删除文章
 * DELETE /api/posts/:id
 */
async function deletePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('📥 收到请求: DELETE /api/posts/:id', { id });
    
    const deleted = await postService.deletePost(id);
    Response.success(res, deleted, '文章删除成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 上传文章封面
 * POST /api/posts/:id/cover
 */
async function uploadCover(req, res, next) {
  // 使用 multer 中间件处理上传
  uploadPostCover.single('cover')(req, res, async (err) => {
    if (err) {
      console.error('❌ 封面上传错误:', err);
      return Response.error(res, err.message, 400, 400);
    }

    try {
      const id = Number(req.params.id);
      console.log('📥 收到请求: POST /api/posts/:id/cover', { id, file: req.file?.filename });

      if (!req.file) {
        return Response.error(res, '请选择封面图片', 400, 400);
      }

      // 构建封面图片URL
      const coverPath = `/uploads/posts/covers/${req.file.filename}`;
      
      // 更新文章的封面字段
      const updatedPost = await postService.updatePostCover(id, coverPath);
      
      Response.success(res, {
        ...updatedPost,
        coverImage: `${process.env.API_BASE_URL || 'http://localhost:5001'}${coverPath}`
      }, '封面上传成功');
    } catch (err) {
      next(err);
    }
  });
}

/**
 * 删除文章封面
 * DELETE /api/posts/:id/cover
 */
async function removeCover(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('📥 收到请求: DELETE /api/posts/:id/cover', { id });

    // 将文章的封面字段设置为 NULL
    const updatedPost = await postService.updatePostCover(id, null);
    
    Response.success(res, updatedPost, '封面删除成功');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPosts,
  getPost,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  uploadCover,
  removeCover,
};

