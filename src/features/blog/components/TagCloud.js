/**
 * ============================================
 * 文件名：TagCloud.js
 * 作用：标签云组件
 * ============================================
 * 显示所有标签，点击可以查看该标签的所有文章
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Tag, Loader2, TrendingUp } from 'lucide-react';
import * as tagApi from '../../../api/tagApi';

function TagCloud({ refreshKey = 0 }) {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTags();
  }, [refreshKey]); // 当 refreshKey 改变时重新加载

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await tagApi.getAllTags();
      setTags(data);
    } catch (err) {
      console.error('加载标签失败:', err);
      setError('加载标签失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (slug) => {
    // 导航到带 tag 参数的博客页面
    navigate(`/blog?tag=${slug}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle 
            className="text-lg flex items-center gap-2"
            style={{ 
              fontWeight: '600',
              letterSpacing: '0.01em'
            }}
          >
            <Tag className="w-5 h-5" />
            标签云
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle 
            className="text-lg flex items-center gap-2"
            style={{ 
              fontWeight: '600',
              letterSpacing: '0.01em'
            }}
          >
            <Tag className="w-5 h-5" />
            标签云
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (tags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle 
            className="text-lg flex items-center gap-2"
            style={{ 
              fontWeight: '600',
              letterSpacing: '0.01em'
            }}
          >
            <Tag className="w-5 h-5" />
            标签云
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            暂无标签
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="text-lg flex items-center justify-between"
          style={{ 
            fontWeight: '600',
            letterSpacing: '0.01em'
          }}
        >
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            标签云
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.slug)}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
              style={{ 
                backgroundColor: tag.color + '15',
                color: '#374151',
                border: `1px solid ${tag.color}40`,
                fontWeight: '500',
                letterSpacing: '0.01em'
              }}
              title={tag.description || tag.name}
            >
              <span>{tag.name}</span>
            
            </button>
          ))}
        </div>
        
        {/* 排序提示 */}
        {/* {tags.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            <span style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
              按文章数量排序
            </span>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}

export default TagCloud;

