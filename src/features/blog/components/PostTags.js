/**
 * ============================================
 * 文件名：PostTags.js
 * 作用：文章标签显示组件
 * ============================================
 * 用于在文章卡片中显示标签
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';

function PostTags({ tags = [] }) {
  const navigate = useNavigate();
  
  if (!tags || tags.length === 0) {
    return null;
  }

  const handleTagClick = (slug, e) => {
    e.stopPropagation(); // 防止触发父元素的点击事件
    navigate(`/blog?tag=${slug}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
      <Tag className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      {tags.map((tag) => (
        <span
          key={tag.id}
          onClick={(e) => handleTagClick(tag.slug, e)}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-all hover:opacity-80 hover:scale-105 cursor-pointer"
          style={{ 
            backgroundColor: tag.color + '15',
            color: tag.color,
            border: `1px solid ${tag.color}30`,
            fontWeight: '500',
            letterSpacing: '0.01em'
          }}
          title={`点击查看"${tag.name}"相关文章`}
        >
          #{tag.name}
        </span>
      ))}
    </div>
  );
}

export default PostTags;

