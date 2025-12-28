import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Calendar, Clock, Eye, Type, Tag } from 'lucide-react';

/**
 * ArticleMetaInfo - 文章元信息组件
 * 显示发布时间、阅读时长、字数、浏览量等
 */
function ArticleMetaInfo({ post }) {
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 计算阅读时长（按平均阅读速度 300 字/分钟计算）
  const calculateReadingTime = (content) => {
    if (!content) return 0;
    const wordCount = content.length;
    const minutes = Math.ceil(wordCount / 300);
    return minutes;
  };

  // 获取分类样式
  const getCategoryStyle = (category) => {
    const styles = {
      '技术博客': { bg: 'bg-blue-500', text: 'text-white', icon: '📝' },
      '说说': { bg: 'bg-orange-500', text: 'text-white', icon: '💬' },
      '学习笔记': { bg: 'bg-green-500', text: 'text-white', icon: '📚' },
    };
    return styles[category] || styles['技术博客'];
  };

  const categoryStyle = getCategoryStyle(post.category);
  const readingTime = calculateReadingTime(post.content);
  const wordCount = post.content?.length || 0;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {/* 分类标签 */}
        <div className="flex items-center justify-between mb-4">
          <Badge
            className={`${categoryStyle.bg} ${categoryStyle.text} px-4 py-1.5 text-sm font-semibold shadow-md`}
            style={{
              fontWeight: '600',
              letterSpacing: '0.01em',
            }}
          >
            <span className="mr-1.5">{categoryStyle.icon}</span>
            {post.category || '技术博客'}
          </Badge>
        </div>

        <Separator className="my-4" />

        {/* 元信息列表 */}
        <div className="space-y-3">
          {/* 发布时间 */}
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div>
              <div
                className="text-xs text-gray-500 dark:text-gray-400 mb-0.5"
                style={{ fontWeight: '500', letterSpacing: '0.01em' }}
              >
                发布时间
              </div>
              <div style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                {formatDate(post.createdAt)}
              </div>
            </div>
          </div>

          {/* 最后更新 */}
          {post.updatedAt && post.updatedAt !== post.createdAt && (
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <div>
                <div
                  className="text-xs text-gray-500 dark:text-gray-400 mb-0.5"
                  style={{ fontWeight: '500', letterSpacing: '0.01em' }}
                >
                  最后更新
                </div>
                <div style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                  {formatDate(post.updatedAt)}
                </div>
              </div>
            </div>
          )}

          {/* 阅读时长 */}
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4 text-green-500 flex-shrink-0" />
            <div>
              <div
                className="text-xs text-gray-500 dark:text-gray-400 mb-0.5"
                style={{ fontWeight: '500', letterSpacing: '0.01em' }}
              >
                阅读时长
              </div>
              <div style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                约 {readingTime} 分钟
              </div>
            </div>
          </div>

          {/* 字数统计 */}
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Type className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <div>
              <div
                className="text-xs text-gray-500 dark:text-gray-400 mb-0.5"
                style={{ fontWeight: '500', letterSpacing: '0.01em' }}
              >
                字数统计
              </div>
              <div style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                {wordCount.toLocaleString()} 字
              </div>
            </div>
          </div>

          {/* 浏览量（预留，后续可以接入真实统计） */}
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Eye className="w-4 h-4 text-red-500 flex-shrink-0" />
            <div>
              <div
                className="text-xs text-gray-500 dark:text-gray-400 mb-0.5"
                style={{ fontWeight: '500', letterSpacing: '0.01em' }}
              >
                浏览量
              </div>
              <div style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                {post.viewCount || 0} 次
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* 标签（预留，后续可以添加标签功能） */}
        <div className="flex items-start gap-3 text-sm">
          <Tag className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div
              className="text-xs text-gray-500 dark:text-gray-400 mb-2"
              style={{ fontWeight: '500', letterSpacing: '0.01em' }}
            >
              文章标签
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="text-xs"
                style={{ fontWeight: '400', letterSpacing: '0.01em' }}
              >
                {post.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ArticleMetaInfo;

