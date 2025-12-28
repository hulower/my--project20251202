import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Calendar, Folder, Tag, Edit, Trash2 } from 'lucide-react';

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

  // 截取摘要（前150字）
  const getExcerpt = (content) => {
    if (!content) return '';
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
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
      
      <CardHeader className="relative">
        {/* 分类标签 - 醒目的彩色标签 */}
        <div className="flex items-center justify-between mb-4">
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
        <CardTitle 
          onClick={handleViewDetail}
          className="text-3xl font-bold hover:text-primary transition-colors cursor-pointer mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300"
          style={{ 
            fontWeight: '800',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}
        >
          {post.title}
        </CardTitle>
        <CardDescription 
          className="flex flex-wrap gap-4 mt-2"
          style={{ 
            fontWeight: '500',
            letterSpacing: '0.01em'
          }}
        >
          <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-blue-500" />
            {formatDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Tag className="w-4 h-4 text-purple-500" />
            {post.content?.length || 0} 字
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p 
          className="text-gray-700 dark:text-gray-300 leading-relaxed text-base"
          style={{ 
            fontWeight: '400',
            letterSpacing: '0.02em',
            lineHeight: '1.8'
          }}
        >
          {getExcerpt(post.content)}
        </p>
      </CardContent>

      <CardFooter className="relative flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
        <Button 
          onClick={handleViewDetail}
          variant="link" 
          className="px-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 group/read"
          style={{ 
            fontWeight: '600',
            letterSpacing: '0.01em'
          }}
        >
          阅读全文 
          <span className="inline-block ml-1 group-hover/read:translate-x-1 transition-transform">→</span>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(post)}
            className="gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
            style={{ 
              fontWeight: '500',
              letterSpacing: '0.01em'
            }}
          >
            <Edit className="w-4 h-4" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="gap-1.5 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            style={{ 
              fontWeight: '500',
              letterSpacing: '0.01em'
            }}
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




