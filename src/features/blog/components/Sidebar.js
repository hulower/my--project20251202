import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { Loader2, Github, ChevronDown, ChevronRight } from 'lucide-react';
import * as userApi from '../../../api/userApi';
import { API_BASE } from '../../../api/httpClient';
import { useAuth } from '../../../contexts/AuthContext';

function Sidebar({ stats = { posts: 0, categories: 0, tags: 0 } }) {
  const { user } = useAuth();     // 读取全局用户状态，头像更新后自动同步
  const [avatarUrl, setAvatarUrl] = useState(null);
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

  // 获取博主信息（始终显示博主的信息）
  useEffect(() => {
    // 如果当前登录用户就是博主（ID=1），直接用 Context 里的最新数据
    if (user && user.id === 1) {
      setUserName(user.username || '我的博客');
      setUserBio(user.bio || '趁年轻，做自己想做的！');
      setAvatarUrl(user.avatarUrl ? `${API_BASE}${user.avatarUrl}` : null);
      setLoading(false);
      return;
    }
    // 否则调 API 获取博主信息
    fetchBlogOwnerInfo();
  }, [user]); // 监听 user 变化，头像更新后自动刷新

  const fetchBlogOwnerInfo = async () => {
    try {
      setLoading(true);
      const BLOG_OWNER_ID = 1;
      const data = await userApi.fetchUserById(BLOG_OWNER_ID);

      if (data.avatarUrl) {
        setAvatarUrl(`${API_BASE}${data.avatarUrl}`);
      } else {
        setAvatarUrl(null);
      }
      if (data.username) setUserName(data.username);
      if (data.bio) setUserBio(data.bio);
    } catch (error) {
      console.error('获取博主信息失败:', error);
      setAvatarUrl(null);
      setUserName('我的博客');
      setUserBio('趁年轻，做自己想做的！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="space-y-4 backdrop-blur-sm bg-white/10">
      {/* 个人信息卡片 */}
      <Card>
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-4">
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
              href="https://github.com/hulower?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </a>
            <a
              href="https://m.weibo.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="微博"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#E6162D">
                <path d="M20.194 14.197c.478-1.256.443-2.335-.098-3.043-.49-.642-1.435-.936-2.642-.74-.191.031-.323.048-.405.058.035-.084.066-.168.093-.251.348-.982.392-1.83.124-2.385-.387-.804-1.493-1.142-2.928-.902-.742.124-1.547.399-2.318.789.022-.11.041-.222.057-.336.138-.995-.021-1.768-.448-2.173-.394-.373-.985-.485-1.67-.315-.684.17-1.386.513-1.975 1.017-.589.504-1.027 1.12-1.23 1.731-.204.611-.152 1.167.147 1.564.299.397.768.594 1.325.594.557 0 1.135-.163 1.643-.501-.144.446-.201.928-.152 1.426.057.577.227 1.133.503 1.641-.577-.17-1.155-.261-1.717-.261-1.842 0-3.459.796-4.556 2.02-1.097 1.224-1.523 2.747-1.194 4.175.329 1.428 1.365 2.596 2.84 3.197 1.475.601 3.288.613 5.044.031 1.756-.582 3.454-1.735 4.603-3.202 1.149-1.467 1.649-3.088 1.387-4.402-.148-.743-.522-1.376-1.048-1.847.744-.197 1.401-.063 1.759.457.316.459.34 1.175.068 2.051-.088.283-.041.59.124.822.165.232.435.367.722.367.344 0 .657-.175.835-.467z"/>
              </svg>
            </a>
            <a
              href="https://space.bilibili.com/1491849569?spm_id_from=333.1387.0.0"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="哔哩哔哩"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#00A1D6">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/>
              </svg>
            </a>
            <a
              href="https://music.163.com/#/user/home?id=382468132"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="网易云音乐"
            >
              <svg className="w-5 h-5" viewBox="0 0 512 512" fill="#C20C0C">
                <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 472c-123.7 0-224-100.3-224-224S132.3 32 256 32s224 100.3 224 224-100.3 224-224 224zm-96.5-288c7.5 13.5 22.5 45 30 60 31.5 63 27 81-4.5 85.5-48 6-49.5-57-36-90 6-15 10.5-37.5 10.5-55.5zm144 0c-7.5 13.5-22.5 45-30 60-31.5 63-27 81 4.5 85.5 48 6 49.5-57 36-90-6-15-10.5-37.5-10.5-55.5z"/>
                <circle cx="256" cy="256" r="48" fill="#C20C0C"/>
                <path d="M341 133.5c-22.5-7.5-49.5 3-67.5 18-6 4.5-13.5 3-16.5-3-4.5-6-3-13.5 3-16.5 22.5-19.5 58.5-33 90-22.5 7.5 3 10.5 12 7.5 18-3 7.5-12 10.5-16.5 6z"/>
              </svg>
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
                  • 四月是你的谎言
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 海贼王
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 双城之战
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 龙与虎
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
                  • 威海
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 深圳
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 洛阳
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 苏州
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
                  • 英雄联盟
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 刺客信条
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 侠盗猎车手5
                </div>
                <div 
                  className="py-1"
                  style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                >
                  • 瓦罗兰特
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

        </CardContent>
      </Card>
    </aside>
  );
}

export default Sidebar;





