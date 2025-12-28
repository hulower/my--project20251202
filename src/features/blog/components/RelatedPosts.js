import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import * as blogApi from '../../../api/blogApi';
import { BookOpen, Calendar, TrendingUp } from 'lucide-react';

/**
 * RelatedPosts - 相关文章推荐组件
 * 显示同分类的其他文章，或最新文章
 */
function RelatedPosts({ currentPostId, category, limit = 5 }) {
  const navigate = useNavigate();
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRelatedPosts();
  }, [currentPostId, category]);

  const loadRelatedPosts = async () => {
    try {
      setLoading(true);

      // 获取同分类的文章
      const params = {
        category,
        pageSize: limit + 1, // 多获取一篇，用于过滤当前文章
      };

      const result = await blogApi.fetchPosts(params);
      
      // 过滤掉当前文章
      const filtered = (result.list || result)
        .filter((post) => post.id !== currentPostId)
        .slice(0, limit);

      setRelatedPosts(filtered);
    } catch (err) {
      console.error('加载相关文章失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post) => {
    const identifier = post.slug || post.id;
    navigate(`/blog/post/${identifier}`);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 截取标题
  const truncateTitle = (title, maxLength = 40) => {
    if (!title) return '';
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  if (loading) {
    return (
      <Card className="sticky top-20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span style={{ fontWeight: '600', letterSpacing: '0.01em' }}>
              相关推荐
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <span style={{ fontWeight: '600', letterSpacing: '0.01em' }}>
            相关推荐
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedPosts.map((post, index) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post)}
              className="group cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              {/* 排名数字 */}
              <div className="flex items-start gap-3">
                <div
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${
                      index < 3
                        ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }
                  `}
                  style={{ fontWeight: '700' }}
                >
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* 标题 */}
                  <h4
                    className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2"
                    style={{
                      fontWeight: '600',
                      letterSpacing: '0.01em',
                      lineHeight: '1.4',
                    }}
                  >
                    {post.title}
                  </h4>

                  {/* 元信息 */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                      {formatDate(post.createdAt)}
                    </span>
                    <span>•</span>
                    <span style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                      {post.content?.length || 0} 字
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RelatedPosts;

