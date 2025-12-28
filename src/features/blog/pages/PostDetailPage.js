import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as blogApi from '../../../api/blogApi';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2,
  AlertCircle,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ArticleMetaInfo from '../components/ArticleMetaInfo';
import ArticleToc from '../components/ArticleToc';
import RelatedPosts from '../components/RelatedPosts';
import ReadingProgress from '../components/ReadingProgress';
import ArticleMusicPlayer from '../../../components/ArticleMusicPlayer/ArticleMusicPlayer';
import '../styles/article-content.css';

/**
 * PostDetailPage - 文章详情页（三栏布局）
 * 路由：/blog/post/:slug
 * 
 * 布局：
 * - 左侧栏：作者信息（复用 Sidebar）
 * - 中间：文章内容主体
 * - 右侧栏：文章元信息、目录、相关推荐
 */
function PostDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      
      // 智能判断：如果 slug 是纯数字，使用 ID 查询；否则使用 slug 查询
      const isNumeric = /^\d+$/.test(slug);
      const data = isNumeric 
        ? await blogApi.fetchPostById(slug)
        : await blogApi.fetchPostBySlug(slug);
      
      setPost(data);
      setError(null);
    } catch (err) {
      console.error('加载文章失败:', err);
      setError('文章不存在或已被删除');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // TODO: 跳转到编辑页面或打开编辑对话框
    console.log('编辑文章:', post.id);
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这篇文章吗？')) return;
    
    try {
      await blogApi.deletePost(post.id);
      alert('删除成功！');
      navigate('/blog');
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败，请稍后重试');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground" style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
          加载中...
        </p>
      </div>
    );
  }

  // 错误状态
  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2" style={{ fontWeight: '700', letterSpacing: '0.01em' }}>
          文章不存在
        </h2>
        <p className="text-muted-foreground mb-6" style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
          {error || '找不到该文章'}
        </p>
        <Button onClick={() => navigate('/blog')}>
          返回博客首页
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* 阅读进度条 */}
      <ReadingProgress />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* 顶部操作栏 */}
        <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="gap-2"
                style={{ fontWeight: '500', letterSpacing: '0.01em' }}
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  style={{ fontWeight: '500', letterSpacing: '0.01em' }}
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">点赞</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  style={{ fontWeight: '500', letterSpacing: '0.01em' }}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">分享</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="gap-1.5"
                  style={{ fontWeight: '500', letterSpacing: '0.01em' }}
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">编辑</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="gap-1.5 text-red-600 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:hover:bg-red-900/20"
                  style={{ fontWeight: '500', letterSpacing: '0.01em' }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">删除</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 三栏布局主体 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 左侧栏 - 作者信息 */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <Sidebar />
              </div>
            </aside>

            {/* 中间 - 文章内容主体 */}
            <main className="lg:col-span-6">
              <article className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm p-6 sm:p-8">
                {/* 文章标题 */}
                <h1 
                  className="text-3xl sm:text-4xl font-bold mb-4 leading-tight text-gray-900 dark:text-white"
                  style={{ 
                    fontWeight: '800',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.2'
                  }}
                >
                  {post.title}
                </h1>

                <Separator className="my-6" />

                {/* 文章配乐 - 放在文章开头 */}
                {post.musicId && (
                  <ArticleMusicPlayer musicId={post.musicId} />
                )}

                {/* 文章正文 */}
                <div className="article-content whitespace-pre-wrap">
                  {post.content}
                </div>

                {/* 文章底部信息 */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* 互动按钮 */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        className="gap-2"
                        style={{ fontWeight: '500', letterSpacing: '0.01em' }}
                      >
                        <Heart className="w-4 h-4" />
                        点赞 (0)
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        style={{ fontWeight: '500', letterSpacing: '0.01em' }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        评论 (0)
                      </Button>
                    </div>

                    {/* 返回列表 */}
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/blog')}
                      className="gap-2"
                      style={{ fontWeight: '500', letterSpacing: '0.01em' }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      返回列表
                    </Button>
                  </div>
                </div>
              </article>

              {/* 评论区（预留） */}
              <div className="mt-8 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm p-6 sm:p-8">
                <h2 
                  className="text-xl font-bold mb-4 flex items-center gap-2"
                  style={{ fontWeight: '700', letterSpacing: '0.01em' }}
                >
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  评论区
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8" style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                  暂无评论，快来发表你的看法吧~
                </p>
              </div>
            </main>

            {/* 右侧栏 - 文章元信息、目录、相关推荐 */}
            <aside className="lg:col-span-3">
              <div className="space-y-6">
                {/* 文章元信息 */}
                <ArticleMetaInfo post={post} />

                {/* 文章目录 */}
                <ArticleToc content={post.content} />

                {/* 相关推荐 */}
                <RelatedPosts 
                  currentPostId={post.id} 
                  category={post.category} 
                  limit={5} 
                />
              </div>
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}

export default PostDetailPage;
