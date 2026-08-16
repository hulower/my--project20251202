/**
 * ============================================
 * 文件名：server/src/controllers/aiSummaryController.js
 * 作用：AI 摘要控制器
 * ============================================
 */

const postService = require('../services/postService');
const { generateSummary, generateSummaryStream } = require('../services/aiSummaryService');
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

/**
 * 流式生成文章 AI 摘要（SSE）
 * POST /api/posts/:id/generate-summary-stream
 */
async function generatePostSummaryStream(req, res, next) {
  const { id } = req.params;
  console.log(`🤖 收到流式摘要生成请求: postId=${id}`);

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');  // 禁用 Nginx 缓冲

  let summary = '';

  try {
    const post = await postService.getPostById(Number(id));
    if (!post) {
      res.write(`data: ${JSON.stringify({ error: '文章不存在' })}\n\n`);
      res.end();
      return;
    }
    if (!post.content) {
      res.write(`data: ${JSON.stringify({ error: '文章内容为空' })}\n\n`);
      res.end();
      return;
    }

    // 发送开始事件
    res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`);

    // 逐 token 推送
    for await (const token of generateSummaryStream(post.content)) {
      summary += token;
      res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
    }

    // 持久化完整摘要
    await postService.updatePostSummary(Number(id), summary);

    // 发送完成事件
    res.write(`data: ${JSON.stringify({ type: 'done', summary })}\n\n`);
    res.end();
  } catch (err) {
    console.error('❌ 流式摘要失败:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
}

module.exports = { generatePostSummary, generatePostSummaryStream };
