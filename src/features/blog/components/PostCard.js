import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Calendar, Tag, Edit, Trash2 } from 'lucide-react';

function PostCard({ post, onEdit, onDelete }) {
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
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 根据分类获取标签样式
  const getCategoryBadge = () => {
    const category = post.category || '技术博客';
    const styles = {
      '技术博客': {
        bg: 'bg-blue-500',
        text: 'text-white',
        icon: '📝',
        label: '技术博客'
      },
      '说说': {
        bg: 'bg-orange-500',
        text: 'text-white',
        icon: '💬',
        label: '说说'
      },
      '学习笔记': {
        bg: 'bg-green-500',
        text: 'text-white',
        icon: '📚',
        label: '学习笔记'
      }
    };
    return styles[category] || styles['技术博客'];
  };

  const categoryStyle = getCategoryBadge();

  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      {/* 装饰性渐变背景 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      
      <CardHeader className="pb-3 relative">
        {/* 分类标签 */}
        <div className="mb-4">
          <div 
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${categoryStyle.bg} ${categoryStyle.text} text-sm font-medium shadow-lg`}
            style={{ 
              fontWeight: '600',
              letterSpacing: '0.01em'
            }}
          >
            <span>{categoryStyle.icon}</span>
            <span>{categoryStyle.label}</span>
          </div>
        </div>

        {/* 标题 */}
        <CardTitle 
          onClick={handleViewDetail}
          className="text-2xl font-bold hover:text-primary transition-colors cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300"
          style={{ 
            fontWeight: '700',
            letterSpacing: '-0.01em',
            lineHeight: '1.3'
          }}
        >
          {post.title || '未命名'}
        </CardTitle>
      </CardHeader>

      <Separator className="bg-blue-100 dark:bg-blue-900/30" />

      <CardContent className="pt-5">
        <div 
          onClick={handleViewDetail}
          className="relative cursor-pointer group/content"
        >
          <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-blue-500/50 to-transparent rounded-full group-hover/content:from-blue-600/70 transition-colors" />
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

      <Separator className="bg-blue-100 dark:bg-blue-900/30" />

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
            <Tag className="w-3.5 h-3.5" />
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
            className="gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
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

export default PostCard;




