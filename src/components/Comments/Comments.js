/**
 * ============================================
 * 文件名：src/components/Comments/Comments.js
 * 作用：评论组件 - 显示和管理文章评论
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import * as commentApi from '../../api/commentApi';
import { API_BASE } from '../../api/httpClient';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { MessageCircle, Send, Edit2, Trash2, Reply, X, Monitor, Chrome } from 'lucide-react';
import { getDeviceInfo } from '../../utils/userAgent';
import './comments.css';

function Comments({ postId }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // 字数限制常量
  const MAX_COMMENT_LENGTH = 1000;
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // 回复状态
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  
  // 编辑状态
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  useEffect(() => {
    loadComments();
  }, [postId]);
  
  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentApi.fetchComments(postId);
      setComments(data);
    } catch (error) {
      console.error('加载评论失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 加载失败",
        description: "无法加载评论",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "✗ 提交失败",
        description: "评论内容不能为空",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // 获取设备信息
      const deviceInfo = getDeviceInfo();
      
      await commentApi.createComment(postId, { 
        content: newComment,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
      });
      
      toast({
        title: "✓ 发布成功",
        description: "您的评论已发布",
      });
      
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('发布评论失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 发布失败",
        description: error.message || "无法发布评论",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSubmitReply = async (parentId) => {
    if (!replyContent.trim()) {
      toast({
        variant: "destructive",
        title: "✗ 提交失败",
        description: "回复内容不能为空",
      });
      return;
    }
    
    try {
      // 获取设备信息
      const deviceInfo = getDeviceInfo();
      
      await commentApi.createComment(postId, {
        content: replyContent,
        parentId,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
      });
      
      toast({
        title: "✓ 回复成功",
        description: "您的回复已发布",
      });
      
      setReplyingTo(null);
      setReplyContent('');
      await loadComments();
    } catch (error) {
      console.error('回复失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 回复失败",
        description: error.message || "无法发布回复",
      });
    }
  };
  
  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) {
      toast({
        variant: "destructive",
        title: "✗ 更新失败",
        description: "评论内容不能为空",
      });
      return;
    }
    
    try {
      await commentApi.updateComment(commentId, { content: editContent });
      
      toast({
        title: "✓ 更新成功",
        description: "评论已更新",
      });
      
      setEditingId(null);
      setEditContent('');
      await loadComments();
    } catch (error) {
      console.error('更新评论失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 更新失败",
        description: error.message || "无法更新评论",
      });
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }
    
    try {
      await commentApi.deleteComment(commentId);
      
      toast({
        title: "✓ 删除成功",
        description: "评论已删除",
      });
      
      await loadComments();
    } catch (error) {
      console.error('删除评论失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 删除失败",
        description: error.message || "无法删除评论",
      });
    }
  };
  
  // 将嵌套评论展平为列表
  const flattenComments = (comments, parentAuthor = null) => {
    const result = [];
    
    comments.forEach(comment => {
      result.push({
        ...comment,
        parentAuthor, // 添加父评论作者信息
      });
      
      if (comment.replies && comment.replies.length > 0) {
        // 递归展平子评论，传递当前评论作者作为 parentAuthor
        result.push(...flattenComments(comment.replies, comment.username));
      }
    });
    
    return result;
  };
  
  const renderComment = (comment, isReply = false) => {
    const isOwner = user?.id === comment.userId;
    const canEdit = isOwner;
    const canDelete = isOwner || user?.role === 'admin' || user?.role === 'editor';
    
    const avatarUrl = comment.avatarUrl 
      ? `${API_BASE}${comment.avatarUrl}`
      : null;
    
    return (
      <div key={comment.id} className={`comment ${isReply ? 'comment-reply' : ''}`}>
        <div className="comment-content">
          <div className="comment-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={comment.username} />
            ) : (
              <div className="avatar-placeholder">
                {comment.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          <div className="comment-body">
            <div className="comment-header">
              {/* 第一行：用户名 + 时间 */}
              <div className="comment-header-row-1">
                <span className="comment-author">{comment.username}</span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  }).replace(/\//g, '-')}
                </span>
              </div>
              
              {/* 第二行：设备信息徽章 */}
              <div className="comment-device-info">
                {comment.os && (
                  <span className="device-badge os-badge">
                    <Monitor className="w-3 h-3" />
                    {comment.os}
                  </span>
                )}
                {comment.browser && (
                  <span className="device-badge browser-badge">
                    <Chrome className="w-3 h-3" />
                    {comment.browser}
                  </span>
                )}
                {comment.location && (
                  <span className="device-badge location-badge">
                    📍 {comment.location}
                  </span>
                )}
              </div>
            </div>
            
            {editingId === comment.id ? (
              <div className="comment-edit-form">
                <div className="textarea-wrapper">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="编辑评论..."
                    rows={3}
                    maxLength={MAX_COMMENT_LENGTH}
                  />
                  <div className={`character-count ${editContent.length > MAX_COMMENT_LENGTH * 0.9 ? 'warning' : ''} ${editContent.length >= MAX_COMMENT_LENGTH ? 'error' : ''}`}>
                    {editContent.length} / {MAX_COMMENT_LENGTH}
                  </div>
                </div>
                <div className="edit-actions">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={!editContent.trim() || editContent.length > MAX_COMMENT_LENGTH}
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="comment-text">
                  {comment.parentAuthor && (
                    <span className="reply-to-indicator">
                      回复 @{comment.parentAuthor}:
                    </span>
                  )}
                  {comment.content}
                </p>
                
                <div className="comment-actions">
                  {isAuthenticated && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      回复
                    </Button>
                  )}
                  
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      编辑
                    </Button>
                  )}
                  
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      删除
                    </Button>
                  )}
                </div>
              </>
            )}
            
            {/* 回复表单 */}
            {replyingTo === comment.id && (
              <div className="reply-form">
                <div className="textarea-wrapper">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`回复 @${comment.username}...`}
                    rows={3}
                    maxLength={MAX_COMMENT_LENGTH}
                  />
                  <div className={`character-count ${replyContent.length > MAX_COMMENT_LENGTH * 0.9 ? 'warning' : ''} ${replyContent.length >= MAX_COMMENT_LENGTH ? 'error' : ''}`}>
                    {replyContent.length} / {MAX_COMMENT_LENGTH}
                  </div>
                </div>
                <div className="reply-actions">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim() || replyContent.length > MAX_COMMENT_LENGTH}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    发送
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="comments-section">
      <div className="comments-header">
        <MessageCircle className="w-5 h-5" />
        <h3>评论 ({comments.length})</h3>
      </div>
      
      {/* 评论输入框 */}
      {isAuthenticated ? (
        <div className="comment-form">
          <div className="textarea-wrapper">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              rows={4}
              maxLength={MAX_COMMENT_LENGTH}
            />
            <div className={`character-count ${newComment.length > MAX_COMMENT_LENGTH * 0.9 ? 'warning' : ''} ${newComment.length >= MAX_COMMENT_LENGTH ? 'error' : ''}`}>
              {newComment.length} / {MAX_COMMENT_LENGTH}
            </div>
          </div>
          <div className="form-actions">
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim() || newComment.length > MAX_COMMENT_LENGTH}
            >
              {submitting ? '发布中...' : '发布评论'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          请<a href="/login">登录</a>后发表评论
        </div>
      )}
      
      {/* 评论列表 */}
      <div className="comments-list">
        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : comments.length === 0 ? (
          <div className="empty-state">
            暂无评论，快来发表第一条评论吧~
          </div>
        ) : (
          <>
            {comments.flatMap(comment => {
              // 展平该评论及其所有回复
              const flatComments = [
                { ...comment, parentAuthor: null }, // 顶级评论
                ...flattenComments(comment.replies || [], comment.username) // 展平的回复
              ];
              
              return flatComments.map((flatComment, index) => 
                renderComment(flatComment, index > 0)
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default Comments;

