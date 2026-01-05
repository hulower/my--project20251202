/**
 * ============================================
 * 文件名：src/features/user/pages/SettingsPage.js
 * 作用：设置页面 - 修改密码、账号设置、偏好设置
 * ============================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../hooks/use-toast';
import * as userApi from '../../../api/userApi';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  Lock, 
  Shield, 
  Bell, 
  Palette, 
  Loader2, 
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';

function SettingsPage() {
  const { user, logout } = useAuth();
  const { themeMode, changeTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // 修改密码表单
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // 删除账号相关状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  // 密码强度检查
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4); // 最大 4 级
  };
  
  const passwordStrength = checkPasswordStrength(passwordForm.newPassword);
  
  const getPasswordStrengthText = (strength) => {
    const texts = ['很弱', '弱', '中等', '强', '很强'];
    return texts[strength] || '';
  };
  
  const getPasswordStrengthColor = (strength) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    return colors[strength] || 'bg-gray-300';
  };
  
  // 处理密码输入
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // 修改密码
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!passwordForm.currentPassword) {
      toast({
        variant: "destructive",
        title: "✗ 验证失败",
        description: "请输入当前密码",
      });
      return;
    }
    
    if (!passwordForm.newPassword) {
      toast({
        variant: "destructive",
        title: "✗ 验证失败",
        description: "请输入新密码",
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "✗ 验证失败",
        description: "新密码至少需要 6 个字符",
      });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "✗ 验证失败",
        description: "两次输入的新密码不一致",
      });
      return;
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast({
        variant: "destructive",
        title: "✗ 验证失败",
        description: "新密码不能与当前密码相同",
      });
      return;
    }
    
    try {
      setChangingPassword(true);
      
      // 调用修改密码 API
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      toast({
        title: "✓ 修改成功",
        description: "密码已更新，3秒后将自动退出登录",
      });
      
      // 清空表单
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // 3 秒后自动退出登录
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('修改密码失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 修改失败",
        description: error.message || "密码修改失败，请检查当前密码是否正确",
      });
    } finally {
      setChangingPassword(false);
    }
  };
  
  // 删除账号
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '删除我的账号') {
      toast({
        variant: "destructive",
        title: "✗ 验证失败",
        description: "请输入正确的确认文本",
      });
      return;
    }
    
    try {
      setDeletingAccount(true);
      
      // 调用删除账号 API
      await userApi.deleteAccount();
      
      toast({
        title: "✓ 账号已删除",
        description: "您的账号已被永久删除",
      });
      
      // 清空确认文本
      setDeleteConfirmText('');
      setDeleteDialogOpen(false);
      
      // 1 秒后退出登录并跳转到首页
      setTimeout(async () => {
        await logout();
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('删除账号失败:', error);
      toast({
        variant: "destructive",
        title: "✗ 删除失败",
        description: error.message || "删除账号时发生错误",
      });
    } finally {
      setDeletingAccount(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            设置
          </h1>
          <p className="text-muted-foreground">
            管理您的账号设置和偏好
          </p>
        </div>
        
        {/* 设置选项卡 */}
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">安全</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">账号</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">通知</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">外观</span>
            </TabsTrigger>
          </TabsList>
          
          {/* 安全设置 */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  修改密码
                </CardTitle>
                <CardDescription>
                  定期更换密码可以提高账号安全性
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* 当前密码 */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">当前密码</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="输入当前密码"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* 新密码 */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密码</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="输入新密码（至少 6 个字符）"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* 密码强度指示器 */}
                    {passwordForm.newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getPasswordStrengthColor(passwordStrength)}`}
                              style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground min-w-[3rem]">
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          建议：包含大小写字母、数字和特殊字符
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* 确认新密码 */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="再次输入新密码"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* 密码匹配提示 */}
                    {passwordForm.confirmPassword && (
                      <div className="flex items-center gap-2">
                        {passwordForm.newPassword === passwordForm.confirmPassword ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-600">密码匹配</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-600">密码不匹配</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* 提交按钮 */}
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      disabled={changingPassword}
                      className="gap-2"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          修改中...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          修改密码
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 账号设置 */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  账号信息
                </CardTitle>
                <CardDescription>
                  查看您的账号信息
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">用户名</p>
                      <p className="text-sm text-muted-foreground">{user?.username}</p>
                    </div>
                    <Button variant="outline" size="sm">修改</Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">邮箱</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm">修改</Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">角色</p>
                      <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 dark:text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    危险操作
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    删除账号后，所有数据将被永久删除且无法恢复
                  </p>
                  
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        删除账号
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          删除账号
                        </DialogTitle>
                        <DialogDescription>
                          这是一个不可逆的操作。删除账号后，您的所有数据将被永久删除。
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="delete-confirm">
                            请输入 "<span className="font-semibold text-red-600">删除我的账号</span>" 以确认
                          </Label>
                          <Input
                            id="delete-confirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="删除我的账号"
                            className="border-red-300 focus:border-red-500"
                          />
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>警告：</strong>此操作将删除：
                          </p>
                          <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                            <li>您的所有个人资料</li>
                            <li>您发布的所有文章</li>
                            <li>您的所有评论和互动</li>
                          </ul>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDeleteDialogOpen(false);
                            setDeleteConfirmText('');
                          }}
                        >
                          取消
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deletingAccount || deleteConfirmText !== '删除我的账号'}
                          className="gap-2"
                        >
                          {deletingAccount ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              删除中...
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4" />
                              确认删除
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 通知设置 */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  通知偏好
                </CardTitle>
                <CardDescription>
                  管理您接收通知的方式
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">邮件通知</p>
                    <p className="text-sm text-muted-foreground">接收重要更新的邮件通知</p>
                  </div>
                  <Button variant="outline" size="sm">启用</Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">评论通知</p>
                    <p className="text-sm text-muted-foreground">有人评论您的文章时通知</p>
                  </div>
                  <Button variant="outline" size="sm">启用</Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">点赞通知</p>
                    <p className="text-sm text-muted-foreground">有人点赞您的文章时通知</p>
                  </div>
                  <Button variant="outline" size="sm">启用</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 外观设置 */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  外观设置
                </CardTitle>
                <CardDescription>
                  自定义应用的外观和感觉
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-4 block">主题</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {/* 浅色主题 */}
                      <button
                        onClick={() => {
                          changeTheme('light');
                          toast({
                            title: "✓ 主题已更新",
                            description: "已切换至浅色主题",
                          });
                        }}
                        className={`p-4 border-2 rounded-lg hover:border-primary transition-all ${
                          themeMode === 'light' ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                      >
                        <div className="w-full h-20 bg-white border rounded mb-2 shadow-sm" />
                        <p className={`text-sm font-medium ${themeMode === 'light' ? 'text-primary' : ''}`}>
                          浅色
                        </p>
                      </button>

                      {/* 深色主题 */}
                      <button
                        onClick={() => {
                          changeTheme('dark');
                          toast({
                            title: "✓ 主题已更新",
                            description: "已切换至深色主题",
                          });
                        }}
                        className={`p-4 border-2 rounded-lg hover:border-primary transition-all ${
                          themeMode === 'dark' ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                      >
                        <div className="w-full h-20 bg-gray-900 border border-gray-700 rounded mb-2" />
                        <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-primary' : ''}`}>
                          深色
                        </p>
                      </button>

                      {/* 自动主题 */}
                      <button
                        onClick={() => {
                          changeTheme('auto');
                          toast({
                            title: "✓ 主题已更新",
                            description: "已设置为跟随系统主题",
                          });
                        }}
                        className={`p-4 border-2 rounded-lg hover:border-primary transition-all ${
                          themeMode === 'auto' ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                      >
                        <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 border rounded mb-2 shadow-sm" />
                        <p className={`text-sm font-medium ${themeMode === 'auto' ? 'text-primary' : ''}`}>
                          自动
                        </p>
                      </button>
                    </div>
                    
                    {/* 提示文本 */}
                    <p className="text-sm text-muted-foreground mt-4">
                      {themeMode === 'light' && '当前使用浅色主题'}
                      {themeMode === 'dark' && '当前使用深色主题'}
                      {themeMode === 'auto' && '自动模式将根据您的系统设置切换主题'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SettingsPage;


