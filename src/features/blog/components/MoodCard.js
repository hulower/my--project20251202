import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
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
      
      <CardHeader className="pb-3 relative">
        {/* 分类标签 */}
        <div className="mb-4">
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
        </div>

        {/* 标题（如果有） */}
        {post.title && (
          <h3 
            onClick={handleViewDetail}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 cursor-pointer hover:from-orange-700 hover:to-pink-700 transition-all"
            style={{ 
              fontWeight: '700', 
              letterSpacing: '-0.01em',
              lineHeight: '1.3'
            }}
          >
            {post.title}
          </h3>
        )}
      </CardHeader>

      <Separator className="bg-orange-100 dark:bg-orange-900/30" />

      <CardContent className="pt-5">
        {/* 内容预览 - 限制4行 */}
        <div 
          onClick={handleViewDetail}
          className="relative cursor-pointer group/content"
        >
          <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-orange-500/50 to-transparent rounded-full group-hover/content:from-orange-600/70 transition-colors" />
          <p 
            className="text-base text-gray-700 dark:text-gray-300 line-clamp-4 pl-3"
            style={{ 
              fontWeight: '400', 
              letterSpacing: '0.02em',
              lineHeight: '1.8'
            }}
          >
            {post.content}
          </p>
        </div>
      </CardContent>

      <Separator className="bg-orange-100 dark:bg-orange-900/30" />

      <CardFooter className="pt-4 flex items-center justify-between">
        {/* 元信息 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
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
            <Type className="w-3.5 h-3.5" />
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
            variant="outline"
            size="sm"
            onClick={() => onEdit(post)}
            className="gap-1.5 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-colors"
          >
            <Edit className="w-4 h-4" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(post.id, post.title)}
            className="gap-1.5 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default MoodCard;

