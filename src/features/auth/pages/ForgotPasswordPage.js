/**
 * ============================================
 * 文件名：src/features/auth/pages/ForgotPasswordPage.js
 * 作用：忘记密码页面
 * ============================================
 *
 * 功能（简化流程，无需邮件验证）：
 * 1. 用户输入注册邮箱和新密码
 * 2. 后端校验邮箱存在后直接更新密码
 * 3. 重置成功后跳转登录页，用新密码登录
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import * as authApi from '../../../api/authApi';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  // ========================================
  // 处理输入变化
  // ========================================
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // ========================================
  // 处理表单提交
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast({
        variant: 'destructive',
        title: '✗ 重置失败',
        description: '邮箱不能为空',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: '✗ 重置失败',
        description: '密码至少6个字符',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: '✗ 重置失败',
        description: '两次密码输入不一致',
      });
      return;
    }

    try {
      setLoading(true);

      await authApi.resetPassword(formData.email.trim().toLowerCase(), formData.newPassword);

      toast({
        title: '✓ 密码重置成功',
        description: '请使用新密码登录',
      });

      navigate('/login');
    } catch (err) {
      console.error('重置密码失败:', err);
      toast({
        variant: 'destructive',
        title: '✗ 重置失败',
        description: err.message || '请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            重置密码
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            输入邮箱并设置新密码
          </p>
        </div>

        {/* 重置密码卡片 */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold">重置密码</CardTitle>
            <CardDescription>请输入您的账号邮箱和新密码</CardDescription>
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
                    placeholder="请输入注册邮箱"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 新密码输入 */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  新密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="至少6个字符"
                    value={formData.newPassword}
                    onChange={handleChange('newPassword')}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 确认密码输入 */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
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
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    重置中...
                  </>
                ) : (
                  '确定重置'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回登录
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
