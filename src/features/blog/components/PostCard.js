import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Calendar, Folder, Tag, Edit, Trash2 } from 'lucide-react';

function PostCard({ post, onEdit, onDelete }) {
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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            📝 置顶
          </Badge>
        </div>
        <CardTitle 
          className="text-2xl font-bold hover:text-primary transition-colors"
          style={{ 
            fontWeight: '700',
            letterSpacing: '0.01em',
            lineHeight: '1.3'
          }}
        >
          {post.title}
        </CardTitle>
        <CardDescription 
          className="flex flex-wrap gap-3 mt-3"
          style={{ 
            fontWeight: '400',
            letterSpacing: '0.01em'
          }}
        >
          <span className="flex items-center gap-1 text-sm">
            <Calendar className="w-4 h-4" />
            {formatDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-1 text-sm">
            <Folder className="w-4 h-4" />
            个人博客
          </span>
          <span className="flex items-center gap-1 text-sm">
            <Tag className="w-4 h-4" />
            技术 / 前端
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p 
          className="text-muted-foreground leading-relaxed"
          style={{ 
            fontWeight: '400',
            letterSpacing: '0.01em',
            lineHeight: '1.7'
          }}
        >
          {getExcerpt(post.content)}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Button 
          variant="link" 
          className="px-0"
          style={{ 
            fontWeight: '500',
            letterSpacing: '0.01em'
          }}
        >
          阅读全文 →
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(post)}
            className="gap-1"
            style={{ 
              fontWeight: '500',
              letterSpacing: '0.01em'
            }}
          >
            <Edit className="w-4 h-4" />
            编辑
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="gap-1"
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




