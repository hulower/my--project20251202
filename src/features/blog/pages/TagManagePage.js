/**
 * ============================================
 * 文件名：TagManagePage.js
 * 作用：标签管理页面
 * ============================================
 * 管理员管理所有标签（CRUD）
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
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
import { Badge } from '../../../components/ui/badge';
import { Tag, Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import * as tagApi from '../../../api/tagApi';
import ConfirmDialog from '../../../components/ConfirmDialog';

function TagManagePage() {
  const { toast } = useToast();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 编辑对话框
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#3B82F6',
    description: '',
  });
  
  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await tagApi.getAllTags();
      setTags(data);
    } catch (err) {
      console.error('加载标签失败:', err);
      toast({
        variant: "destructive",
        title: "✗ 加载失败",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // 生成 slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s\t\n\r，。！？、；：""''（）《》【】…—·]+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || `tag-${Date.now()}`;
  };

  // 打开创建对话框
  const handleCreate = () => {
    setEditingTag(null);
    setFormData({
      name: '',
      slug: '',
      color: '#3B82F6',
      description: '',
    });
    setShowEditDialog(true);
  };

  // 打开编辑对话框
  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      description: tag.description || '',
    });
    setShowEditDialog(true);
  };

  // 保存标签
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "✗ 保存失败",
        description: "标签名称不能为空",
      });
      return;
    }

    try {
      if (editingTag) {
        await tagApi.updateTag(editingTag.id, formData);
        toast({
          title: "✓ 更新成功",
          description: `标签"${formData.name}"已更新`,
        });
      } else {
        await tagApi.createTag(formData);
        toast({
          title: "✓ 创建成功",
          description: `标签"${formData.name}"已创建`,
        });
      }
      
      setShowEditDialog(false);
      loadTags();
    } catch (err) {
      console.error('保存标签失败:', err);
      toast({
        variant: "destructive",
        title: "✗ 保存失败",
        description: err.message,
      });
    }
  };

  // 删除标签
  const handleDelete = (tag) => {
    setDeletingTag(tag);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await tagApi.deleteTag(deletingTag.id);
      toast({
        title: "✓ 删除成功",
        description: `标签"${deletingTag.name}"已删除`,
      });
      setDeleteDialogOpen(false);
      loadTags();
    } catch (err) {
      console.error('删除标签失败:', err);
      toast({
        variant: "destructive",
        title: "✗ 删除失败",
        description: err.message,
      });
    }
  };

  // 过滤标签
  const filteredTags = tags.filter(tag => {
    if (!searchKeyword.trim()) return true;
    const keyword = searchKeyword.toLowerCase();
    return tag.name.toLowerCase().includes(keyword) || 
           tag.slug.toLowerCase().includes(keyword) ||
           (tag.description && tag.description.toLowerCase().includes(keyword));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Tag className="w-6 h-6" />
              标签管理
            </CardTitle>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              创建标签
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索标签名称、slug 或描述..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 标签列表 */}
          <div className="space-y-2">
            {filteredTags.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchKeyword ? '没有找到匹配的标签' : '暂无标签'}
              </div>
            ) : (
              filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Badge
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                        border: `1px solid ${tag.color}40`,
                      }}
                      className="text-base px-3 py-1"
                    >
                      #{tag.name}
                    </Badge>
                    
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">
                        slug: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{tag.slug}</code>
                      </div>
                      {tag.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {tag.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {tag.postsCount || 0} 篇文章
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tag)}
                      className="gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tag)}
                      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 编辑/创建对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTag ? '编辑标签' : '创建标签'}
            </DialogTitle>
            <DialogDescription>
              {editingTag ? '修改标签信息' : '添加新的标签'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">标签名称 *</label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({
                    ...formData,
                    name,
                    slug: formData.slug || generateSlug(name),
                  });
                }}
                placeholder="例如：JavaScript"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (URL标识) *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="例如：javascript"
                required
              />
              <p className="text-xs text-muted-foreground">
                用于 URL，建议使用小写字母和连字符
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">颜色</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="标签的简短描述..."
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                取消
              </Button>
              <Button type="submit">
                {editingTag ? '保存' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="确认删除"
        description={
          deletingTag ? (
            <div className="space-y-2">
              <p>确定要删除标签 <strong>"{deletingTag.name}"</strong> 吗？</p>
              {deletingTag.postsCount > 0 && (
                <p className="text-red-600 text-sm">
                  ⚠️ 警告：该标签关联了 {deletingTag.postsCount} 篇文章，删除后将从这些文章中移除。
                </p>
              )}
            </div>
          ) : ''
        }
        confirmText="删除"
        cancelText="取消"
      />
    </div>
  );
}

export default TagManagePage;

