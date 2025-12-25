import React, { useState, useEffect, useRef } from 'react';
import * as blogApi from '../../../api/blogApi';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import HeroSection from '../components/HeroSection';
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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  
  // 内容区域的引用，用于滚动
  const contentRef = useRef(null);

  // 统计信息
  const stats = {
    posts: posts.length,
    categories: 10, // 可以后续动态计算
    tags: Math.floor(posts.length * 2.5), // 模拟标签数量
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await blogApi.fetchPosts();
      setPosts(data);
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
      await loadPosts();
      resetForm();
    } catch (err) {
      console.error('保存失败:', err);
      alert(`保存失败: ${err.message}`);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({ title: post.title, content: post.content });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这篇文章吗？')) return;
    try {
      await blogApi.deletePost(id);
      await loadPosts();
    } catch (err) {
      console.error('删除失败:', err);
      alert(`删除失败: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '' });
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
              个人博客
            </h1>
            <p 
              className="text-muted-foreground"
              style={{ 
                fontWeight: '400',
                letterSpacing: '0.01em',
                lineHeight: '1.5'
              }}
            >
              记录学习与生活的点点滴滴
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
            写文章
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
            <Button onClick={loadPosts} variant="outline">
              重试
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              还没有文章，点击"写文章"开始创作吧！
            </p>
            <Button onClick={() => setShowModal(true)} variant="outline" className="gap-2">
              <PenSquare className="w-4 h-4" />
              写文章
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
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
