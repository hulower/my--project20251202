/**
 * ============================================
 * 文件名：src/components/LikeButton/LikeButton.js
 * 作用：点赞按钮组件
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import * as likeApi from '../../api/likeApi';
import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import './like-button.css';

function LikeButton({ postId, initialLiked = false, initialCount = 0 }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  useEffect(() => {
    loadLikeStatus();
  }, [postId]);
  
  const loadLikeStatus = async () => {
    try {
      const data = await likeApi.getLikeStatus(postId);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('获取点赞状态失败:', error);
    }
  };
  
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "✗ 操作失败",
        description: "请先登录",
      });
      return;
    }
    
    if (loading) return;
    
    try {
      setLoading(true);
      
      // 乐观更新 UI
      const newLiked = !liked;
      const newCount = newLiked ? likesCount + 1 : likesCount - 1;
      
      setLiked(newLiked);
      setLikesCount(newCount);
      
      // 触发动画
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
      
      // 调用 API
      const data = await likeApi.toggleLike(postId);
      
      // 更新为服务器返回的实际值
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('点赞操作失败:', error);
      
      // 回滚 UI
      setLiked(!liked);
      setLikesCount(likesCount);
      
      toast({
        variant: "destructive",
        title: "✗ 操作失败",
        description: error.message || "点赞失败",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`like-button ${liked ? 'liked' : ''} ${animating ? 'animating' : ''}`}
      onClick={handleToggleLike}
      disabled={loading}
    >
      <Heart
        className={`like-icon ${liked ? 'filled' : ''}`}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span className="like-count">{likesCount}</span>
    </Button>
  );
}

export default LikeButton;

