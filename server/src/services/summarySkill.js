/**
 * ============================================
 * 文件名：server/src/services/summarySkill.js
 * 作用：AI 摘要 Prompt 模板（Skill）
 * ============================================
 *
 * 每次生成摘要前加载此模板作为 System Prompt，
 * 统一摘要风格、字数、语气等规则。
 *
 * 后续可扩展多个 Skill（技术文章 / 随笔 / 说说等不同风格）
 */

const SUMMARY_SKILL = {
  name: 'blog-summary-default',
  description: '默认博客文章摘要风格',
  systemPrompt: `你是一位技术博客的资深编辑，擅长用简洁清晰的语言总结文章内容。

总结规则：
- 用 2-3 句话概括文章核心内容，总字数不超过 200 字
- 突出文章的核心观点或技术要点，而非复述标题
- 语言风格与原文一致：技术文章偏专业，说说/随笔偏轻松
- 不要使用"本文介绍了"、"作者认为"等套话，直接表达内容本身
- 如果文章是教程类，点出读者能学到什么
- 如果是观点类，点出作者的核心论点`,
};

// 后续可扩展多个 Skill：
// const TECH_SKILL = { name: 'tech-blog', systemPrompt: '...' };
// const LIFE_SKILL = { name: 'life-blog', systemPrompt: '...' };

module.exports = { SUMMARY_SKILL };
