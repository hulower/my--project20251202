/**
 * ============================================
 * 文件名：server/src/controllers/aiSummaryController.js
 * 作用：AI 摘要控制器
 * ============================================
 */

const postService = require('../services/postService');
const { generateSummary } = require('../services/aiSummaryService');
const Response = require('../utils/response');

/**
 * 生成文章 AI 摘要
 * POST /api/posts/:id/generate-summary
 */
async function generatePostSummary(req, res, next) {
  try {
    const { id } = req.params;
    console.log(`🤖 收到 AI 摘要生成请求: postId=${id}`);

    // 1. 获取文章
    const post = await postService.getPostById(Number(id));

    if (!post) {
      return Response.error(res, '文章不存在', 404, 404);
    }

    if (!post.content) {
      return Response.error(res, '文章内容为空，无法生成摘要', 400, 400);
    }

    // 2. 调用 AI 摘要服务
    const summary = await generateSummary(post.content);

    // 3. 更新文章摘要
    await postService.updatePostSummary(Number(id), summary);

    // 4. 返回结果
    Response.success(res, { summary }, 'AI 摘要生成成功');
  } catch (err) {
    console.error('❌ AI 摘要生成失败:', err.message);
    next(err);
  }
}

module.exports = { generatePostSummary };
