/**
 * ============================================
 * 文件名：src/features/auth/pages/RegisterPage.js
 * 作用：注册页面 - 美观简洁大气版
 * ============================================
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import { Mail, Lock, User, UserPlus, LogIn, Loader2, Check, X } from 'lucide-react';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  
  // ========================================
  // 密码强度检查
  // ========================================
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: '弱', color: 'text-red-500' };
    if (strength <= 3) return { strength, label: '中', color: 'text-yellow-500' };
    return { strength, label: '强', color: 'text-green-500' };
  };
  
  const passwordStrength = getPasswordStrength(formData.password);
  
  // ========================================
  // 表单验证规则
  // ========================================
  const validations = {
    username: {
      valid: formData.username.length >= 2,
      message: '用户名至少2个字符',
    },
    email: {
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      message: '请输入有效的邮箱地址',
    },
    password: {
      valid: formData.password.length >= 6,
      message: '密码至少6个字符',
    },
    confirmPassword: {
      valid: formData.password === formData.confirmPassword && formData.confirmPassword !== '',
      message: '两次密码输入不一致',
    },
  };
  
  // ========================================
  // 处理表单提交
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证所有字段
    const invalidFields = Object.entries(validations).filter(([_, v]) => !v.valid);
    if (invalidFields.length > 0) {
      toast({
        variant: 'destructive',
        title: '✗ 注册失败',
        description: invalidFields[0][1].message,
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // 调用注册
      const user = await register({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      
      toast({
        title: '✓ 注册成功',
        description: `欢迎加入，${user.username}！`,
      });
      
      // 跳转到首页
      navigate('/');
    } catch (err) {
      console.error('注册失败:', err);
      toast({
        variant: 'destructive',
        title: '✗ 注册失败',
        description: err.message || '注册失败，请稍后重试',
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
            创建账户
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            开始您的创作之旅
          </p>
        </div>
        
        {/* 注册卡片 */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold">注册</CardTitle>
            <CardDescription>
              填写以下信息创建您的账户
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* 用户名输入 */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium flex items-center justify-between">
                  <span>用户名</span>
                  {formData.username && (
                    <span className="text-xs flex items-center gap-1">
                      {validations.username.valid ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">可用</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-red-500" />
                          <span className="text-red-500">至少2个字符</span>
                        </>
                      )}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    value={formData.username}
                    onChange={handleChange('username')}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* 邮箱输入 */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center justify-between">
                  <span>邮箱</span>
                  {formData.email && (
                    <span className="text-xs flex items-center gap-1">
                      {validations.email.valid ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">格式正确</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-red-500" />
                          <span className="text-red-500">格式错误</span>
                        </>
                      )}
                    </span>
                  )}
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
                <label htmlFor="password" className="text-sm font-medium flex items-center justify-between">
                  <span>密码</span>
                  {formData.password && (
                    <span className={`text-xs ${passwordStrength.color}`}>
                      强度：{passwordStrength.label}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="至少6个字符"
                    value={formData.password}
                    onChange={handleChange('password')}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
                {/* 密码强度条 */}
                {formData.password && (
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.strength <= 2
                          ? 'bg-red-500'
                          : passwordStrength.strength <= 3
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              
              {/* 确认密码输入 */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center justify-between">
                  <span>确认密码</span>
                  {formData.confirmPassword && (
                    <span className="text-xs flex items-center gap-1">
                      {validations.confirmPassword.valid ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">密码匹配</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-red-500" />
                          <span className="text-red-500">密码不匹配</span>
                        </>
                      )}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="再次输入密码"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              {/* 注册按钮 */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    创建账户
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
                    已有账户？
                  </span>
                </div>
              </div>
              
              {/* 登录按钮 */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                立即登录
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
          注册即表示您同意我们的
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

export default RegisterPage;


