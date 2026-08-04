import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as blogApi from '../../../api/blogApi';
import * as musicApi from '../../../api/musicApi';
import * as tagApi from '../../../api/tagApi';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import MoodCard from '../components/MoodCard';
import NoteCard from '../components/NoteCard';
import HeroSection from '../components/HeroSection';
import TagCloud from '../components/TagCloud';
import PaginationWrapper from '../../../components/ui/pagination-wrapper';
import { Button } from '../../../components/ui/button';
import { PenSquare, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { RoleGuard } from '../../../components/ProtectedRoute';

function BlogPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tagSlug = searchParams.get('tag'); // 从 URL 获取 tag 参数
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTagName, setCurrentTagName] = useState(''); // 当前筛选的标签名称

  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const pageSize = 5; // 每页显示 5 条
  
  // 标签云刷新触发器
  const [tagCloudRefreshKey, setTagCloudRefreshKey] = useState(0);
  
  // 内容区域的引用，用于滚动
  const contentRef = useRef(null);

  // 从 URL 路径中获取当前分类
  const currentCategory = useMemo(() => {
    const path = location.pathname;
    if (path === '/blog/mood') return '说说';
    if (path === '/blog/notes') return '学习笔记';
    if (path === '/blog/tech') return '技术博客';
    if (path === '/blog') return null; // 显示全部
    return null;
  }, [location.pathname]);

  // 判断是否显示 Hero Section（在首页和博客主页显示）
  const showHeroSection = location.pathname === '/' || location.pathname === '/blog';

  // 注意：现在 posts 已经是分页后的数据，不需要再筛选
  // 筛选逻辑已经在后端/API 层完成
  const filteredPosts = posts;

  // 页面标题和描述
  const pageInfo = useMemo(() => {
    switch (currentCategory) {
      case '说说':
        return {
          title: '说说 💬',
          description: '记录生活中的点点滴滴，分享此刻的心情',
          buttonText: '写说说',
        };
      case '学习笔记':
        return {
          title: '学习笔记 📚',
          description: '记录学习心得，积累知识财富',
          buttonText: '写笔记',
        };
      default:
        return {
          title: '个人博客',
          description: '记录学习与生活的点点滴滴',
          buttonText: '写文章',
        };
    }
  }, [currentCategory]);

  // 统计信息（使用总数而非当前页数量）
  const stats = {
    posts: totalPosts,
    categories: 10,
    tags: Math.floor(totalPosts * 2.5),
  };

  // 主加载逻辑：当分类、页码、标签或路由改变时，重新加载文章
  useEffect(() => {
    loadPosts(currentPage, tagSlug ? null : currentCategory, tagSlug);
  }, [currentPage, currentCategory, tagSlug, location.pathname]); // 添加 tagSlug 监听

  // 当分类或标签改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, tagSlug]);

  const loadPosts = async (page = 1, category = null, tag = null) => {
    try {
      setLoading(true);
      
      // 如果有标签筛选，使用标签 API
      if (tag) {
        const data = await tagApi.getPostsByTag(tag, page, pageSize);
        
        if (data.list) {
          setPosts(data.list);
          setTotalPosts(data.pagination?.total || 0);
          setTotalPages(data.pagination?.totalPages || 1);
          setCurrentPage(data.pagination?.page || 1);
          
          // 获取标签名称
          if (data.list.length > 0 && data.list[0].tags) {
            const currentTag = data.list[0].tags.find(t => t.slug === tag);
            setCurrentTagName(currentTag ? currentTag.name : '');
          }
        } else {
          setPosts([]);
          setTotalPosts(0);
          setTotalPages(1);
        }
      } else {
        // 正常加载文章（按分类）
        const params = {
          page,
          pageSize,
          category: category || undefined,
        };
        
        const data = await blogApi.fetchPosts(params);
        
        if (data.list) {
          setPosts(data.list);
          setTotalPosts(data.pagination?.total || 0);
          setTotalPages(data.pagination?.totalPages || 1);
          setCurrentPage(data.pagination?.page || 1);
        } else {
          // 如果后端还没改，临时处理：前端分页
          const allPosts = Array.isArray(data) ? data : [];
          const filtered = category 
            ? allPosts.filter(post => post.category === category)
            : allPosts;
          
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedPosts = filtered.slice(startIndex, endIndex);
          
          setPosts(paginatedPosts);
          setTotalPosts(filtered.length);
          setTotalPages(Math.ceil(filtered.length / pageSize));
        }
        
        setCurrentTagName(''); // 清空标签名称
      }
      
      setError(null);
    } catch (err) {
      console.error('加载文章失败:', err);
      setError('加载文章失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理页码变更
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // 滚动到内容顶部
    contentRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleEdit = (post) => {
    navigate(`/blog/edit/${post.id}`);
  };

  const handleDelete = (id, title) => {
    setDeletingPost({ id, title });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;
    try {
      await blogApi.deletePost(deletingPost.id);
      toast({
        title: "✓ 删除成功",
        description: `《${deletingPost.title}》已删除。`,
      });
      // 重新加载当前页
      await loadPosts(currentPage, currentCategory);
      // 触发标签云刷新
      setTagCloudRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('删除失败:', err);
      toast({
        variant: "destructive",
        title: "✗ 删除失败",
        description: err.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingPost(null);
    }
  };

  // 平滑滚动到内容区
  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - 只在个人博客主页显示 */}
      {showHeroSection && <HeroSection onScrollToContent={scrollToContent} />}

      {/* Content Section - 三栏布局：左侧信息 + 中间内容 + 右侧空白 */}
      <div 
        ref={contentRef} 
        className="grid grid-cols-1 lg:grid-cols-5 min-h-screen" 
        style={{ 
          scrollMarginTop: '60px',
          paddingTop: showHeroSection ? '0' : '80px' // 子页面添加顶部间距
        }}
      >
        {/* 左侧边栏 - 个人信息展示（1列，20%） */}
        <div className="lg:col-span-1 p-8">
          <Sidebar stats={stats} />
        </div>

        {/* 中间主内容区 - 文章卡片（3列，60%） */}
        <main className="lg:col-span-3 p-8 backdrop-blur-sm ">
        {/* 文章列表 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => loadPosts(currentPage, currentCategory)} variant="outline">
              重试
            </Button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {currentCategory 
                ? `还没有${currentCategory}，点击"${pageInfo.buttonText}"开始创作吧！`
                : '还没有文章，点击"写文章"开始创作吧！'
              }
            </p>
            <RoleGuard roles={['editor', 'admin']}>
              <Button onClick={() => navigate('/blog/new', { state: { category: currentCategory || '技术博客' } })} variant="outline" className="gap-2">
                <PenSquare className="w-4 h-4" />
                {pageInfo.buttonText}
              </Button>
            </RoleGuard>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => {
              // 根据文章分类渲染不同的卡片组件
              if (post.category === '说说') {
                return (
                  <MoodCard
                    key={post.id}
                    post={post}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                );
              }
              if (post.category === '学习笔记') {
                return (
                  <NoteCard
                    key={post.id}
                    post={post}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                );
              }
              // 默认使用 PostCard（技术博客）
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        )}

        {/* 分页组件 */}
        {!loading && !error && filteredPosts.length > 0 && totalPages > 1 && (
          <PaginationWrapper
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
        </main>

        {/* 右侧边栏 - 标签云（1列，20%） */}
        <div className="hidden lg:block lg:col-span-1 p-8">
          <RoleGuard roles={['editor', 'admin']}>
            <Button 
              onClick={() => navigate('/blog/new', { state: { category: currentCategory || '技术博客' } })}
              size="lg" 
              className="gap-2 w-full mb-4"
              style={{ 
                fontWeight: '500',
                letterSpacing: '0.01em'
              }}
            >
              <PenSquare className="w-5 h-5" />
              {pageInfo.buttonText}
            </Button>
          </RoleGuard>
          <TagCloud refreshKey={tagCloudRefreshKey} />
        </div>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`确定要删除《${deletingPost?.title}》吗？此操作不可逆！`}
        onConfirm={handleConfirmDelete}
        confirmText="删除"
        cancelText="取消"
        confirmVariant="destructive"
      />
    </div>
  );
}

export default BlogPage;
