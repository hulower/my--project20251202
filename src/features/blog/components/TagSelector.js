/**
 * ============================================
 * 文件名：TagSelector.js
 * 作用：标签选择器组件
 * ============================================
 * 用于在创建/编辑文章时选择标签
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { X, Plus, Search, Loader2, Sparkles } from 'lucide-react';
import * as tagApi from '../../../api/tagApi';
import { useToast } from '../../../hooks/use-toast';

function TagSelector({ selectedTagIds = [], onChange }) {
  const { toast } = useToast();
  const [allTags, setAllTags] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // 加载所有标签
  useEffect(() => {
    loadAllTags();
  }, []);

  const loadAllTags = async () => {
    try {
      setLoading(true);
      const tags = await tagApi.getAllTags();
      setAllTags(tags);
      setError(null);
    } catch (err) {
      console.error('加载标签失败:', err);
      setError('加载标签失败');
    } finally {
      setLoading(false);
    }
  };

  // 根据关键词过滤标签
  const filteredTags = allTags.filter(tag => {
    if (!searchKeyword.trim()) return true;
    const keyword = searchKeyword.toLowerCase();
    return tag.name.toLowerCase().includes(keyword) || 
           tag.slug.toLowerCase().includes(keyword);
  });

  // 已选中的标签
  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));

  // 未选中的标签
  const unselectedTags = filteredTags.filter(tag => !selectedTagIds.includes(tag.id));

  // 添加标签
  const handleAddTag = (tagId) => {
    if (!selectedTagIds.includes(tagId)) {
      onChange([...selectedTagIds, tagId]);
    }
  };

  // 移除标签
  const handleRemoveTag = (tagId) => {
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  // 生成 slug（URL 友好的标识符）
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

  // 随机生成标签颜色
  const getRandomColor = () => {
    const colors = [
      '#F7DF1E', // JavaScript Yellow
      '#61DAFB', // React Blue
      '#339933', // Node.js Green
      '#336791', // Database Blue
      '#E34F26', // HTML5 Orange
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#06B6D4', // Cyan
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 创建新标签
  const handleCreateTag = async () => {
    const tagName = searchKeyword.trim();
    
    if (!tagName) {
      toast({
        variant: "destructive",
        title: "✗ 创建失败",
        description: "标签名称不能为空",
      });
      return;
    }

    // 检查是否已存在相同名称的标签
    const existingTag = allTags.find(
      tag => tag.name.toLowerCase() === tagName.toLowerCase()
    );
    
    if (existingTag) {
      toast({
        variant: "warning",
        title: "⚠️ 标签已存在",
        description: `标签"${existingTag.name}"已存在，已为您添加`,
      });
      handleAddTag(existingTag.id);
      setSearchKeyword('');
      return;
    }

    try {
      setCreating(true);
      const newTag = await tagApi.createTag({
        name: tagName,
        slug: generateSlug(tagName),
        color: getRandomColor(),
        description: `关于 ${tagName} 的文章`,
      });

      // 更新标签列表
      setAllTags([...allTags, newTag]);
      
      // 自动选中新创建的标签
      onChange([...selectedTagIds, newTag.id]);
      
      // 清空搜索框
      setSearchKeyword('');
      
      toast({
        title: "✓ 创建成功",
        description: `标签"${newTag.name}"已创建并添加`,
      });
    } catch (err) {
      console.error('创建标签失败:', err);
      toast({
        variant: "destructive",
        title: "✗ 创建失败",
        description: err.message || '创建标签失败，请稍后再试',
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>加载标签中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            已选标签 ({selectedTags.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="cursor-pointer hover:opacity-80 transition-opacity pl-2 pr-1 py-1"
                style={{
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                  border: `1px solid ${tag.color}40`,
                }}
              >
                <span className="text-sm">#{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1.5 hover:bg-red-500/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="搜索标签..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 可选标签 */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          点击添加标签 ({unselectedTags.length} 个可选)
        </label>
        {unselectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-50 dark:bg-gray-900">
            {unselectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="cursor-pointer hover:scale-105 transition-transform"
                style={{
                  borderColor: tag.color + '40',
                  color: tag.color,
                }}
                onClick={() => handleAddTag(tag.id)}
              >
                <Plus className="w-3 h-3 mr-1" />
                <span className="text-sm">#{tag.name}</span>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-500">
              {searchKeyword ? '没有找到匹配的标签' : '所有标签都已选择'}
            </p>
            {searchKeyword && searchKeyword.trim() && (
              <Button
                type="button"
                size="sm"
                onClick={handleCreateTag}
                disabled={creating}
                className="gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>创建中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>创建新标签 "{searchKeyword.trim()}"</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">
          💡 提示：为文章添加标签可以帮助读者更好地发现相关内容
        </p>
        <p className="text-xs text-gray-500">
          ✨ 找不到合适的标签？搜索后点击"创建新标签"按钮即可添加
        </p>
      </div>
    </div>
  );
}

export default TagSelector;

