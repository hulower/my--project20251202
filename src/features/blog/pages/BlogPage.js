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
import TagSelector from '../components/TagSelector';
import TagCloud from '../components/TagCloud';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { PenSquare, Loader2, AlertCircle, FileText, Image as ImageIcon, X, Tag as TagIcon } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../hooks/use-toast';
import ConfirmDialog from '../../../components/ConfirmDialog';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';
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
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [currentTagName, setCurrentTagName] = useState(''); // 当前筛选的标签名称
  
  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    category: '技术博客',
    musicId: null,
    tagIds: []
  });
  const [musicList, setMusicList] = useState([]); // 音乐列表
  
  // 文章配图相关状态
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [shouldRemoveCover, setShouldRemoveCover] = useState(false); // 标记是否需要删除封面
  
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

  // 判断是否显示 Hero Section（只在个人博客主页显示）
  const showHeroSection = location.pathname === '/blog';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        variant: "destructive",
        title: "✗ 保存失败",
        description: "标题和内容不能为空",
      });
      return;
    }

    try {
      let savedPost;
      if (editingPost) {
        savedPost = await blogApi.updatePost(editingPost.id, formData);
        toast({
          title: "✓ 更新成功",
          description: "文章已更新。",
        });
      } else {
        savedPost = await blogApi.createPost(formData);
        toast({
          title: "✓ 创建成功",
          description: "文章已发布。",
        });
      }
      
      // 如果标记了需要删除封面
      if (shouldRemoveCover && savedPost?.id) {
        await blogApi.removeCoverImage(savedPost.id);
        toast({
          title: "✓ 封面已删除",
          description: "文章封面已移除。",
        });
      }
      // 如果有新的封面图片，上传封面
      else if (coverImageFile && savedPost?.id) {
        const coverFormData = new FormData();
        coverFormData.append('cover', coverImageFile);
        await blogApi.uploadCoverImage(savedPost.id, coverFormData);
        toast({
          title: "✓ 封面上传成功",
          description: "文章封面已保存。",
        });
      }
      
      // 保存标签（包括清空标签的情况）
      if (savedPost?.id && formData.tagIds !== undefined) {
        try {
          await tagApi.setPostTags(savedPost.id, formData.tagIds);
          // 标签保存成功，触发标签云刷新
          setTagCloudRefreshKey(prev => prev + 1);
        } catch (tagError) {
          console.error('保存标签失败:', tagError);
          // 标签保存失败不影响文章保存，只显示警告
          toast({
            variant: "warning",
            title: "⚠️ 标签保存失败",
            description: "文章已保存，但标签设置失败。",
          });
        }
      }
      
      // 重新加载当前页
      await loadPosts(currentPage, currentCategory);
      resetForm();
    } catch (err) {
      console.error('保存失败:', err);
      toast({
        variant: "destructive",
        title: "✗ 保存失败",
        description: err.message,
      });
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
      musicId: post.musicId || null,
      tagIds: post.tags ? post.tags.map(tag => tag.id) : []
    });
    // 设置现有的封面图片（用于预览）
    if (post.coverImage) {
      setCoverImagePreview(post.coverImage);
    } else {
      setCoverImagePreview(null);
    }
    setCoverImageFile(null); // 编辑时清空文件对象
    setShouldRemoveCover(false); // 重置删除标志
    setShowModal(true);
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

  // 处理封面图片选择
  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "✗ 文件类型错误",
          description: "请选择图片文件",
        });
        return;
      }
      
      // 验证文件大小 (最大 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "✗ 文件过大",
          description: "图片大小不能超过 5MB",
        });
        return;
      }
      
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
      setShouldRemoveCover(false); // 选择新图片时，取消删除标志
    }
  };

  // 删除封面图片
  const handleRemoveCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setShouldRemoveCover(true); // 标记需要删除封面
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      content: '', 
      category: currentCategory || '技术博客',
      musicId: null,
      tagIds: []
    });
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setShouldRemoveCover(false); // 重置删除标志
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
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-end ">
          <RoleGuard roles={['editor', 'admin']}>
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
          </RoleGuard>
        </div>

        {/* 标签筛选提示 */}
        {tagSlug && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <TagIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              正在显示标签为 <strong>#{currentTagName || tagSlug}</strong> 的文章
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/blog')}
              className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <X className="w-4 h-4 mr-1" />
              清除筛选
            </Button>
          </div>
        )}

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
              <Button onClick={() => setShowModal(true)} variant="outline" className="gap-2">
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
          <TagCloud refreshKey={tagCloudRefreshKey} />
        </div>
      </div>

      {/* 编辑/新建文章对话框 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenSquare className="w-5 h-5" />
              {editingPost ? '编辑文章' : '写新文章'}
            </DialogTitle>
            <DialogDescription>
              {editingPost ? '修改文章内容并保存' : '开始你的创作之旅'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pl-2 pr-12">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                文章分类
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="技术博客">📝 技术博客</SelectItem>
                  <SelectItem value="说说">💬 说说</SelectItem>
                  <SelectItem value="学习笔记">📚 学习笔记</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="musicId" className="text-sm font-medium flex items-center gap-2">
                🎵 文章配乐
                <span className="text-xs text-gray-500 font-normal">（可选）</span>
              </label>
              <Select
                value={formData.musicId ? String(formData.musicId) : 'none'}
                onValueChange={(value) => setFormData({ ...formData, musicId: value === 'none' ? null : Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="无配乐" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无配乐</SelectItem>
                  {musicList.map(music => (
                    <SelectItem key={music.id} value={String(music.id)}>
                      {music.title} - {music.artist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.musicId && (
                <p className="text-xs text-gray-500">
                  💡 提示：选择的音乐将在文章详情页中显示播放器
                </p>
              )}
            </div>

            {/* 文章配图 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                🖼️ 文章配图
                <span className="text-xs text-gray-500 font-normal">（可选）</span>
              </label>
              
              {coverImagePreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 dark:bg-gray-900">
                  <img 
                    src={coverImagePreview} 
                    alt="封面预览" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                    title="删除封面"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('cover-image-upload').click()}
                  className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all"
                >
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">点击上传封面图片</p>
                  <p className="text-xs text-gray-400 mt-1">推荐尺寸: 1200×675 (16:9)</p>
                  <p className="text-xs text-gray-400">支持 JPG、PNG、WEBP (最大5MB)</p>
                </div>
              )}
              
              <input
                id="cover-image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleCoverImageChange}
                className="hidden"
              />
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
              <RichTextEditor
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="开始你的创作...点击工具栏格式化文本"
              />
            </div>

            {/* 标签选择器 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                🏷️ 文章标签
                <span className="text-xs text-gray-500 font-normal">（可选）</span>
              </label>
              <TagSelector
                selectedTagIds={formData.tagIds}
                onChange={(tagIds) => setFormData({ ...formData, tagIds })}
              />
            </div>
          </form>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingPost ? '保存修改' : '发布文章'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
