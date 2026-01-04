/**
 * ============================================
 * 文件名：src/features/user/pages/ProfilePage.js
 * 作用：个人资料页面 - 查看和编辑用户信息
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';
import * as userApi from '../../../api/userApi';
import { API_BASE } from '../../../api/httpClient';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge';
import { Camera, Loader2, User, Mail, Shield, Calendar, Save } from 'lucide-react';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // 用户信息状态
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
  });
  
  // 头像上传状态
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // 获取用户信息
  useEffect(() => {
    if (user?.id) {
      fetchUserInfo();
    }
  }, [user?.id]);
  
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const data = await userApi.fetchUserById(user.id);
      setUserInfo(data);
      setFormData({
        username: data.username || '',
        bio: data.bio || '',
      });
      if (data.avatarUrl) {
        setAvatarUrl(`${API_BASE}${data.avatarUrl}`);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 加载失败",
        description: error.message || "无法加载用户信息",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 处理表单输入
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // 处理头像上传
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 文件类型检查
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "✗ 上传失败",
        description: "请选择图片文件！",
      });
      return;
    }
    
    // 文件大小检查（5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "✗ 上传失败",
        description: "图片大小不能超过 5MB！",
      });
      return;
    }
    
    try {
      setUploadingAvatar(true);
      const data = await userApi.uploadAvatar(file);
      
      if (data && data.url) {
        setAvatarUrl(`${API_BASE}${data.url}`);
        
        // 更新全局用户信息（这样右上角的 UserMenu 也会更新）
        updateUser({
          avatarUrl: data.url,
        });
        
        toast({
          title: "✓ 上传成功",
          description: "头像已更新",
        });
      }
    } catch (error) {
      console.error('头像上传失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 上传失败",
        description: error.message || "头像上传失败",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  // 保存用户信息
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 调用更新 API
      await userApi.updateUser(user.id, {
        username: formData.username,
        bio: formData.bio,
      });
      
      toast({
        title: "✓ 保存成功",
        description: "个人信息已更新",
      });
      
      // 重新获取用户信息
      await fetchUserInfo();
      
      // 更新全局用户信息（这样右上角的 UserMenu 也会更新）
      updateUser({
        username: formData.username,
        bio: formData.bio,
      });
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 保存失败",
        description: error.message || "无法保存个人信息",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // 获取角色颜色
  const getRoleColor = (role) => {
    const colorMap = {
      visitor: 'bg-gray-100 text-gray-700',
      user: 'bg-blue-100 text-blue-700',
      editor: 'bg-green-100 text-green-700',
      admin: 'bg-purple-100 text-purple-700',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-700';
  };
  
  // 获取角色中文名称
  const getRoleName = (role) => {
    const nameMap = {
      visitor: '游客',
      user: '用户',
      editor: '编辑',
      admin: '管理员',
    };
    return nameMap[role] || '未知';
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            个人资料
          </h1>
          <p className="text-muted-foreground">
            查看和编辑您的个人信息
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* 左侧：用户信息卡片 */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {/* 头像 */}
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-white font-medium text-4xl overflow-hidden border-4 border-white shadow-lg"
                    style={{
                      background: avatarUrl
                        ? 'transparent'
                        : 'linear-gradient(to bottom right, rgb(34, 211, 238), rgb(37, 99, 235))',
                    }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="用户头像" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">👨‍💻</span>
                    )}
                  </div>
                  
                  {/* 上传按钮 */}
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 p-3 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg ${
                      uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={uploadingAvatar ? '上传中...' : '更换头像'}
                  >
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    {uploadingAvatar ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </label>
                </div>
              </div>
              
              <CardTitle className="text-2xl">
                {userInfo?.username || '用户'}
              </CardTitle>
              
              <div className="mt-3 flex justify-center">
                <Badge className={`${getRoleColor(userInfo?.role)}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleName(userInfo?.role)}
                </Badge>
              </div>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-4">
              {/* 账户信息 */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      邮箱
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {userInfo?.email || '未设置'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      注册时间
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(userInfo?.createdAt)}
                    </p>
                  </div>
                </div>
                
                {userInfo?.lastLogin && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        最后登录
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(userInfo?.lastLogin)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* 右侧：编辑表单 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                编辑资料
              </CardTitle>
              <CardDescription>
                更新您的个人信息
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form className="space-y-6">
                {/* 用户名 */}
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="输入用户名"
                  />
                  <p className="text-xs text-muted-foreground">
                    用户名将显示在您的文章和评论中
                  </p>
                </div>
                
                {/* 个人简介 */}
                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="介绍一下自己..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    简短地介绍您自己，让其他人更了解您
                  </p>
                </div>
                
                <Separator />
                
                {/* 保存按钮 */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        username: userInfo?.username || '',
                        bio: userInfo?.bio || '',
                      });
                      toast({
                        title: "已重置",
                        description: "表单已重置为原始值",
                      });
                    }}
                  >
                    重置
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        保存更改
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

