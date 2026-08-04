import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as blogApi from '../../../api/blogApi';
import * as musicApi from '../../../api/musicApi';
import * as tagApi from '../../../api/tagApi';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';
import TagSelector from '../components/TagSelector';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Separator } from '../../../components/ui/separator';
import { ArrowLeft, Save, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';

function EditorPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();       // 编辑模式时来自 /blog/edit/:id
  const location = useLocation();
  const isEditing = Boolean(id);
  const prevCategory = location.state?.category || '技术博客';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [musicList, setMusicList] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: prevCategory,
    musicId: null,
    tagIds: [],
  });

  // 封面
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [shouldRemoveCover, setShouldRemoveCover] = useState(false);

  const fileInputRef = useRef(null);

  // 加载音乐列表
  useEffect(() => {
    musicApi.fetchMusicList().then(setMusicList).catch(console.error);
  }, []);

  // 加载待编辑的文章
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const post = await blogApi.fetchPostById(id);
        setFormData({
          title: post.title || '',
          content: post.content || '',
          category: post.category || '技术博客',
          musicId: post.musicId || null,
          tagIds: post.tags ? post.tags.map(t => t.id) : [],
        });
        if (post.coverImage) setCoverImagePreview(post.coverImage);
      } catch (err) {
        toast({ variant: 'destructive', title: '加载失败', description: err.message });
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: '文件类型错误', description: '请选择图片文件' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: '文件过大', description: '图片不超过 5MB' });
      return;
    }
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
    setShouldRemoveCover(false);
  };

  const handleRemoveCover = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setShouldRemoveCover(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ variant: 'destructive', title: '保存失败', description: '标题和内容不能为空' });
      return;
    }

    setSaving(true);
    try {
      let savedPost;
      if (isEditing) {
        savedPost = await blogApi.updatePost(id, formData);
      } else {
        savedPost = await blogApi.createPost(formData);
      }

      // 封面
      if (savedPost?.id) {
        if (shouldRemoveCover) {
          await blogApi.removeCoverImage(savedPost.id);
        } else if (coverImageFile) {
          const fd = new FormData();
          fd.append('cover', coverImageFile);
          await blogApi.uploadCoverImage(savedPost.id, fd);
        }
      }

      // 标签
      if (savedPost?.id && formData.tagIds !== undefined) {
        try {
          await tagApi.setPostTags(savedPost.id, formData.tagIds);
        } catch { /* 标签保存失败不影响文章 */ }
      }

      toast({ title: isEditing ? '✓ 更新成功' : '✓ 发布成功', description: isEditing ? '文章已更新' : '文章已发布' });
      navigate(-1);  // 返回上一页
    } catch (err) {
      toast({ variant: 'destructive', title: '保存失败', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '60px' }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" style={{ paddingTop: '60px' }}>
      {/* 顶部导航栏 */}
      <div className="sticky top-[60px] z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Button>
            <span className="text-sm text-muted-foreground">
              {isEditing ? '编辑文章' : '写新文章'}
            </span>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? '保存修改' : '发布文章'}
          </Button>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* 第一行：分类 + 配乐 + 封面 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 分类 */}
          <div>
            <Label>文章分类</Label>
            <Select
              value={formData.category}
              onValueChange={v => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="技术博客">📝 技术博客</SelectItem>
                <SelectItem value="说说">💬 说说</SelectItem>
                <SelectItem value="学习笔记">📚 学习笔记</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 配乐 */}
          <div>
            <Label>🎵 文章配乐 <span className="text-xs text-gray-400">可选</span></Label>
            <Select
              value={formData.musicId ? String(formData.musicId) : 'none'}
              onValueChange={v => setFormData({ ...formData, musicId: v === 'none' ? null : Number(v) })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="无配乐" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无配乐</SelectItem>
                {musicList.map(m => (
                  <SelectItem key={m.id} value={String(m.id)}>{m.title} - {m.artist}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 封面 */}
          <div>
            <Label>🖼️ 文章配图 <span className="text-xs text-gray-400">可选</span></Label>
            {coverImagePreview ? (
              <div className="relative mt-1.5 h-20 rounded overflow-hidden border">
                <img src={coverImagePreview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button" onClick={handleRemoveCover}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button" onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 w-full h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-primary hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="w-5 h-5" /> 上传封面
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
          </div>
        </div>

        <Separator />

        {/* 标题 */}
        <div>
          <Input
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="输入文章标题..."
            className="text-2xl font-bold border-none shadow-none p-0 focus-visible:ring-0"
            style={{ fontSize: '2rem' }}
          />
        </div>

        {/* 富文本编辑器 */}
        <div>
          <RichTextEditor
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            placeholder="开始你的创作..."
          />
        </div>

        {/* 标签 */}
        <div>
          <Label>🏷️ 文章标签 <span className="text-xs text-gray-400">可选</span></Label>
          <div className="mt-1.5">
            <TagSelector
              selectedTagIds={formData.tagIds}
              onChange={tagIds => setFormData({ ...formData, tagIds })}
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => navigate(-1)}>取消</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {isEditing ? '保存修改' : '发布文章'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
