/**
 * ============================================
 * 文件名：server/src/services/aiSummaryService.js
 * 作用：AI 摘要生成服务
 * ============================================
 *
 * 基于 LangChain.js + DeepSeek API 实现文章摘要生成。
 * 每次生成前加载 summarySkill 定义的 Prompt 模板，
 * 统一摘要的风格、字数、语气等规则。
 */

const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } = require('@langchain/core/prompts');
const { SUMMARY_SKILL } = require('./summarySkill');

/**
 * 从 HTML 提取纯文本
 * @param {string} html - HTML 内容
 * @returns {string} 纯文本
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')      // 去掉所有 HTML 标签
    .replace(/&nbsp;/g, ' ')       // 替换 &nbsp;
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')          // 合并连续空白
    .trim();
}

/**
 * 生成文章摘要
 *
 * @param {string} content - 文章 HTML 内容
 * @param {string} skillName - Skill 名称（默认 'default'）
 * @returns {Promise<string>} 摘要文本
 */
async function generateSummary(content, skillName = 'default') {
  // 1. HTML → 纯文本
  const plainText = stripHtml(content);

  if (!plainText || plainText.length < 50) {
    throw new Error('文章内容过短，无法生成摘要');
  }

  // 2. 选择 Skill（后续可扩展多 Skill 选择）
  const skill = SUMMARY_SKILL;

  console.log(`🤖 开始生成摘要，文章长度: ${plainText.length} 字符，Skill: ${skill.name}`);

  // 3. 构建 Prompt 模板：SystemMessage（Skill 规则）+ HumanMessage（文章内容）
  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(skill.systemPrompt),
    HumanMessagePromptTemplate.fromTemplate('请为以下文章生成摘要：\n\n{content}'),
  ]);

  // 4. 创建模型实例（DeepSeek 兼容 OpenAI 接口）
  const model = new ChatOpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    configuration: {
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    },
    modelName: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    temperature: 0.3,         // 低温度，保持摘要稳定可预期
    maxTokens: 300,            // 摘要不需要太长
  });

  // 5. 链式调用
  const chain = prompt.pipe(model);
  const result = await chain.invoke({ content: plainText });

  const summary = result.content.trim();
  console.log(`✅ 摘要生成成功，长度: ${summary.length} 字符`);

  return summary;
}

/**
 * 流式生成文章摘要（每次返回一个 token）
 * 用于 SSE 逐字推送给前端，实现打字机效果
 *
 * @param {string} content - 文章 HTML 内容
 * @param {string} skillName - Skill 名称
 * @returns {AsyncGenerator<string>} 每次 yield 一个文本片段
 */
async function* generateSummaryStream(content, skillName = 'default') {
  const plainText = stripHtml(content);

  if (!plainText || plainText.length < 50) {
    throw new Error('文章内容过短，无法生成摘要');
  }

  const skill = SUMMARY_SKILL;
  console.log(`🤖 开始流式生成摘要，文章长度: ${plainText.length} 字符`);

  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(skill.systemPrompt),
    HumanMessagePromptTemplate.fromTemplate('请为以下文章生成摘要：\n\n{content}'),
  ]);

  const model = new ChatOpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    configuration: {
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    },
    modelName: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    temperature: 0.3,
    maxTokens: 300,
    streaming: true,           // ← 关键：启用流式输出
  });

  const chain = prompt.pipe(model);
  const stream = await chain.stream({ content: plainText });

  for await (const chunk of stream) {
    if (chunk.content) {
      yield chunk.content;     // 每次 yield 一个 token
    }
  }
  console.log('✅ 流式摘要生成完成');
}

module.exports = { generateSummary, generateSummaryStream };
