import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Calendar, Eye, BookOpen, Edit, Trash2 } from 'lucide-react';
import { RoleGuard } from '../../../components/ProtectedRoute';
import { getTextLength, calculateReadingTime } from '../../../utils/textUtils';
import PostTags from './PostTags';

function PostCard({ post, onEdit, onDelete }) {
  const navigate = useNavigate();
  
  // 跳转到文章详情页
  const handleViewDetail = () => {
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
  const getCategoryStyle = () => {
    const category = post.category || '技术博客';
    const styles = {
      '技术博客': {
        color: 'bg-blue-500',
        label: '技术博客'
      },
      '说说': {
        color: 'bg-orange-500',
        label: '心情随笔'
      },
      '学习笔记': {
        color: 'bg-green-500',
        label: '学习笔记'
      }
    };
    return styles[category] || styles['技术博客'];
  };

  const categoryStyle = getCategoryStyle();
  
  // 计算字数和阅读时长
  const wordCount = getTextLength(post.content || '');
  const readingTime = calculateReadingTime(post.content || '');
  
  // 获取配图URL（优先使用后端存储的配图，否则使用默认图片）
  const coverUrl = post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';

  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
      {/* 分类标签 - 右上角 */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className={`${categoryStyle.color} text-white px-3 py-1 text-xs font-medium`}>
          {categoryStyle.label}
        </Badge>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* 标题 - 居中 */}
        <h3 
          onClick={handleViewDetail}
          className="text-2xl font-bold text-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 min-h-[4rem] flex items-center justify-center"
        >
          {post.title || '未命名'}
        </h3>

        {/* 元信息 - 一行显示 */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
          {/* 日期 */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          
          {/* 字数 */}
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>{wordCount}字</span>
          </div>
          
          {/* 热度 */}
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{post.viewCount || 0}次</span>
          </div>
          
          {/* 阅读时长 */}
          <div className="flex items-center gap-1.5">
            <span>⏱️</span>
            <span>约{readingTime}分钟</span>
          </div>
        </div>

        {/* 配图 - 固定16:9比例，优雅显示 */}
        <div 
          onClick={handleViewDetail}
          className="relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900"
        >
          <img
            src={coverUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';
            }}
          />
          {/* 图片遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* 阅读全文按钮 */}
        <div className="flex justify-center">
          <Button
            onClick={handleViewDetail}
            className="px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium"
            size="sm"
          >
            阅读全文
          </Button>
        </div>

        {/* 标签 */}
        <PostTags tags={post.tags} />
      </CardContent>

      {/* 管理员操作按钮 */}
      <RoleGuard roles={['editor', 'admin']}>
        <CardFooter className="pt-0 px-6 pb-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(post)}
            className="flex-1 gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
          >
            <Edit className="w-4 h-4" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(post.id, post.title)}
            className="flex-1 gap-1.5 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </Button>
        </CardFooter>
      </RoleGuard>
    </Card>
  );
}

export default PostCard;
