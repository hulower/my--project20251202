/**
 * ============================================
 * LRC 歌词文件解析工具
 * ============================================
 * 解析 LRC 格式歌词文件，提取元数据和歌词内容
 */

/**
 * 解析 LRC 文件内容，提取元数据
 * @param {string} lrcContent - LRC 文件的文本内容
 * @returns {Object} 包含元数据和歌词的对象
 */
export function parseLRCFile(lrcContent) {
  if (!lrcContent) {
    return {
      title: '',
      artist: '',
      album: '',
      by: '',
      offset: 0,
      lyrics: '',
    };
  }

  const lines = lrcContent.split('\n');
  const metadata = {};
  const lyricsLines = [];

  // LRC 元数据标签
  const tagRegex = /^\[(\w+):(.+)\]$/;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      // 跳过空行
      return;
    }

    const tagMatch = trimmedLine.match(tagRegex);
    
    if (tagMatch) {
      // 这是一个元数据标签
      const tag = tagMatch[1].toLowerCase();
      const value = tagMatch[2].trim();
      
      switch (tag) {
        case 'ti':  // 标题 (Title)
          metadata.title = value;
          break;
        case 'ar':  // 艺术家 (Artist)
          metadata.artist = value;
          break;
        case 'al':  // 专辑 (Album)
          metadata.album = value;
          break;
        case 'by':  // 作词/作曲 (By)
          metadata.by = value;
          break;
        case 'offset': // 时间偏移
          metadata.offset = parseInt(value, 10) || 0;
          break;
        // 其他标签：ver（版本）、length（长度）等
        default:
          // 保留其他标签行
          lyricsLines.push(trimmedLine);
      }
    } else {
      // 这是歌词行（可能包含时间戳）
      lyricsLines.push(trimmedLine);
    }
  });

  return {
    title: metadata.title || '',
    artist: metadata.artist || '',
    album: metadata.album || '',
    by: metadata.by || '',
    offset: metadata.offset || 0,
    lyrics: lyricsLines.join('\n').trim(),
  };
}

/**
 * 格式化 LRC 元数据为完整的 LRC 文件内容
 * @param {Object} metadata - 元数据对象
 * @param {string} metadata.title - 标题
 * @param {string} metadata.artist - 艺术家
 * @param {string} metadata.album - 专辑
 * @param {string} lyrics - 歌词内容（可以包含时间戳）
 * @returns {string} 完整的 LRC 文件内容
 */
export function formatLRCFile(metadata, lyrics) {
  const lines = [];
  
  // 添加元数据标签
  if (metadata.title) {
    lines.push(`[ti:${metadata.title}]`);
  }
  if (metadata.artist) {
    lines.push(`[ar:${metadata.artist}]`);
  }
  if (metadata.album) {
    lines.push(`[al:${metadata.album}]`);
  }
  if (metadata.by) {
    lines.push(`[by:${metadata.by}]`);
  }
  
  // 添加空行分隔
  lines.push('');
  
  // 添加歌词内容
  if (lyrics) {
    lines.push(lyrics);
  }
  
  return lines.join('\n');
}

/**
 * 验证 LRC 文件格式是否正确
 * @param {string} lrcContent - LRC 文件内容
 * @returns {boolean} 是否为有效的 LRC 格式
 */
export function isValidLRC(lrcContent) {
  if (!lrcContent) return false;
  
  // 检查是否包含时间戳格式 [mm:ss.xx] 或元数据标签 [ti:xxx]
  const timestampRegex = /\[\d{2}:\d{2}\.\d{2,3}\]/;
  const tagRegex = /^\[(ti|ar|al|by|offset):/im;
  
  return timestampRegex.test(lrcContent) || tagRegex.test(lrcContent);
}

/**
 * 从 LRC 内容中移除所有元数据标签，只保留歌词
 * @param {string} lrcContent - LRC 文件内容
 * @returns {string} 纯歌词内容（包含时间戳）
 */
export function removeLRCMetadata(lrcContent) {
  if (!lrcContent) return '';
  
  const lines = lrcContent.split('\n');
  const tagRegex = /^\[(\w+):/;
  
  return lines
    .filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return true; // 保留空行
      return !tagRegex.test(trimmed); // 移除标签行
    })
    .join('\n')
    .trim();
}

