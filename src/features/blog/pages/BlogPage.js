import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import * as blogApi from '../../../api/blogApi';
import * as musicApi from '../../../api/musicApi';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import MoodCard from '../components/MoodCard';
import NoteCard from '../components/NoteCard';
import HeroSection from '../components/HeroSection';
import PaginationWrapper from '../../../components/ui/pagination-wrapper';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { PenSquare, Loader2, AlertCircle, FileText } from 'lucide-react';

function BlogPage() {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    category: '技术博客',
    musicId: null
  });
  const [musicList, setMusicList] = useState([]); // 音乐列表
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const pageSize = 5; // 每页显示 5 条
  
  // 内容区域的引用，用于滚动
  const contentRef = useRef(null);

  // 从 URL 路径中获取当前分类
  const currentCategory = useMemo(() => {
    const path = location.pathname;
    if (path === '/blog/mood') return '说说';
    if (path === '/blog/notes') return '学习笔记';
    if (path === '/blog') return null; // 显示全部
    return null;
  }, [location.pathname]);

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

  // 当分类或页码改变时，重新加载文章
  useEffect(() => {
    loadPosts(currentPage, currentCategory);
  }, [currentPage, currentCategory]);

  // 当分类改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory]);

  // 加载音乐列表
  useEffect(() => {
    const loadMusicList = async () => {
      try {
        const data = await musicApi.fetchMusicList();
        setMusicList(data);
      } catch (err) {
        console.error('加载音乐列表失败:', err);
      }
    };
    loadMusicList();
  }, []);

  const loadPosts = async (page = 1, category = null) => {
    try {
      setLoading(true);
      
      // 调用 API，传递分页和分类参数
      const params = {
        page,
        pageSize,
        category: category || undefined, // 如果没有分类，不传这个参数
      };
      
      const data = await blogApi.fetchPosts(params);
      
      // 假设后端返回的格式是 { list, pagination: { total, page, pageSize, totalPages } }
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
      
      setError(null);
    } catch (err) {
      console.error('加载文章失败:', err);
      setError('加载文章失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('标题和内容不能为空');
      return;
    }

    try {
      if (editingPost) {
        await blogApi.updatePost(editingPost.id, formData);
      } else {
        await blogApi.createPost(formData);
      }
      // 重新加载当前页
      await loadPosts(currentPage, currentCategory);
      resetForm();
    } catch (err) {
      console.error('保存失败:', err);
      alert(`保存失败: ${err.message}`);
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
    setEditingPost(post);
    setFormData({ 
      title: post.title, 
      content: post.content,
      category: post.category || '技术博客',
      musicId: post.musicId || null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这篇文章吗？')) return;
    try {
      await blogApi.deletePost(id);
      // 重新加载当前页
      await loadPosts(currentPage, currentCategory);
    } catch (err) {
      console.error('删除失败:', err);
      alert(`删除失败: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      content: '', 
      category: currentCategory || '技术博客',
      musicId: null
    });
    setEditingPost(null);
    setShowModal(false);
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
      {/* Hero Section - 第一屏 */}
      <HeroSection onScrollToContent={scrollToContent} />

      {/* Content Section - 第二屏 */}
      <div ref={contentRef} className="flex min-h-screen" style={{ scrollMarginTop: '60px' }}>
        {/* 左侧边栏 */}
        <Sidebar stats={stats} />

      {/* 右侧主内容区 */}
      <main className="flex-1 p-8 backdrop-blur-sm bg-white/10">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{ 
                fontWeight: '700',
                letterSpacing: '0.01em',
                lineHeight: '1.2'
              }}
            >
              {pageInfo.title}
            </h1>
            <p 
              className="text-muted-foreground"
              style={{ 
                fontWeight: '400',
                letterSpacing: '0.01em',
                lineHeight: '1.5'
              }}
            >
              {pageInfo.description}
            </p>
          </div>
          <Button 
            onClick={() => setShowModal(true)} 
            size="lg" 
            className="gap-2"
            style={{ 
              fontWeight: '500',
              letterSpacing: '0.01em'
            }}
          >
            <PenSquare className="w-5 h-5" />
            {pageInfo.buttonText}
          </Button>
        </div>

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
            <Button onClick={() => setShowModal(true)} variant="outline" className="gap-2">
              <PenSquare className="w-4 h-4" />
              {pageInfo.buttonText}
            </Button>
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

      {/* 编辑/新建文章对话框 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenSquare className="w-5 h-5" />
              {editingPost ? '编辑文章' : '写新文章'}
            </DialogTitle>
            <DialogDescription>
              {editingPost ? '修改文章内容并保存' : '开始你的创作之旅'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                文章分类
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="技术博客">📝 技术博客</option>
                <option value="说说">💬 说说</option>
                <option value="学习笔记">📚 学习笔记</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="musicId" className="text-sm font-medium flex items-center gap-2">
                🎵 文章配乐
                <span className="text-xs text-gray-500 font-normal">（可选）</span>
              </label>
              <select
                id="musicId"
                value={formData.musicId || ''}
                onChange={(e) => setFormData({ ...formData, musicId: e.target.value ? Number(e.target.value) : null })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">无配乐</option>
                {musicList.map(music => (
                  <option key={music.id} value={music.id}>
                    {music.title} - {music.artist}
                  </option>
                ))}
              </select>
              {formData.musicId && (
                <p className="text-xs text-gray-500">
                  💡 提示：选择的音乐将在文章详情页中显示播放器
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                文章标题
              </label>
              <Input
                id="title"
                placeholder="输入文章标题..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                文章内容
              </label>
              <Textarea
                id="content"
                rows={12}
                placeholder="开始你的创作..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="resize-none"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                取消
              </Button>
              <Button type="submit">
                {editingPost ? '保存修改' : '发布文章'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default BlogPage;
