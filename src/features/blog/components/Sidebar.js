import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Button } from '../../../components/ui/button';
import { Home, Folder, Archive, Sparkles, Link2, User, Rss, Camera, Loader2, Github, Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import * as userApi from '../../../api/userApi';
import { API_BASE } from '../../../api/httpClient';

function Sidebar({ stats = { posts: 0, categories: 0, tags: 0 } }) {
  const { toast } = useToast();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('我的博客');
  const [userBio, setUserBio] = useState('趁年轻，做自己想做的！');
  
  // 可折叠列表的展开状态
  const [expandedSections, setExpandedSections] = useState({
    anime: false,
    cities: false,
    games: false,
  });

  // 切换展开/收起
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
      toast({
        variant: "destructive",
        title: "✗ 上传失败",
        description: "请检查网络连接或后端服务是否启动！",
      });
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
          {/* 社交媒体链接 */}
          <div className="flex justify-center gap-3 mb-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://weibo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="微博"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.194 14.197c.478-1.256.443-2.335-.098-3.043-.49-.642-1.435-.936-2.642-.74-.191.031-.323.048-.405.058.035-.084.066-.168.093-.251.348-.982.392-1.83.124-2.385-.387-.804-1.493-1.142-2.928-.902-.742.124-1.547.399-2.318.789.022-.11.041-.222.057-.336.138-.995-.021-1.768-.448-2.173-.394-.373-.985-.485-1.67-.315-.684.17-1.386.513-1.975 1.017-.589.504-1.027 1.12-1.23 1.731-.204.611-.152 1.167.147 1.564.299.397.768.594 1.325.594.557 0 1.135-.163 1.643-.501-.144.446-.201.928-.152 1.426.057.577.227 1.133.503 1.641-.577-.17-1.155-.261-1.717-.261-1.842 0-3.459.796-4.556 2.02-1.097 1.224-1.523 2.747-1.194 4.175.329 1.428 1.365 2.596 2.84 3.197 1.475.601 3.288.613 5.044.031 1.756-.582 3.454-1.735 4.603-3.202 1.149-1.467 1.649-3.088 1.387-4.402-.148-.743-.522-1.376-1.048-1.847.744-.197 1.401-.063 1.759.457.316.459.34 1.175.068 2.051-.088.283-.041.59.124.822.165.232.435.367.722.367.344 0 .657-.175.835-.467z"/>
              </svg>
            </a>
            <a
              href="mailto:your-email@example.com"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="邮箱"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          <Separator className="my-4" />

          {/* 可折叠列表 - 最喜欢的动漫 */}
          <div className="mb-3">
            <button
              onClick={() => toggleSection('anime')}
              className="w-full flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors text-left"
            >
              <span 
                className="text-sm font-medium flex items-center gap-2"
                style={{ fontWeight: '500', letterSpacing: '0.01em' }}
              >
                最喜欢的动漫 📺
              </span>
              {expandedSections.anime ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedSections.anime && (
              <div className="mt-2 pl-4 space-y-1 text-sm text-muted-foreground">
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 进击的巨人
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 命运石之门
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 钢之炼金术师
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 紫罗兰永恒花园
                </div>
              </div>
            )}
          </div>

          {/* 可折叠列表 - 喜欢的城市 */}
          <div className="mb-3">
            <button
              onClick={() => toggleSection('cities')}
              className="w-full flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors text-left"
            >
              <span 
                className="text-sm font-medium flex items-center gap-2"
                style={{ fontWeight: '500', letterSpacing: '0.01em' }}
              >
                喜欢的城市 🏙️
              </span>
              {expandedSections.cities ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedSections.cities && (
              <div className="mt-2 pl-4 space-y-1 text-sm text-muted-foreground">
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 东京，日本
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 上海，中国
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 巴黎，法国
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 纽约，美国
                </div>
              </div>
            )}
          </div>

          {/* 可折叠列表 - 最喜欢的游戏 */}
          <div className="mb-3">
            <button
              onClick={() => toggleSection('games')}
              className="w-full flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors text-left"
            >
              <span 
                className="text-sm font-medium flex items-center gap-2"
                style={{ fontWeight: '500', letterSpacing: '0.01em' }}
              >
                最喜欢的游戏 🎮
              </span>
              {expandedSections.games ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedSections.games && (
              <div className="mt-2 pl-4 space-y-1 text-sm text-muted-foreground">
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 塞尔达传说：旷野之息
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 最后生还者
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 巫师 3：狂猎
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 艾尔登法环
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

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




