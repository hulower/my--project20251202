import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { MessageCircle, Edit, Trash2, Calendar, Type } from 'lucide-react';

/**
 * MoodCard - 说说卡片组件
 * 用于展示"说说"类型的文章，UI 更简洁，类似微博风格
 */
function MoodCard({ post, onEdit, onDelete }) {
  const navigate = useNavigate();
  
  // 跳转到文章详情页
  const handleViewDetail = () => {
    // 优先使用 slug，如果没有 slug 则使用 ID（向后兼容）
    const identifier = post.slug || post.id;
    navigate(`/blog/post/${identifier}`);
  };
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-orange-50/30 to-white dark:from-orange-900/10 dark:to-gray-800/50">
      {/* 装饰性橙色渐变背景 */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-orange-400/10 to-pink-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      
      <CardContent className="pt-6 relative">
        {/* 顶部元信息 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {/* 醒目的分类标签 */}
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/30"
              style={{ 
                fontWeight: '600', 
                letterSpacing: '0.01em'
              }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>说说</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span
                style={{ 
                  fontWeight: '400', 
                  letterSpacing: '0.01em' 
                }}
              >
                {formatDate(post.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Type className="w-4 h-4" />
              <span
                style={{ 
                  fontWeight: '400', 
                  letterSpacing: '0.01em' 
                }}
              >
                {post.content?.length || 0} 字
              </span>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(post)}
              className="gap-1.5 hover:bg-orange-100 hover:text-orange-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="gap-1.5 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </Button>
          </div>
        </div>

        {/* 标题（可选） */}
        {post.title && (
          <h3 
            onClick={handleViewDetail}
            className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 cursor-pointer hover:from-orange-700 hover:to-pink-700 transition-all"
            style={{ 
              fontWeight: '700', 
              letterSpacing: '-0.01em',
              lineHeight: '1.4'
            }}
          >
            {post.title}
          </h3>
        )}

        {/* 内容 - 带有装饰性引号 */}
        <div 
          onClick={handleViewDetail}
          className="relative pl-4 border-l-4 border-orange-400/30 cursor-pointer hover:border-orange-500/50 transition-colors"
        >
          <div 
            className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
            style={{ 
              fontWeight: '400', 
              letterSpacing: '0.02em',
              lineHeight: '1.9'
            }}
          >
            {post.content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MoodCard;

