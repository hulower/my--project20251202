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
  MessageCircle,
  Heart,
  Sparkles
} from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmDialog from '../../../components/ConfirmDialog';
// import Sidebar from '../components/Sidebar'; // 移除左侧栏
import ArticleMetaInfo from '../components/ArticleMetaInfo';
import ArticleToc from '../components/ArticleToc';
import ReadingProgress from '../components/ReadingProgress';
import ArticleMusicPlayer from '../../../components/ArticleMusicPlayer/ArticleMusicPlayer';
import Comments from '../../../components/Comments/Comments';
import LikeButton from '../../../components/LikeButton/LikeButton';
import '../styles/article-content.css';
import '../../../components/RichTextEditor/rich-text-editor.css';

/**
 * PostDetailPage - 文章详情页（居中两栏布局）
 * 路由：/blog/post/:slug
 * 
 * 布局：
 * - 左侧留白（1列 / 8.3%）
 * - 主内容区（8列 / 66.7%）：文章标题、元信息、内容主体、评论
 * - 右侧栏（3列 / 25%）：文章目录
 */
function PostDetailPage() {
  const { toast } = useToast();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // AI 摘要
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState(null);

  // 生成 AI 摘要
  const handleGenerateSummary = async () => {
    if (!post || !post.id) return;
    try {
      setGeneratingSummary(true);
      const result = await blogApi.generateSummary(post.id);
      setSummary(result.summary);
      setPost(prev => ({ ...prev, summary: result.summary }));
      toast({
        title: '✓ 摘要生成成功',
        description: 'AI 已自动生成文章摘要',
      });
    } catch (err) {
      console.error('生成摘要失败:', err);
      toast({
        variant: 'destructive',
        title: '✗ 生成失败',
        description: err.message || '请稍后重试',
      });
    } finally {
      setGeneratingSummary(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [slug]);

  // 为文章标题添加 ID，以支持目录锚点跳转
  useEffect(() => {
    if (!post) return;

    const articleContent = document.querySelector('.article-content');
    if (!articleContent) return;

    const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      // 统一覆盖赋值，确保与 ArticleToc 中的 ID 完全一致
      heading.id = `heading-${index}`;
    });
  }, [post]);

  const loadPost = async () => {
    try {
      setLoading(true);
      
      // 智能判断：如果 slug 是纯数字，使用 ID 查询；否则使用 slug 查询
      const isNumeric = /^\d+$/.test(slug);
      const data = isNumeric 
        ? await blogApi.fetchPostById(slug)
        : await blogApi.fetchPostBySlug(slug);
      
      setPost(data);
      setSummary(data.summary || null);
      setError(null);

      // 增加浏览量（异步调用，不影响页面加载）
      if (data && data.id) {
        blogApi.incrementViewCount(data.id)
          .then(updatedPost => {
            // 更新本地的浏览量显示
            setPost(prev => ({
              ...prev,
              viewCount: updatedPost.viewCount
            }));
          })
          .catch(err => {
            console.warn('浏览量更新失败:', err);
            // 浏览量更新失败不影响页面正常显示，只记录警告
          });
      }
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

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await blogApi.deletePost(post.id);
      toast({
        title: "✓ 删除成功",
        description: `《${post.title}》已删除。`,
      });
      navigate('/blog');
    } catch (err) {
      console.error('删除失败:', err);
      toast({
        variant: "destructive",
        title: "✗ 删除失败",
        description: "请稍后重试",
      });
    } finally {
      setDeleteDialogOpen(false);
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
        {/* 两栏布局主体 - 居中布局，左右留白 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* 左侧空白区域 - 1列用于居中 */}
            <div className="hidden lg:block lg:col-span-1"></div>

            {/* 主内容区 - 8列（约66.7%宽度） */}
            <main className="lg:col-span-8">
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

                {/* 文章元信息 - 移动到标题下方，使用内联布局 */}
                <div className="mb-6">
                  <ArticleMetaInfo post={post} inline={true} />
                </div>

                {/* AI 摘要区域 */}
                {(summary || hasRole(['editor', 'admin'])) && (
                  <div className="mb-6">
                    {summary ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed" style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                            <span className="font-semibold">📝 AI 摘要：</span>{summary}
                          </p>
                          {hasRole(['editor', 'admin']) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleGenerateSummary}
                              disabled={generatingSummary}
                              className="flex-shrink-0 h-7 text-xs"
                              title="重新生成摘要"
                            >
                              {generatingSummary ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      hasRole(['editor', 'admin']) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateSummary}
                          disabled={generatingSummary}
                          className="gap-2"
                        >
                          {generatingSummary ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              AI 生成中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              AI 生成摘要
                            </>
                          )}
                        </Button>
                      )
                    )}
                  </div>
                )}

                <Separator className="my-6" />

                {/* 文章配乐 - 放在文章开头 */}
                {post.musicId && (
                  <ArticleMusicPlayer musicId={post.musicId} />
                )}

                {/* 文章正文 - 富文本 HTML 渲染 */}
                <div 
                  className="article-content ProseMirror"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* 文章底部信息 */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* 互动按钮 */}
                    <div className="flex items-center gap-4">
                      <LikeButton postId={post.id} />
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

              {/* 评论区 */}
              <div className="mt-8 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm p-6 sm:p-8">
                <Comments postId={post.id} />
              </div>
            </main>

            {/* 右侧栏 - 文章目录（缩小到 3 列，25%宽度） */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* 文章目录 */}
                <ArticleToc content={post.content} />
              </div>
            </aside>

          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`确定要删除《${post?.title}》吗？此操作不可逆！`}
        onConfirm={handleConfirmDelete}
        confirmText="删除"
        cancelText="取消"
        confirmVariant="destructive"
      />
    </>
  );
}

export default PostDetailPage;
