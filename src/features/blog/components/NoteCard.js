import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { BookMarked, Edit, Trash2, Calendar, Type } from 'lucide-react';

/**
 * NoteCard - 学习笔记卡片组件
 * 用于展示"学习笔记"类型的文章，强调知识分类和标签
 */
function NoteCard({ post, onEdit, onDelete }) {
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
      month: 'long', 
      day: 'numeric' 
    });
  };

  // 从内容中提取潜在的标签（简单实现，可后续改为从数据库获取）
  const extractTags = (content) => {
    // 这里是一个简单的实现，实际应该从数据库中获取标签
    const keywords = ['React', 'Node.js', 'JavaScript', 'TypeScript', 'CSS', 'HTML'];
    const foundTags = keywords.filter(keyword => 
      content?.toLowerCase().includes(keyword.toLowerCase())
    );
    return foundTags.slice(0, 3); // 最多显示3个标签
  };

  const tags = extractTags(post.content);

  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-green-50/30 to-white dark:from-green-900/10 dark:to-gray-800/50">
      {/* 装饰性绿色渐变背景 */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      
      <CardHeader className="pb-3 relative">
        {/* 分类标签 */}
        <div className="mb-4">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium shadow-lg shadow-green-500/30"
            style={{ 
              fontWeight: '600',
              letterSpacing: '0.01em'
            }}
          >
            <BookMarked className="w-4 h-4" />
            <span>学习笔记</span>
          </div>
        </div>

        {/* 标题 */}
        <div className="flex items-start justify-between gap-4">
          <CardTitle 
            onClick={handleViewDetail}
            className="text-2xl font-bold hover:text-green-600 transition-colors cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 hover:from-green-600 hover:to-emerald-600"
            style={{ 
              fontWeight: '700', 
              letterSpacing: '-0.01em',
              lineHeight: '1.3'
            }}
          >
            {post.title || '未命名笔记'}
          </CardTitle>
        </div>

        {/* 标签 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                style={{ 
                  fontWeight: '500', 
                  letterSpacing: '0.01em' 
                }}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <Separator className="bg-green-100 dark:bg-green-900/30" />

      <CardContent className="pt-5">
        {/* 内容预览 - 带有图标装饰 */}
        <div 
          onClick={handleViewDetail}
          className="relative cursor-pointer group/content"
        >
          <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-green-500/50 to-transparent rounded-full group-hover/content:from-green-600/70 transition-colors" />
          <p 
            className="text-base text-gray-700 dark:text-gray-300 line-clamp-3 pl-3"
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

      <Separator className="bg-green-100 dark:bg-green-900/30" />

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
            className="gap-1.5 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors"
          >
            <Edit className="w-4 h-4" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(post.id)}
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

export default NoteCard;

