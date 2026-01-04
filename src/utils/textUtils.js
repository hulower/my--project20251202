/**
 * ============================================
 * 文件名：src/utils/textUtils.js
 * 作用：文本处理工具函数
 * ============================================
 */

/**
 * 从HTML字符串中提取纯文本内容
 * @param {string} html - HTML字符串
 * @returns {string} 纯文本内容
 */
export function extractTextFromHTML(html) {
  if (!html) return '';
  
  // 创建一个临时DOM元素来解析HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // 获取纯文本内容
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // 去除多余的空白字符
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * 计算HTML内容的字符数（不包含标签和空白）
 * @param {string} html - HTML字符串
 * @returns {number} 字符数
 */
export function getTextLength(html) {
  if (!html) return 0;
  
  const text = extractTextFromHTML(html);
  // 去除所有空白后计算长度
  return text.replace(/\s+/g, '').length;
}

/**
 * 计算阅读时长（分钟）
 * @param {string} html - HTML字符串
 * @param {number} wordsPerMinute - 每分钟阅读字数，默认300
 * @returns {number} 阅读时长（分钟）
 */
export function calculateReadingTime(html, wordsPerMinute = 300) {
  const length = getTextLength(html);
  const minutes = Math.ceil(length / wordsPerMinute);
  return Math.max(1, minutes); // 至少1分钟
}

