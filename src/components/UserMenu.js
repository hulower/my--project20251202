/**
 * ============================================
 * 文件名：src/components/UserMenu.js
 * 作用：用户菜单组件 - 显示用户信息和操作
 * ============================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { User, Settings, LogOut, Shield } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { API_BASE } from '../api/httpClient';

function UserMenu() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  
  // 获取完整的头像 URL
  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return null;
    // 如果已经是完整 URL，直接返回
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    // 否则拼接 API_BASE
    return `${API_BASE}${user.avatarUrl}`;
  };
  
  const avatarUrl = getAvatarUrl();

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "✓ 退出成功",
        description: "您已成功退出登录",
      });
      setOpen(false);
      navigate('/');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "✗ 退出失败",
        description: err.message || "退出登录时发生错误",
      });
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

  // 如果未登录，显示登录/注册按钮
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/login')}
          className="gap-2"
        >
          登录
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/register')}
          className="gap-2"
        >
          注册
        </Button>
      </div>
    );
  }

  // 已登录，显示用户菜单
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 hover:bg-gray-100 relative"
        >
          {/* 用户头像 */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden"
            style={{
              background: avatarUrl
                ? 'transparent'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="用户头像" className="w-full h-full object-cover" />
            ) : (
              user?.username?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          
          {/* 用户名 */}
          <span className="font-medium text-gray-700">
            {user?.username || '用户'}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="end">
        {/* 用户信息卡片 */}
        <div className="p-4 border-b">
          <div className="flex items-start gap-3">
            {/* 头像 */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium overflow-hidden"
              style={{
                background: avatarUrl
                  ? 'transparent'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="用户头像" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            
            {/* 用户信息 */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
              
              {/* 角色标签 */}
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                    user?.role
                  )}`}
                >
                  <Shield className="w-3 h-3" />
                  {getRoleName(user?.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 菜单选项 */}
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => {
              navigate('/profile');
              setOpen(false);
            }}
          >
            <User className="w-4 h-4" />
            <span>个人资料</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => {
              navigate('/settings');
              setOpen(false);
            }}
          >
            <Settings className="w-4 h-4" />
            <span>设置</span>
          </Button>
        </div>

        {/* 退出登录 */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default UserMenu;
