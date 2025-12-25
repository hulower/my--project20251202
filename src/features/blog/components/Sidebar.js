import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Button } from '../../../components/ui/button';
import { Home, Folder, Archive, Sparkles, Link2, User, Rss, Camera, Loader2 } from 'lucide-react';
import * as userApi from '../../../api/userApi';
import { API_BASE } from '../../../api/httpClient';

function Sidebar({ stats = { posts: 0, categories: 0, tags: 0 } }) {
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('我的博客');
  const [userBio, setUserBio] = useState('趁年轻，做自己想做的！');

  // 组件加载时从后端获取用户信息
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 从后端获取用户信息
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const data = await userApi.fetchUserById(1); // 调用 API 层
      
      // 如果有头像 URL，设置完整路径
      if (data.avatarUrl) {
        setAvatarUrl(`${API_BASE}${data.avatarUrl}`);
      }
      
      // 更新用户名和简介
      if (data.username) setUserName(data.username);
      if (data.bio) setUserBio(data.bio);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // 文件类型检查
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件！');
      return;
    }
    
    // 文件大小检查（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB！');
      return;
    }

    try {
      setUploading(true);
      
      // 调用 API 层上传头像
      const data = await userApi.uploadAvatar(file);
      
      // data 现在已经是解包后的 data 字段：{ url, user }
      if (data && data.url) {
        setAvatarUrl(`${API_BASE}${data.url}`);
        console.log('✅ 头像上传成功:', data.url);
        
        // 同时更新用户信息
        if (data.user) {
          if (data.user.username) setUserName(data.user.username);
          if (data.user.bio) setUserBio(data.user.bio);
        }
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请检查网络连接或后端服务是否启动！');
    } finally {
      setUploading(false);
    }
  };
  const menuItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/blog', icon: Folder, label: '分类', count: stats.categories },
    { path: '/blog', icon: Archive, label: '归档', count: stats.posts },
    { path: '/particles', icon: Sparkles, label: '粒子系统' },
    { path: '/blog', icon: Link2, label: '友链', count: 0 },
    { path: '/blog', icon: User, label: '关于' },
  ];

  return (
    <aside className="w-80 space-y-4 p-4 backdrop-blur-sm bg-white/10">
      {/* 个人信息卡片 */}
      <Card>
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {/* 如果正在加载，显示加载状态 */}
                {loading ? (
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-cyan-400 to-blue-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </AvatarFallback>
                ) : (
                  <>
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="用户头像" />}
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-cyan-400 to-blue-600">
                      👨‍💻
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              
              {/* 上传按钮 */}
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={uploading ? '上传中...' : '更换头像'}
              >
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </label>
            </div>
          </div>
          <CardTitle 
            className="text-2xl"
            style={{ 
              fontWeight: '600',
              letterSpacing: '0.01em'
            }}
          >
            {userName}
          </CardTitle>
          <p 
            className="text-sm text-muted-foreground mt-2"
            style={{ 
              fontWeight: '400',
              letterSpacing: '0.01em',
              lineHeight: '1.6'
            }}
          >
            {userBio}
          </p>
          <p 
            className="text-xs text-muted-foreground italic"
            style={{ 
              fontWeight: '400',
              letterSpacing: '0.03em',
              lineHeight: '1.5'
            }}
          >
            There is no best, only better!
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div 
                className="text-2xl font-bold text-primary"
                style={{ fontWeight: '700', letterSpacing: '-0.02em' }}
              >
                {stats.posts}
              </div>
              <div 
                className="text-xs text-muted-foreground"
                style={{ fontWeight: '500', letterSpacing: '0.02em' }}
              >
                归档
              </div>
            </div>
            <div>
              <div 
                className="text-2xl font-bold text-primary"
                style={{ fontWeight: '700', letterSpacing: '-0.02em' }}
              >
                {stats.categories}
              </div>
              <div 
                className="text-xs text-muted-foreground"
                style={{ fontWeight: '500', letterSpacing: '0.02em' }}
              >
                分类
              </div>
            </div>
            <div>
              <div 
                className="text-2xl font-bold text-primary"
                style={{ fontWeight: '700', letterSpacing: '-0.02em' }}
              >
                {stats.tags}
              </div>
              <div 
                className="text-xs text-muted-foreground"
                style={{ fontWeight: '500', letterSpacing: '0.02em' }}
              >
                标签
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* RSS 订阅 */}
          <Button variant="outline" className="w-full gap-2" size="sm">
            <Rss className="w-4 h-4" />
            RSS 订阅
          </Button>
        </CardContent>
      </Card>

      {/* 导航菜单 */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="text-lg"
            style={{ 
              fontWeight: '600',
              letterSpacing: '0.01em'
            }}
          >
            博客导航
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <nav className="flex flex-col">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center justify-between px-6 py-3 hover:bg-accent transition-colors ${
                    isActive ? 'bg-accent text-accent-foreground font-medium' : ''
                  }`}
                  style={{
                    fontWeight: isActive ? '500' : '400',
                    letterSpacing: '0.01em'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.count}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}

export default Sidebar;




