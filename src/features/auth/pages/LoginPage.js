/**
 * ============================================
 * 文件名：src/features/auth/pages/LoginPage.js
 * 作用：登录页面 - 美观简洁大气版
 * ============================================
 */

import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import { Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  
  // ========================================
  // 处理表单提交
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.email.trim() || !formData.password.trim()) {
      toast({
        variant: 'destructive',
        title: '✗ 登录失败',
        description: '邮箱和密码不能为空',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // 调用登录
      const user = await login(formData);
      
      toast({
        title: '✓ 登录成功',
        description: `欢迎回来，${user.username}！`,
      });
      
      // 获取重定向地址
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      console.error('登录失败:', err);
      toast({
        variant: 'destructive',
        title: '✗ 登录失败',
        description: err.message || '邮箱或密码错误',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // ========================================
  // 处理输入变化
  // ========================================
  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            欢迎回来
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            登录以继续访问您的账户
          </p>
        </div>
        
        {/* 登录卡片 */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold">登录</CardTitle>
            <CardDescription>
              输入您的邮箱和密码以登录
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* 邮箱输入 */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* 密码输入 */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange('password')}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* 忘记密码链接 */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  忘记密码？
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              {/* 登录按钮 */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    登录
                  </>
                )}
              </Button>
              
              {/* 分隔线 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    或
                  </span>
                </div>
              </div>
              
              {/* 注册按钮 */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => navigate('/register')}
                disabled={loading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                创建新账户
              </Button>
              
              {/* 返回首页 */}
              <div className="text-center text-sm text-muted-foreground">
                <Link
                  to="/"
                  className="hover:text-foreground transition-colors"
                >
                  返回首页
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        {/* 底部提示 */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
          登录即表示您同意我们的
          <Link to="/terms" className="text-blue-600 hover:underline mx-1">
            服务条款
          </Link>
          和
          <Link to="/privacy" className="text-blue-600 hover:underline ml-1">
            隐私政策
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;


